import { z } from "zod"

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
 */
export const entrySchema = z.object({
  type: z.enum(["income", "expense"], { error: "Выберите доход или расход" }),
  amount: z
    .string()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .min(1, "Введите сумму")
        .regex(/^\d+$/, "Только целые сомы, без копеек")
        .transform(Number)
        .pipe(
          z
            .number()
            .min(1, "Сумма должна быть больше нуля")
            .max(MAX_AMOUNT, "Слишком большая сумма")
        )
    ),
  categoryId: z.string().min(1, "Выберите категорию"),
  date: z
    .string()
    .min(1, "Укажите дату")
    .pipe(z.iso.date("Укажите дату"))
    .refine((date) => date >= MIN_DATE, "Слишком ранняя дата")
    .refine((date) => date <= todayInBishkek(), "Дата не может быть в будущем"),
  comment: z.string().trim().max(MAX_COMMENT, `Не больше ${MAX_COMMENT} символов`),
})

export type EntryFormValues = z.input<typeof entrySchema>
export type EntryValues = z.output<typeof entrySchema>

export type EntrySaveResult = { error?: string }

const FOREIGN_KEY_VIOLATION = "23503"
const RLS_VIOLATION = "42501"

/** Database error code → message for the person filling in the form. */
export function entrySaveError(code: string): EntrySaveResult {
  if (code === FOREIGN_KEY_VIOLATION) return { error: "Категория не найдена. Обновите страницу" }
  if (code === RLS_VIOLATION) return { error: "Категория скрыта или нет прав. Обновите страницу" }
  return { error: "Не удалось сохранить. Попробуйте ещё раз" }
}
