import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthShell } from "./auth-shell"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Вход · Balans",
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
