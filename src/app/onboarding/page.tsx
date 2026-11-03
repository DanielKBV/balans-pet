import type { Metadata } from "next"
import { Suspense, type ReactNode } from "react"
import { redirect } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { AuthShell } from "../login/auth-shell"
import { BusinessForm } from "./business-form"

export const metadata: Metadata = {
  title: "Новый бизнес · Balans",
}

export default function OnboardingPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-title">Новый бизнес</h1>
        <p className="text-muted-foreground">
          Стартовые категории доходов и расходов добавим сами, потом их можно изменить.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <RequireNoBusiness>
          <BusinessForm />
        </RequireNoBusiness>
      </Suspense>
    </AuthShell>
  )
}

async function RequireNoBusiness({ children }: { children: ReactNode }) {
  const membership = await getMembership()
  if (membership) redirect("/dashboard")
  return children
}
