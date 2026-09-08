/**
 * A database stub (R15; question-derivation amendment "Stub precedence").
 *
 * Fewer than three present fields is not a page with sections missing: it is a record that holds
 * identity, whatever relations resolution found, and a count. It carries no questions, even when
 * the compound is suppressed, and it is not indexed.
 *
 * A suppressed record that has a recorded classification states it in the supervision block above
 * this record view, in the words docs/specs/suppression-classes.md fixes; the block, not the stub,
 * is where a reader meets it, and no class id is ever printed. The one line left here belongs to
 * the record whose registers returned no classification at all, which is a statement about the
 * data held and not a claim about the compound.
 */
import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import { ExactRecord } from './ExactRecord'
import { HubRows } from './HubRows'
import { RelationsRows } from './RelationsRows'

export function StubRecord({ dossier }: { dossier: CorpusDossier }) {
  const fields = dossier.presentFieldCount
  return (
    <div>
      <p className="cd-stub-count">
        This record holds {fields} {fields === 1 ? 'field' : 'fields'}.
      </p>
      {/*
        §11: the S10-only line states an absence in fixed words, so it is furniture. It is still
        printed — a record whose registers returned no classification says so — and the ruler
        leaves it out of the measured text.
      */}
      {dossier.supervisionLine ? (
        <p className="cd-supervision-line" data-furniture="true">
          {dossier.supervisionLine}
        </p>
      ) : null}
      <ExactRecord identifiers={dossier.identifiers} />
      <RelationsRows relations={dossier.relations} />
      {/*
        docs/specs/hubs.md §3: a stub is exactly the page the hub row is for. It is below its
        tier's threshold, so it is noindex,follow, and these links are how it stays reachable.
      */}
      <HubRows hubs={dossier.hubs} />
    </div>
  )
}
