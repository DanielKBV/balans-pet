import { Suspense, type ReactNode } from "react"
import { redirect } from "next/navigation"

import { AppHeader } from "@/components/app-nav"
import { CabinetBottomNav, CabinetSidebar } from "@/components/cabinet-nav"
import { SignOutIconButton } from "@/components/sign-out-button"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import CabinetLoading from "./loading"

const SIDEBAR_CLASS = "sticky top-0 hidden h-dvh lg:flex"
const BOTTOM_NAV_CLASS = "fixed inset-x-0 bottom-0 z-10 lg:hidden"

export default function CabinetLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">
      {/* Until the role is known, only the items both roles share are shown. */}
      <Suspense fallback={<CabinetSidebar isOwner={false} className={SIDEBAR_CLASS} />}>
        <RoleSidebar />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader className="sticky top-0 z-10 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            <Suspense fallback={<Skeleton className="h-5 w-32" />}>
              <BusinessName />
            </Suspense>
            <SignOutIconButton />
          </div>
        </AppHeader>
        <main
          id="main"
          className="page-container flex-1 pt-6 pb-[calc(--spacing(6)+var(--spacing-bottom-nav)+env(safe-area-inset-bottom))] lg:py-8"
        >
          <Suspense fallback={<CabinetLoading />}>
            <RequireBusiness>{children}</RequireBusiness>
          </Suspense>
        </main>
      </div>
      <Suspense fallback={<CabinetBottomNav isOwner={false} className={BOTTOM_NAV_CLASS} />}>
        <RoleBottomNav />
      </Suspense>
    </div>
  )
}

async function RoleSidebar() {
  const membership = await getMembership()
  return <CabinetSidebar isOwner={membership?.role === "owner"} className={SIDEBAR_CLASS} />
}

async function RoleBottomNav() {
  const membership = await getMembership()
  return <CabinetBottomNav isOwner={membership?.role === "owner"} className={BOTTOM_NAV_CLASS} />
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
