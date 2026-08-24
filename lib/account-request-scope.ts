export function accountScopeKey(accountId: string | null | undefined): string {
  return accountId ?? 'signed-out'
}

export function isCurrentAccountRequest(args: {
  accountKey: string
  currentAccountKey: string
  accountGeneration: number
  currentAccountGeneration: number
  aborted?: boolean
}): boolean {
  return (
    args.aborted !== true &&
    args.accountKey === args.currentAccountKey &&
    args.accountGeneration === args.currentAccountGeneration
  )
}
