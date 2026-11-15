"use server"

import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"

export type BusinessState = { error?: string }

const MAX_LENGTH = 100
const UNIQUE_VIOLATION = "23505"

export async function createBusiness(_prev: BusinessState, formData: FormData): Promise<BusinessState> {
  const name = String(formData.get("name") ?? "").trim()
  const activity = String(formData.get("activity") ?? "").trim()
  const t = await getTranslations()

  if (!name) return { error: t("business.nameRequired") }
  if (!activity) return { error: t("business.activityRequired") }
  if (name.length > MAX_LENGTH || activity.length > MAX_LENGTH) {
    return { error: t("common.maxLengthField", { max: MAX_LENGTH }) }
  }

  const supabase = await createClient()
  // Starter categories are created in the language the business is created in.
  const { error } = await supabase.rpc("create_business", {
    p_name: name,
    p_activity: activity,
    p_locale: await getLocale(),
  })

  // Unique violation: this user already has a business (double submit, second tab).
  if (error && error.code !== UNIQUE_VIOLATION) {
    return { error: t("onboarding.failed") }
  }

  redirect("/dashboard")
}
