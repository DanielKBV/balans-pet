import { Suspense, type ReactNode } from "react"
import { redirect } from "next/navigation"
import { LogOutIcon } from "lucide-react"

import { signOut } from "@/app/login/actions"
import { AppHeader } from "@/components/app-nav"
import { CabinetBottomNav, CabinetSidebar } from "@/components/cabinet-nav"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"

export default function CabinetLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">
      <CabinetSidebar className="sticky top-0 hidden h-dvh lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader className="sticky top-0 z-10 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            <Suspense fallback={<Skeleton className="h-5 w-32" />}>
              <BusinessName />
            </Suspense>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Выйти" title="Выйти">
                <LogOutIcon className="size-5 text-muted-foreground" />
              </Button>
            </form>
          </div>
        </AppHeader>
        <main
          id="main"
          className="page-container flex-1 pt-6 pb-[calc(--spacing(6)+var(--spacing-bottom-nav)+env(safe-area-inset-bottom))] lg:py-8"
        >
          <Suspense fallback={<PageSkeleton />}>
            <RequireBusiness>{children}</RequireBusiness>
          </Suspense>
        </main>
      </div>
      <CabinetBottomNav className="fixed inset-x-0 bottom-0 z-10 lg:hidden" />
    </div>
  )
}

async function BusinessName() {
  const membership = await getMembership()
  return <p className="min-w-0 truncate font-medium">{membership?.business.name}</p>
}

async function RequireBusiness({ children }: { children: ReactNode }) {
  const membership = await getMembership()
  if (!membership) redirect("/onboarding")
  return children
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
