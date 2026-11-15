"use server"

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"

// accept_invite answers with error codes; the text comes from the dictionary.
const ERRORS = {
  P0002: "notFoundTitle",
  "22023": "inactive",
  "23505": "alreadyTitle",
  "42501": "signInFirst",
} as const

/** Joins the business by the link; the database checks the link and spends it. */
export async function acceptInvite(code: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("accept_invite", { p_code: code })
  if (error) {
    const t = await getTranslations("invite")
    const key = ERRORS[error.code as keyof typeof ERRORS]
    return { error: key ? t(key) : t("failed") }
  }
  // An employee's main page.
  redirect("/add")
}
