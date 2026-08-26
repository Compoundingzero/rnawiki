const FOCUSABLE_SELECTOR = 'a, button, input, select, textarea, summary, [tabindex]'

function directSummary(details: HTMLDetailsElement): HTMLElement | null {
  return details.querySelector<HTMLElement>(':scope > summary')
}

/** Open every nested native disclosure between a hash target and its outer dossier disclosure. */
export function revealDisclosureTarget(
  outerDetails: HTMLDetailsElement,
  target: HTMLElement,
): HTMLElement {
  let nested = (
    target.matches('details') ? target : target.closest('details')
  ) as HTMLDetailsElement | null
  let nearestSummary: HTMLElement | null = null

  while (nested && nested !== outerDetails && outerDetails.contains(nested)) {
    nested.open = true
    nearestSummary ??= directSummary(nested)
    nested = nested.parentElement?.closest('details') ?? null
  }

  const targetHeading = target.matches('h1, h2, h3, h4, h5, h6')
    ? target
    : target.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6')
  return nearestSummary ?? targetHeading ?? target
}

export function focusDisclosureTarget(outerDetails: HTMLDetailsElement, target: HTMLElement): void {
  const focusTarget = revealDisclosureTarget(outerDetails, target)
  if (!focusTarget.matches(FOCUSABLE_SELECTOR)) focusTarget.tabIndex = -1
  focusTarget.focus({ preventScroll: true })
}
