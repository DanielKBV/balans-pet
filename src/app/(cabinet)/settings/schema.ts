import { z } from "zod"

import type { Translate } from "@/i18n/config"

const MAX_LENGTH = 100

function text(empty: string, t: Translate) {
  return z.string().trim().min(1, empty).max(MAX_LENGTH, t("common.maxLength", { max: MAX_LENGTH }))
}

/** One schema for the form and the server action. */
export function businessSchema(t: Translate) {
  return z.object({
    name: text(t("business.nameRequired"), t),
    activity: text(t("business.activityRequired"), t),
  })
}

export type BusinessValues = z.infer<ReturnType<typeof businessSchema>>

export function displayNameSchema(t: Translate) {
  return text(t("settings.displayNameRequired"), t)
}

export type SettingsResult = { error?: string }
