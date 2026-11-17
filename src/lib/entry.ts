import { z } from "zod"

import type { Translate } from "@/i18n/config"

export type EntryType = "income" | "expense"

export const MAX_AMOUNT = 1_000_000_000
export const MAX_COMMENT = 500
export const MIN_DATE = "2000-01-01"

/** Today as YYYY-MM-DD in Bishkek, whatever the device or server time zone. */
export function todayInBishkek(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bishkek" }).format(new Date())
}

/**
 * One schema for the form and the server action: the browser shows the errors,
 * the server checks the same rules again before writing.
 * Form values are strings; the parsed result is ready for the database.
 * `t` gives the error texts in the visitor's language.
 */
export function entrySchema(t: Translate) {
  return z.object({
    type: z.enum(["income", "expense"], { error: t("entries.typeRequired") }),
    amount: z
      .string()
      .transform((value) => value.replace(/\s/g, ""))
      // English groups thousands with commas («5,400»); only that exact pattern is unpacked,
      // so «100,50» still reads as a decimal and gets «whole soms only».
      .transform((value) => (/^\d{1,3}(,\d{3})+$/.test(value) ? value.replace(/,/g, "") : value))
      .pipe(
        z
          .string()
          .min(1, t("entries.amountRequired"))
          .regex(/^\d+$/, t("entries.wholeOnly"))
          .transform(Number)
          .pipe(z.number().min(1, t("entries.positive")).max(MAX_AMOUNT, t("entries.tooLarge")))
      ),
    categoryId: z.string().min(1, t("entries.categoryRequired")),
    date: z
      .string()
      .min(1, t("entries.dateRequired"))
      .pipe(z.iso.date(t("entries.dateRequired")))
      .refine((date) => date >= MIN_DATE, t("entries.tooEarly"))
      .refine((date) => date <= todayInBishkek(), t("entries.future")),
    comment: z.string().trim().max(MAX_COMMENT, t("common.maxLength", { max: MAX_COMMENT })),
  })
}

type EntrySchema = ReturnType<typeof entrySchema>

export type EntryFormValues = z.input<EntrySchema>
export type EntryValues = z.output<EntrySchema>

export type EntrySaveResult = { error?: string }

const FOREIGN_KEY_VIOLATION = "23503"
const RLS_VIOLATION = "42501"

/** Database error code → message for the person filling in the form. */
export function entrySaveError(code: string, t: Translate): EntrySaveResult {
  if (code === FOREIGN_KEY_VIOLATION) return { error: t("entries.categoryMissing") }
  if (code === RLS_VIOLATION) return { error: t("entries.categoryHidden") }
  return { error: t("common.saveFailed") }
}
