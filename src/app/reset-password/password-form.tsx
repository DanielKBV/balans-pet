"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/password-input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { updatePassword, type PasswordState } from "./actions"

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState<PasswordState, FormData>(updatePassword, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Новый пароль</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <p className="text-small text-muted-foreground">Не меньше 6 символов</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Повторите пароль</Label>
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
        Сохранить пароль
      </Button>
    </form>
  )
}
