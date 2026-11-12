import { z } from "zod"

const MAX_LENGTH = 100

function text(empty: string) {
  return z.string().trim().min(1, empty).max(MAX_LENGTH, `Не больше ${MAX_LENGTH} символов`)
}

/** One schema for the form and the server action. */
export const businessSchema = z.object({
  name: text("Введите название бизнеса"),
  activity: text("Укажите вид деятельности"),
})

export type BusinessValues = z.infer<typeof businessSchema>

export const displayNameSchema = text("Введите имя")

export type SettingsResult = { error?: string }
