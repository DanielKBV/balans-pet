"use client"

import "./globals.css"

import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { StateMessage } from "@/components/state-message"
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config"
import en from "../../messages/en.json"
import ru from "../../messages/ru.json"

const messages = { en, ru }
const subscribe = () => () => {}

/** The language cookie, read in the browser: this page has no translation provider. */
function cookieLocale(): Locale {
  const value = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))?.[1]
  return isLocale(value) ? value : defaultLocale
}

// Replaces the root layout when it fails, so it brings its own <html> and <body>.
export default function GlobalError({ retry }: { retry: () => void }) {
  const locale = useSyncExternalStore(subscribe, cookieLocale, () => defaultLocale)
  const t = messages[locale]

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh items-center justify-center bg-background text-foreground antialiased">
        <StateMessage
          variant="error"
          title={t.errors.globalTitle}
          description={t.common.checkInternet}
          action={<Button onClick={() => retry()}>{t.common.retry}</Button>}
        />
      </body>
    </html>
  )
}
