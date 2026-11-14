"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StateMessage } from "@/components/state-message"

export default function AdminError({ retry }: { retry: () => void }) {
  return (
    <main id="main" className="page-container flex flex-1 flex-col py-6 lg:py-8">
      <Card className="py-0">
        <StateMessage
          variant="error"
          title="Не удалось загрузить бизнесы"
          description="Проверьте интернет и попробуйте ещё раз."
          action={<Button onClick={() => retry()}>Повторить</Button>}
        />
      </Card>
    </main>
  )
}
