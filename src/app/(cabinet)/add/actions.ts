"use server"

import { getTranslations } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"
import { entrySaveError, entrySchema, type EntryFormValues, type EntrySaveResult } from "@/lib/entry"

export async function addEntry(values: EntryFormValues): Promise<EntrySaveResult> {
  const t = await getTranslations()
  const parsed = entrySchema(t).safeParse(values)
  // The form runs the same schema, so this only fires for a tampered request.
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { type, amount, categoryId, date, comment } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from("entries").insert({
    type,
    amount,
    category_id: categoryId,
    entry_date: date,
    comment: comment || null,
  })
  if (error) return entrySaveError(error.code, t)
  return {}
}
