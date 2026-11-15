import type { Metadata } from "next"
import { Suspense, type ReactNode } from "react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { createClient } from "@/lib/supabase/server"
import { AuthShell } from "../../login/auth-shell"
import { AcceptButton } from "./accept-button"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("invite")
  return { title: t("metaTitle") }
}

type InviteStatus = "active" | "used" | "expired" | "revoked"

const CLOSED = {
  used: { title: "usedTitle", text: "usedText" },
  expired: { title: "expiredTitle", text: "expiredText" },
  revoked: { title: "revokedTitle", text: "revokedText" },
} as const satisfies Record<Exclude<InviteStatus, "active">, { title: string; text: string }>

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
  const t = await getTranslations()
  const { code } = await params
  if (!z.uuid().safeParse(code).success) return <NotFound title={t("invite.notFoundTitle")} text={t("invite.notFoundText")} />

  const supabase = await createClient()
  const [{ data: info, error }, { data: auth }] = await Promise.all([
    supabase.rpc("invite_info", { p_code: code }),
    supabase.auth.getClaims(),
  ])
  // Thrown errors show the shared error page with "Try again".
  if (error) throw new Error(error.message)
  const invite = (info as { business_name: string; status: InviteStatus }[])[0]
  if (!invite) return <NotFound title={t("invite.notFoundTitle")} text={t("invite.notFoundText")} />

  if (invite.status !== "active") {
    const { title, text } = CLOSED[invite.status]
    return <Message title={t(`invite.${title}`)} text={t(`invite.${text}`)} />
  }

  const back = encodeURIComponent(`/invite/${code}`)
  if (!auth?.claims) {
    return (
      <Message title={t("invite.invitedTitle", { business: invite.business_name })} text={t("invite.guestText")}>
        <div className="flex flex-col gap-2">
          <Button className="w-full" render={<Link href={`/login?mode=signup&next=${back}`} />} nativeButton={false}>
            {t("common.signUp")}
          </Button>
          <Button variant="outline" className="w-full" render={<Link href={`/login?next=${back}`} />} nativeButton={false}>
            {t("common.signIn")}
          </Button>
        </div>
      </Message>
    )
  }

  const membership = await getMembership()
  if (membership) {
    return (
      <Message
        title={t("invite.alreadyTitle")}
        text={t("invite.alreadyText", { current: membership.business.name, invited: invite.business_name })}
      >
        <Button variant="outline" className="w-full" render={<Link href="/dashboard" />} nativeButton={false}>
          {t("invite.toCabinet")}
        </Button>
      </Message>
    )
  }

  return (
    <Message title={t("invite.invitedTitle", { business: invite.business_name })} text={t("invite.memberText")}>
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

function NotFound({ title, text }: { title: string; text: string }) {
  return <Message title={title} text={text} />
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
