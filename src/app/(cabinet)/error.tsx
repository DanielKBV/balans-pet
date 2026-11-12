"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StateMessage } from "@/components/state-message"

// A failed cabinet page shows its error inside the cabinet: the menu and header stay,
// so the person can go to another page. Layout errors still reach app/error.tsx.
export default function CabinetError({ retry }: { retry: () => void }) {
  return (
    <Card className="py-0">
      <StateMessage
        variant="error"
        title="Не удалось загрузить страницу"
        description="Проверьте интернет и попробуйте ещё раз."
        action={<Button onClick={() => retry()}>Повторить</Button>}
      />
    </Card>
  )
}
