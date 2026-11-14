import type { Metadata } from "next"
import { cache, Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRightIcon, PlusIcon } from "lucide-react"

import { BlockError } from "@/components/block-error"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { MonthSwitcher } from "@/components/month-switcher"
import { Money } from "@/components/money"
import { StatCard, StatCardSkeleton } from "@/components/stat-card"
import { StateMessage } from "@/components/state-message"
import { TopExpenses, type CategoryTotal } from "@/components/top-expenses"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getMembership } from "@/lib/business"
import { formatDate } from "@/lib/format"
import {
  addMonths,
  currentMonth,
  firstDay,
  lastDay,
  monthName,
  monthShort,
  monthTitle,
  parseMonth,
  type Month,
} from "@/lib/month"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Дашборд · Balans",
}

const CHART_MONTHS = 6

type SearchParams = PageProps<"/dashboard">["searchParams"]

// The heading is static and shows instantly; every block streams in behind its own skeleton.
export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h1 className="text-title">Дашборд</h1>
        <Suspense fallback={<Skeleton className="h-11 w-64 rounded-lg" />}>
          <Switcher searchParams={searchParams} />
        </Suspense>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <Blocks searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

/** Owner check and the month from the address, shared by the switcher and the blocks. */
async function readMonth(searchParams: SearchParams): Promise<Month> {
  // Employees never see totals: their main page is «Добавить запись».
  const membership = await getMembership()
  if (membership?.role !== "owner") redirect("/add")
  return parseMonth((await searchParams).month)
}

const hrefFor = (month: Month) => (month === currentMonth() ? "/dashboard" : `/dashboard?month=${month}`)

async function Switcher({ searchParams }: { searchParams: SearchParams }) {
  const month = await readMonth(searchParams)
  return (
    <MonthSwitcher
      title={monthTitle(month)}
      prevHref={hrefFor(addMonths(month, -1))}
      nextHref={month === currentMonth() ? null : hrefFor(addMonths(month, 1))}
    />
  )
}

async function Blocks({ searchParams }: { searchParams: SearchParams }) {
  const month = await readMonth(searchParams)

  return (
    <div className="flex flex-col gap-6">
      <BlockError title="Не удалось загрузить итоги месяца" card>
        <Suspense fallback={<StatsSkeleton />}>
          <Stats month={month} />
        </Suspense>
      </BlockError>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <h2>Доходы и расходы</h2>
            </CardTitle>
            <CardDescription>
              {monthTitle(addMonths(month, 1 - CHART_MONTHS))} — {monthTitle(month)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlockError title="Не удалось загрузить график">
              <Suspense fallback={<Skeleton className="h-72 w-full rounded-lg" />}>
                <Chart month={month} />
              </Suspense>
            </BlockError>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Топ расходов</h2>
            </CardTitle>
            <CardDescription>За {monthName(month)}</CardDescription>
          </CardHeader>
          <CardContent>
            <BlockError title="Не удалось загрузить расходы">
              <Suspense fallback={<ListSkeleton rows={5} />}>
                <Top month={month} />
              </Suspense>
            </BlockError>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>
            <h2>Последние записи</h2>
          </CardTitle>
          {/* Negative margins equal to the padding (16px left, 12px before the icon): the text lines up with the card edge, wrapped or not. */}
          <Button variant="ghost" className="-mr-3 -ml-4" render={<Link href="/operations" />} nativeButton={false}>
            Все операции
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </CardHeader>
        <CardContent>
          <BlockError title="Не удалось загрузить записи">
            <Suspense fallback={<ListSkeleton rows={5} />}>
              <Recent />
            </Suspense>
          </BlockError>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Income and expense per month for the chart period ending at `month`.
 * Cached per request: the cards and the chart share one database call.
 */
const getMonthlyTotals = cache(async (month: Month) => {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("monthly_totals", {
    p_from: firstDay(addMonths(month, 1 - CHART_MONTHS)),
    p_to: lastDay(month),
  })
  // Thrown errors show the block's own error state with "Повторить".
  if (error) throw new Error(error.message)
  const byMonth = new Map(
    (data as { month: string; income: number; expense: number }[]).map((row) => [row.month.slice(0, 7), row])
  )
  // Months without entries are missing from the result: fill them with zeros.
  return Array.from({ length: CHART_MONTHS }, (_, i) => {
    const key = addMonths(month, i + 1 - CHART_MONTHS)
    const row = byMonth.get(key)
    return { month: key, income: Number(row?.income ?? 0), expense: Number(row?.expense ?? 0) }
  })
})

/** Change in percent; none when the previous month is zero (division by zero says nothing). */
function change(current: number, previous: number): number | undefined {
  if (previous === 0) return undefined
  // Relative to the absolute value: a loss turning into a smaller loss is growth.
  return ((current - previous) / Math.abs(previous)) * 100
}

async function Stats({ month }: { month: Month }) {
  const totals = await getMonthlyTotals(month)
  const current = totals[CHART_MONTHS - 1]
  const previous = totals[CHART_MONTHS - 2]
  const profit = current.income - current.expense
  const previousProfit = previous.income - previous.expense
  const name = monthName(month)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label={`Выручка за ${name}`} amount={current.income} change={change(current.income, previous.income)} />
      <StatCard
        label={`Расходы за ${name}`}
        amount={current.expense}
        change={change(current.expense, previous.expense)}
        goodWhen="down"
      />
      <StatCard label={`Прибыль за ${name}`} amount={profit} change={change(profit, previousProfit)} />
    </div>
  )
}

async function Chart({ month }: { month: Month }) {
  const totals = await getMonthlyTotals(month)
  if (totals.every((row) => !row.income && !row.expense)) {
    return <StateMessage variant="empty" title="За полгода записей нет" description="График появится после первых записей." />
  }
  return <IncomeExpenseChart data={totals.map((row) => ({ ...row, month: monthShort(row.month) }))} />
}

async function Top({ month }: { month: Month }) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("expense_by_category", {
    p_from: firstDay(month),
    p_to: lastDay(month),
  })
  if (error) throw new Error(error.message)
  const items = (data as CategoryTotal[]).map((row) => ({ name: row.name, total: Number(row.total) }))

  if (!items.length) {
    return <StateMessage variant="empty" title={`Расходов за ${monthName(month)} нет`} className="py-6" />
  }
  return <TopExpenses items={items} />
}

type RecentEntry = {
  id: string
  type: "income" | "expense"
  amount: number
  entry_date: string
  comment: string | null
  category: { name: string } | null
}

async function Recent() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("entries")
    .select("id, type, amount, entry_date, comment, category:categories(name)")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<RecentEntry[]>()
  if (error) throw new Error(error.message)

  if (!data.length) {
    return (
      <StateMessage
        variant="empty"
        title="Записей пока нет"
        description="Добавьте первую: выручку или расход за сегодня."
        action={
          <Button render={<Link href="/add" />} nativeButton={false}>
            <PlusIcon />
            Добавить запись
          </Button>
        }
      />
    )
  }

  return (
    <ul className="-my-2 divide-y divide-border">
      {data.map((entry) => (
        <li key={entry.id} className="flex min-h-row items-center justify-between gap-4 py-2">
          <div className="flex min-w-0 flex-col">
            <span className="line-clamp-2 break-words" title={entry.category?.name}>
              {entry.category?.name}
            </span>
            <span className="line-clamp-2 text-small break-words text-muted-foreground">
              <span className="tabular-nums">{formatDate(entry.entry_date)}</span>
              {entry.comment && <span className="break-words"> · {entry.comment}</span>}
            </span>
          </div>
          <Money amount={entry.amount} type={entry.type} className="shrink-0 font-medium" />
        </li>
      ))}
    </ul>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  )
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <StatsSkeleton />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}
