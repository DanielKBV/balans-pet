"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"

import { Money } from "@/components/money"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { LIVE_FEED, type SampleEntry } from "./sample-data"

type Row = SampleEntry & { id: number; date: string }
type Totals = { income: number; expense: number }

const COUNT_MS = 1400
const FEED_MS = 3200

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches

/** A pulsing dot with a hint. Opens on hover, focus or tap; the hint drops down, aligned to the right edge. */
function Hint({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="group/hint absolute top-1 right-1 z-20">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        className="grid size-11 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="lp-hot size-5.5 rounded-full border-2 border-foreground bg-primary" />
      </button>
      <p
        id={id}
        className={cn(
          "absolute top-full right-1.5 w-58 -translate-y-1.5 rounded-lg border bg-popover p-3 text-small text-popover-foreground opacity-0 shadow-popover transition duration-200",
          "pointer-events-none group-hover/hint:translate-y-0 group-hover/hint:opacity-100 group-focus-within/hint:translate-y-0 group-focus-within/hint:opacity-100",
          open && "translate-y-0 opacity-100"
        )}
      >
        {text}
      </p>
    </div>
  )
}

/**
 * The live part of the cabinet window: the cards count up from zero the first time they show,
 * then a new entry from the demo car wash arrives every few seconds and moves the totals.
 */
export function LiveDashboard({
  current,
  previous,
  monthName,
  today,
  initial,
  chart,
}: {
  current: Totals
  previous: Totals
  monthName: string
  today: string
  initial: Row[]
  chart: ReactNode
}) {
  const t = useTranslations()
  const locale = useLocale()
  const [totals, setTotals] = useState(current)
  const [count, setCount] = useState(1)
  const [rows, setRows] = useState(initial)
  const [bumps, setBumps] = useState({ income: 0, profit: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const visible = useRef(false)
  const next = useRef(0)

  useEffect(() => {
    const element = ref.current
    if (!element || reducedMotion()) return
    // Server HTML has the real totals. The first report (window still below the screen) drops them to zero,
    // a quarter in view counts them up, from 30% the live feed runs.
    let counted = false
    const countUp = () => {
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / COUNT_MS)
        setCount(1 - Math.pow(1 - progress, 3))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.intersectionRatio >= 0.3
        if (counted) return
        if (entry.intersectionRatio < 0.25) return setCount(0)
        counted = true
        countUp()
      },
      { threshold: [0, 0.25, 0.3] }
    )
    observer.observe(element)
    let timer = 0
    const delay = window.setTimeout(() => {
      timer = window.setInterval(() => {
        if (!visible.current || document.hidden) return
        const entry = LIVE_FEED[next.current++ % LIVE_FEED.length]
        setRows((list) => [{ ...entry, id: next.current, date: today }, ...list.slice(0, -1)])
        setTotals((sum) => ({ ...sum, [entry.type]: sum[entry.type] + entry.amount }))
        setBumps((b) => ({ income: entry.type === "income" ? b.income + 1 : b.income, profit: b.profit + 1 }))
      }, FEED_MS)
    }, 2500)
    return () => {
      observer.disconnect()
      clearTimeout(delay)
      clearInterval(timer)
    }
  }, [ref, today])

  const forMonth = { month: monthName }
  const change = (now: number, before: number) => ((now - before) / Math.abs(before)) * 100
  const profit = totals.income - totals.expense
  const previousProfit = previous.income - previous.expense
  const flash = (n: number) => (n > 0 ? "lp-flash" : undefined)

  return (
    <div ref={ref} className="flex flex-col gap-4 md:gap-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div inert key={`i${bumps.income}`} className={cn("min-w-0", flash(bumps.income))}>
          <StatCard
            label={t("dashboard.revenueFor", forMonth)}
            amount={Math.round(totals.income * count)}
            change={change(totals.income, previous.income)}
          />
        </div>
        <div inert className="min-w-0">
          <StatCard
            label={t("dashboard.expensesFor", forMonth)}
            amount={Math.round(totals.expense * count)}
            change={change(totals.expense, previous.expense)}
            goodWhen="down"
          />
        </div>
        <div className="relative min-w-0 sm:col-span-2 md:col-span-1">
          <div inert key={`p${bumps.profit}`} className={flash(bumps.profit)}>
            <StatCard label={t("dashboard.profitFor", forMonth)} amount={Math.round(profit * count)} change={change(profit, previousProfit)} />
          </div>
          <Hint label={t("landing.cabinet.profitHintAria")} text={t("landing.cabinet.profitHint")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5 md:gap-6">
        <div inert className="min-w-0 md:col-span-3">
          {chart}
        </div>
        <Card className="relative min-w-0 md:col-span-2">
          <Hint label={t("landing.cabinet.entriesHintAria")} text={t("landing.cabinet.entriesHint")} />
          <CardHeader inert>
            <CardTitle>{t("dashboard.recentTitle")}</CardTitle>
          </CardHeader>
          <CardContent inert>
            <ul className="-my-2 divide-y divide-border">
              {rows.map((row) => (
                <li key={row.id} className={cn("flex min-h-row items-center justify-between gap-4 py-2", row.id > 0 && "lp-entry-in")}>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{t(`landing.sample.${row.category}`)}</span>
                    <span className="truncate text-small text-muted-foreground">
                      <span className="tabular-nums">{formatDate(row.date, locale)}</span>
                      {row.comment && <> · {t(`landing.sample.${row.comment}`)}</>}
                    </span>
                  </div>
                  <Money amount={row.amount} type={row.type} className="shrink-0 font-medium" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
