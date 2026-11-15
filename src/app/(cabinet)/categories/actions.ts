"use server"

import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"

import type { Translate } from "@/i18n/config"
import { createClient } from "@/lib/supabase/server"

export type CategoryState = { error?: string }

const MAX_LENGTH = 100
const UNIQUE_VIOLATION = "23505"

function readName(rawName: string, t: Translate): string | { error: string } {
  const name = rawName.trim()
  if (!name) return { error: t("categories.nameRequired") }
  if (name.length > MAX_LENGTH) return { error: t("common.maxLength", { max: MAX_LENGTH }) }
  return name
}

function saveError(code: string | undefined, t: Translate): CategoryState {
  if (code === UNIQUE_VIOLATION) return { error: t("categories.duplicate") }
  return { error: t("common.saveFailed") }
}

export async function addCategory(type: "income" | "expense", rawName: string): Promise<CategoryState> {
  const t = await getTranslations()
  const name = readName(rawName, t)
  if (typeof name !== "string") return name
  if (type !== "income" && type !== "expense") return { error: t("categories.unknownType") }

  const supabase = await createClient()
  const { error } = await supabase.from("categories").insert({ name, type })
  if (error) return saveError(error.code, t)

  refresh()
  return {}
}

export async function renameCategory(id: string, rawName: string): Promise<CategoryState> {
  const t = await getTranslations()
  const name = readName(rawName, t)
  if (typeof name !== "string") return name

  const supabase = await createClient()
  // RLS silently skips rows the user may not edit, so check that one row changed.
  const { data, error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id)
    .select("id")
  if (error) return saveError(error.code, t)
  if (!data.length) return { error: t("categories.noRights") }

  refresh()
  return {}
}

export async function setCategoryHidden(id: string, isHidden: boolean): Promise<CategoryState> {
  const t = await getTranslations()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .update({ is_hidden: isHidden })
    .eq("id", id)
    .select("id")
  if (error) return saveError(error.code, t)
  if (!data.length) return { error: t("categories.noRights") }

  refresh()
  return {}
}
