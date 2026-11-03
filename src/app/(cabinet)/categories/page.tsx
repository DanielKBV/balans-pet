import type { Metadata } from "next"

import { PageStub } from "../page-stub"

export const metadata: Metadata = {
  title: "Категории · Balans",
}

export default function CategoriesPage() {
  return <PageStub title="Категории" description="Здесь можно будет добавлять и скрывать категории." />
}
