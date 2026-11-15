import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"

import { AuthShell } from "../login/auth-shell"
import { PasswordForm } from "./password-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("resetPassword")
  return { title: t("metaTitle") }
}

export default function ResetPasswordPage() {
  const t = useTranslations("resetPassword")
  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-title">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <PasswordForm />
    </AuthShell>
  )
}
