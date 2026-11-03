"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { authErrorMessage } from "@/lib/auth-errors"
import { createClient } from "@/lib/supabase/server"

export type AuthMode = "signin" | "signup" | "forgot"
export type AuthState = { error?: string; message?: string }

async function siteOrigin() {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}

/** One action for the three modes of the login page. */
export async function authAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const mode = formData.get("mode") as AuthMode
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email) return { error: "Введите почту" }
  if (mode !== "forgot" && !password) return { error: "Введите пароль" }

  const supabase = await createClient()

  if (mode === "forgot") {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
    })
    if (error) return { error: authErrorMessage(error) }
    return {
      message: "Если такой аккаунт есть, мы отправили ссылку на почту. Откройте её в этом же браузере",
    }
  }

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: authErrorMessage(error) }
    // Email confirmation is off in Supabase, so signUp returns a session.
    // If it is turned on, there is no session until the link is opened.
    if (!data.session) return { message: "Проверьте почту: мы отправили ссылку для входа" }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: authErrorMessage(error) }
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
