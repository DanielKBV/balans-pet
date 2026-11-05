"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/**
 * «‹ Ноябрь 2026 ›». The pressed arrow shows a spinner until the new month has loaded;
 * «next» is disabled on the current month.
 */
export function MonthSwitcher({
  title,
  prevHref,
  nextHref,
}: {
  title: string
  prevHref: string
  nextHref: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pressed, setPressed] = useState<"prev" | "next">()

  function go(direction: "prev" | "next", href: string) {
    setPressed(direction)
    startTransition(() => router.push(href, { scroll: false }))
  }

  return (
    <div className="flex items-center gap-1" aria-busy={isPending}>
      <Button
        variant="outline"
        size="icon"
        aria-label="Предыдущий месяц"
        disabled={isPending}
        onClick={() => go("prev", prevHref)}
      >
        {isPending && pressed === "prev" ? <Spinner className="size-5" /> : <ChevronLeftIcon className="size-5" />}
      </Button>
      <p className="min-w-40 text-center font-medium tabular-nums" aria-live="polite">
        {title}
      </p>
      <Button
        variant="outline"
        size="icon"
        aria-label="Следующий месяц"
        disabled={isPending || !nextHref}
        onClick={() => nextHref && go("next", nextHref)}
      >
        {isPending && pressed === "next" ? <Spinner className="size-5" /> : <ChevronRightIcon className="size-5" />}
      </Button>
    </div>
  )
}
