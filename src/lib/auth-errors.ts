import type { AuthError } from "@supabase/supabase-js"

import type { Translate } from "@/i18n/config"

const KNOWN = [
  "invalid_credentials",
  "user_already_exists",
  "email_exists",
  "weak_password",
  "same_password",
  "email_not_confirmed",
  "over_email_send_rate_limit",
  "over_request_rate_limit",
  "validation_failed",
  "session_not_found",
] as const

type KnownCode = (typeof KNOWN)[number]

/** Message for a Supabase Auth error in the visitor's language. */
export function authErrorMessage(error: AuthError, t: Translate) {
  const code = KNOWN.find((known): known is KnownCode => known === error.code)
  return code ? t(`authErrors.${code}`) : t("authErrors.fallback")
}
