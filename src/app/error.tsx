"use client"

import { Button } from "@/components/ui/button"
import { StateMessage } from "@/components/state-message"

// Lives at the root to also catch errors from the cabinet layout,
// which an error file in (cabinet) would not cover.
export default function Error({ retry }: { retry: () => void }) {
  return (
    <main id="main" className="page-container flex flex-1 items-center justify-center">
      <StateMessage
        variant="error"
        title="Не удалось загрузить страницу"
        description="Проверьте соединение и попробуйте ещё раз."
        action={<Button onClick={() => retry()}>Повторить</Button>}
      />
    </main>
  )
}
