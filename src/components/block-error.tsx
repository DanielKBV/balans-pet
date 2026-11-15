"use client"

import { catchError, type ErrorInfo } from "next/error"
import { useTranslations } from "next-intl"

import { StateMessage } from "@/components/state-message"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

/** Error state of one block: the rest of the page keeps working. `card` wraps it for blocks that are cards themselves. */
function BlockErrorFallback({ title, card = false }: { title: string; card?: boolean }, { retry }: ErrorInfo) {
  return <BlockErrorMessage title={title} card={card} retry={retry} />
}

// A component of its own: the fallback above is a plain function, hooks need a component.
function BlockErrorMessage({ title, card, retry }: { title: string; card: boolean; retry: () => void }) {
  const t = useTranslations("common")
  const message = (
    <StateMessage
      variant="error"
      title={title}
      description={t("checkInternet")}
      action={
        <Button variant="outline" onClick={() => retry()}>
          {t("retry")}
        </Button>
      }
    />
  )
  return card ? <Card className="py-0">{message}</Card> : message
}

export const BlockError = catchError(BlockErrorFallback)
