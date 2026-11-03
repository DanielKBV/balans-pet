import type { Metadata } from "next"
import Link from "next/link"

import { navItems } from "@/components/app-nav"
import { buttonVariants } from "@/components/ui/button"
import { PageStub } from "../page-stub"

export const metadata: Metadata = {
  title: "Настройки · Balans",
}

export default function SettingsPage() {
  return (
    <PageStub title="Настройки" description="Здесь появятся настройки бизнеса и профиль.">
      {/* These sections do not fit into the phone's bottom menu. */}
      <nav aria-label="Другие разделы" className="flex flex-col gap-2 sm:flex-row lg:hidden">
        {navItems
          .filter((item) => !item.inBottomNav)
          .map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={buttonVariants({ variant: "outline" })}>
              <Icon aria-hidden className="size-5 text-muted-foreground" />
              {label}
            </Link>
          ))}
      </nav>
    </PageStub>
  )
}
