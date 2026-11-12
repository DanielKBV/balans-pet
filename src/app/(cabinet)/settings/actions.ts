"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { businessSchema, displayNameSchema, type BusinessValues, type SettingsResult } from "./schema"

export async function updateBusiness(values: BusinessValues): Promise<SettingsResult> {
  const parsed = businessSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const businessId = await ownBusinessId(supabase)
  if (!businessId) return { error: "Не удалось сохранить. Попробуйте ещё раз" }
  // RLS silently skips the row for a non-owner, so an empty result means no rights.
  const { data, error } = await supabase
    .from("businesses")
    .update(parsed.data)
    .eq("id", businessId)
    .select("id")
  if (error) return { error: "Не удалось сохранить. Попробуйте ещё раз" }
  if (!data.length) return { error: "Менять бизнес может только владелец" }

  refresh()
  return {}
}

export async function updateDisplayName(displayName: string): Promise<SettingsResult> {
  const parsed = displayNameSchema.safeParse(displayName)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const userId = await currentUserId(supabase)
  const { data, error } = await supabase
    .from("business_members")
    .update({ display_name: parsed.data })
    .eq("user_id", userId)
    .select("user_id")
  if (error || !data.length) return { error: "Не удалось сохранить. Попробуйте ещё раз" }

  refresh()
  return {}
}

/** The database deletes only the owner's business and only when the typed name matches exactly. */
export async function deleteBusiness(confirmName: string): Promise<SettingsResult> {
  const supabase = await createClient()
  const businessId = await ownBusinessId(supabase)
  if (!businessId) return { error: "Не удалось удалить. Попробуйте ещё раз" }
  const { data, error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", businessId)
    .eq("name", confirmName.trim())
    .select("id")
  if (error) return { error: "Не удалось удалить. Попробуйте ещё раз" }
  if (!data.length) return { error: "Название не совпадает или нет прав" }

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
