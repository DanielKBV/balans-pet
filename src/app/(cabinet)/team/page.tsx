import type { Metadata } from "next"

import { PageStub } from "../page-stub"

export const metadata: Metadata = {
  title: "Команда · Balans",
}

export default function TeamPage() {
  return <PageStub title="Команда" description="Здесь появятся сотрудники и ссылки-приглашения." />
}
