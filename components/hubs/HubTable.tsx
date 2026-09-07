/**
 * The hub comparison table (docs/specs/hubs.md §2 item 2).
 *
 * One row per member page, columns in the order the spec fixes. Every cell is a value — a status
 * word, a class code, a count, a share — and never a sentence, so the uniqueness ruler reads only
 * the synthesis and the same table markup on nine hundred hubs is not counted as repeated prose.
 *
 * A cell the registers do not fill carries the recorded absence word the registration block wrote
 * ("not found", "not cleared"), so a reader can tell a register that was checked and found nothing
 * from one that this run could not check.
 *
 * The table scrolls inside its own container. At 320 px the page itself never scrolls sideways.
 */
import Link from 'next/link'

import { HUB_JURISDICTION_COLUMNS, type HubMemberRecord, type HubType } from '@/lib/hubs/types'

const CELL = 'px-2 py-2 align-top border-b border-black/[0.06] whitespace-nowrap'
const HEAD = 'px-2 py-2 text-left font-semibold text-[#1D1D1F] border-b border-black/[0.12]'

function value(text: string): string {
  return text.trim() === '' ? '—' : text
}

export function HubTable({
  members,
  hubType,
  hubName,
}: {
  members: HubMemberRecord[]
  hubType: HubType
  hubName: string
}) {
  const showPotency = hubType === 'target'
  return (
    <section aria-labelledby="hub-table-heading" className="space-y-3">
      <h2 className="text-xl font-bold text-[#1D1D1F]" id="hub-table-heading">
        Every member, side by side
      </h2>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="min-w-full text-[12px] border-collapse">
          <caption className="text-left text-[11px] text-[#6E6E73] pb-2">
            {members.length} member {members.length === 1 ? 'page' : 'pages'}. Each cell is a
            recorded value; where a register holds no record the cell says which.
          </caption>
          <thead>
            <tr>
              <th className={HEAD} scope="col">
                Medicine
              </th>
              {HUB_JURISDICTION_COLUMNS.map((column) => (
                <th className={HEAD} key={column.code} scope="col">
                  <abbr title={column.label}>{column.code}</abbr>
                </th>
              ))}
              <th className={HEAD} scope="col">
                Singapore forensic class
              </th>
              <th className={HEAD} scope="col">
                Generic available
              </th>
              {showPotency ? (
                <th className={HEAD} scope="col">
                  pChEMBL against {hubName}
                </th>
              ) : null}
              <th className={HEAD} scope="col">
                Approved indications
              </th>
              <th className={HEAD} scope="col">
                Withdrawn
              </th>
              <th className={HEAD} scope="col">
                Trials · results posted
              </th>
              <th className={HEAD} scope="col">
                Tier
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.key}>
                <th className={`${CELL} text-left font-medium`} scope="row">
                  {member.slug ? (
                    <Link
                      className="text-[#0B5FFF] underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
                      href={`/d/${member.slug}`}
                    >
                      {member.name}
                    </Link>
                  ) : (
                    member.name
                  )}
                </th>
                {HUB_JURISDICTION_COLUMNS.map((column) => (
                  <td className={CELL} key={column.code}>
                    {value(String(member[column.field] ?? ''))}
                  </td>
                ))}
                <td className={CELL}>{value(member.sgForensicClass)}</td>
                <td className={CELL}>{value(member.genericAvailable)}</td>
                {showPotency ? <td className={CELL}>{value(member.potency)}</td> : null}
                <td className={`${CELL} whitespace-normal min-w-[14rem]`}>
                  {member.indicationCount === 0
                    ? 'no label indication on record'
                    : `${member.indications} (${member.indicationCount})`}
                </td>
                <td className={`${CELL} whitespace-normal min-w-[10rem]`}>
                  {member.withdrawnReason === '' && member.withdrawnWhere === ''
                    ? '—'
                    : `${value(member.withdrawnReason)}${
                        member.withdrawnWhere ? ` · ${member.withdrawnWhere}` : ''
                      }`}
                </td>
                <td className={CELL}>
                  {member.trialsCount} · {value(member.resultsPostedShare)}
                </td>
                <td className={CELL}>{member.tier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
