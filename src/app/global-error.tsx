"use client"

import "./globals.css"

import { Button } from "@/components/ui/button"
import { StateMessage } from "@/components/state-message"

// Replaces the root layout when it fails, so it brings its own <html> and <body>.
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="ru">
      <body className="flex min-h-dvh items-center justify-center bg-background text-foreground antialiased">
        <StateMessage
          variant="error"
          title="Не удалось загрузить Balans"
          description="Проверьте интернет и попробуйте ещё раз."
          action={<Button onClick={() => retry()}>Повторить</Button>}
        />
      </body>
    </html>
  )
}
