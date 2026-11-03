import Link from "next/link"
import type { ReactNode } from "react"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card } from "@/components/ui/card"

/** Centered card layout shared by the login and new-password pages. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b">
        <div className="page-container flex h-header items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="page-container flex flex-1 justify-center py-10 md:py-16">
        <Card className="h-fit w-full max-w-sm gap-6 px-(--card-spacing)">{children}</Card>
      </main>
    </>
  )
}
