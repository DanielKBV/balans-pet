"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { setLocale } from "@/i18n/actions"

/** RU / EN next to the theme toggle: shows the language it switches to. The session is untouched. */
export function LocaleToggle() {
  const locale = useLocale()
  const t = useTranslations("locale")
  const [isPending, startTransition] = useTransition()
  const next = locale === "ru" ? "en" : "ru"

  return (
    <Button
      variant="ghost"
      size="icon"
      lang={next}
      aria-label={t("aria")}
      title={t("title")}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next)
          // A ?lang= left in the address would bring the old language back on reload.
          const url = new URL(window.location.href)
          if (url.searchParams.has("lang")) {
            url.searchParams.delete("lang")
            window.history.replaceState(null, "", url)
          }
        })
      }
      className="text-small font-medium text-muted-foreground"
    >
      {isPending ? <Spinner className="size-5" /> : next.toUpperCase()}
    </Button>
  )
}
