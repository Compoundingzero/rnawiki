import type { TrustTier } from '@/lib/types'

export const TIER_LABEL: Record<TrustTier, string> = {
  new: 'New contributor',
  contributor: 'Contributor',
  trusted: 'Trusted editor',
  steward: 'Steward',
}

export const TIER_DESCRIPTION: Record<TrustTier, string> = {
  new: 'Your suggestions wait for another person to review them.',
  contributor: 'Your suggestions still wait for another person to review them.',
  trusted:
    'You may review another person’s medicine-name correction, but never your own. Scientific programme conclusions require separate qualifications.',
  steward:
    'You may manage review work and review another person’s medicine-name correction, but never your own. Scientific programme conclusions require separately recorded qualifications.',
}
