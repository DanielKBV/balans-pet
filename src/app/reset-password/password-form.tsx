"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/password-input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { updatePassword, type PasswordState } from "./actions"

export function PasswordForm() {
  const t = useTranslations()
  const [state, formAction, isPending] = useActionState<PasswordState, FormData>(updatePassword, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("resetPassword.title")}</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <p className="text-small text-muted-foreground">{t("auth.passwordHint")}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">{t("resetPassword.confirm")}</Label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-small text-destructive-text">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Spinner />}
        {t("resetPassword.submit")}
      </Button>
    </form>
  )
}
