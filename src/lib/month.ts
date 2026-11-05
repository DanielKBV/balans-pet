import { todayInBishkek } from "@/lib/entry"

/** A month is a «YYYY-MM» string, the same form as in the address: ?month=2026-10. */
export type Month = string

const LONG = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
const SHORT = ["Янв", "Фев", "Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сен", "Окт", "Нояб", "Дек"]

export function currentMonth(): Month {
  return todayInBishkek().slice(0, 7)
}

/** A valid month not later than the current one; anything else gives the current month. */
export function parseMonth(value: unknown): Month {
  const now = currentMonth()
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return now
  return value > now ? now : value
}

export function addMonths(month: Month, count: number): Month {
  const [year, monthIndex] = month.split("-").map(Number)
  const date = new Date(Date.UTC(year, monthIndex - 1 + count, 1))
  return date.toISOString().slice(0, 7)
}

export function firstDay(month: Month): string {
  return `${month}-01`
}

export function lastDay(month: Month): string {
  const [year, monthIndex] = month.split("-").map(Number)
  const day = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()
  return `${month}-${String(day).padStart(2, "0")}`
}

const index = (month: Month) => Number(month.slice(5, 7)) - 1

/** «2026-11» → «Ноябрь 2026». */
export function monthTitle(month: Month): string {
  return `${LONG[index(month)]} ${month.slice(0, 4)}`
}

/** «2026-11» → «ноябрь», for «Выручка за ноябрь». */
export function monthName(month: Month): string {
  return LONG[index(month)].toLowerCase()
}

/** «2026-11» → «Нояб», for chart axes. */
export function monthShort(month: Month): string {
  return SHORT[index(month)]
}
