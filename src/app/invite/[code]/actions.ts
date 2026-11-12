"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

const ERRORS: Record<string, string> = {
  P0002: "Ссылка не найдена",
  "22023": "Ссылка уже не действует. Попросите владельца прислать новую",
  "23505": "Вы уже состоите в бизнесе",
  "42501": "Сначала войдите в аккаунт",
}

/** Joins the business by the link; the database checks the link and spends it. */
export async function acceptInvite(code: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("accept_invite", { p_code: code })
  if (error) return { error: ERRORS[error.code] ?? "Не удалось вступить. Попробуйте ещё раз" }
  // An employee's main page.
  redirect("/add")
}
