import assert from "node:assert/strict"
import test from "node:test"
import {
  getInviteCodeError,
  inviteReservationExpiresAt,
  isInviteReservationActive,
  normalizeEmail,
} from "../lib/invite-helpers"

const now = new Date("2026-11-25T12:00:00.000Z")

test("normalizes invite emails consistently", () => {
  assert.equal(normalizeEmail("  Person@Example.COM "), "person@example.com")
})

test("reservations expire after exactly fifteen minutes", () => {
  const expiresAt = inviteReservationExpiresAt(now)
  assert.equal(expiresAt.toISOString(), "2026-11-25T12:15:00.000Z")
  assert.equal(isInviteReservationActive(expiresAt, now), true)
  assert.equal(isInviteReservationActive(expiresAt, expiresAt), false)
  assert.equal(isInviteReservationActive(null, now), false)
})

test("invite validation distinguishes revoked, expired, and full codes", () => {
  const valid = { active: true, expiresAt: new Date("2026-11-26T00:00:00Z"), uses: 2, maxUses: 3 }
  assert.equal(getInviteCodeError(valid, now), null)
  assert.equal(getInviteCodeError({ ...valid, active: false }, now), "Invite code has been revoked")
  assert.equal(
    getInviteCodeError({ ...valid, expiresAt: now }, now),
    "Invite code has expired"
  )
  assert.equal(
    getInviteCodeError({ ...valid, uses: 3 }, now),
    "Invite code has reached maximum uses"
  )
  assert.equal(getInviteCodeError(null, now), "Invalid invite code")
})
