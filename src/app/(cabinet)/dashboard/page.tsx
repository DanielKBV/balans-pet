import type { Metadata } from "next"

import { PageStub } from "../page-stub"

export const metadata: Metadata = {
  title: "Дашборд · Balans",
}

export default function DashboardPage() {
  return <PageStub title="Дашборд" description="Здесь появятся выручка, расходы и прибыль за месяц." />
}
