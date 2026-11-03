import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { StateMessage } from "@/components/state-message"

/** Placeholder for cabinet pages built at later stages. */
export function PageStub({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title">{title}</h1>
      {children}
      <Card className="py-0">
        <StateMessage variant="empty" title="Раздел в разработке" description={description} />
      </Card>
    </div>
  )
}
