import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"

import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { createClient } from "@/lib/supabase/server"
import { CategorySection, type Category } from "./category-list"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories")
  return { title: t("metaTitle") }
}

// The heading is static and shows instantly; the lists stream in behind their own skeleton.
export default function CategoriesPage() {
  const t = useTranslations("categories")
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-title">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoryLists />
      </Suspense>
    </div>
  )
}

async function CategoryLists() {
  const membership = await getMembership()
  if (membership?.role !== "owner") redirect("/add")

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, is_hidden")
    .order("created_at")
    .returns<(Category & { type: "income" | "expense" })[]>()
  // Thrown errors show the shared error page with "Try again".
  if (error) throw new Error(error.message)
  const t = await getTranslations("common")

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CategorySection type="income" title={t("incomes")} categories={data.filter((c) => c.type === "income")} />
      <CategorySection type="expense" title={t("expenses")} categories={data.filter((c) => c.type === "expense")} />
    </div>
  )
}

function CategoriesSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  )
}
