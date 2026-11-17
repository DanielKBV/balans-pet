import { useLocale, useTranslations } from "next-intl"

import { AppHeader, Sidebar } from "@/components/app-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { todayInBishkek } from "@/lib/entry"
import { addMonths, monthName, monthShort, monthTitle } from "@/lib/month"
import { LazyChart } from "./lazy-chart"
import { LiveDashboard } from "./live-dashboard"
import { SAMPLE_ENTRIES, sampleMonths } from "./sample-data"
import { SectionHeading } from "./section-heading"

function daysBefore(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

/**
 * Block 3: the owner's dashboard built from the cabinet's own components, with sample data for the current month.
 * It leans back and straightens on scroll; only the two hint dots take clicks and focus.
 */
export function ProductWindow() {
  const t = useTranslations()
  const locale = useLocale()
  const months = sampleMonths()
  const [previous, current] = months.slice(-2)
  const today = todayInBishkek()

  return (
    <section id="cabinet" aria-labelledby="cabinet-title" className="page-container scroll-mt-(--landing-header) pt-10 max-md:overflow-x-clip pb-24 md:pb-36">
      <SectionHeading
        id="cabinet-title"
        kicker={t("landing.cabinet.kicker")}
        title={t("landing.cabinet.title")}
        text={t("landing.cabinet.text")}
      />
      <div className="tilt-in mt-14">
        <div className="spotlight overflow-hidden rounded-2xl border bg-background shadow-showcase md:max-h-190 md:mask-fade-bottom">
          <p className="sr-only">{t("landing.productAria")}</p>
          <div className="flex">
            <div inert className="hidden lg:flex">
              <Sidebar active="/dashboard" prefetch={false} />
            </div>
            <div className="min-w-0 flex-1">
              <div inert>
                <AppHeader>
                  <p className="truncate font-medium">{t("landing.sample.business")}</p>
                </AppHeader>
              </div>
              <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div inert className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <p className="text-title">{t("dashboard.title")}</p>
                  <p className="font-medium">{monthTitle(current.month, locale)}</p>
                </div>
                <LiveDashboard
                  current={current}
                  previous={previous}
                  monthName={monthName(current.month, locale)}
                  today={today}
                  initial={SAMPLE_ENTRIES.map(({ daysAgo, ...entry }, i) => ({ ...entry, id: -i, date: daysBefore(today, daysAgo) }))}
                  chart={
                    <Card>
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
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
