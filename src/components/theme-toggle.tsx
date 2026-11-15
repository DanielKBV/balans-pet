"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const themes = [
  { value: "system", Icon: MonitorIcon },
  { value: "light", Icon: SunIcon },
  { value: "dark", Icon: MoonIcon },
] as const

const subscribe = () => () => {}

/** Cycles system → light → dark. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const t = useTranslations("theme")
  // Theme is known only in the browser; render the neutral icon on the server.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  const index = mounted ? Math.max(0, themes.findIndex((item) => item.value === theme)) : 0
  const current = themes[index]
  const next = themes[(index + 1) % themes.length]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next.value)}
      aria-label={t("aria", { current: t(current.value), next: t(next.value) })}
      title={t("title", { current: t(current.value) })}
    >
      <current.Icon className="size-5 text-muted-foreground" />
    </Button>
  )
}
