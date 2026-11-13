import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { siteOrigin } from "@/lib/site-origin"
import { createClient } from "@/lib/supabase/server"
import { InviteBlock, MemberList, type Member } from "./team-view"

export const metadata: Metadata = {
  title: "Команда · Balans",
}

// The heading is static and shows instantly; the lists stream in behind their own skeleton.
export default function TeamPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-title">Команда</h1>
      <Suspense fallback={<TeamSkeleton />}>
        <Team />
      </Suspense>
    </div>
  )
}

async function Team() {
  const membership = await getMembership()
  if (membership?.role !== "owner") redirect("/add")

  const supabase = await createClient()
  const [members, invites, origin] = await Promise.all([
    supabase
      .from("business_members")
      .select("user_id, role, display_name, email, created_at")
      .order("role", { ascending: false })
      .order("created_at")
      .returns<Member[]>(),
    // The database keeps one active link per business.
    supabase
      .from("invites")
      .select("id, expires_at")
      .is("used_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1),
    siteOrigin(),
  ])
  // Thrown errors show the shared error page with "Повторить".
  if (members.error) throw new Error(members.error.message)
  if (invites.error) throw new Error(invites.error.message)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Пригласить сотрудника</h2>
          </CardTitle>
          <CardDescription>Сотрудник вносит записи и видит только свои. Итоги и прибыль видите только вы.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* The database refuses invites from a demo guest too. */}
          {membership.isDemo ? (
            <p className="text-muted-foreground">В демо приглашения выключены. Создайте свой бизнес, чтобы позвать сотрудников.</p>
          ) : (
            <InviteBlock invite={invites.data[0] ?? null} origin={origin} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Участники</h2>
          </CardTitle>
          <CardDescription>
            {members.data.length === 1 ? "Пока только вы. Пригласите сотрудника ссылкой выше." : `Всего: ${members.data.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MemberList members={members.data} businessName={membership.business.name} />
        </CardContent>
      </Card>
    </>
  )
}

function TeamSkeleton() {
  return (
    <>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </>
  )
}
