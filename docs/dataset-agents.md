# Dataset agents

A dataset agent is a local algorithm that reads the recorded corpus and produces a derived dataset,
a queue of work for people, or both. Agents run without any language model and without any network
call: they are ordinary deterministic TypeScript, so their output can be regenerated, diffed and
reviewed exactly like the corpus itself.

They live in `lib/agents/`. The mathematical core is in `lib/agents/core/`; each agent is one file
under `lib/agents/dataset/` exporting one `DatasetAgent`.

## The boundary every agent holds

This is a public medical-information site. An agent may compute over recorded values, compare them,
group them, rank them and flag them. An agent may never author medical content. Concretely, no
agent output may:

- **Fill in a value the sources did not state** — imputed, interpolated, averaged into existence or
  predicted — whatever caveat is attached to it. An estimated half-life displayed beside recorded
  ones is a medical claim wearing a disclaimer.
- **Resolve a disagreement** by choosing a winner. Recording that two sources differ is the product;
  deciding which is right is the judgement the record exists to present rather than to make.
- **Assert a property of a medicine** where only a property of a record is observable. "This
  recorded value is unusual among recorded values in its group" is a fact about the corpus. "This
  medicine's half-life is wrong" is not, and nothing an agent computes licenses it.
- **Name a patient action** — take, avoid, adjust, monitor, combine, stop — under any phrasing.
- **Relate two medicines to each other.** This is the hardest line and the least obvious. A
  bipartite medicine-to-enzyme structure is fine, because each edge is a sourced statement about one
  medicine. The projection to medicine-to-medicine is not, however statistically validated it is:
  Stated accurately, because a rule defended on a false basis gets overturned: interaction-lookup
  functions fall under Appendix B of FDA's mobile medical applications guidance, which means they
  **are** device functions over which FDA has said it does not intend to enforce. Enforcement
  discretion is revocable and is not a safe harbour, and the discretion is framed around a
  patient-specific report generated from a current medication list with clinical context — none of
  which a public wiki has. RNAWiki therefore keeps a rule stricter than FDA requires, as a
  deliberate editorial choice. No agent emits a medicine pair, similarity, ranking or "related
  medicines" list.

  The trap is subtler than it looks. Most ingredients are _also_ sold as standalone products:
  amlodipine and atorvastatin are each marketed alone and co-formulated in Caduet, so a validated
  co-formulation edge between them, rendered anywhere reachable from amlodipine's page, is a
  medicine-to-medicine edge wearing an ingredient label. An ingredient pair may be rendered only on
  the page of a product whose own ingredient set contains both endpoints.

- **Frame silence as reassurance or as alarm.** A label that does not state a pediatric half-life
  has not said the medicine is safe for children, and has not said it is dangerous.

`findForbiddenPhrases` in `lib/agents/core/types.ts` screens agent strings mechanically, so the
boundary is enforced by code rather than by remembering to be careful. Every agent's test asserts
its reader-facing output passes it.

## Determinism

RNA Intelligence is contractually deterministic and versioned, and agents inherit that. Several of
the methods they need are randomised in textbook form — k-means initialisation, permutation
baselines, sampled silhouettes — which would make a rerun disagree with the run a person reviewed.

Every randomised step draws from `createRng(seed)` in `lib/agents/core/rng.ts`, seeded from
`AgentInput.seed`. mulberry32 is used because it is exactly specified in 32-bit integer arithmetic
and produces the same stream on every platform. No agent may call `Date.now()`, `new Date()` with no
argument, or `Math.random()`; the run date arrives as `AgentInput.runDate`.

## The mathematical core

| Module          | What it provides                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `rng.ts`        | Seeded uniform, integer and gaussian draws; seeded Fisher-Yates                                                            |
| `statistics.ts` | Type-7 quantiles, median, MAD, outlier-resistant summaries, Benjamini-Hochberg, log-gamma, exact hypergeometric upper tail |
| `conformal.ts`  | Group-conditional split-conformal p-values, log-scale nonconformity                                                        |
| `text.ts`       | Tokenisation with domain stopwords, TF-IDF (sublinear tf, L2), cosine, top terms                                           |
| `cluster.ts`    | Spherical k-means with k-means++ seeding, cluster description, sampled silhouette                                          |

Two properties of this corpus drive the choices. Pharmacokinetic quantities are right-skewed over
orders of magnitude — recorded half-lives run from 0.4 hours to 561 — so summaries are computed on
the log scale. And the values being summarised are the same values being screened for error, so an
estimator whose breakdown point is zero would be corrupted by the very outliers it is meant to
surface. Mean and standard deviation are not used anywhere an outlier-resistant alternative exists.

### Why conformal, and what it cannot do here

An anomaly score is not actionable: a score of 3.7 means nothing, and a threshold chosen to make the
queue a comfortable length is a threshold chosen to produce a comfortable answer. Conformal
calibration converts any score into a p-value that is super-uniform under exchangeability, for any
score function, with no distributional assumption.

Calibration is group-conditional because that is the whole point for this corpus: a three-hour
half-life is unremarkable across all recorded half-lives and conspicuous inside a group measured in
days, and a global screen would surface neither.

**False-discovery control is not reachable at this corpus size, and the code says so rather than
implying otherwise.** Leave-one-out conformal in a group of n cannot emit a p-value below 1/(n+1),
while Benjamini-Hochberg over m tests needs the smallest to fall below alpha/m. With around 900
numeric values and peer groups in the tens, the requirement sits two orders of magnitude below what
the resolution allows, so BH would reject nothing however wrong a value was. Items are therefore
selected at an uncorrected threshold and the **expected number of chance flags** is reported
instead — a number a reviewer can plan around. An empty queue presented as FDR-controlled would read
as a clean corpus, which is the opposite of what it would mean.

### What the anomaly screen is not

Known-correct extreme values exist and are common. Lanthanum carbonate really has 0.002%
bioavailability because it is a phosphate binder designed not to be absorbed. Risedronate really has
a 561-hour terminal half-life because bisphosphonates deposit in bone. A naive global outlier screen
flags both and wastes the reviewer's day.

A flag says a recorded value is unusual among its peers and is worth a human look. It never says the
value is wrong, and it is never a verdict on the source: flagging a value read faithfully from an
FDA label as anomalous would publicly imply the label is mistaken.

## The agents

Nine agents, run by `npx tsx scripts/agents/run-agents.ts`. Every run reports its coverage, and the
queue column is work routed to people rather than changes made automatically.

| Agent                                  | What it computes                                                               | Used | Queue |
| -------------------------------------- | ------------------------------------------------------------------------------ | ---- | ----- |
| `silence-ledger`                       | Every record against 17 fixed questions as RECORDED, NOT_ESTABLISHED or SILENT | 3008 | 40    |
| `mechanism-text-grouping`              | Groups of medicines whose recorded mechanism wording clusters together         | 1240 | 1     |
| `peer-group-anomaly-screen`            | Conformal p-values for recorded numbers against their peer group               | 1026 | 96    |
| `enzyme-and-transporter-documentation` | Per-counterparty documentation profiles, with role and label section           | 585  | 102   |
| `substance-synonyms`                   | Records sharing a substance identifier, as merge candidates                    | 1868 | 178   |
| `evidence-density`                     | How much of the schema each record holds, and how concentrated its sources are | 3008 | 40    |
| `numeric-distributions`                | Distributions per quantity, strictly separated by unit                         | 1325 | 0     |
| `adverse-reaction-term-structure`      | Reaction term profiles and pairs surviving a frequency-preserving null         | 656  | 324   |
| `excerpt-integrity`                    | Independent per-value re-check that each number appears in its cited text      | 1433 | 0     |

Together they publish **7,451 addressable dataset instances**: 17 corpus-wide silence roll-ups, 48
mechanism groups, 8 unit-separated anomaly screens over 90 peer-group calibrations, 36 counterparty
profiles, 89 identity groups, 7 numeric distributions, 1,044 reaction-term profiles, 93 validated
term pairs, 3 integrity roll-ups, and per-record entries for all 3,008 records in two ledgers.

The single largest finding so far: **998 records carry an explicit source statement that pediatric
safety or effectiveness was not established** — 2.6 times the 379 records where a pediatric
population is recorded as addressed, and a distinction that is invisible in every resource that
treats absence and explicit non-establishment as the same blank.

### What the silence ledger cannot yet distinguish

`distinguishesNotEstablished` is false on 11 of the 17 questions, and this is a real information
loss rather than a modelling choice. If a label prints "pharmacokinetics in renal impairment have
not been characterised", the corpus has no field to carry that state for a pharmacokinetic
question, so it arrives as a plain absence and is counted SILENT alongside sources that never
raised the question. Closing that gap needs a schema change to `RecordedPharmacokinetics` and its
siblings, not an agent change.

## Cross-source consensus

The largest single gain in the corpus, and the dataset hardest for anyone else to reproduce.

The extraction pipeline picks one label per medicine and discards the rest. Gabapentin is covered by
more than four hundred published labels because every manufacturer publishes its own, metoprolol by
over three hundred, and roughly 48,000 such documents were being thrown away. Reading all of them
lifts the pharmacokinetic evidence base from 947 documents to 14,058 and gives 375 records a field
corroborated by ten or more independent sources.

Nothing is resolved. Where readings differ they are all kept, each with its own excerpt, and none is
preferred — because most apparent disagreement between labels is not error. Thirty labels put
abiraterone's half-life at 5 hours and one at 18, and that one's excerpt says it is prolonged to
approximately 18 hours in subjects with mild hepatic impairment. That is a different population, not
a contradiction, and the excerpt is what makes it visible.

Built by `scripts/background/build-source-consensus.ts`; validated by Group I rules
`I_CONSENSUS_READING_NOT_IN_EXCERPT`, `I_CONSENSUS_COUNT_INCONSISTENT` and
`I_CONSENSUS_AGREEMENT_INVALID`.

## Why this compounds

The corpus itself is public data and copyable. The schema, the excerpt guarantee and the attribution
guarantee are copyable with effort. The cross-source concordance layer is expensive to reproduce —
it needs the full archive, normalised extraction and per-substance attribution before it exists at
all. The induced structure on top of it only exists if that layer does.

What is not copyable is the record of human judgement: every accept, reject and correction a
reviewer makes. Those decisions are the training signal that sharpens the agents, which surface
better candidates, which produce more decisions. A competitor starting today gets a snapshot; the
loop is what accumulates.

That is also why every agent's queue output is shaped as a question for a person rather than an
automatic correction. The queue is not a chore the agents create — it is the mechanism by which the
corpus gets better than its sources.

## Method choices that were rejected

Recorded because the reasons generalise, and because each of these is the obvious thing to try.

- **Chemical fingerprints (Morgan/ECFP, MACCS) from the recorded molecular formula.** Structurally
  impossible, not merely inaccurate: a formula is a multiset of element counts, while ECFP hashes
  each atom's expanded connectivity neighbourhood. Fingerprints need a connection table (SMILES or
  InChI), and the corpus holds those for 144 medicines.
- **Training word2vec or fastText on the mechanism corpus.** Around 10^5 tokens, three orders of
  magnitude below where those methods produce meaningful vectors. TF-IDF with a truncated basis is
  the right tool at this size; embeddings here would be confident-looking noise.
- **Soundex, Double Metaphone or NYSIIS as a similarity scorer for drug names.** Measured
  recall@10 of 0.3965 against a gold standard. Jaro-Winkler fares no better as a primary scorer,
  because its prefix bonus is exactly wrong for a nomenclature where most confusable pairs share a
  prefix.
- **Mean plus or minus three standard deviations, and the raw 1.5×IQR fence, on pharmacokinetic
  values.** Breakdown point zero, and both over-flag heavily on right-skewed data.
- **Link prediction on a medicine-to-adverse-event graph** to suggest unlisted reactions. This
  invents medical claims, which is the one thing no amount of statistical validity redeems.
- **Imputing missing pharmacokinetic values** by QSAR, nearest neighbour in structure space, or
  matrix completion. Same reason, and the most tempting of all because the gaps are visible.
- **A statistically validated medicine-to-medicine co-metabolism projection.** The statistics are
  sound and the output is still a drug-drug interaction dataset.
- **Registry identifiers as a differentiator.** NCATS Inxight Drugs already publishes them over
  125,036 product ingredients.

## Running agents

Agents are pure functions of `(corpus, seed, runDate)`. Run them with
`npx tsx scripts/agents/run-agents.ts`, which writes each agent's output to
`scripts/seed-data/agents/` as generated TypeScript so a change in the corpus shows up as a diff
rather than as a silent difference.
