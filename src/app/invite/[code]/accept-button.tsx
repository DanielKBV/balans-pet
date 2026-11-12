"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { acceptInvite } from "./actions"

export function AcceptButton({ code }: { code: string }) {
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function accept() {
    startTransition(async () => {
      const result = await acceptInvite(code)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button className="w-full" disabled={isPending} onClick={accept}>
        {isPending && <Spinner />}
        Вступить в команду
      </Button>
      {error && (
        <p role="alert" className="text-small text-destructive-text">
          {error}
        </p>
      )}
    </div>
  )
}
