"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const themes = [
  { value: "system", label: "как в системе", Icon: MonitorIcon },
  { value: "light", label: "светлая", Icon: SunIcon },
  { value: "dark", label: "тёмная", Icon: MoonIcon },
] as const

const subscribe = () => () => {}

/** Cycles system → light → dark. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // Theme is known only in the browser; render the neutral icon on the server.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  const index = mounted ? Math.max(0, themes.findIndex((t) => t.value === theme)) : 0
  const current = themes[index]
  const next = themes[(index + 1) % themes.length]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next.value)}
      aria-label={`Тема: ${current.label}. Переключить на: ${next.label}`}
      title={`Тема: ${current.label}`}
    >
      <current.Icon className="size-5 text-muted-foreground" />
    </Button>
  )
}
