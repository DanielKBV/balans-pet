import type { Metadata } from "next"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuthShell } from "./login/auth-shell"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound")
  return { title: t("metaTitle") }
}

// «/» sends a signed-in person to the cabinet, a guest to the landing.
export default function NotFound() {
  const t = useTranslations("notFound")
  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-title">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Link href="/" className={cn(buttonVariants(), "w-full")}>
        {t("home")}
      </Link>
    </AuthShell>
  )
}
