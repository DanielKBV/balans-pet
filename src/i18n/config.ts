export const locales = ["ru", "en"] as const
export type Locale = (typeof locales)[number]

/** No cookie and no browser hint (bots, link previews) get English. */
export const defaultLocale: Locale = "en"

/** The cookie and the `?lang=en` link use the same name. */
export const LOCALE_COOKIE = "lang"
export const LOCALE_COOKIE_OPTIONS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" } as const

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale)
}

/**
 * Browser languages in order of preference: the first Russian or Kyrgyz one gives `ru`,
 * the first English one gives `en`, anything else falls back to English.
 */
export function localeFromAcceptLanguage(header: string | null): Locale {
  const languages = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, quality] = part.trim().split(";q=")
      return { language: tag.toLowerCase().split("-")[0], quality: quality === undefined ? 1 : Number(quality) || 0 }
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality)

  for (const { language } of languages) {
    if (language === "ru" || language === "ky") return "ru"
    if (language === "en") return "en"
  }
  return defaultLocale
}

/** The whole-dictionary translator (`useTranslations()` / `await getTranslations()`), for shared schemas and messages. */
export type Translate = ReturnType<typeof import("next-intl").useTranslations<never>>
