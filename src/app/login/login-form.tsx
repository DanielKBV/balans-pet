"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { GoogleIcon } from "@/components/google-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { authAction, signInWithGoogle, type AuthMode, type AuthState } from "./actions"

const copy = {
  signin: { title: "auth.titleSignin", submit: "common.signIn" },
  signup: { title: "auth.titleSignup", submit: "common.signUp" },
  forgot: { title: "auth.titleForgot", submit: "auth.submitForgot" },
} as const satisfies Record<AuthMode, { title: string; submit: string }>

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
  const t = useTranslations("auth")
  const linkExpired = urlError === "link"
  const [mode, setMode] = useState<AuthMode>(linkExpired ? "forgot" : urlMode === "signup" ? "signup" : "signin")
  // Controlled: React resets uncontrolled fields after a form action, and the
  // email should survive both a failed attempt and a mode switch.
  const [email, setEmail] = useState("")
  const initial: AuthState = linkExpired && mode === "forgot"
    ? { error: t("linkExpired") }
    : urlError === "google" && mode === "signin"
      ? { error: t("googleFailed") }
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
  const t = useTranslations()
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(authAction, initial)
  const { title, submit } = copy[mode]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title">{t(title)}</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mode !== "forgot" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              {mode === "signin" && (
                <button type="button" className={`${linkClass} text-small`} onClick={() => setMode("forgot")}>
                  {t("auth.forgotLink")}
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
              <p className="text-small text-muted-foreground">{t("auth.passwordHint")}</p>
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
          {isPending && <Spinner />}
          {t(submit)}
        </Button>
      </form>

      {mode !== "forgot" && (
        <>
          <div className="flex items-center gap-3 text-small text-muted-foreground">
            <span aria-hidden className="h-px flex-1 bg-border" />
            {t("auth.or")}
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
            {t("auth.noAccount")}{" "}
            <button type="button" className={linkClass} onClick={() => setMode("signup")}>
              {t("common.signUp")}
            </button>
          </>
        ) : (
          <>
            {mode === "signup" ? t("auth.haveAccount") : t("auth.remembered")}{" "}
            <button type="button" className={linkClass} onClick={() => setMode("signin")}>
              {t("common.signIn")}
            </button>
          </>
        )}
      </p>
    </div>
  )
}

function GoogleButton() {
  const { pending } = useFormStatus()
  const t = useTranslations("auth")
  return (
    <Button type="submit" variant="outline" disabled={pending} className="w-full">
      {pending ? <Spinner /> : <GoogleIcon className="size-5" />}
      {t("google")}
    </Button>
  )
}
