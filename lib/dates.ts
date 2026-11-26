const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
const DAY_IN_MS = 24 * 60 * 60 * 1000

/** Validate a calendar date without involving the host's local timezone. */
export function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) return false

  const instant = new Date(`${value}T12:00:00.000Z`)
  return (
    Number.isFinite(instant.getTime()) &&
    instant.toISOString().slice(0, 10) === value
  )
}

/**
 * Compatibility bridge for code that still needs a Date instant.
 * Date-only values always resolve to noon UTC, never local midnight.
 */
export function parseDateOnly(dateOnly: string): Date {
  if (!isValidDateOnly(dateOnly)) {
    throw new RangeError(`Invalid date-only value: ${dateOnly}`)
  }
  return new Date(`${dateOnly}T12:00:00.000Z`)
}

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) {
    return false
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date(0))
    return true
  } catch {
    return false
  }
}

function datePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value
  if (!year || !month || !day) throw new RangeError("Could not resolve local date")

  return `${year}-${month}-${day}`
}

export function todayInTimeZone(timeZone: string, now: Date = new Date()): string {
  if (!isValidTimeZone(timeZone)) {
    throw new RangeError(`Invalid IANA timezone: ${timeZone}`)
  }
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new RangeError("Invalid current date")
  }
  return datePartsInTimeZone(now, timeZone)
}

export function shiftDateOnly(dateOnly: string, days: number): string {
  if (!Number.isInteger(days)) {
    throw new RangeError("Date shift must be a whole number of days")
  }

  const shifted = parseDateOnly(dateOnly)
  shifted.setUTCDate(shifted.getUTCDate() + days)
  const result = shifted.toISOString().slice(0, 10)
  if (!isValidDateOnly(result)) throw new RangeError("Date shift is out of range")
  return result
}

/** Format a date-only calendar value using UTC, independent of host timezone. */
export function formatLocalDate(
  dateOnly: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(parseDateOnly(dateOnly))
}

export function monthBounds(month: string): { start: string; end: string } {
  if (typeof month !== "string" || !MONTH_PATTERN.test(month)) {
    throw new RangeError(`Invalid month: ${month}`)
  }

  const start = `${month}-01`
  if (!isValidDateOnly(start)) throw new RangeError(`Invalid month: ${month}`)

  const end = parseDateOnly(start)
  end.setUTCMonth(end.getUTCMonth() + 1, 0)
  return { start, end: end.toISOString().slice(0, 10) }
}

/** Inclusive calendar-range start in the user's timezone. */
export function dateRangeStart(
  range: string,
  timeZone: string,
  now: Date = new Date()
): string {
  const today = todayInTimeZone(timeZone, now)

  switch (range) {
    case "today":
      return today
    case "yesterday":
      return shiftDateOnly(today, -1)
    case "7d":
      return shiftDateOnly(today, -6)
    case "30d":
      return shiftDateOnly(today, -29)
    case "90d":
      return shiftDateOnly(today, -89)
    case "month":
      return monthBounds(today.slice(0, 7)).start
    case "year":
      return `${today.slice(0, 4)}-01-01`
    case "all":
      return "0000-01-01"
    default:
      throw new RangeError(`Unsupported date range: ${range}`)
  }
}

/** Sunday-based index (Sunday = 0), matching Date#getUTCDay. */
export function dayOfWeekIndex(dateOnly: string): number {
  return parseDateOnly(dateOnly).getUTCDay()
}

/** UTC calendar date used only for legacy rows that predate localDate. */
export function utcDateOnly(value: string | Date): string {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw new RangeError("Invalid date")
    return value.toISOString().slice(0, 10)
  }
  if (isValidDateOnly(value)) return value

  const instant = new Date(value)
  if (!Number.isFinite(instant.getTime())) throw new RangeError("Invalid date")
  return instant.toISOString().slice(0, 10)
}

export function calendarDayNumber(dateOnly: string): number {
  return parseDateOnly(dateOnly).getTime() / DAY_IN_MS
}
