import { useLocale, useTranslations } from "next-intl"

import { formatShare, formatSom } from "@/lib/format"

export type CategoryTotal = { name: string; total: number }

/**
 * Biggest expense categories of a month, largest first: name, amount, share and a bar.
 * Everything after `limit` is summed into one «Other categories» row.
 */
export function TopExpenses({ items, limit = 5 }: { items: CategoryTotal[]; limit?: number }) {
  const locale = useLocale()
  const t = useTranslations("dashboard")
  const total = items.reduce((sum, item) => sum + item.total, 0)
  const rest = items.slice(limit).reduce((sum, item) => sum + item.total, 0)
  const rows = items.slice(0, limit)
  if (rest > 0) rows.push({ name: t("topRest"), total: rest })

  return (
    <ol className="flex flex-col gap-4">
      {rows.map((row) => {
        const share = total ? (row.total / total) * 100 : 0
        return (
          <li key={row.name} className="flex flex-col gap-1.5">
            {/* Narrow column (1024): the amount wraps under the name instead of squeezing it to «Зарп / лата». */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="line-clamp-2 min-w-0 flex-1 basis-32 break-words" title={row.name}>
                {row.name}
              </span>
              <span className="ml-auto shrink-0 tabular-nums">
                <span className="font-medium">{formatSom(row.total, locale)}</span>
                <span className="ml-2 inline-block w-10 text-right text-small text-muted-foreground">
                  {formatShare(share, locale)}
                </span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div className="h-full rounded-full bg-chart-expense" style={{ width: `${Math.max(share, 1)}%` }} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
