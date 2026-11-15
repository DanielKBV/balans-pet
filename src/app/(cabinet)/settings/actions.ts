"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"
import { businessSchema, displayNameSchema, type BusinessValues, type SettingsResult } from "./schema"

export async function updateBusiness(values: BusinessValues): Promise<SettingsResult> {
  const t = await getTranslations()
  const parsed = businessSchema(t).safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const businessId = await ownBusinessId(supabase)
  if (!businessId) return { error: t("common.saveFailed") }
  // RLS silently skips the row for a non-owner, so an empty result means no rights.
  const { data, error } = await supabase
    .from("businesses")
    .update(parsed.data)
    .eq("id", businessId)
    .select("id")
  if (error) return { error: t("common.saveFailed") }
  if (!data.length) return { error: t("settings.ownerOnly") }

  refresh()
  return {}
}

export async function updateDisplayName(displayName: string): Promise<SettingsResult> {
  const t = await getTranslations()
  const parsed = displayNameSchema(t).safeParse(displayName)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const userId = await currentUserId(supabase)
  const { data, error } = await supabase
    .from("business_members")
    .update({ display_name: parsed.data })
    .eq("user_id", userId)
    .select("user_id")
  if (error || !data.length) return { error: t("common.saveFailed") }

  refresh()
  return {}
}

/** The database deletes only the owner's business and only when the typed name matches exactly. */
export async function deleteBusiness(confirmName: string): Promise<SettingsResult> {
  const t = await getTranslations()
  const supabase = await createClient()
  const businessId = await ownBusinessId(supabase)
  if (!businessId) return { error: t("common.deleteFailed") }
  const { data, error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", businessId)
    .eq("name", confirmName.trim())
    .select("id")
  if (error) return { error: t("common.deleteFailed") }
  if (!data.length) return { error: t("settings.nameMismatch") }

  redirect("/onboarding")
}

type Supabase = Awaited<ReturnType<typeof createClient>>

async function currentUserId(supabase: Supabase) {
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect("/login")
  return data.claims.sub
}

async function ownBusinessId(supabase: Supabase): Promise<string | null> {
  const { data } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", await currentUserId(supabase))
    .maybeSingle()
  return data?.business_id ?? null
}
