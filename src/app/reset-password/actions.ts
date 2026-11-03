"use server"

import { redirect } from "next/navigation"

import { authErrorMessage } from "@/lib/auth-errors"
import { createClient } from "@/lib/supabase/server"

export type PasswordState = { error?: string }

export async function updatePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (password.length < 6) return { error: "Пароль должен быть не меньше 6 символов" }
  if (password !== confirm) return { error: "Пароли не совпадают" }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: authErrorMessage(error) }

  redirect("/dashboard")
}
