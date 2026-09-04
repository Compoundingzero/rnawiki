"""Overlap harness at scale (risk R3).

Implements ``docs/specs/overlap-harness.md`` with the definitions the 324-record diagnosis
(``docs/worklogs/page-overlap-diagnosis.md``) used:

* text under measure  visible page text, already extracted upstream; this module receives
  ``{key, text}`` records and never fetches anything.
* tokens             lower-cased, punctuation stripped, numbers kept.
* positional overlap |shared 5-grams| / |5-grams of the shorter page|; a page's score is its
                     nearest-neighbour maximum.
* lexical overlap    Jaccard of the two pages' word sets; nearest-neighbour maximum likewise.
* shared-word share  the share of a page's word occurrences whose word appears on more than 90%
                     of the other pages.
* controls           other-page filler and own-text filler (never scrambled tokens).

Candidate generation is MinHash (128 permutations) over the 5-gram shingle set with LSH at two
band structures fixed by the spec: 16 bands x 8 rows for the >= 0.6 sweep and 32 bands x 4 rows
for the >= 0.2 nearest-neighbour measurement. Candidates are then scored exactly.

Memory: shingles and words are hashed to 64-bit integers and never held as strings; pages stream
from the source file in batches of 250 and live in a DuckDB page store on disk, with a bounded
LRU of decoded arrays in front of it.
"""

from __future__ import annotations

import hashlib
import json
import re
import resource
import sys
import time
from collections import OrderedDict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterator, Sequence

import duckdb
import numpy as np
import pyarrow as pa

# --------------------------------------------------------------------------------------------
# constants

SHINGLE_N = 5
BATCH_SIZE = 250
DEFAULT_PERMUTATIONS = 128
# Fixed by the spec. The analytic 50%-detection point of a (bands, rows) structure is
# (1 / bands) ** (1 / rows); both are reported in the run record so the gap to the spec's
# nominal ">= 0.6" / ">= 0.2" labels is visible rather than assumed.
SWEEP_BANDS, SWEEP_ROWS = 16, 8          # spec: "threshold ~= 0.6" sweep
NEIGHBOUR_BANDS, NEIGHBOUR_ROWS = 32, 4  # spec: "threshold ~= 0.2" nearest-neighbour pass
# Backfill structures for pages the primary pass leaves with too few candidates. 32x4 detects at
# 0.42, not at the 0.20 its spec line names, so on this corpus it starves a fifth of the pages of
# any candidate at all and fails the spec's own 0.02 fitness gate. These wider structures are
# queried only for starved pages, which keeps the cost of the recall proportional to the problem.
BACKFILL_STRUCTURES = ((64, 2), (128, 1))
DEFAULT_MIN_CANDIDATES = 32
SHARED_WORD_FRACTION = 0.90
DEFAULT_SEED = 20260904

_MAX_U64 = np.uint64((1 << 64) - 1)
_FNV_PRIME = np.uint64(1099511628211)
_TOKEN_RE = re.compile(r"[a-z0-9]+")


def lsh_threshold(bands: int, rows: int) -> float:
    """The similarity at which an LSH structure has a 50% chance of producing the pair."""
    return float((1.0 / bands) ** (1.0 / rows))


# --------------------------------------------------------------------------------------------
# text -> tokens -> hashes


def normalise_tokens(text: str) -> list[str]:
    """Lower-case, drop punctuation, keep numbers. Returns the token sequence in page order."""
    return _TOKEN_RE.findall(text.lower())


class TokenVocabulary:
    """Deterministic token -> random 64-bit value. Cached so a token is hashed once per run."""

    def __init__(self) -> None:
        self._values: dict[str, int] = {}

    def value(self, token: str) -> int:
        v = self._values.get(token)
        if v is None:
            v = int.from_bytes(hashlib.blake2b(token.encode("utf-8"), digest_size=8).digest(), "big")
            self._values[token] = v
        return v

    def encode(self, tokens: Sequence[str]) -> np.ndarray:
        out = np.empty(len(tokens), dtype=np.uint64)
        get = self.value
        for i, token in enumerate(tokens):
            out[i] = get(token)
        return out

    def __len__(self) -> int:
        return len(self._values)


def shingle_hashes(values: np.ndarray, n: int = SHINGLE_N) -> np.ndarray:
    """64-bit hashes of the page's n-gram (default five-word) sequences, unique and sorted.

    Order-sensitive FNV-style mixing of the token values; a page shorter than ``n`` tokens
    contributes the single shingle formed from every token it has.
    """
    if values.size == 0:
        return np.empty(0, dtype=np.uint64)
    if values.size < n:
        acc = np.zeros(1, dtype=np.uint64)
        with np.errstate(over="ignore"):
            for j in range(values.size):
                acc = (acc * _FNV_PRIME) ^ values[j : j + 1]
        return acc
    m = values.size - n + 1
    acc = np.zeros(m, dtype=np.uint64)
    with np.errstate(over="ignore"):
        for j in range(n):
            acc = (acc * _FNV_PRIME) ^ values[j : j + m]
    return np.unique(acc)


def word_hashes(values: np.ndarray) -> np.ndarray:
    """The page's word set as unique sorted 64-bit hashes."""
    if values.size == 0:
        return np.empty(0, dtype=np.uint64)
    return np.unique(values)


def word_counts(values: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Unique word hashes and their occurrence counts on this page."""
    if values.size == 0:
        return np.empty(0, dtype=np.uint64), np.empty(0, dtype=np.int64)
    return np.unique(values, return_counts=True)


# --------------------------------------------------------------------------------------------
# exact scoring


def intersection_size(a: np.ndarray, b: np.ndarray) -> int:
    """|a & b| for two unique sorted uint64 arrays, in O(min log max)."""
    if a.size == 0 or b.size == 0:
        return 0
    if a.size > b.size:
        a, b = b, a
    idx = np.searchsorted(b, a)
    idx[idx == b.size] = 0
    return int(np.count_nonzero(b[idx] == a))


def positional_overlap(a_shingles: np.ndarray, b_shingles: np.ndarray) -> float:
    """Shared five-word sequences over the five-gram count of the SHORTER page."""
    smaller = min(a_shingles.size, b_shingles.size)
    if smaller == 0:
        return 0.0
    return intersection_size(a_shingles, b_shingles) / smaller


def lexical_overlap(a_words: np.ndarray, b_words: np.ndarray) -> float:
    """Jaccard of the two pages' word sets."""
    if a_words.size == 0 and b_words.size == 0:
        return 0.0
    shared = intersection_size(a_words, b_words)
    union = a_words.size + b_words.size - shared
    if union == 0:
        return 0.0
    return shared / union


# --------------------------------------------------------------------------------------------
# MinHash + LSH


def make_hash_seeds(n_perm: int = DEFAULT_PERMUTATIONS, seed: int = DEFAULT_SEED) -> np.ndarray:
    """One 64-bit seed per MinHash permutation.

    The permutation family is ``splitmix64(x XOR seed_i)``. An earlier draft used the textbook
    ``(a*x + b) mod (2**61 - 1)`` over the low 32 bits, which is degenerate at these magnitudes:
    with a, b < 2**32 and x < 2**32 the product rarely wraps the modulus, so the map is nearly
    monotone in x and almost every permutation picks the same few smallest elements. It estimated
    a real Jaccard of 0.431 as 0.063. Full-width avalanche hashing does not have that failure.
    """
    rng = np.random.default_rng(seed)
    return rng.integers(0, 1 << 64, size=n_perm, dtype=np.uint64)


def _splitmix64(z: np.ndarray) -> np.ndarray:
    """SplitMix64 finalizer. Every step wraps modulo 2**64 by design."""
    with np.errstate(over="ignore"):
        z = (z ^ (z >> np.uint64(30))) * np.uint64(0xBF58476D1CE4E5B9)
        z = (z ^ (z >> np.uint64(27))) * np.uint64(0x94D049BB133111EB)
        return z ^ (z >> np.uint64(31))


def minhash_signature(shingles: np.ndarray, seeds: np.ndarray, chunk: int = 4096) -> np.ndarray:
    """MinHash of a shingle-hash set: the minimum of each seeded permutation.

    Chunked over the shingle set so a very long page cannot blow up the transient
    (n_perm x n_shingles) matrix.
    """
    n_perm = seeds.size
    if shingles.size == 0:
        return np.full(n_perm, _MAX_U64, dtype=np.uint64)
    best = np.full(n_perm, _MAX_U64, dtype=np.uint64)
    seed_column = seeds[:, None]
    for start in range(0, shingles.size, chunk):
        block = shingles[start : start + chunk][None, :]
        np.minimum(best, _splitmix64(block ^ seed_column).min(axis=1), out=best)
    return best


def estimated_jaccard(sig_a: np.ndarray, sig_b: np.ndarray) -> float:
    return float(np.count_nonzero(sig_a == sig_b) / sig_a.size)


def estimated_containment(jaccard: float, size_a: int, size_b: int) -> float:
    """Containment against the smaller set, implied by an estimated Jaccard and the exact sizes."""
    smaller = min(size_a, size_b)
    if smaller == 0 or jaccard <= 0.0:
        return 0.0
    shared = jaccard * (size_a + size_b) / (1.0 + jaccard)
    return min(1.0, shared / smaller)


def band_keys(signature: np.ndarray, bands: int, rows: int) -> list[bytes]:
    """One key per band: the band index plus the raw bytes of that band's signature rows."""
    keys: list[bytes] = []
    for band in range(bands):
        chunk = signature[band * rows : (band + 1) * rows]
        keys.append(band.to_bytes(2, "big") + chunk.tobytes())
    return keys


class LshIndex:
    """Banded LSH over MinHash signatures.

    ``max_bucket`` caps how many members of one bucket are considered, deterministically sampled
    per bucket. A corpus whose pages are near-identical produces buckets holding most of the
    corpus, and an uncapped scan of those is quadratic; the cap trades a bounded amount of recall
    for a bounded cost and is reported in the run record.
    """

    def __init__(self, bands: int, rows: int, max_bucket: int = 512, seed: int = DEFAULT_SEED) -> None:
        self.bands = bands
        self.rows = rows
        self.max_bucket = max_bucket
        self.seed = seed
        self.buckets: dict[bytes, list[int]] = {}

    def add(self, idx: int, signature: np.ndarray) -> None:
        for key in band_keys(signature, self.bands, self.rows):
            self.buckets.setdefault(key, []).append(idx)

    def bucket_sizes(self) -> list[int]:
        return [len(v) for v in self.buckets.values()]

    def candidates_for(self, idx: int, signature: np.ndarray) -> list[int]:
        found: set[int] = set()
        for key in band_keys(signature, self.bands, self.rows):
            members = self.buckets.get(key)
            if not members:
                continue
            if len(members) > self.max_bucket:
                rng = np.random.default_rng(self.seed ^ int.from_bytes(key[:8], "big"))
                picked = rng.choice(len(members), size=self.max_bucket, replace=False)
                found.update(int(members[p]) for p in picked)
            else:
                found.update(members)
        found.discard(idx)
        return sorted(found)


# --------------------------------------------------------------------------------------------
# page store


@dataclass
class PageRecord:
    idx: int
    key: str
    tier: str
    n_tokens: int
    n_words: int
    n_shingles: int
    shingles: np.ndarray
    words: np.ndarray
    signature: np.ndarray


class PageStore:
    """DuckDB-backed store of per-page hash arrays with a bounded decode cache."""

    def __init__(self, path: Path, cache_pages: int = 2000) -> None:
        self.path = path
        if path.exists():
            path.unlink()
        self.con = duckdb.connect(str(path))
        self.con.execute(
            """
            CREATE TABLE pages (
                idx INTEGER, key VARCHAR, tier VARCHAR,
                n_tokens BIGINT, n_words INTEGER, n_shingles INTEGER,
                shingles BLOB, words BLOB, signature BLOB
            )
            """
        )
        self.con.execute("CREATE TABLE page_words (idx INTEGER, word UBIGINT, occurrences INTEGER)")
        self._cache: OrderedDict[int, tuple[np.ndarray, np.ndarray]] = OrderedDict()
        self._sigs: dict[int, np.ndarray] = {}
        self._keys: list[str] = []
        self._tiers: list[str] = []
        self._n_shingles: list[int] = []
        self._n_words: list[int] = []
        self._n_tokens: list[int] = []
        self.cache_pages = cache_pages

    # -- writing ------------------------------------------------------------------------
    def add_batch(
        self,
        records: Sequence[PageRecord],
        word_idx: np.ndarray | None = None,
        word_values: np.ndarray | None = None,
        word_occurrences: np.ndarray | None = None,
    ) -> None:
        """Append a batch. Arrow tables, not executemany: parameter-per-row insertion of the word
        table costs ~150 microseconds a row in DuckDB and dominated the whole build."""
        page_table = pa.table(
            {
                "idx": pa.array([r.idx for r in records], pa.int32()),
                "key": pa.array([r.key for r in records], pa.string()),
                "tier": pa.array([r.tier for r in records], pa.string()),
                "n_tokens": pa.array([r.n_tokens for r in records], pa.int64()),
                "n_words": pa.array([r.n_words for r in records], pa.int32()),
                "n_shingles": pa.array([r.n_shingles for r in records], pa.int32()),
                "shingles": pa.array([r.shingles.tobytes() for r in records], pa.binary()),
                "words": pa.array([r.words.tobytes() for r in records], pa.binary()),
                "signature": pa.array([r.signature.tobytes() for r in records], pa.binary()),
            }
        )
        self.con.register("_page_batch", page_table)
        self.con.execute("INSERT INTO pages SELECT * FROM _page_batch")
        self.con.unregister("_page_batch")
        if word_idx is not None and word_idx.size:
            word_table = pa.table(
                {
                    "idx": pa.array(word_idx.astype(np.int32)),
                    "word": pa.array(word_values.astype(np.uint64)),
                    "occurrences": pa.array(word_occurrences.astype(np.int32)),
                }
            )
            self.con.register("_word_batch", word_table)
            self.con.execute("INSERT INTO page_words SELECT * FROM _word_batch")
            self.con.unregister("_word_batch")
        for r in records:
            self._keys.append(r.key)
            self._tiers.append(r.tier)
            self._n_shingles.append(r.n_shingles)
            self._n_words.append(r.n_words)
            self._n_tokens.append(r.n_tokens)
            self._sigs[r.idx] = r.signature

    def finish(self) -> None:
        self.con.execute("CREATE INDEX pages_idx ON pages(idx)")

    # -- reading ------------------------------------------------------------------------
    @property
    def size(self) -> int:
        return len(self._keys)

    def key(self, idx: int) -> str:
        return self._keys[idx]

    def tier(self, idx: int) -> str:
        return self._tiers[idx]

    def n_shingles(self, idx: int) -> int:
        return self._n_shingles[idx]

    def n_words(self, idx: int) -> int:
        return self._n_words[idx]

    def n_tokens(self, idx: int) -> int:
        return self._n_tokens[idx]

    def signature(self, idx: int) -> np.ndarray:
        return self._sigs[idx]

    def arrays(self, idx: int) -> tuple[np.ndarray, np.ndarray]:
        hit = self._cache.get(idx)
        if hit is not None:
            self._cache.move_to_end(idx)
            return hit
        row = self.con.execute("SELECT shingles, words FROM pages WHERE idx = ?", [idx]).fetchone()
        arrays = (
            np.frombuffer(row[0], dtype=np.uint64),
            np.frombuffer(row[1], dtype=np.uint64),
        )
        self._cache[idx] = arrays
        if len(self._cache) > self.cache_pages:
            self._cache.popitem(last=False)
        return arrays

    def shared_word_share(self) -> np.ndarray:
        """Per-page share of word occurrences whose word appears on > 90% of the OTHER pages."""
        n = self.size
        if n < 2:
            return np.zeros(n, dtype=float)
        threshold = SHARED_WORD_FRACTION * (n - 1)
        rows = self.con.execute(
            """
            WITH df AS (SELECT word, count(*) AS pages FROM page_words GROUP BY word),
                 tot AS (SELECT idx, sum(occurrences) AS total FROM page_words GROUP BY idx)
            SELECT p.idx,
                   sum(CASE WHEN d.pages - 1 > ? THEN p.occurrences ELSE 0 END)::DOUBLE
                     / nullif(t.total, 0) AS share
            FROM page_words p
            JOIN df d ON d.word = p.word
            JOIN tot t ON t.idx = p.idx
            GROUP BY p.idx, t.total
            """,
            [threshold],
        ).fetchall()
        out = np.zeros(n, dtype=float)
        for idx, share in rows:
            out[int(idx)] = float(share or 0.0)
        return out

    def close(self) -> None:
        self.con.close()


# --------------------------------------------------------------------------------------------
# input


@dataclass
class SourceIndex:
    """Byte offsets of every usable line of the pages NDJSON, so controls can re-read donors."""

    path: Path
    offsets: list[int]
    keys: list[str]

    @classmethod
    def build(cls, path: Path, wanted: set[str] | None) -> "SourceIndex":
        offsets: list[int] = []
        keys: list[str] = []
        with path.open("rb") as handle:
            position = 0
            for raw in handle:
                length = len(raw)
                stripped = raw.strip()
                if stripped:
                    record = json.loads(stripped)
                    key = record.get("key") or record.get("slug") or record.get("id")
                    if key is not None and (wanted is None or key in wanted):
                        offsets.append(position)
                        keys.append(str(key))
                position += length
        return cls(path=path, offsets=offsets, keys=keys)

    def read(self, i: int) -> dict:
        with self.path.open("rb") as handle:
            handle.seek(self.offsets[i])
            return json.loads(handle.readline())

    def stream(self, indices: Sequence[int] | None = None, batch: int = BATCH_SIZE) -> Iterator[list[tuple[int, dict]]]:
        """Yield batches of (position-in-index, record). Sequential when indices is None."""
        order = list(range(len(self.offsets))) if indices is None else list(indices)
        with self.path.open("rb") as handle:
            buffer: list[tuple[int, dict]] = []
            for i in order:
                handle.seek(self.offsets[i])
                buffer.append((i, json.loads(handle.readline())))
                if len(buffer) >= batch:
                    yield buffer
                    buffer = []
            if buffer:
                yield buffer


def record_text(record: dict) -> str:
    text = record.get("text")
    if text is None:
        raise ValueError(f"page record {record.get('key')!r} has no 'text' field")
    return str(text)


# --------------------------------------------------------------------------------------------
# building the store


@dataclass
class BuildStats:
    pages: int = 0
    tokens: int = 0
    vocabulary: int = 0
    seconds: float = 0.0


def build_store(
    source: SourceIndex,
    store: PageStore,
    seeds: np.ndarray,
    indices: Sequence[int] | None = None,
    batch: int = BATCH_SIZE,
    transform: Callable[[int, list[str]], list[str]] | None = None,
    keep_word_rows: bool = True,
) -> BuildStats:
    """Stream pages in batches of ``batch``, hash them and write them to the store."""
    vocab = TokenVocabulary()
    stats = BuildStats()
    started = time.perf_counter()
    next_idx = 0
    for chunk in source.stream(indices, batch=batch):
        records: list[PageRecord] = []
        word_idx: list[np.ndarray] = []
        word_values: list[np.ndarray] = []
        word_occurrences: list[np.ndarray] = []
        for position, raw in chunk:
            tokens = normalise_tokens(record_text(raw))
            if transform is not None:
                tokens = transform(position, tokens)
            values = vocab.encode(tokens)
            shingles = shingle_hashes(values)
            words, counts = word_counts(values)
            signature = minhash_signature(shingles, seeds)
            key = str(raw.get("key") or raw.get("slug") or raw.get("id"))
            records.append(
                PageRecord(
                    idx=next_idx,
                    key=key,
                    tier=str(raw.get("tier") or ""),
                    n_tokens=len(tokens),
                    n_words=int(words.size),
                    n_shingles=int(shingles.size),
                    shingles=shingles,
                    words=words,
                    signature=signature,
                )
            )
            if keep_word_rows and words.size:
                word_idx.append(np.full(words.size, next_idx, dtype=np.int32))
                word_values.append(words)
                word_occurrences.append(counts.astype(np.int32))
            stats.tokens += len(tokens)
            next_idx += 1
        if word_idx:
            store.add_batch(
                records,
                np.concatenate(word_idx),
                np.concatenate(word_values),
                np.concatenate(word_occurrences),
            )
        else:
            store.add_batch(records)
        stats.pages += len(records)
    store.finish()
    stats.vocabulary = len(vocab)
    stats.seconds = time.perf_counter() - started
    return stats


# --------------------------------------------------------------------------------------------
# nearest neighbours


@dataclass
class NeighbourResult:
    positional: np.ndarray
    positional_partner: np.ndarray
    lexical: np.ndarray
    lexical_partner: np.ndarray
    pairs_scored: int = 0
    candidates_total: int = 0
    seconds: float = 0.0
    mode: str = "lsh"
    bucket_sizes: list[int] = field(default_factory=list)
    structures: list[tuple[int, int]] = field(default_factory=list)
    backfilled_pages: int = 0

    def partner_key(self, store: PageStore, idx: int, which: str) -> str | None:
        partner = self.positional_partner[idx] if which == "positional" else self.lexical_partner[idx]
        return None if partner < 0 else store.key(int(partner))


def _blank(n: int) -> NeighbourResult:
    return NeighbourResult(
        positional=np.zeros(n, dtype=float),
        positional_partner=np.full(n, -1, dtype=np.int64),
        lexical=np.zeros(n, dtype=float),
        lexical_partner=np.full(n, -1, dtype=np.int64),
    )


def _record(result: NeighbourResult, i: int, j: int, pos: float, lex: float) -> None:
    if pos > result.positional[i]:
        result.positional[i] = pos
        result.positional_partner[i] = j
    if pos > result.positional[j]:
        result.positional[j] = pos
        result.positional_partner[j] = i
    if lex > result.lexical[i]:
        result.lexical[i] = lex
        result.lexical_partner[i] = j
    if lex > result.lexical[j]:
        result.lexical[j] = lex
        result.lexical_partner[j] = i


def exhaustive_neighbours(store: PageStore, subset: Sequence[int] | None = None) -> NeighbourResult:
    """Every pair, scored exactly. O(n^2) — the validation reference, not the corpus path."""
    members = list(range(store.size)) if subset is None else list(subset)
    result = _blank(store.size)
    result.mode = "exhaustive"
    started = time.perf_counter()
    pairs = 0
    for pi, i in enumerate(members):
        a_sh, a_w = store.arrays(i)
        for j in members[pi + 1 :]:
            b_sh, b_w = store.arrays(j)
            _record(result, i, j, positional_overlap(a_sh, b_sh), lexical_overlap(a_w, b_w))
            pairs += 1
    result.pairs_scored = pairs
    result.candidates_total = pairs * 2
    result.seconds = time.perf_counter() - started
    return result


def lsh_neighbours(
    store: PageStore,
    subset: Sequence[int] | None = None,
    bands: int = NEIGHBOUR_BANDS,
    rows: int = NEIGHBOUR_ROWS,
    max_bucket: int = 512,
    rerank: int = 64,
    seed: int = DEFAULT_SEED,
    min_candidates: int = DEFAULT_MIN_CANDIDATES,
    backfill: Sequence[tuple[int, int]] = BACKFILL_STRUCTURES,
) -> NeighbourResult:
    """LSH candidates, MinHash re-ranking, then exact scoring of the survivors.

    ``backfill`` widens the candidate net only for pages the primary structure leaves with fewer
    than ``min_candidates`` neighbours; pass an empty sequence for a spec-literal single-structure
    run. Containment against a much longer page is the case a Jaccard-driven index under-detects,
    and those pages are exactly the starved ones.
    """
    members = list(range(store.size)) if subset is None else list(subset)
    structures: list[tuple[int, int]] = [(bands, rows)]
    for extra in backfill:
        if extra not in structures and extra[0] * extra[1] <= store.signature(members[0]).size:
            structures.append(extra)

    indexes: list[LshIndex] = []
    for s_bands, s_rows in structures:
        index = LshIndex(bands=s_bands, rows=s_rows, max_bucket=max_bucket, seed=seed)
        for i in members:
            index.add(i, store.signature(i))
        indexes.append(index)

    result = _blank(store.size)
    result.mode = "lsh"
    started = time.perf_counter()
    scored: set[tuple[int, int]] = set()
    candidates_total = 0
    backfilled = 0
    for i in members:
        sig_i = store.signature(i)
        cands = indexes[0].candidates_for(i, sig_i)
        used_backfill = False
        for index in indexes[1:]:
            if len(cands) >= min_candidates:
                break
            used_backfill = True
            cands = sorted(set(cands) | set(index.candidates_for(i, sig_i)))
        if used_backfill:
            backfilled += 1
        if not cands:
            continue
        candidates_total += len(cands)
        if len(cands) > rerank:
            sizes_sh = np.array([store.n_shingles(c) for c in cands], dtype=float)
            sizes_w = np.array([store.n_words(c) for c in cands], dtype=float)
            sig_matrix = np.stack([store.signature(c) for c in cands])
            jac = (sig_matrix == sig_i[None, :]).mean(axis=1)
            own_sh = float(store.n_shingles(i))
            own_w = float(store.n_words(i))
            with np.errstate(divide="ignore", invalid="ignore"):
                shared_sh = jac * (own_sh + sizes_sh) / (1.0 + jac)
                cont = shared_sh / np.maximum(np.minimum(own_sh, sizes_sh), 1.0)
                shared_w = jac * (own_w + sizes_w) / (1.0 + jac)
                lex = shared_w / np.maximum(own_w + sizes_w - shared_w, 1.0)
            keep = set(np.argsort(-cont)[:rerank].tolist())
            keep.update(np.argsort(-lex)[:rerank].tolist())
            cands = [cands[k] for k in sorted(keep)]
        a_sh, a_w = store.arrays(i)
        for j in cands:
            pair = (i, j) if i < j else (j, i)
            if pair in scored:
                continue
            scored.add(pair)
            b_sh, b_w = store.arrays(j)
            _record(result, i, j, positional_overlap(a_sh, b_sh), lexical_overlap(a_w, b_w))
    result.pairs_scored = len(scored)
    result.candidates_total = candidates_total
    result.bucket_sizes = indexes[0].bucket_sizes()
    result.structures = structures
    result.backfilled_pages = backfilled
    result.seconds = time.perf_counter() - started
    return result


def missed_merge_sweep(
    store: PageStore,
    threshold: float = 0.6,
    max_bucket: int = 512,
    seed: int = DEFAULT_SEED,
    bands: int = SWEEP_BANDS,
    rows: int = SWEEP_ROWS,
) -> list[dict]:
    """The suspected-missed-merge pass: pairs whose exact positional overlap clears ``threshold``.

    The spec's 16x8 structure detects a **Jaccard** of 0.71, while the threshold here is a
    **containment**; the two part company whenever the pages differ in length. Measured on the
    324-page validation corpus, 16x8 at threshold 0.6 returns 90 of the 1,615 true pairs (5.6%
    recall, no false positives); 32x4 reaches 61.7%, 64x2 reaches 99.8% and 128x1 is complete.
    Widen ``bands``/``rows`` when recall matters more than cost; every pair returned is exactly
    scored either way, so widening costs time and never precision.
    """
    index = LshIndex(bands=bands, rows=rows, max_bucket=max_bucket, seed=seed)
    for i in range(store.size):
        index.add(i, store.signature(i))
    found: list[dict] = []
    seen: set[tuple[int, int]] = set()
    for i in range(store.size):
        a_sh, a_w = store.arrays(i)
        for j in index.candidates_for(i, store.signature(i)):
            pair = (i, j) if i < j else (j, i)
            if pair in seen:
                continue
            seen.add(pair)
            b_sh, b_w = store.arrays(j)
            pos = positional_overlap(a_sh, b_sh)
            if pos >= threshold:
                found.append(
                    {
                        "a": store.key(pair[0]),
                        "b": store.key(pair[1]),
                        "positional": round(pos, 6),
                        "lexical": round(lexical_overlap(a_w, b_w), 6),
                    }
                )
    found.sort(key=lambda row: -row["positional"])
    return found


# --------------------------------------------------------------------------------------------
# distributions, null model, controls


def distribution(values: np.ndarray) -> dict:
    if values.size == 0:
        return {"count": 0}
    return {
        "count": int(values.size),
        "median": round(float(np.median(values)), 6),
        "mean": round(float(values.mean()), 6),
        "p90": round(float(np.percentile(values, 90)), 6),
        "max": round(float(values.max()), 6),
        "above_0_20": int(np.count_nonzero(values > 0.20)),
        "above_0_30": int(np.count_nonzero(values > 0.30)),
    }


def random_pair_scores(
    store: PageStore,
    subset: Sequence[int] | None = None,
    samples: int = 20000,
    seed: int = DEFAULT_SEED,
) -> tuple[np.ndarray, np.ndarray]:
    """Exact scores for uniformly random page pairs: the null model's per-pair distribution."""
    members = list(range(store.size)) if subset is None else list(subset)
    n = len(members)
    if n < 2:
        return np.zeros(0), np.zeros(0)
    rng = np.random.default_rng(seed)
    total_pairs = n * (n - 1) // 2
    draws = min(samples, total_pairs)
    seen: set[tuple[int, int]] = set()
    pos: list[float] = []
    lex: list[float] = []
    attempts = 0
    while len(pos) < draws and attempts < draws * 20:
        attempts += 1
        i, j = rng.integers(0, n, size=2)
        if i == j:
            continue
        pair = (int(min(i, j)), int(max(i, j)))
        if pair in seen:
            continue
        seen.add(pair)
        ai, aj = members[pair[0]], members[pair[1]]
        a_sh, a_w = store.arrays(ai)
        b_sh, b_w = store.arrays(aj)
        pos.append(positional_overlap(a_sh, b_sh))
        lex.append(lexical_overlap(a_w, b_w))
    return np.array(pos), np.array(lex)


def expected_nearest_neighbour(sample: np.ndarray, corpus_size: int, trials: int = 200, seed: int = DEFAULT_SEED) -> float:
    """E[max of (corpus_size - 1) draws] from the empirical random-pair distribution.

    This is the corpus-size adjustment the spec asks for: nearest-neighbour maxima rise with the
    number of candidates alone, so a rise that size explains is visible next to the observed one.
    """
    if sample.size == 0 or corpus_size < 2:
        return 0.0
    rng = np.random.default_rng(seed)
    k = corpus_size - 1
    maxima = np.empty(trials, dtype=float)
    for t in range(trials):
        maxima[t] = sample[rng.integers(0, sample.size, size=k)].max()
    return round(float(maxima.mean()), 6)


def other_page_filler(source: SourceIndex, seed: int = DEFAULT_SEED) -> Callable[[int, list[str]], list[str]]:
    """Control: pad each page with a contiguous passage of another page, of equal length."""
    n = len(source.offsets)
    rng = np.random.default_rng(seed)
    donors = [(int(i) + 1 + int(rng.integers(0, max(n - 1, 1)))) % n for i in range(n)]

    def transform(position: int, tokens: list[str]) -> list[str]:
        donor_tokens = normalise_tokens(record_text(source.read(donors[position])))
        if not donor_tokens:
            return tokens
        want = len(tokens)
        start = (position * 7919) % len(donor_tokens)
        filler: list[str] = []
        while len(filler) < want:
            filler.extend(donor_tokens[start:])
            start = 0
        return tokens + filler[:want]

    return transform


def own_text_filler() -> Callable[[int, list[str]], list[str]]:
    """Control: pad each page with its own text (pure length effect)."""

    def transform(position: int, tokens: list[str]) -> list[str]:
        return tokens + list(tokens)

    return transform


# --------------------------------------------------------------------------------------------
# reporting


def peak_rss_mb() -> float:
    usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    # macOS reports bytes, Linux kilobytes.
    divisor = 1024 * 1024 if sys.platform == "darwin" else 1024
    return round(usage / divisor, 1)


def per_page_rows(store: PageStore, result: NeighbourResult, shared_share: np.ndarray) -> Iterator[dict]:
    for idx in range(store.size):
        yield {
            "key": store.key(idx),
            "tier": store.tier(idx),
            "tokens": store.n_tokens(idx),
            "words": store.n_words(idx),
            "shingles": store.n_shingles(idx),
            "positional": round(float(result.positional[idx]), 6),
            "positionalPartner": result.partner_key(store, idx, "positional"),
            "lexical": round(float(result.lexical[idx]), 6),
            "lexicalPartner": result.partner_key(store, idx, "lexical"),
            "sharedWordShare": round(float(shared_share[idx]), 6),
        }


def tier_medians(store: PageStore, values: np.ndarray) -> dict[str, float]:
    by_tier: dict[str, list[float]] = {}
    for idx in range(store.size):
        by_tier.setdefault(store.tier(idx) or "(none)", []).append(float(values[idx]))
    return {tier: round(float(np.median(v)), 6) for tier, v in sorted(by_tier.items())}
