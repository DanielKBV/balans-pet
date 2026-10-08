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
