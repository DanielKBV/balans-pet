import { addMonths, currentMonth, type Month } from "@/lib/month"

/**
 * Month totals for the landing showcase, in the range the demo seed produces
 * (supabase/migrations/0009_locale.sql: ~10 000 сом income a day, rent 45 000, payroll 90 000).
 * Fixed rather than random, so the hero picture and the cabinet window always agree.
 */
const INCOME = [284_300, 297_600, 301_200, 289_800, 312_400, 318_900]
const EXPENSE = [171_200, 168_500, 174_300, 169_900, 172_600, 176_100]

export type SampleMonth = { month: Month; income: number; expense: number }

/** The last six months, the current one last. */
export function sampleMonths(): SampleMonth[] {
  const now = currentMonth()
  return INCOME.map((income, i) => ({ month: addMonths(now, i + 1 - INCOME.length), income, expense: EXPENSE[i] }))
}

/** Same formula as the dashboard cards. */
export function changePercent(current: number, previous: number) {
  return ((current - previous) / Math.abs(previous)) * 100
}

/** Keys in `landing.sample`. */
export type SampleEntry = {
  category: "exteriorWash" | "fullWash" | "detailing" | "supplies" | "utilities" | "other"
  comment: "utilitiesComment" | "otherComment" | null
  amount: number
  type: "income" | "expense"
}

/** `daysAgo` counts from today in Bishkek. */
export const SAMPLE_ENTRIES: (SampleEntry & { daysAgo: number })[] = [
  { category: "fullWash", comment: null, amount: 5_400, type: "income", daysAgo: 0 },
  { category: "exteriorWash", comment: null, amount: 4_800, type: "income", daysAgo: 0 },
  { category: "detailing", comment: null, amount: 3_200, type: "income", daysAgo: 1 },
  { category: "supplies", comment: null, amount: 5_600, type: "expense", daysAgo: 1 },
  { category: "other", comment: "otherComment", amount: 900, type: "income", daysAgo: 2 },
]

/** New entries that keep arriving in the landing's cabinet window, in the demo seed's ranges. */
export const LIVE_FEED: SampleEntry[] = [
  { category: "exteriorWash", comment: null, amount: 3_600, type: "income" },
  { category: "fullWash", comment: null, amount: 5_400, type: "income" },
  { category: "utilities", comment: "utilitiesComment", amount: 7_200, type: "expense" },
  { category: "detailing", comment: null, amount: 3_200, type: "income" },
  { category: "other", comment: "otherComment", amount: 900, type: "income" },
  { category: "supplies", comment: null, amount: 5_600, type: "expense" },
]
