export function countCsvEntries(csv: string): number {
  if (!csv) return 0

  let inQuotes = false
  let records = 1

  for (let index = 0; index < csv.length; index++) {
    const character = csv[index]

    if (character === '"') {
      if (inQuotes && csv[index + 1] === '"') {
        index++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && csv[index + 1] === "\n") index++
      records++
    }
  }

  if (csv.endsWith("\n") || csv.endsWith("\r")) records--

  return Math.max(0, records - 1)
}
