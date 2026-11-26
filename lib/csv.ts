/** Encode one CSV cell and neutralize spreadsheet formula prefixes. */
export function csvCell(value: string | number | null | undefined): string {
  const text = String(value ?? "")
  const formulaCandidate = text.trimStart()
  const safeText = /^[=+\-@]/.test(formulaCandidate) ? `'${text}` : text

  return /[",\r\n]/.test(safeText)
    ? `"${safeText.replace(/"/g, '""')}"`
    : safeText
}
