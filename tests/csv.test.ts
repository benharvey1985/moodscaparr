import test from "node:test"
import assert from "node:assert/strict"
import { csvCell } from "../lib/csv"

test("CSV cells preserve ordinary values and empty values", () => {
  assert.equal(csvCell("Happy"), "Happy")
  assert.equal(csvCell(7), "7")
  assert.equal(csvCell(null), "")
  assert.equal(csvCell(undefined), "")
})

test("CSV cells neutralize every spreadsheet formula prefix", () => {
  assert.equal(csvCell("=1+1"), "'=1+1")
  assert.equal(csvCell("+SUM(A1:A2)"), "'+SUM(A1:A2)")
  assert.equal(csvCell("-2+3"), "'-2+3")
  assert.equal(csvCell("@SUM(A1:A2)"), "'@SUM(A1:A2)")
  assert.equal(csvCell(-12), "'-12")
})

test("CSV formula neutralization also handles leading whitespace", () => {
  assert.equal(csvCell("  =cmd"), "'  =cmd")
  assert.equal(csvCell("\t@formula"), "'\t@formula")
})

test("CSV quoting and escaping still apply after neutralization", () => {
  assert.equal(csvCell('say "hello"'), '"say ""hello"""')
  assert.equal(csvCell("line one\nline two"), '"line one\nline two"')
  assert.equal(csvCell('=SUM(1,2)\n"quoted"'), '"\'=SUM(1,2)\n""quoted"""')
})
