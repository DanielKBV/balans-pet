"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

/** Anonymous sign-in and the guest's own «Автомойка Азамата». A second click reuses both. */
export async function startDemo(): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) return { error: "Не удалось открыть демо. Попробуйте ещё раз" }
  }

  const { error } = await supabase.rpc("create_demo_business")
  if (error) return { error: "Не удалось открыть демо. Попробуйте ещё раз" }
  redirect("/dashboard")
}

/** Leaves the demo for a real account: the demo itself is deleted by the database within a day. */
export async function leaveDemo() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login?mode=signup")
}
