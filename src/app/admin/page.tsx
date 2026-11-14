import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { connection } from "next/server"

import { Logo } from "@/components/logo"
import { SignOutIconButton } from "@/components/sign-out-button"
import { StateMessage } from "@/components/state-message"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMoment } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Все бизнесы · Balans",
  robots: { index: false },
}

type Business = {
  id: string
  name: string
  activity: string
  owner_name: string | null
  owner_email: string | null
  members: number
  entries: number
  last_activity: string | null
  created_at: string
}

type Stats = { users: number; businesses: number; entries: number; demos: number }

const count = new Intl.NumberFormat("ru-RU")

// Outside the cabinet: works whether or not the superadmin has a business of their own.
export default function AdminPage() {
  return (
    <>
      <header className="border-b">
        <div className="page-container flex h-header items-center justify-between gap-4">
          <Link href="/" className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <SignOutIconButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="main" className="page-container flex flex-1 flex-col gap-6 py-6 lg:py-8">
        {/* Everything, the heading too, waits for the role check: others get a plain 404. */}
        <Suspense fallback={<AdminSkeleton />}>
          <Admin />
        </Suspense>
      </main>
    </>
  )
}

async function Admin() {
  // Supabase reads the clock (token expiry), so render at request time.
  await connection()
  const supabase = await createClient()
  const { data: isSuperadmin } = await supabase.rpc("is_superadmin")
  if (isSuperadmin !== true) notFound()

  // The database checks the role again in both functions.
  const [businesses, stats] = await Promise.all([
    supabase.rpc("admin_businesses"),
    supabase.rpc("admin_stats"),
  ])
  // Thrown errors show app/admin/error.tsx with «Повторить».
  if (businesses.error) throw new Error(businesses.error.message)
  if (stats.error) throw new Error(stats.error.message)
  const list = businesses.data as Business[]
  const totals = (stats.data as Stats[])[0]

  return (
    <>
      <h1 className="text-title">Все бизнесы</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CountCard label="Пользователей" value={totals.users} />
        <CountCard label="Бизнесов" value={totals.businesses} />
        <CountCard label="Записей" value={totals.entries} />
        <CountCard label="Демо сейчас" value={totals.demos} />
      </div>

      {list.length ? <BusinessList businesses={list} /> : (
        <Card className="py-0">
          <StateMessage variant="empty" title="Бизнесов пока нет" description="Демо-бизнесы здесь не показываются." />
        </Card>
      )}
    </>
  )
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    // No @container: a short count keeps the full text-display size even in a half-width card.
    <Card className="gap-2 px-(--card-spacing)">
      <p className="text-small text-muted-foreground">{label}</p>
      <p className="text-display">{count.format(value)}</p>
    </Card>
  )
}

const lastActivity = (business: Business) => (business.last_activity ? formatMoment(business.last_activity) : "—")
const owner = (business: Business) => business.owner_name || business.owner_email || "—"
// The name is the email until the person sets one: then the email line would repeat it.
const ownerEmail = (business: Business) =>
  business.owner_email && business.owner_email !== owner(business) ? business.owner_email : null

function BusinessList({ businesses }: { businesses: Business[] }) {
  return (
    <>
      <Card className="hidden py-0 lg:flex">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Бизнес</TableHead>
              <TableHead>Владелец</TableHead>
              <TableHead className="text-right">Участников</TableHead>
              <TableHead className="text-right">Записей</TableHead>
              <TableHead>Активность</TableHead>
              <TableHead>Создан</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell>
                  <span className="block max-w-64 truncate font-medium" title={business.name}>
                    {business.name}
                  </span>
                  <span className="block max-w-64 truncate text-small text-muted-foreground" title={business.activity}>
                    {business.activity}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="block max-w-56 truncate" title={owner(business)}>
                    {owner(business)}
                  </span>
                  {ownerEmail(business) && (
                    <span className="block max-w-56 truncate text-small text-muted-foreground" title={ownerEmail(business)!}>
                      {ownerEmail(business)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{count.format(business.members)}</TableCell>
                <TableCell className="text-right tabular-nums">{count.format(business.entries)}</TableCell>
                <TableCell className="tabular-nums">{lastActivity(business)}</TableCell>
                <TableCell className="tabular-nums">{formatMoment(business.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="gap-0 py-0 lg:hidden">
        <ul className="divide-y divide-border">
          {businesses.map((business) => (
            <li key={business.id} className="flex flex-col gap-1 px-4 py-3">
              <span className="line-clamp-2 font-medium break-words" title={business.name}>
                {business.name}
              </span>
              <span className="line-clamp-2 text-small break-words text-muted-foreground">
                {business.activity} · {owner(business)}
                {ownerEmail(business) && ` · ${ownerEmail(business)}`}
              </span>
              <span className="text-small text-muted-foreground tabular-nums">
                Участников: {count.format(business.members)} · Записей: {count.format(business.entries)}
              </span>
              <span className="text-small text-muted-foreground tabular-nums">
                Активность: {lastActivity(business)} · Создан: {formatMoment(business.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}

function AdminSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </>
  )
}
