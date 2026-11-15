import type { Metadata } from "next"
import { Suspense, type ReactNode } from "react"
import Link from "next/link"
import { KeyRoundIcon, LogOutIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"

import { signOut } from "@/app/login/actions"
import { navItemsFor } from "@/components/app-nav"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { cn } from "@/lib/utils"
import { BusinessForm, DeleteBusiness, ProfileForm } from "./settings-forms"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings")
  return { title: t("metaTitle") }
}

// The heading is static and shows instantly; the sections stream in behind their own skeleton.
export default function SettingsPage() {
  const t = useTranslations("settings")
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-title">{t("title")}</h1>
      <Suspense fallback={<SettingsSkeleton />}>
        <Settings />
      </Suspense>
    </div>
  )
}

async function Settings() {
  const membership = await getMembership()
  if (!membership) return null
  const isOwner = membership.role === "owner"
  const { business } = membership
  const t = await getTranslations()

  return (
    <>
      <OtherSections isOwner={isOwner} />

      {isOwner && (
        <Section title={t("settings.business")}>
          <BusinessForm defaultValues={{ name: business.name, activity: business.activity }} />
        </Section>
      )}

      <Section title={t("settings.profile")}>
        <div className="flex flex-col gap-6">
          {/* One primary button per screen: the owner's is in «Business». */}
          <ProfileForm
            defaultName={membership.display_name ?? membership.email ?? ""}
            buttonVariant={isOwner ? "outline" : "default"}
          />
          {/* A demo guest signed in anonymously: no email, no password. */}
          {!membership.isDemo && (
            <div className="flex flex-col gap-1">
              <span className="text-small text-muted-foreground">{t("settings.loginEmail")}</span>
              <span className="break-words">{membership.email}</span>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            {!membership.isDemo && (
              <Link href="/reset-password" className={cn(buttonVariants({ variant: "outline" }))}>
                <KeyRoundIcon data-icon="inline-start" />
                {t("settings.changePassword")}
              </Link>
            )}
            <form action={signOut}>
              <Button type="submit" variant="outline" className="w-full">
                <LogOutIcon data-icon="inline-start" />
                {t("common.signOut")}
              </Button>
            </form>
          </div>
        </div>
      </Section>

      {isOwner && (
        <Section title={t("settings.deleteTitle")} description={t("settings.deleteDescription")}>
          <DeleteBusiness businessName={business.name} />
        </Section>
      )}
    </>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/** Sections that do not fit into the phone's bottom menu. An employee has none. */
function OtherSections({ isOwner }: { isOwner: boolean }) {
  const t = useTranslations("nav")
  const items = navItemsFor(isOwner).filter((item) => !item.inBottomNav)
  if (!items.length) return null

  return (
    <nav aria-label={t("other")} className="flex flex-col gap-2 sm:flex-row lg:hidden">
      {items.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={cn(buttonVariants({ variant: "outline" }))}>
          <Icon aria-hidden className="size-5 text-muted-foreground" />
          {t(label)}
        </Link>
      ))}
    </nav>
  )
}

function SettingsSkeleton() {
  return (
    <>
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </>
  )
}
