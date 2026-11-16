import type { ReactNode } from "react"
import { CopyIcon, LockIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDate, formatSom } from "@/lib/format"
import { todayInBishkek } from "@/lib/entry"
import { monthName } from "@/lib/month"
import { EntryPreview, FormatPreview } from "./previews"
import { sampleMonths } from "./sample-data"

function inDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function Feature({ title, text, className, children }: { title: string; text: string; className?: string; children: ReactNode }) {
  return (
    <li className={cn("reveal flex flex-col justify-between gap-6 overflow-hidden rounded-xl border bg-card p-6 shadow-highlight", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="text-heading">{title}</h3>
        <p className="text-muted-foreground text-pretty">{text}</p>
      </div>
      {children}
    </li>
  )
}

/** Owner and employee side by side: the same card, profit hidden for the employee. */
function RolePanel({ role, profit, entries }: { role: string; profit: ReactNode; entries: string }) {
  return (
    <div className="@container flex min-w-0 flex-col gap-2 rounded-xl border bg-background p-4">
      <p className="text-small font-medium text-muted-foreground">{role}</p>
      {profit}
      <p className="text-small text-muted-foreground">{entries}</p>
    </div>
  )
}

/** Bento: four cards of different sizes, each with a working piece of the real interface. */
export function Features() {
  const t = useTranslations("landing")
  const tDashboard = useTranslations("dashboard")
  const locale = useLocale()
  const today = todayInBishkek()
  const current = sampleMonths().at(-1)!
  const profitLabel = tDashboard("profitFor", { month: monthName(current.month, locale) })

  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <Feature title={t("entryTitle")} text={t("entryText")} className="pb-0 md:row-span-2">
        <EntryPreview today={today} />
      </Feature>

      <Feature title={t("rolesTitle")} text={t("rolesText")} className="lg:col-span-2">
        <div inert className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <RolePanel
            role={t("owner")}
            entries={t("allEntries")}
            profit={
              <>
                <p className="text-small text-muted-foreground">{profitLabel}</p>
                <p className="text-display">{formatSom(current.income - current.expense, locale)}</p>
              </>
            }
          />
          <RolePanel
            role={t("employee")}
            entries={t("ownEntries")}
            profit={
              <>
                <p className="text-small text-muted-foreground">{profitLabel}</p>
                <p className="flex items-center gap-2 text-display text-subtle-foreground">
                  <LockIcon aria-hidden className="size-6 shrink-0" />
                  {t("hidden")}
                </p>
              </>
            }
          />
        </div>
      </Feature>

      <Feature title={t("inviteTitle")} text={t("inviteText")}>
        <div inert className="flex flex-col gap-2">
          <p className="text-small text-muted-foreground">{t("inviteLabel")}</p>
          <div className="flex items-center gap-2 rounded-lg border bg-background py-1 pr-1 pl-3">
            <span className="min-w-0 flex-1 truncate">balans-pet.vercel.app/invite/k7Qm2x</span>
            <Button variant="outline" size="sm">
              <CopyIcon aria-hidden />
              {t("copy")}
            </Button>
          </div>
          <p className="text-small text-muted-foreground">{t("validUntil", { date: formatDate(inDays(today, 7), locale) })}</p>
        </div>
      </Feature>

      <Feature title={t("formatsTitle")} text={t("formatsText")} className="md:col-span-2 lg:col-span-1">
        <FormatPreview today={today} initial={locale} />
      </Feature>
    </ul>
  )
}
