"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export type BusinessState = { error?: string }

const MAX_LENGTH = 100
const UNIQUE_VIOLATION = "23505"

export async function createBusiness(_prev: BusinessState, formData: FormData): Promise<BusinessState> {
  const name = String(formData.get("name") ?? "").trim()
  const activity = String(formData.get("activity") ?? "").trim()

  if (!name) return { error: "Введите название бизнеса" }
  if (!activity) return { error: "Укажите вид деятельности" }
  if (name.length > MAX_LENGTH || activity.length > MAX_LENGTH) {
    return { error: `Не больше ${MAX_LENGTH} символов в поле` }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc("create_business", { p_name: name, p_activity: activity })

  // Unique violation: this user already has a business (double submit, second tab).
  if (error && error.code !== UNIQUE_VIOLATION) {
    return { error: "Не удалось создать бизнес. Попробуйте ещё раз" }
  }

  redirect("/dashboard")
}
