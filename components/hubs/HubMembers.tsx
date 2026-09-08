/**
 * The hub's member list (docs/specs/hubs.md §2 item 4).
 *
 * Every member, linked, grouped by the role the registers record, each with its own page's first
 * question as its one-line description. The list is what makes a leaf below its tier's indexing
 * threshold reachable: the hub links every member, and the member page carries the hub back.
 */
import { HUB_MEMBER_ROLES, HUB_MEMBER_ROLE_LABEL, type HubMemberRecord } from '@/lib/hubs/types'

export function HubMembers({ members }: { members: HubMemberRecord[] }) {
  const grouped = HUB_MEMBER_ROLES.map((role) => ({
    role,
    rows: members.filter((member) => member.memberRole === role),
  })).filter((group) => group.rows.length > 0)

  return (
    <section aria-labelledby="hub-members-heading" className="space-y-5">
      <h2 className="text-xl font-bold text-[#1D1D1F]" id="hub-members-heading">
        Members
      </h2>
      {grouped.map((group) => (
        <div className="space-y-2" key={group.role}>
          <h3 className="text-sm font-semibold text-[#1D1D1F]">
            {HUB_MEMBER_ROLE_LABEL[group.role]}{' '}
            <span className="font-normal text-[#6E6E73]">({group.rows.length})</span>
          </h3>
          <ul className="space-y-1.5">
            {group.rows.map((member) => (
              <li className="text-sm leading-relaxed" key={member.key}>
                {member.slug ? (
                  <a
                    className="font-medium text-[#0B5FFF] underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
                    href={`/d/${member.slug}`}
                  >
                    {member.name}
                  </a>
                ) : (
                  <span className="font-medium">{member.name}</span>
                )}{' '}
                {/* §14(7): a text node between the name and the question, so no extractor reads
                    "Golcadomide— Which 2 trials…" as one word. */}
                {member.firstQuestion ? (
                  <span className="text-[#6E6E73]">— {member.firstQuestion}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
