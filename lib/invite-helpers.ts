export const INVITE_RESERVATION_MINUTES = 15

export interface InviteCodeState {
  active: boolean
  expiresAt: Date
  uses: number
  maxUses: number
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function inviteReservationExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + INVITE_RESERVATION_MINUTES * 60 * 1000)
}

export function isInviteReservationActive(
  expiresAt: Date | string | null,
  now = new Date()
): boolean {
  if (!expiresAt) return false
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() > now.getTime()
}

export function getInviteCodeError(
  invite: InviteCodeState | null,
  now = new Date()
): string | null {
  if (!invite) return "Invalid invite code"
  if (!invite.active) return "Invite code has been revoked"
  if (invite.expiresAt.getTime() <= now.getTime()) return "Invite code has expired"
  if (invite.uses >= invite.maxUses) return "Invite code has reached maximum uses"
  return null
}
