"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { startDemo } from "./actions"

export function DemoButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="lg"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await startDemo()
          if (result?.error) toast.error(result.error)
        })
      }
    >
      {isPending && <Spinner />}
      Посмотреть демо
    </Button>
  )
}
