# The RNAwiki dataset

Every medicine on [rnawiki.com](https://rnawiki.com), as data. Regenerated from the live database
and committed here, so anyone can read it, check it, re-run the sums, or disagree with them.

A claim you cannot check is not evidence. This directory is what makes the rest of the site
checkable.

**Licence: CC BY-SA 4.0** (see [`LICENSE-DATA`](../LICENSE-DATA)). Use it, publish on it, build on
it. Credit RNAwiki and share derivatives under the same terms.

---

## This directory is generated. Do not send pull requests to it.

Every file here is overwritten wholesale on each export. A change committed to `data/` disappears
at the next run.

That is deliberate, and it is the same reason the site works at all: **every edit goes through the
automatic check, and for most contributors through a human reviewer, and the only place that
happens is rnawiki.com.** A second way in through GitHub would be an unchecked one, and the two
copies would diverge the first time somebody edited both.

**To change what is in here, [edit the page](https://rnawiki.com/browse).** It arrives in the next
export. How that works: [rnawiki.com/how-it-works](https://rnawiki.com/how-it-works).

Corrections to the _pipeline_ — the ingest, the enrichment, the checks — are very welcome as pull
requests. That is code, and it lives outside this directory.

---

## What is here

| File                     | What it is                                                           |
| ------------------------ | -------------------------------------------------------------------- |
| `manifest.json`          | Export time, row counts, and a SHA-256 for every file below          |
| `drugs.csv`              | The columns most people want, flat, openable in a spreadsheet        |
| `drugs/drugs-NNN.ndjson` | The complete records. One JSON object per line, 1,000 lines per file |

Newline-delimited JSON, so you can stream it without loading 14 MB into memory:

```bash
cat data/drugs/*.ndjson | jq -c 'select(.modality == "siRNA (Small Interfering RNA)") | {slug, name}'
```

```python
import json
for line in open('data/drugs/drugs-001.ndjson'):
    drug = json.loads(line)
```

Keys are sorted inside each object, so a diff between two exports shows what actually changed
rather than a reshuffle.

## Verifying an export

```bash
python3 - <<'PY'
import hashlib, json, pathlib
manifest = json.load(open('data/manifest.json'))
for entry in manifest['files']:
    digest = hashlib.sha256(pathlib.Path(entry['path']).read_bytes()).hexdigest()
    print('ok  ' if digest == entry['sha256'] else 'BAD ', entry['path'])
PY
```

## The three kinds of record

Read `dossierDepth` before you read anything else. It says how much of a record a human has
touched, and the three levels mean very different things.

| `dossierDepth` | What it means                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flagship`     | Researched by hand. Verdict, mechanism, audits, alternatives, and citations checked one at a time against the source.                                                                                    |
| `curated`      | Built from public records. Mechanism quoted from the FDA label, price from the CMS survey, trials from ClinicalTrials.gov, structure from PubChem and checked by the engine. **Nobody has reviewed it.** |
| `stub`         | A name, a maker and a legal status. Everything else is unwritten.                                                                                                                                        |

`sourceProvenance` on every record names where its facts came from.

## What the fields mean

Full dictionary: [`dictionary.md`](dictionary.md). The type definitions the site itself uses are in
[`lib/types.ts`](../lib/types.ts), and they are the same shapes.

## Things worth knowing before you use this

- **An empty field means nobody has written it**, not that the answer is zero or none. Most records
  have no verdict, no pricing and no alternatives.
- **`trials[].endpointMet` is `false` on machine-added trials, and that means "not recorded".**
  ClinicalTrials.gov carries registrations, not results — whether a trial worked is in the paper.
  Only hand-researched records carry a real answer here.
- **Prices are what pharmacies pay**, from the CMS National Average Drug Acquisition Cost survey,
  not what a patient is charged. US list prices are not published and net prices after rebates are
  confidential.
- **`isMachineVerifiedStructure` means the structure passed the engine**, not that the medicine
  works or the page is right. It also means less on a biologic, where there is no tractable
  structure to check, than on a small molecule.
- **A quoted label passage is marked as one** — it opens "From the FDA-approved label:". Those are
  the manufacturer's words to the regulator, not writing done for this site.

## Live API

If you want current data rather than a snapshot:

```
GET https://rnawiki.com/api/drugs?limit=60&offset=0&modality=Small%20Molecule
GET https://rnawiki.com/api/drugs/metformin
GET https://rnawiki.com/api/search?q=paracetamol
```

Rate limited to 60 requests a minute. For anything larger, use this directory — that is what it is
for.

## Where the underlying data comes from

openFDA (Drugs@FDA, the NDC Directory, SPL labels) · PubChem · ClinicalTrials.gov · the CMS
National Average Drug Acquisition Cost survey · the NIH Dietary Supplement Label Database · and,
for hand-researched records, the individual papers cited on each one.

All public, all free, all cited per record.

## Not medical advice

A public reference work. Nothing here is a recommendation to start, stop or change a treatment.
