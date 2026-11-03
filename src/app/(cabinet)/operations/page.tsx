import type { Metadata } from "next"

import { PageStub } from "../page-stub"

export const metadata: Metadata = {
  title: "Операции · Balans",
}

export default function OperationsPage() {
  return <PageStub title="Операции" description="Здесь появится таблица всех записей с фильтрами." />
}
