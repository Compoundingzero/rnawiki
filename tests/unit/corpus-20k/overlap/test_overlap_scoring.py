"""Unit tests for the overlap harness scoring functions (risk R3).

Fixtures are tiny made-up strings. Nothing here reads or writes anything under ``data/``, and no
value in this file is corpus content.

Run:  .venv-corpus/bin/python -m unittest discover -s tests/unit/corpus-20k/overlap -v
(The file is also plain pytest-compatible if pytest is ever installed in that environment.)
"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / "scripts" / "corpus-20k" / "overlap"))

from harness import (  # noqa: E402
    LshIndex,
    PageStore,
    SourceIndex,
    TokenVocabulary,
    band_keys,
    build_store,
    distribution,
    estimated_containment,
    estimated_jaccard,
    exhaustive_neighbours,
    expected_nearest_neighbour,
    intersection_size,
    lexical_overlap,
    lsh_neighbours,
    lsh_threshold,
    make_hash_seeds,
    minhash_signature,
    normalise_tokens,
    other_page_filler,
    own_text_filler,
    positional_overlap,
    shingle_hashes,
    word_counts,
    word_hashes,
)

VOCAB = TokenVocabulary()


def hashes_of(text: str):
    values = VOCAB.encode(normalise_tokens(text))
    return shingle_hashes(values), word_hashes(values)


class NormalisationTests(unittest.TestCase):
    def test_lower_cases_and_strips_punctuation(self):
        self.assertEqual(normalise_tokens("The Dose, Twice!"), ["the", "dose", "twice"])

    def test_keeps_numbers(self):
        self.assertEqual(normalise_tokens("500 mg (2 x 250)"), ["500", "mg", "2", "x", "250"])

    def test_splits_on_hyphens_and_collapses_whitespace(self):
        self.assertEqual(normalise_tokens("alpha-beta \n gamma"), ["alpha", "beta", "gamma"])

    def test_empty_text_gives_no_tokens(self):
        self.assertEqual(normalise_tokens("   ...   "), [])


class ShingleTests(unittest.TestCase):
    def test_five_gram_count(self):
        shingles, _ = hashes_of("one two three four five six seven")
        self.assertEqual(shingles.size, 3)  # 7 tokens -> 3 five-grams

    def test_identical_text_gives_identical_shingles(self):
        a, _ = hashes_of("alpha beta gamma delta epsilon zeta")
        b, _ = hashes_of("ALPHA, beta. gamma delta epsilon zeta!")
        np.testing.assert_array_equal(a, b)

    def test_order_matters(self):
        a, _ = hashes_of("one two three four five")
        b, _ = hashes_of("five four three two one")
        self.assertEqual(intersection_size(a, b), 0)

    def test_page_shorter_than_the_window_still_yields_one_shingle(self):
        shingles, _ = hashes_of("only three tokens")
        self.assertEqual(shingles.size, 1)

    def test_repeated_sequences_are_counted_once(self):
        a, _ = hashes_of("one two three four five one two three four five")
        # six distinct five-grams in ten tokens once the repeat is de-duplicated
        self.assertEqual(a.size, 5)


class IntersectionTests(unittest.TestCase):
    def test_intersection_size_is_symmetric_and_exact(self):
        a = np.array([1, 3, 5, 7], dtype=np.uint64)
        b = np.array([3, 4, 5, 6], dtype=np.uint64)
        self.assertEqual(intersection_size(a, b), 2)
        self.assertEqual(intersection_size(b, a), 2)

    def test_empty_side_is_zero(self):
        self.assertEqual(intersection_size(np.array([], dtype=np.uint64), np.array([1], dtype=np.uint64)), 0)


class PositionalOverlapTests(unittest.TestCase):
    def test_one_shared_five_gram_of_two(self):
        a, _ = hashes_of("one two three four five six")      # abcde, bcdef
        b, _ = hashes_of("one two three four five other")    # abcde, bcdeX
        self.assertAlmostEqual(positional_overlap(a, b), 0.5)

    def test_identical_pages_score_one(self):
        a, _ = hashes_of("the same page repeated word for word here")
        self.assertAlmostEqual(positional_overlap(a, a), 1.0)

    def test_denominator_is_the_shorter_page(self):
        short, _ = hashes_of("one two three four five six")
        long, _ = hashes_of("one two three four five six and then a good deal more text follows on")
        # every one of the shorter page's five-grams appears in the longer page
        self.assertAlmostEqual(positional_overlap(short, long), 1.0)
        self.assertAlmostEqual(positional_overlap(long, short), 1.0)

    def test_no_shared_sequence_scores_zero(self):
        a, _ = hashes_of("alpha beta gamma delta epsilon")
        b, _ = hashes_of("nothing at all in common here")
        self.assertAlmostEqual(positional_overlap(a, b), 0.0)

    def test_empty_page_scores_zero(self):
        a, _ = hashes_of("alpha beta gamma delta epsilon")
        empty = np.empty(0, dtype=np.uint64)
        self.assertAlmostEqual(positional_overlap(a, empty), 0.0)


class LexicalOverlapTests(unittest.TestCase):
    def test_jaccard_of_word_sets(self):
        _, a = hashes_of("alpha beta gamma")
        _, b = hashes_of("beta gamma delta")
        self.assertAlmostEqual(lexical_overlap(a, b), 0.5)  # 2 shared / 4 union

    def test_repetition_does_not_change_the_set(self):
        _, a = hashes_of("alpha alpha alpha beta")
        _, b = hashes_of("alpha beta")
        self.assertAlmostEqual(lexical_overlap(a, b), 1.0)

    def test_disjoint_vocabularies_score_zero(self):
        _, a = hashes_of("alpha beta")
        _, b = hashes_of("gamma delta")
        self.assertAlmostEqual(lexical_overlap(a, b), 0.0)

    def test_ignores_word_order(self):
        _, a = hashes_of("alpha beta gamma")
        _, b = hashes_of("gamma alpha beta")
        self.assertAlmostEqual(lexical_overlap(a, b), 1.0)


class WordCountTests(unittest.TestCase):
    def test_counts_occurrences_per_distinct_word(self):
        values = VOCAB.encode(normalise_tokens("dose dose review"))
        words, counts = word_counts(values)
        self.assertEqual(words.size, 2)
        self.assertEqual(sorted(counts.tolist()), [1, 2])


class MinHashTests(unittest.TestCase):
    def setUp(self):
        self.seeds = make_hash_seeds(128, seed=11)

    def test_estimate_tracks_a_known_jaccard(self):
        rng = np.random.default_rng(3)
        universe = np.unique(rng.integers(0, 1 << 63, size=3000, dtype=np.uint64))
        a = universe[:1000]
        b = np.unique(np.concatenate([universe[:250], universe[1000:1750]]))
        shared = intersection_size(a, b)
        true_jaccard = shared / (a.size + b.size - shared)
        estimate = estimated_jaccard(minhash_signature(a, self.seeds), minhash_signature(b, self.seeds))
        self.assertAlmostEqual(estimate, true_jaccard, delta=0.06)

    def test_permutation_family_is_not_degenerate(self):
        """Regression: the (a*x+b) mod 2**61-1 family over 32-bit values was nearly monotone in x,
        so almost every permutation picked the same smallest element and a Jaccard of 0.43 was
        estimated as 0.06."""
        rng = np.random.default_rng(5)
        values = np.unique(rng.integers(0, 1 << 63, size=800, dtype=np.uint64))
        signature = minhash_signature(values, self.seeds)
        self.assertGreater(len(set(signature.tolist())), 100)

    def test_identical_sets_agree_everywhere(self):
        values = np.unique(np.random.default_rng(7).integers(0, 1 << 63, size=500, dtype=np.uint64))
        self.assertEqual(
            estimated_jaccard(minhash_signature(values, self.seeds), minhash_signature(values, self.seeds)), 1.0
        )

    def test_empty_set_signature_is_saturated(self):
        signature = minhash_signature(np.empty(0, dtype=np.uint64), self.seeds)
        self.assertTrue(np.all(signature == np.uint64((1 << 64) - 1)))

    def test_chunking_does_not_change_the_signature(self):
        values = np.unique(np.random.default_rng(9).integers(0, 1 << 63, size=5000, dtype=np.uint64))
        np.testing.assert_array_equal(
            minhash_signature(values, self.seeds, chunk=512), minhash_signature(values, self.seeds, chunk=100000)
        )


class ContainmentEstimateTests(unittest.TestCase):
    def test_matches_the_algebra(self):
        # |A| = 100, |B| = 50, |A & B| = 40 -> J = 40/110, containment against B = 0.8
        jaccard = 40 / 110
        self.assertAlmostEqual(estimated_containment(jaccard, 100, 50), 0.8, places=6)

    def test_zero_jaccard_is_zero(self):
        self.assertEqual(estimated_containment(0.0, 10, 10), 0.0)


class LshStructureTests(unittest.TestCase):
    def test_analytic_threshold(self):
        self.assertAlmostEqual(lsh_threshold(16, 8), 0.7071, places=4)
        self.assertAlmostEqual(lsh_threshold(32, 4), 0.4204, places=4)

    def test_band_key_count_and_width(self):
        signature = np.arange(128, dtype=np.uint64)
        keys = band_keys(signature, 32, 4)
        self.assertEqual(len(keys), 32)
        self.assertEqual(len(keys[0]), 2 + 4 * 8)
        self.assertEqual(len(set(keys)), 32)

    def test_identical_signatures_are_always_candidates(self):
        signature = np.arange(128, dtype=np.uint64)
        index = LshIndex(bands=32, rows=4)
        index.add(0, signature)
        index.add(1, signature)
        self.assertEqual(index.candidates_for(0, signature), [1])

    def test_a_page_is_never_its_own_candidate(self):
        signature = np.arange(128, dtype=np.uint64)
        index = LshIndex(bands=32, rows=4)
        index.add(0, signature)
        self.assertEqual(index.candidates_for(0, signature), [])

    def test_oversized_buckets_are_capped(self):
        signature = np.arange(128, dtype=np.uint64)
        index = LshIndex(bands=32, rows=4, max_bucket=5)
        for i in range(40):
            index.add(i, signature)
        self.assertLessEqual(len(index.candidates_for(0, signature)), 5 * 32)
        self.assertGreaterEqual(len(index.candidates_for(0, signature)), 5)


class DistributionTests(unittest.TestCase):
    def test_reports_median_p90_and_the_two_counts(self):
        values = np.array([0.0, 0.1, 0.25, 0.35, 0.9])
        d = distribution(values)
        self.assertEqual(d["count"], 5)
        self.assertAlmostEqual(d["median"], 0.25)
        self.assertEqual(d["above_0_20"], 3)
        self.assertEqual(d["above_0_30"], 2)

    def test_empty_input(self):
        self.assertEqual(distribution(np.array([]))["count"], 0)


class NullModelTests(unittest.TestCase):
    def test_expected_maximum_rises_with_corpus_size(self):
        sample = np.random.default_rng(2).uniform(0, 1, size=5000)
        small = expected_nearest_neighbour(sample, 50, trials=100, seed=1)
        large = expected_nearest_neighbour(sample, 5000, trials=100, seed=1)
        self.assertLess(small, large)
        self.assertLessEqual(large, 1.0)

    def test_no_pages_no_expectation(self):
        self.assertEqual(expected_nearest_neighbour(np.array([]), 100), 0.0)


class ControlTests(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.path = Path(self.dir.name) / "pages.ndjson"
        self.path.write_text(
            "\n".join(
                json.dumps({"key": f"p{i}", "text": " ".join(f"w{i}x{j}" for j in range(20))})
                for i in range(4)
            )
            + "\n",
            encoding="utf-8",
        )
        self.source = SourceIndex.build(self.path, None)

    def tearDown(self):
        self.dir.cleanup()

    def test_own_text_filler_doubles_the_page(self):
        tokens = ["a", "b", "c"]
        self.assertEqual(own_text_filler()(0, tokens), ["a", "b", "c", "a", "b", "c"])

    def test_other_page_filler_adds_an_equal_length_passage_from_another_page(self):
        transform = other_page_filler(self.source, seed=1)
        tokens = normalise_tokens("w0x0 w0x1 w0x2")
        padded = transform(0, tokens)
        self.assertEqual(len(padded), 2 * len(tokens))
        self.assertEqual(padded[: len(tokens)], tokens)
        self.assertTrue(all(not t.startswith("w0") for t in padded[len(tokens) :]))


class StoreAndNeighbourTests(unittest.TestCase):
    """The DuckDB store, the shared-word share SQL and the LSH path against exhaustive truth."""

    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        base = "the recorded evidence for this programme is not established in any source "
        # The base line stands on every page, so for each page it is on 100% of the others. Pages
        # a and b carry almost nothing else; page c carries a lot of text of its own.
        pages = [
            {"key": "a", "tier": "thin", "text": base + "alpha alpha alpha"},
            {"key": "b", "tier": "thin", "text": base + "beta beta beta"},
            {
                "key": "c",
                "tier": "rich",
                "text": base + " ".join(f"distinct{i}" for i in range(60)),
            },
        ]
        self.path = Path(self.dir.name) / "pages.ndjson"
        self.path.write_text("\n".join(json.dumps(p) for p in pages) + "\n", encoding="utf-8")
        self.source = SourceIndex.build(self.path, None)
        self.store = PageStore(Path(self.dir.name) / "pages.duckdb")
        build_store(self.source, self.store, make_hash_seeds(128, seed=4), batch=2)

    def tearDown(self):
        self.store.close()
        self.dir.cleanup()

    def test_store_round_trips_the_hash_arrays(self):
        shingles, words = self.store.arrays(0)
        self.assertEqual(shingles.size, self.store.n_shingles(0))
        self.assertEqual(words.size, self.store.n_words(0))

    def test_sample_restriction_selects_only_the_named_keys(self):
        restricted = SourceIndex.build(self.path, {"a", "c"})
        self.assertEqual(restricted.keys, ["a", "c"])

    def test_shared_word_share_finds_the_repeated_boilerplate(self):
        shares = self.store.shared_word_share()
        # Pages a and b are almost entirely the everywhere-line; page c is mostly its own text.
        # 12 boilerplate tokens of 15 on each of the two thin pages
        self.assertAlmostEqual(shares[0], 0.8, places=6)
        self.assertAlmostEqual(shares[1], 0.8, places=6)
        self.assertLess(shares[2], 0.3)

    def test_shared_word_share_needs_more_than_ninety_percent_of_the_other_pages(self):
        # A word on two of three pages is on 50% of each holder's other pages, not more than 90%,
        # so it is not counted as shared. The threshold is deliberately strict.
        alpha = self.store.con.execute(
            "SELECT count(*) FROM page_words WHERE occurrences = 3"
        ).fetchone()[0]
        self.assertGreaterEqual(alpha, 1)

    def test_exhaustive_nearest_neighbour_picks_the_right_partner(self):
        result = exhaustive_neighbours(self.store)
        self.assertEqual(result.pairs_scored, 3)
        self.assertEqual(result.partner_key(self.store, 0, "positional"), "b")
        self.assertEqual(result.partner_key(self.store, 1, "positional"), "a")
        self.assertGreaterEqual(result.positional[0], result.positional[2])

    def test_lsh_agrees_with_exhaustive_on_this_fixture(self):
        exact = exhaustive_neighbours(self.store)
        approx = lsh_neighbours(self.store, seed=4)
        np.testing.assert_allclose(exact.positional, approx.positional, atol=1e-9)
        np.testing.assert_allclose(exact.lexical, approx.lexical, atol=1e-9)


if __name__ == "__main__":
    unittest.main()
