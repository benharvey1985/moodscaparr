export const activeAdminWhere = { role: "admin", banned: false } as const

export function isLastActiveAdmin(activeAdminCount: number): boolean {
  return activeAdminCount <= 1
}
