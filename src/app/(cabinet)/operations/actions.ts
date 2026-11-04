"use server"

import { refresh } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { entrySaveError, entrySchema, type EntryFormValues, type EntrySaveResult } from "@/lib/entry"

export async function updateEntry(id: string, values: EntryFormValues): Promise<EntrySaveResult> {
  const parsed = entrySchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { type, amount, categoryId, date, comment } = parsed.data

  const supabase = await createClient()
  // RLS silently skips rows the user may not edit, so check that one row changed.
  const { data, error } = await supabase
    .from("entries")
    .update({ type, amount, category_id: categoryId, entry_date: date, comment: comment || null })
    .eq("id", id)
    .select("id")
  if (error) return entrySaveError(error.code)
  if (!data.length) return { error: "Нет прав на изменение этой записи" }

  refresh()
  return {}
}

export async function deleteEntry(id: string): Promise<EntrySaveResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("entries").delete().eq("id", id).select("id")
  if (error) return { error: "Не удалось удалить. Попробуйте ещё раз" }
  if (!data.length) return { error: "Нет прав на удаление этой записи" }

  refresh()
  return {}
}
