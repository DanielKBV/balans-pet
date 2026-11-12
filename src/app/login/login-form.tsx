"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"

import { GoogleIcon } from "@/components/google-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { Label } from "@/components/ui/label"
import { authAction, signInWithGoogle, type AuthMode, type AuthState } from "./actions"

const copy: Record<AuthMode, { title: string; submit: string; pending: string }> = {
  signin: { title: "Вход в Balans", submit: "Войти", pending: "Входим…" },
  signup: { title: "Регистрация", submit: "Зарегистрироваться", pending: "Создаём аккаунт…" },
  forgot: { title: "Восстановление пароля", submit: "Отправить ссылку", pending: "Отправляем…" },
}

const linkClass =
  "rounded-sm text-primary-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"

export function LoginForm() {
  const params = useSearchParams()
  const urlError = params.get("error")
  const urlMode = params.get("mode")
  // ?next= brings the person back (e.g. to an invite); ?mode=signup opens registration.
  // key: the same page with another ?mode= or ?error= (back button, invite links) starts fresh.
  return (
    <LoginModes key={`${urlMode}|${urlError}`} urlError={urlError} urlMode={urlMode} next={params.get("next") ?? ""} />
  )
}

function LoginModes({ urlError, urlMode, next }: { urlError: string | null; urlMode: string | null; next: string }) {
  const linkExpired = urlError === "link"
  const [mode, setMode] = useState<AuthMode>(linkExpired ? "forgot" : urlMode === "signup" ? "signup" : "signin")
  // Controlled: React resets uncontrolled fields after a form action, and the
  // email should survive both a failed attempt and a mode switch.
  const [email, setEmail] = useState("")
  const initial: AuthState = linkExpired && mode === "forgot"
    ? { error: "Ссылка устарела или уже использована. Запросите новую" }
    : urlError === "google" && mode === "signin"
      ? { error: "Не удалось войти через Google. Попробуйте ещё раз" }
      : {}

  // key: switching mode starts with a clean form state
  return (
    <AuthForm key={mode} mode={mode} setMode={setMode} initial={initial} email={email} setEmail={setEmail} next={next} />
  )
}

function AuthForm({
  mode,
  setMode,
  initial,
  email,
  setEmail,
  next,
}: {
  mode: AuthMode
  setMode: (mode: AuthMode) => void
  initial: AuthState
  email: string
  setEmail: (email: string) => void
  next: string
}) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(authAction, initial)
  const { title, submit, pending } = copy[mode]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title">{title}</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Почта</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="name@mail.kg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mode !== "forgot" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="password">Пароль</Label>
              {mode === "signin" && (
                <button type="button" className={`${linkClass} text-small`} onClick={() => setMode("forgot")}>
                  Забыли пароль?
                </button>
              )}
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={mode === "signup" ? 6 : undefined}
              required
            />
            {mode === "signup" && (
              <p className="text-small text-muted-foreground">Не меньше 6 символов</p>
            )}
          </div>
        )}

        {state.error && (
          <p role="alert" className="text-small text-destructive-text">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="text-small text-income">
            {state.message}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? pending : submit}
        </Button>
      </form>

      {mode !== "forgot" && (
        <>
          <div className="flex items-center gap-3 text-small text-muted-foreground">
            <span aria-hidden className="h-px flex-1 bg-border" />
            или
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <GoogleButton />
          </form>
        </>
      )}

      <p className="text-small text-muted-foreground">
        {mode === "signin" ? (
          <>
            Нет аккаунта?{" "}
            <button type="button" className={linkClass} onClick={() => setMode("signup")}>
              Зарегистрироваться
            </button>
          </>
        ) : (
          <>
            {mode === "signup" ? "Уже есть аккаунт? " : "Вспомнили пароль? "}
            <button type="button" className={linkClass} onClick={() => setMode("signin")}>
              Войти
            </button>
          </>
        )}
      </p>
    </div>
  )
}

function GoogleButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" disabled={pending} className="w-full">
      <GoogleIcon className="size-5" />
      {pending ? "Переходим в Google…" : "Войти через Google"}
    </Button>
  )
}
