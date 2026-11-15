import type { Locale } from "@/i18n/config"

const INTL_LOCALE: Record<Locale, string> = { ru: "ru-RU", en: "en-US" }
const CURRENCY: Record<Locale, string> = { ru: "сом", en: "KGS" }

const NBSP = " "
const MINUS = "−"

function perLocale<T>(create: (intlLocale: string) => T): Record<Locale, T> {
  return { ru: create(INTL_LOCALE.ru), en: create(INTL_LOCALE.en) }
}

const groups = perLocale((locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }))
const percent = perLocale((locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }))
const wholePercent = perLocale((locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }))
const compact = new Intl.NumberFormat(INTL_LOCALE.en, { notation: "compact", maximumFractionDigits: 1 })

/** The currency word next to an amount: «сом» / «KGS». */
export function currencyLabel(locale: Locale): string {
  return CURRENCY[locale]
}

/** 16000 → «16 000» / «16,000». */
export function formatNumber(value: number, locale: Locale): string {
  return groups[locale].format(value).replace(/\s/g, NBSP)
}

/** 16000 → «16 000 сом» / «16,000 KGS». Whole soms only; `signed` adds «+» to positive amounts. */
export function formatSom(amount: number, locale: Locale, { signed = false } = {}): string {
  const rounded = Math.round(amount)
  const sign = rounded < 0 ? MINUS : signed && rounded > 0 ? "+" : ""
  return `${sign}${formatNumber(Math.abs(rounded), locale)}${NBSP}${CURRENCY[locale]}`
}

/** 12.4 → «+12,4%» / «+12.4%», −3 → «−3%». */
export function formatChange(value: number, locale: Locale): string {
  const sign = value < 0 ? MINUS : value > 0 ? "+" : ""
  return `${sign}${percent[locale].format(Math.abs(value))}%`
}

/** 45.3 → «45%»: a share of the total. */
export function formatShare(value: number, locale: Locale): string {
  return `${wholePercent[locale].format(value)}%`
}

/** Chart axis: 250000 → «250 тыс.» / «250K», 1500000 → «1,5 млн» / «1.5M». */
export function formatAxis(value: number, locale: Locale): string {
  if (locale === "en") return compact.format(value)
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString(INTL_LOCALE.ru)} млрд`
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString(INTL_LOCALE.ru)} млн`
  if (value >= 1_000) return `${(value / 1_000).toLocaleString(INTL_LOCALE.ru)} тыс.`
  return String(value)
}

const englishDay = new Intl.DateTimeFormat(INTL_LOCALE.en, {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
})

/**
 * «2026-11-04» → «04.11.2026» / «Nov 4, 2026».
 * Works on the date string (UTC parts), so the time zone cannot shift the day.
 */
export function formatDate(isoDate: string, locale: Locale): string {
  const [year, month, day] = isoDate.split("-")
  if (locale === "en") return englishDay.format(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return `${day}.${month}.${year}`
}

const bishkekDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bishkek" })

/** A moment from the database («2026-11-04T20:30:00Z») → its day in Bishkek: «05.11.2026» / «Nov 5, 2026». */
export function formatMoment(timestamp: string, locale: Locale): string {
  return formatDate(bishkekDay.format(new Date(timestamp)), locale)
}
