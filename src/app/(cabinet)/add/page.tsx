import type { Metadata } from "next"
import { Suspense } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { todayInBishkek } from "@/lib/entry"
import { createClient } from "@/lib/supabase/server"
import { EntryForm, type EntryCategory } from "@/components/entry-form"
import { addEntry } from "./actions"

export const metadata: Metadata = {
  title: "Добавить запись · Balans",
}

// The heading is static and shows instantly; the form streams in with its categories.
export default function AddPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-title">Добавить запись</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<FormSkeleton />}>
            <EntryFormLoader />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function EntryFormLoader() {
  const membership = await getMembership()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("is_hidden", false)
    .order("created_at")
    .returns<EntryCategory[]>()
  // Thrown errors show the shared error page with "Повторить".
  if (error) throw new Error(error.message)

  return (
    <EntryForm categories={data} today={todayInBishkek()} isOwner={membership?.role === "owner"} save={addEntry} />
  )
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="flex flex-wrap gap-2">
        {[28, 36, 32, 20].map((width) => (
          <Skeleton key={width} className="h-11 rounded-lg" style={{ width: `${width * 4}px` }} />
        ))}
      </div>
      <Skeleton className="h-11 w-56 max-w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg sm:w-48" />
    </div>
  )
}
