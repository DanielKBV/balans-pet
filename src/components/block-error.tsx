"use client"

import { catchError, type ErrorInfo } from "next/error"

import { StateMessage } from "@/components/state-message"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

/** Error state of one block: the rest of the page keeps working. `card` wraps it for blocks that are cards themselves. */
function BlockErrorFallback({ title, card = false }: { title: string; card?: boolean }, { retry }: ErrorInfo) {
  const message = (
    <StateMessage
      variant="error"
      title={title}
      description="Проверьте интернет и попробуйте ещё раз."
      action={
        <Button variant="outline" onClick={() => retry()}>
          Повторить
        </Button>
      }
    />
  )
  return card ? <Card className="py-0">{message}</Card> : message
}

export const BlockError = catchError(BlockErrorFallback)
