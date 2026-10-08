import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatChange, formatSom } from "@/lib/format"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Metric card: label, big amount, change vs previous month.
 * `goodWhen="down"` for expenses: growth is shown as bad (red).
 */
export function StatCard({
  label,
  amount,
  change,
  goodWhen = "up",
}: {
  label: string
  amount: number
  change?: number
  goodWhen?: "up" | "down"
}) {
  const isGood = change !== undefined && (goodWhen === "up" ? change >= 0 : change <= 0)
  const ChangeIcon = change !== undefined && change < 0 ? ArrowDownRightIcon : ArrowUpRightIcon

  return (
    <Card className="gap-2 px-(--card-spacing)">
      <p className="text-small text-muted-foreground">{label}</p>
      <p className="text-display">{formatSom(amount)}</p>
      {change !== undefined && (
        <p className="flex flex-wrap items-center gap-x-1.5 text-small text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium tabular-nums",
              isGood ? "text-income" : "text-expense"
            )}
          >
            <ChangeIcon aria-hidden className="size-4" />
            {formatChange(change)}
          </span>
          к прошлому месяцу
        </p>
      )}
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-3 px-(--card-spacing)" aria-hidden>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-44" />
      <Skeleton className="h-4 w-36" />
    </Card>
  )
}
