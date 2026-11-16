import type { Locale } from "@/i18n/config"

// Contacts from docs/launch/MOI_DANNYE.md. Brand names are not translated.
export const REPO_URL = "https://github.com/DanielKBV/balans-pet"

export const CONTACTS = [
  { label: "GitHub", href: "https://github.com/DanielKBV" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/daniel-kubanychbekov-795218276/" },
  { label: "Upwork", href: "https://www.upwork.com/freelancers/~01b283fca85d0e87ae" },
  { label: "Telegram", href: "https://t.me/DanieL_KBV" },
] as const

export const EMAIL = "mr.daniel.kv@gmail.com"

/** Replace the file under the same name to update the résumé (see PROGRESS.md, RUN 2). */
export function resumeHref(locale: Locale) {
  return `/resume/Daniel-Kubanychbekov-CV-${locale}.pdf`
}
