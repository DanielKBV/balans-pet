"use server"

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { authErrorMessage } from "@/lib/auth-errors"
import { createClient } from "@/lib/supabase/server"

export type PasswordState = { error?: string }

export async function updatePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")
  const t = await getTranslations()

  if (password.length < 6) return { error: t("resetPassword.tooShort") }
  if (password !== confirm) return { error: t("resetPassword.mismatch") }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: authErrorMessage(error, t) }

  redirect("/dashboard")
}
