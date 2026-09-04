/**
 * A database stub (R15; question-derivation amendment "Stub precedence").
 *
 * Fewer than three present fields is not a page with sections missing: it is a record that holds
 * identity, whatever relations resolution found, and a count. It carries no questions, even when
 * the compound is suppressed, and it is not indexed.
 *
 * The supervision line is written only where a classification exists to cite: S1-S9 name the
 * recorded classes, an S10-only page says that no classification is recorded, and a cleared page
 * says nothing at all. Both lines are markup, not a claim about the compound's safety.
 */
import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import { ExactRecord } from './ExactRecord'
import { RelationsRows } from './RelationsRows'

export function StubRecord({ dossier }: { dossier: CorpusDossier }) {
  const fields = dossier.presentFieldCount
  return (
    <div>
      <p className="cd-stub-count">
        This record holds {fields} {fields === 1 ? 'field' : 'fields'}.
      </p>
      {dossier.supervisionLine ? (
        <p className="cd-supervision-line">{dossier.supervisionLine}</p>
      ) : null}
      <ExactRecord identifiers={dossier.identifiers} />
      <RelationsRows relations={dossier.relations} />
    </div>
  )
}
