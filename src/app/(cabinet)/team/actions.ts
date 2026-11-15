"use server"

import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"

export type TeamState = { error?: string; warning?: string }

/** Returns the active link if there is one: the database keeps a single active link per business. */
export async function createInvite(): Promise<TeamState> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("create_invite")
  if (error) {
    const t = await getTranslations("team")
    return { error: t("createFailed") }
  }
  refresh()
  return {}
}

export async function revokeInvite(id: string): Promise<TeamState> {
  const t = await getTranslations("team")
  const supabase = await createClient()
  // Only an unused link is revoked; RLS silently skips rows the user may not edit.
  const { data, error } = await supabase
    .from("invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("used_at", null)
    .is("revoked_at", null)
    .select("id")
  if (error) return { error: t("revokeFailed") }
  if (data.length) {
    refresh()
    return {}
  }

  // Someone may have joined while the page was open: show the new member instead of a false «revoked».
  const { data: invite } = await supabase.from("invites").select("used_at").eq("id", id).maybeSingle()
  if (!invite) return { error: t("noLinkRights") }
  refresh()
  return invite.used_at ? { warning: t("alreadyUsed") } : { warning: t("alreadyRevoked") }
}

export async function removeMember(userId: string): Promise<TeamState> {
  const t = await getTranslations()
  const supabase = await createClient()
  const { data, error } = await supabase.from("business_members").delete().eq("user_id", userId).select("user_id")
  if (error) return { error: t("common.deleteFailed") }
  if (!data.length) return { error: t("team.noRemoveRights") }
  refresh()
  return {}
}
