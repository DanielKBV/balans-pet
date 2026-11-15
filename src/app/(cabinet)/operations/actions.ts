"use server"

import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"
import { entrySaveError, entrySchema, type EntryFormValues, type EntrySaveResult } from "@/lib/entry"

export async function updateEntry(id: string, values: EntryFormValues): Promise<EntrySaveResult> {
  const t = await getTranslations()
  const parsed = entrySchema(t).safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { type, amount, categoryId, date, comment } = parsed.data

  const supabase = await createClient()
  // RLS silently skips rows the user may not edit, so check that one row changed.
  const { data, error } = await supabase
    .from("entries")
    .update({ type, amount, category_id: categoryId, entry_date: date, comment: comment || null })
    .eq("id", id)
    .select("id")
  if (error) return entrySaveError(error.code, t)
  if (!data.length) return { error: t("operations.noEditRights") }

  refresh()
  return {}
}

export async function deleteEntry(id: string): Promise<EntrySaveResult> {
  const t = await getTranslations()
  const supabase = await createClient()
  const { data, error } = await supabase.from("entries").delete().eq("id", id).select("id")
  if (error) return { error: t("common.deleteFailed") }
  if (!data.length) return { error: t("operations.noDeleteRights") }

  refresh()
  return {}
}
