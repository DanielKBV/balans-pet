import type { Metadata } from "next"
import { Suspense, type ReactNode } from "react"
import Link from "next/link"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { createClient } from "@/lib/supabase/server"
import { AuthShell } from "../../login/auth-shell"
import { AcceptButton } from "./accept-button"

export const metadata: Metadata = {
  title: "Приглашение · Balans",
}

type InviteStatus = "active" | "used" | "expired" | "revoked"

const CLOSED: Record<Exclude<InviteStatus, "active">, { title: string; text: string }> = {
  used: { title: "Ссылка уже использована", text: "Одна ссылка — для одного человека. Попросите владельца прислать новую." },
  expired: { title: "Срок ссылки истёк", text: "Ссылка действует 7 дней. Попросите владельца прислать новую." },
  revoked: { title: "Ссылка отозвана", text: "Владелец отменил это приглашение. Если это ошибка, попросите новую ссылку." },
}

// Page 4 of the spec: open to guests and signed-in people alike.
export default function InvitePage({ params }: PageProps<"/invite/[code]">) {
  return (
    <AuthShell>
      <Suspense fallback={<InviteSkeleton />}>
        <Invite params={params} />
      </Suspense>
    </AuthShell>
  )
}

async function Invite({ params }: Pick<PageProps<"/invite/[code]">, "params">) {
  const { code } = await params
  if (!z.uuid().safeParse(code).success) return <NotFound />

  const supabase = await createClient()
  const [{ data: info, error }, { data: auth }] = await Promise.all([
    supabase.rpc("invite_info", { p_code: code }),
    supabase.auth.getClaims(),
  ])
  // Thrown errors show the shared error page with "Повторить".
  if (error) throw new Error(error.message)
  const invite = (info as { business_name: string; status: InviteStatus }[])[0]
  if (!invite) return <NotFound />

  if (invite.status !== "active") {
    const { title, text } = CLOSED[invite.status]
    return <Message title={title} text={text} />
  }

  const back = encodeURIComponent(`/invite/${code}`)
  if (!auth?.claims) {
    return (
      <Message
        title={`Вас пригласили в «${invite.business_name}»`}
        text="Создайте аккаунт или войдите, чтобы вносить выручку и расходы как сотрудник."
      >
        <div className="flex flex-col gap-2">
          <Button className="w-full" render={<Link href={`/login?mode=signup&next=${back}`} />} nativeButton={false}>
            Зарегистрироваться
          </Button>
          <Button variant="outline" className="w-full" render={<Link href={`/login?next=${back}`} />} nativeButton={false}>
            Войти
          </Button>
        </div>
      </Message>
    )
  }

  const membership = await getMembership()
  if (membership) {
    return (
      <Message
        title="Вы уже состоите в бизнесе"
        text={`Ваш аккаунт уже в «${membership.business.name}». В Balans можно состоять только в одном бизнесе. Чтобы вступить в «${invite.business_name}», войдите другим аккаунтом.`}
      >
        <Button variant="outline" className="w-full" render={<Link href="/dashboard" />} nativeButton={false}>
          Перейти в кабинет
        </Button>
      </Message>
    )
  }

  return (
    <Message
      title={`Вас пригласили в «${invite.business_name}»`}
      text="Вы будете сотрудником: вносить записи и видеть свои. Итоги и прибыль видит только владелец."
    >
      <AcceptButton code={code} />
    </Message>
  )
}

function Message({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-title break-words">{title}</h1>
        <p className="text-muted-foreground">{text}</p>
      </div>
      {children}
    </div>
  )
}

function NotFound() {
  return <Message title="Ссылка не найдена" text="Проверьте, что скопировали её целиком, или попросите владельца прислать новую." />
}

function InviteSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  )
}
