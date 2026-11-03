import type { Metadata } from "next"

import { PageStub } from "../page-stub"

export const metadata: Metadata = {
  title: "Добавить запись · Balans",
}

export default function AddPage() {
  return <PageStub title="Добавить запись" description="Здесь появится форма дохода и расхода." />
}
