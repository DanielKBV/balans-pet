"use server"

import { refresh } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export type CategoryState = { error?: string }

const MAX_LENGTH = 100
const UNIQUE_VIOLATION = "23505"

function readName(rawName: string): string | { error: string } {
  const name = rawName.trim()
  if (!name) return { error: "Введите название категории" }
  if (name.length > MAX_LENGTH) return { error: `Не больше ${MAX_LENGTH} символов` }
  return name
}

function saveError(code: string | undefined): CategoryState {
  if (code === UNIQUE_VIOLATION) return { error: "Такая категория уже есть" }
  return { error: "Не удалось сохранить. Попробуйте ещё раз" }
}

export async function addCategory(type: "income" | "expense", rawName: string): Promise<CategoryState> {
  const name = readName(rawName)
  if (typeof name !== "string") return name
  if (type !== "income" && type !== "expense") return { error: "Неизвестный тип категории" }

  const supabase = await createClient()
  const { error } = await supabase.from("categories").insert({ name, type })
  if (error) return saveError(error.code)

  refresh()
  return {}
}

export async function renameCategory(id: string, rawName: string): Promise<CategoryState> {
  const name = readName(rawName)
  if (typeof name !== "string") return name

  const supabase = await createClient()
  // RLS silently skips rows the user may not edit, so check that one row changed.
  const { data, error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id)
    .select("id")
  if (error) return saveError(error.code)
  if (!data.length) return { error: "Нет прав на изменение этой категории" }

  refresh()
  return {}
}

export async function setCategoryHidden(id: string, isHidden: boolean): Promise<CategoryState> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .update({ is_hidden: isHidden })
    .eq("id", id)
    .select("id")
  if (error) return saveError(error.code)
  if (!data.length) return { error: "Нет прав на изменение этой категории" }

  refresh()
  return {}
}
