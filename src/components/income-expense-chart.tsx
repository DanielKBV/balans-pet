"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useLocale, useTranslations } from "next-intl"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatAxis, formatSom } from "@/lib/format"

export type MonthTotals = { month: string; income: number; expense: number }

/** Income and expense bars by month; `month` is the axis label. */
export function IncomeExpenseChart({ data }: { data: MonthTotals[] }) {
  const locale = useLocale()
  const t = useTranslations("common")
  const chartConfig = {
    income: { label: t("income"), color: "var(--chart-income)" },
    expense: { label: t("expense"), color: "var(--chart-expense)" },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data} barGap={2} margin={{ left: 0, right: 0 }}>
        <CartesianGrid vertical={false} />
        {/* interval 0: every month is labelled, short names fit even at 360px. */}
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
        <YAxis tickLine={false} axisLine={false} width={72} tickFormatter={(value: number) => formatAxis(value, locale)} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent valueFormatter={(value) => formatSom(value, locale)} />}
        />
        <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  )
}
