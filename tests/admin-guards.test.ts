import assert from "node:assert/strict"
import test from "node:test"
import { activeAdminWhere, isLastActiveAdmin } from "../lib/admin-guards"

test("active-admin counts exclude banned administrators", () => {
  assert.deepEqual(activeAdminWhere, { role: "admin", banned: false })

  const admins = [
    { role: "admin", banned: true },
    { role: "admin", banned: false },
  ]
  const usableAdmins = admins.filter(
    (admin) => admin.role === activeAdminWhere.role && admin.banned === activeAdminWhere.banned
  )
  assert.equal(usableAdmins.length, 1)
})

test("remaining active administrator cannot self-delete after another admin is banned", () => {
  const twoAdmins = [
    { role: "admin", banned: false },
    { role: "admin", banned: false },
  ]
  const afterBan = twoAdmins.map((admin, index) => ({ ...admin, banned: index === 0 }))
  const activeCount = afterBan.filter(
    (admin) => admin.role === activeAdminWhere.role && admin.banned === activeAdminWhere.banned
  ).length

  assert.equal(isLastActiveAdmin(activeCount), true)
  assert.equal(isLastActiveAdmin(2), false)
})
