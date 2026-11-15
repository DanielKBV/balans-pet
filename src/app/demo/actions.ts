"use server"

import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"

/**
 * Anonymous sign-in and the guest's own demo in the current language («Azamat's Car Wash» / «Автомойка Азамата»).
 * A second click reuses both; in the other language the database replaces the demo.
 */
export async function startDemo(): Promise<{ error: string }> {
  const t = await getTranslations("demo")
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) return { error: t("failed") }
  }

  const { error } = await supabase.rpc("create_demo_business", { p_locale: await getLocale() })
  if (error) return { error: t("failed") }
  redirect("/dashboard")
}

/** Leaves the demo for a real account: the demo itself is deleted by the database within a day. */
export async function leaveDemo() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login?mode=signup")
}
