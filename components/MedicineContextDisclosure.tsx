import { ChevronDown, CircleHelp } from 'lucide-react'

import type { PublicMedicineContextItem } from '@/lib/public-medicine-context'

interface MedicineContextDisclosureProps {
  label: string
  items: readonly PublicMedicineContextItem[]
  variant?: 'compact' | 'section'
  testId?: string
}

/**
 * A native, server-rendered disclosure for the few technical terms that need more context.
 * Everyday wording always appears before the stored clinical or scientific term.
 */
export function MedicineContextDisclosure({
  label,
  items,
  variant = 'compact',
  testId,
}: MedicineContextDisclosureProps) {
  if (items.length === 0) return null

  const isSection = variant === 'section'

  return (
    <details
      className={`group min-w-0 max-w-full ${
        isSection
          ? 'rounded-[20px] border border-black/[0.08] bg-white p-4 sm:p-5'
          : 'border-t border-black/[0.07] pt-3'
      }`}
      data-testid={testId}
    >
      <summary className="flex min-h-11 max-w-full cursor-pointer list-none items-center gap-2 rounded-xl text-left text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
        <CircleHelp className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 break-words">{label}</span>
        <ChevronDown
          className="ml-auto h-4 w-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>

      <div className="min-w-0 max-w-full pb-1 pt-2">
        <p className="text-sm leading-6 text-[#6E6E73]">
          Everyday wording comes first. The clinical or technical name is kept here so you can match
          it to a study or source.
        </p>
        <dl className="mt-3 min-w-0 max-w-full divide-y divide-black/[0.06]">
          {items.map((context) => (
            <div key={context.key} className="min-w-0 max-w-full py-3 first:pt-0 last:pb-0">
              <dt className="[overflow-wrap:anywhere] text-sm font-semibold leading-6 text-[#1D1D1F]">
                {context.plainMeaning}
              </dt>
              <dd className="mt-1 min-w-0 max-w-full">
                <p className="[overflow-wrap:anywhere] text-xs font-semibold leading-5 text-[#0066CC]">
                  Technical term: {context.technicalTerm}
                </p>
                <p className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#6E6E73]">
                  {context.definition}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  )
}
