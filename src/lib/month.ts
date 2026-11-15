import type { Locale } from "@/i18n/config"
import { todayInBishkek } from "@/lib/entry"

/** A month is a «YYYY-MM» string, the same form as in the address: ?month=2026-10. */
export type Month = string

const LONG: Record<Locale, string[]> = {
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
}
const SHORT: Record<Locale, string[]> = {
  ru: ["Янв", "Фев", "Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сен", "Окт", "Нояб", "Дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}

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

/** «2026-11» → «Ноябрь 2026» / «November 2026». */
export function monthTitle(month: Month, locale: Locale): string {
  return `${LONG[locale][index(month)]} ${month.slice(0, 4)}`
}

/** «2026-11» → «ноябрь» / «November», for «Выручка за ноябрь» / «Revenue in November». */
export function monthName(month: Month, locale: Locale): string {
  const name = LONG[locale][index(month)]
  return locale === "ru" ? name.toLowerCase() : name
}

/** «2026-11» → «Нояб» / «Nov», for chart axes. */
export function monthShort(month: Month, locale: Locale): string {
  return SHORT[locale][index(month)]
}
