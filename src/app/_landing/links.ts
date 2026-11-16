import type { Locale } from "@/i18n/config"

// Contacts from docs/launch/MOI_DANNYE.md. Brand names are not translated.
export const CONTACTS = {
  github: { label: "GitHub", href: "https://github.com/DanielKBV" },
  telegram: { label: "Telegram", href: "https://t.me/DanieL_KBV" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/daniel-kubanychbekov-795218276/" },
} as const

/** Replace the file under the same name to update the résumé (see PROGRESS.md, RUN 2). */
export function resumeHref(locale: Locale) {
  return `/resume/Daniel-Kubanychbekov-CV-${locale}.pdf`
}
