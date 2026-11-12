import Link from "next/link"
import { Suspense, type ReactNode } from "react"
import { connection } from "next/server"

import { Logo } from "@/components/logo"
import { SignOutIconButton } from "@/components/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

/** Centered card layout shared by the login, new-password, invite, onboarding and 404 pages. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b">
        <div className="page-container flex h-header items-center justify-between gap-4">
          {/* A signed-in person goes from «/» to the cabinet (proxy). */}
          <Link
            href="/"
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <Suspense>
              <SignOutButton />
            </Suspense>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="page-container flex flex-1 justify-center py-10 md:py-16">
        <Card className="h-fit w-full max-w-sm gap-6 px-(--card-spacing)">{children}</Card>
      </main>
    </>
  )
}

/** Only for a signed-in person: someone without a business on /onboarding or with the wrong account on an invite. */
async function SignOutButton() {
  // Supabase reads the clock (token expiry), so render at request time.
  await connection()
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return null

  return <SignOutIconButton />
}
