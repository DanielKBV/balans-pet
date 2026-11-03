import type { Metadata } from "next"

import { AuthShell } from "../login/auth-shell"
import { PasswordForm } from "./password-form"

export const metadata: Metadata = {
  title: "Новый пароль · Balans",
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-title">Новый пароль</h1>
        <p className="text-muted-foreground">
          Если вы входили через Google, здесь можно задать пароль для входа по почте.
        </p>
      </div>
      <PasswordForm />
    </AuthShell>
  )
}
