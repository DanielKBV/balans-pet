"use server"

import { redirect } from "next/navigation"

import { authErrorMessage } from "@/lib/auth-errors"
import { safeNext } from "@/lib/safe-next"
import { siteOrigin } from "@/lib/site-origin"
import { createClient } from "@/lib/supabase/server"

export type AuthMode = "signin" | "signup" | "forgot"
export type AuthState = { error?: string; message?: string }

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

  // Back to where the person came from, e.g. an invite link.
  redirect(safeNext(formData.get("next")))
}

/** Sends the user to Google; they come back through /auth/callback. */
export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(formData.get("next"))
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteOrigin()}/auth/callback?from=google&next=${encodeURIComponent(next)}` },
  })
  if (error) redirect("/login?error=google")
  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
