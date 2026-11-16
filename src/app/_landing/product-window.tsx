import { useLocale, useTranslations } from "next-intl"

import { AppHeader, Sidebar } from "@/components/app-nav"
import { Money } from "@/components/money"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { todayInBishkek } from "@/lib/entry"
import { formatDate } from "@/lib/format"
import { addMonths, monthName, monthShort, monthTitle } from "@/lib/month"
import { LazyChart } from "./lazy-chart"
import { changePercent, SAMPLE_ENTRIES, sampleMonths } from "./sample-data"

function daysBefore(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

/**
 * The owner's dashboard built from the cabinet's own components, with sample data for the current month.
 * Inert: nothing inside takes clicks or focus. On a phone it drops the sidebar and the recent list.
 */
export function ProductWindow() {
  const t = useTranslations()
  const locale = useLocale()
  const months = sampleMonths()
  const [previous, current] = months.slice(-2)
  const profit = current.income - current.expense
  const forMonth = { month: monthName(current.month, locale) }
  const today = todayInBishkek()

  return (
    <figure className="flex flex-col gap-4">
      <div className="tilt-in">
        <div
          inert
          aria-label={t("landing.productAria")}
          role="img"
          className="mask-fade-bottom max-h-150 overflow-hidden rounded-2xl border bg-background shadow-showcase md:max-h-190"
        >
          <div className="flex">
            <Sidebar active="/dashboard" prefetch={false} className="hidden lg:flex" />
            <div className="min-w-0 flex-1">
              <AppHeader>
                <p className="truncate font-medium">{t("landing.sample.business")}</p>
              </AppHeader>
              <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <p className="text-title">{t("dashboard.title")}</p>
                  <p className="font-medium">{monthTitle(current.month, locale)}</p>
                </div>

                {/* Phone: only the profit card, so the chart still fits above the fade. */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="hidden md:contents">
                    <StatCard
                      label={t("dashboard.revenueFor", forMonth)}
                      amount={current.income}
                      change={changePercent(current.income, previous.income)}
                    />
                    <StatCard
                      label={t("dashboard.expensesFor", forMonth)}
                      amount={current.expense}
                      change={changePercent(current.expense, previous.expense)}
                      goodWhen="down"
                    />
                  </div>
                  <StatCard
                    label={t("dashboard.profitFor", forMonth)}
                    amount={profit}
                    change={changePercent(profit, previous.income - previous.expense)}
                  />
                </div>

                <div className="grid gap-4 md:gap-6 xl:grid-cols-5">
                  <Card className="min-w-0 xl:col-span-3">
                    <CardHeader>
                      <CardTitle>{t("dashboard.chartTitle")}</CardTitle>
                      <CardDescription>
                        {monthTitle(addMonths(current.month, -5), locale)} — {monthTitle(current.month, locale)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LazyChart data={months.map((row) => ({ ...row, month: monthShort(row.month, locale) }))} />
                    </CardContent>
                  </Card>

                  <Card className="hidden md:flex xl:col-span-2">
                    <CardHeader>
                      <CardTitle>{t("dashboard.recentTitle")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="-my-2 divide-y divide-border">
                        {SAMPLE_ENTRIES.map((entry) => (
                          <li key={entry.category} className="flex min-h-row items-center justify-between gap-4 py-2">
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate">{t(`landing.sample.${entry.category}`)}</span>
                              <span className="truncate text-small text-muted-foreground">
                                <span className="tabular-nums">{formatDate(daysBefore(today, entry.daysAgo), locale)}</span>
                                {entry.comment && <> · {t(`landing.sample.${entry.comment}`)}</>}
                              </span>
                            </div>
                            <Money amount={entry.amount} type={entry.type} className="shrink-0 font-medium" />
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="text-center text-small text-muted-foreground">{t("landing.productText")}</figcaption>
    </figure>
  )
}
