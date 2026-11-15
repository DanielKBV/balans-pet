import type { Metadata } from "next"
import { Suspense, type ReactNode } from "react"
import { redirect } from "next/navigation"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"

import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { AuthShell } from "../login/auth-shell"
import { BusinessForm } from "./business-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding")
  return { title: t("metaTitle") }
}

export default function OnboardingPage() {
  const t = useTranslations("onboarding")
  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-title">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
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
