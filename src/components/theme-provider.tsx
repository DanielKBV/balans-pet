"use client"

import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Pages that follow the visitor's theme. Everything else (landing, sign-in, invite, 404, errors) is dark only.
const THEMED_PREFIXES = ["/dashboard", "/operations", "/add", "/categories", "/team", "/settings", "/admin", "/design"]

function isThemed(pathname: string) {
  return THEMED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Known on the server too, so the inline theme script sets «dark» before the first paint: no light flash.
  const pathname = usePathname()
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      forcedTheme={isThemed(pathname) ? undefined : "dark"}
    >
      {children}
    </NextThemesProvider>
  )
}
