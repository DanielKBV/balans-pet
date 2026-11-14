"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatSom } from "@/lib/format"

export type MonthTotals = { month: string; income: number; expense: number }

const chartConfig = {
  income: { label: "Доход", color: "var(--chart-income)" },
  expense: { label: "Расход", color: "var(--chart-expense)" },
} satisfies ChartConfig

/** 250000 → «250 тыс.», 1500000 → «1,5 млн». */
function axisLabel(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("ru-RU")} млрд`
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("ru-RU")} млн`
  if (value >= 1_000) return `${(value / 1_000).toLocaleString("ru-RU")} тыс.`
  return String(value)
}

/** Income and expense bars by month; `month` is the axis label. */
export function IncomeExpenseChart({ data }: { data: MonthTotals[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data} barGap={2} margin={{ left: 0, right: 0 }}>
        <CartesianGrid vertical={false} />
        {/* interval 0: every month is labelled, short names fit even at 360px. */}
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
        <YAxis tickLine={false} axisLine={false} width={72} tickFormatter={axisLabel} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent valueFormatter={formatSom} />} />
        <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  )
}
