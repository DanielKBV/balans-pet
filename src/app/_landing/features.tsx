import type { CSSProperties, ReactNode } from "react"
import { CheckIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PlayCard } from "./motion"
import { EntryDemo, RolesDemo } from "./previews"
import { sampleMonths } from "./sample-data"
import { SectionHeading } from "./section-heading"

/** Expense shares of the month; `width` is relative to the largest bar. */
const SHARES = [
  { key: "payroll", percent: 48, width: 1 },
  { key: "rent", percent: 25, width: 0.52 },
  { key: "supplies", percent: 18, width: 0.38 },
  { key: "other", percent: 9, width: 0.2 },
] as const

function Feature({ title, text, className, children }: { title: string; text: string; className?: string; children: ReactNode }) {
  return (
    <PlayCard className={cn("flex min-w-0 flex-col gap-2 overflow-hidden rounded-2xl border bg-card p-6 lg:min-h-85", className)}>
      <h3 className="text-heading">{title}</h3>
      <p className="max-w-[30em] text-muted-foreground text-pretty">{text}</p>
      {children}
    </PlayCard>
  )
}

/** Block 5: bento 4 + 2 / 2 + 4. Each card plays its mini-interface on hover (on a phone, once it shows up). */
export function Features() {
  const t = useTranslations("landing.features")
  const current = sampleMonths().at(-1)!

  return (
    <section id="features" aria-labelledby="features-title" className="page-container scroll-mt-(--landing-header) py-24 md:py-36">
      <SectionHeading id="features-title" kicker={t("kicker")} title={t("title")} />
      <ul className="mt-14 grid gap-4 lg:grid-cols-6">
        <Feature title={t("entryTitle")} text={t("entryText")} className="lg:col-span-4">
          <EntryDemo />
        </Feature>

        <Feature title={t("rolesTitle")} text={t("rolesText")} className="lg:col-span-2">
          <RolesDemo profit={current.income - current.expense} />
        </Feature>

        <Feature title={t("inviteTitle")} text={t("inviteText")} className="lg:col-span-2">
          <div inert className="mt-4 rounded-xl border bg-background p-4">
            <div className="flex min-w-0 items-center gap-2 rounded-lg border py-1 pr-1 pl-3">
              <span className="min-w-0 flex-1 truncate text-small text-muted-foreground">balans-pet.vercel.app/invite/k7Qm2x</span>
              <Button variant="outline" size="sm" className="group-data-play/card:border-income/35 group-data-play/card:bg-income-subtle group-data-play/card:text-income">
                <span className="group-data-play/card:hidden">{t("copy")}</span>
                <span className="hidden items-center gap-1 group-data-play/card:inline-flex">
                  <CheckIcon aria-hidden />
                  {t("copied")}
                </span>
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2.5 text-small text-muted-foreground">
              <div className="flex">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-8.5 rounded-full border-2 border-background not-first:-ml-2",
                      i === 0 ? "bg-primary" : "bg-muted",
                      "lp-avatar"
                    )}
                  />
                ))}
              </div>
              {t("teamCount")}
            </div>
          </div>
        </Feature>

        <Feature title={t("spendTitle")} text={t("spendText")} className="lg:col-span-4">
          <ul inert className="mt-4 flex flex-col gap-3 rounded-xl border bg-background p-4">
            {SHARES.map(({ key, percent, width }, i) => (
              <li key={key} className="grid grid-cols-[7.5rem_1fr_2.75rem] items-center gap-2.5 text-small text-muted-foreground sm:grid-cols-[10rem_1fr_2.75rem]">
                <span className="truncate">{t(`spend.${key}`)}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <span
                    style={{ "--w": width } as CSSProperties}
                    className={cn("block h-full rounded-full bg-expense", i > 0 && "opacity-70", "lp-share")}
                  />
                </span>
                <span className="text-right text-foreground tabular-nums">{percent}%</span>
              </li>
            ))}
          </ul>
        </Feature>
      </ul>
    </section>
  )
}
