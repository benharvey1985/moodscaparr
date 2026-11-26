import assert from "node:assert/strict"
import test from "node:test"
import { shouldClearUserDataKey } from "../lib/session-cleanup"

test("clears legacy user data regardless of user id", () => {
  assert.equal(shouldClearUserDataKey("mood-draft", "user-1"), true)
  assert.equal(shouldClearUserDataKey("moodscaparr-feedback-history", "user-1"), true)
  assert.equal(shouldClearUserDataKey("moodscaparr-feedback-draft", undefined), true)
})

test("clears only the requested user's scoped keys when an id is supplied", () => {
  assert.equal(shouldClearUserDataKey("mood-draft:user-1", "user-1"), true)
  assert.equal(shouldClearUserDataKey("moodscaparr-feedback-history:user-1", "user-1"), true)
  assert.equal(shouldClearUserDataKey("feedback:user-1", "user-1"), true)
  assert.equal(shouldClearUserDataKey("mood-draft:user-2", "user-1"), false)
})

test("account changes without a user id clear all scoped drafts and feedback", () => {
  assert.equal(shouldClearUserDataKey("mood-draft:user-2"), true)
  assert.equal(shouldClearUserDataKey("moodscaparr-feedback-history:user-2"), true)
  assert.equal(shouldClearUserDataKey("feedback:user-2"), true)
  assert.equal(shouldClearUserDataKey("mood-entries:user-2"), false)
  assert.equal(shouldClearUserDataKey("unrelated-setting"), false)
})
