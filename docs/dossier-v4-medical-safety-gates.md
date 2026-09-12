# Dossier v4 — medical safety gates

Extends `docs/privacy-and-medical-safety-boundaries.md`. Nothing here relaxes a rule there.

## Gates a slug must pass before the flag is turned on

Run `npx tsx scripts/dossier-v4/check-gate.ts --slugs <slug>`. It exits non-zero if any fails.

| Gate                       | What it checks                                                        |
| -------------------------- | --------------------------------------------------------------------- |
| `identity_passed`          | The identity check on the record passed                               |
| `no_cross_family_merge`    | No unresolved merge across substance families                         |
| `claim_provenance_present` | The opening statement carries a source, not an absence                |
| `trial_roles_valid`        | At least one registered study is classified as testing this substance |
| `no_raw_internal_fields`   | No internal key in reader text                                        |
| `safety_mode_valid`        | Supervision resolved to something other than unknown                  |
| `canonical_metadata_valid` | Canonical metadata present                                            |

The flag is not the decision. A slug that fails a gate is served without the compass.

## Measurement mode

The self-experiment planner is offered only when all of these hold:

- the record's availability resolves to non-prescription;
- the supervision level is not `required`;
- the record is not suppressed, controlled or withdrawn.

Where a register row and a curated row disagree — the register says prescription, the curated row
says supplement — the conservative reading wins and no planner is offered. A unit test and a browser
test both assert this, on separate fixtures, because a record that claims to be both is the exact
case that would otherwise slip through.

Neither mode ever carries an amount. The planner names what to watch, how to establish a baseline,
how long the studies ran, what not to measure and when to stop. The clinician mode replaces all of
that with questions to ask.

## Rules enforced in code, not by review

- **A mechanism is not a benefit.** The body path states it, and the path's own truth terms carry
  "A change inside the body is a reason to look. It is not a result in a person."
- **A biomarker is not an outcome.** The felt/measured/meaningful split is built by a deterministic
  classifier; a term it does not recognise stays unsorted rather than moving to the nearest bucket.
- **An animal result is not a human one.** A path step whose recorded measurement names an animal is
  drawn dashed and says so in words.
- **A prediction is not a finding.** No predicted edge reaches the public path. Where none is held,
  the page says so rather than staying silent.
- **A count is not a rate.** The five spontaneous-report framing sentences appear above any count,
  and a safety line without a denominator says nobody counted the people who were fine.
- **Absence is not safety.** Every "nothing found" carries what was searched and the qualification.
- **Identity decides transfer.** Nothing in the corpus relation vocabulary carries evidence to
  another substance. A stereoisomer, an ester, a component of a mixture and a substance that hits
  the same target are each a different substance, and the page says which.

## Community reports

No third-party forum or archive is read, scraped or imported. The lane renders before any report
exists, with its categories and its ranking rules visible, because a lane that appears only once it
is full of favourable reports is an advert. Four of the ten categories are for things going wrong.
Ranking may use completeness, identity certainty, context, follow-up, confounder disclosure and
whether objective and subjective results were kept apart. It may never use sentiment, and no amount
anybody reports is ever aggregated into a suggestion.

## Private data

Anything a reader types into the clash map stays in that browser. No request carries it, and no
analytics event names a substance or a condition.
