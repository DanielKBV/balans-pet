import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"

import { navItemsFor } from "@/components/app-nav"
import { buttonVariants } from "@/components/ui/button"
import { getMembership } from "@/lib/business"
import { PageStub } from "../page-stub"

export const metadata: Metadata = {
  title: "Настройки · Balans",
}

export default function SettingsPage() {
  return (
    <PageStub title="Настройки" description="Здесь появятся настройки бизнеса и профиль.">
      <Suspense>
        <OtherSections />
      </Suspense>
    </PageStub>
  )
}

/** Sections that do not fit into the phone's bottom menu. An employee has none. */
async function OtherSections() {
  const membership = await getMembership()
  const items = navItemsFor(membership?.role === "owner").filter((item) => !item.inBottomNav)
  if (!items.length) return null

  return (
    <nav aria-label="Другие разделы" className="flex flex-col gap-2 sm:flex-row lg:hidden">
      {items.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={buttonVariants({ variant: "outline" })}>
          <Icon aria-hidden className="size-5 text-muted-foreground" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
