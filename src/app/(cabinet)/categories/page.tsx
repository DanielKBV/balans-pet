import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getMembership } from "@/lib/business"
import { createClient } from "@/lib/supabase/server"
import { CategorySection, type Category } from "./category-list"

export const metadata: Metadata = {
  title: "Категории · Balans",
}

export default async function CategoriesPage() {
  const membership = await getMembership()
  if (membership?.role !== "owner") redirect("/add")

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, is_hidden")
    .order("created_at")
    .returns<(Category & { type: "income" | "expense" })[]>()
  // Thrown errors show the shared error page with "Повторить".
  if (error) throw new Error(error.message)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-title">Категории</h1>
        <p className="text-muted-foreground">
          Скрытая категория пропадает из формы новой записи, старые записи по ней остаются.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CategorySection type="income" title="Доходы" categories={data.filter((c) => c.type === "income")} />
        <CategorySection type="expense" title="Расходы" categories={data.filter((c) => c.type === "expense")} />
      </div>
    </div>
  )
}
