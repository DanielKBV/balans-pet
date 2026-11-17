import type { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { AuthShell } from "./auth-shell"
import { LoginForm } from "./login-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return { title: t("metaTitle"), description: t("metaDescription") }
}

export default function LoginPage() {
  return (
    <AuthShell>
      {/* The form reads ?error= from the URL, which is only known at request time. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
