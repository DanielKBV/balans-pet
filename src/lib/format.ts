const somGroups = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 })
const percent = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 })

const NBSP = " "
const MINUS = "−"

/** 16000 → «16 000 сом». Whole soms only; `signed` adds «+» to positive amounts. */
export function formatSom(amount: number, { signed = false } = {}): string {
  const rounded = Math.round(amount)
  const sign = rounded < 0 ? MINUS : signed && rounded > 0 ? "+" : ""
  return `${sign}${somGroups.format(Math.abs(rounded)).replace(/\s/g, NBSP)}${NBSP}сом`
}

/** 12.4 → «+12,4%», −3 → «−3%». */
export function formatChange(value: number): string {
  const sign = value < 0 ? MINUS : value > 0 ? "+" : ""
  return `${sign}${percent.format(Math.abs(value))}%`
}

/** «2026-11-04» → «04.11.2026». Works on the date string, so the time zone cannot shift the day. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}.${month}.${year}`
}

const bishkekDate = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Bishkek",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

/** A moment from the database («2026-11-04T20:30:00Z») → its day in Bishkek: «05.11.2026». */
export function formatMoment(timestamp: string): string {
  return bishkekDate.format(new Date(timestamp))
}
