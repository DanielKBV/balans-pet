import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { todayInBishkek } from "@/lib/entry"
import { createClient } from "@/lib/supabase/server"
import { OperationsView, type EntryRow, type FilterCategory, type FilterMember } from "./operations-view"
import { memberName, PAGE_SIZE, parseParams, toSearch } from "./params"

export const metadata: Metadata = {
  title: "Операции · Balans",
}

const RANGE_NOT_SATISFIABLE = "PGRST103"
// The database lets an employee change their own entry for this long after adding it.
const EMPLOYEE_EDIT_MS = 24 * 60 * 60 * 1000

function isFresh(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < EMPLOYEE_EDIT_MS
}

type EntryData = Omit<EntryRow, "author" | "editable"> & { created_at: string; created_by: string | null }

// The heading is static and shows instantly; filters and the table stream in.
export default function OperationsPage({ searchParams }: PageProps<"/operations">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title">Операции</h1>
      <Suspense fallback={<OperationsSkeleton />}>
        <OperationsData searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function OperationsData({ searchParams }: Pick<PageProps<"/operations">, "searchParams">) {
  // The database shows an employee only their own entries; the owner sees everyone's.
  const membership = await getMembership()
  const isOwner = membership?.role === "owner"

  const params = parseParams(await searchParams)
  const supabase = await createClient()

  // Filtering, sorting and paging happen in the database: only one page reaches the browser.
  let query = supabase
    .from("entries")
    .select("id, type, amount, entry_date, comment, category_id, category:categories(name), created_at, created_by", {
      count: "exact",
    })
  if (params.q) query = query.ilike("comment", `%${params.q.replace(/[\\%_]/g, "\\$&")}%`)
  if (params.from) query = query.gte("entry_date", params.from)
  if (params.to) query = query.lte("entry_date", params.to)
  if (params.type) query = query.eq("type", params.type)
  if (params.category) query = query.eq("category_id", params.category)
  if (isOwner && params.author) query = query.eq("created_by", params.author)

  const ascending = params.dir === "asc"
  query =
    params.sort === "amount"
      ? query.order("amount", { ascending }).order("entry_date", { ascending: false })
      : query.order("entry_date", { ascending }).order("created_at", { ascending })
  const offset = (params.page - 1) * PAGE_SIZE

  const [entries, categories, members] = await Promise.all([
    query.range(offset, offset + PAGE_SIZE - 1).returns<EntryData[]>(),
    supabase.from("categories").select("id, name, type, is_hidden").order("created_at").returns<FilterCategory[]>(),
    // Names for «Кто внёс»; an employee sees only their own row, so it is not asked for.
    isOwner
      ? supabase
          .from("business_members")
          .select("user_id, display_name, email")
          .order("role", { ascending: false })
          .order("created_at")
          .returns<FilterMember[]>()
      : { data: [] as FilterMember[], error: null },
  ])

  // A page past the end (old link, last entry deleted) goes back to the first page.
  if (entries.error?.code === RANGE_NOT_SATISFIABLE) redirect(`/operations${toSearch({ ...params, page: 1 })}`)
  // Thrown errors show the shared error page with "Повторить".
  if (entries.error) throw new Error(entries.error.message)
  if (categories.error) throw new Error(categories.error.message)
  if (members.error) throw new Error(members.error.message)

  // A removed employee is no longer in the team, but their entries stay.
  const names = new Map(members.data.map((member) => [member.user_id, memberName(member)]))
  const rows: EntryRow[] = entries.data.map(({ created_at, created_by, ...entry }) => ({
    ...entry,
    author: isOwner ? (created_by && names.get(created_by)) || "Бывший сотрудник" : "",
    editable: isOwner || isFresh(created_at),
  }))

  return (
    <OperationsView
      rows={rows}
      total={entries.count ?? 0}
      params={params}
      categories={categories.data}
      members={members.data}
      isOwner={isOwner}
      today={todayInBishkek()}
    />
  )
}

function OperationsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-[1fr_repeat(4,10rem)]">
        <Skeleton className="col-span-2 h-11 rounded-lg md:col-span-4 xl:col-span-1" />
        {[1, 2, 3, 4].map((key) => (
          <Skeleton key={key} className="h-11 rounded-lg" />
        ))}
      </div>
      <Card className="gap-0 py-0">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </Card>
    </div>
  )
}
