"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { CheckIcon, LockIcon } from "lucide-react"

import { AmountInput } from "@/components/amount-input"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatNumber, formatSom } from "@/lib/format"
import { cn } from "@/lib/utils"
import { usePlay } from "./motion"

const CATEGORIES = ["exteriorWash", "fullWash", "detailing"] as const
const AMOUNT = 5_400
type Stage = "typing" | "picked" | "pressed" | "saved"

/** Bento 1: the amount types itself, a category is picked, the button is pressed, «Saved» shows. Same components as /add. */
export function EntryDemo() {
  const t = useTranslations()
  const locale = useLocale()
  const { round } = usePlay()
  const full = formatNumber(AMOUNT, locale)
  // Progress of the current round; a new round starts from an empty field until its first timer fires.
  const [progress, setProgress] = useState({ round: 0, typed: 0, stage: "typing" as Stage })
  const fresh = progress.round !== round
  const typed = fresh ? 0 : progress.typed
  const stage = fresh ? "typing" : progress.stage

  // Not played yet: show the finished form, so the card reads well without JS and with reduced motion.
  const amount = round === 0 ? full : full.slice(0, typed)
  const picked = round === 0 || stage !== "typing"

  useEffect(() => {
    if (round === 0) return
    const timers: number[] = []
    const later = (ms: number, typed: number, stage: Stage) =>
      timers.push(window.setTimeout(() => setProgress({ round, typed, stage }), ms))
    for (let i = 1; i <= full.length; i++) later(i * 120, i, "typing")
    const typedAt = full.length * 120
    later(typedAt + 300, full.length, "picked")
    later(typedAt + 900, full.length, "pressed")
    later(typedAt + 1100, full.length, "saved")
    return () => timers.forEach(clearTimeout)
  }, [round, full])

  return (
    <div inert className="relative mt-4 flex flex-col rounded-xl border bg-background p-4">
      <p
        className={cn(
          "absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-lg max-sm:static max-sm:order-last max-sm:mt-3 max-sm:self-start border border-income/35 bg-income-subtle px-3 py-2 text-small text-income transition duration-300",
          stage === "saved" && round > 0 ? "opacity-100" : "-translate-y-2 opacity-0"
        )}
      >
        <CheckIcon aria-hidden className="size-4" />
        {t("landing.features.saved")}
      </p>
      <div className="flex max-w-85 flex-col gap-2.5">
        <ToggleGroup variant="outline" className="w-full" value={["income"]}>
          <ToggleGroupItem
            value="income"
            className="flex-1 aria-pressed:border-income aria-pressed:bg-income-subtle aria-pressed:text-income"
          >
            {t("common.income")}
          </ToggleGroupItem>
          <ToggleGroupItem value="expense" className="flex-1">
            {t("common.expense")}
          </ToggleGroupItem>
        </ToggleGroup>
        <AmountInput aria-label={t("entries.amount")} value={amount} readOnly />
        <ToggleGroup variant="outline" className="w-full flex-wrap" value={picked ? ["fullWash"] : []}>
          {CATEGORIES.map((key) => (
            <ToggleGroupItem key={key} value={key} className="max-w-full">
              <span className="min-w-0 truncate">{t(`landing.sample.${key}`)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button size="lg" className={cn("w-full transition-transform", stage === "pressed" && "scale-96")}>
          {t("entries.submit")}
        </Button>
      </div>
    </div>
  )
}

/** Bento 2: the role switches from owner to employee and the profit blurs away. */
export function RolesDemo({ profit }: { profit: number }) {
  const t = useTranslations("landing.features")
  const locale = useLocale()
  const { playing } = usePlay()
  return (
    <div inert className="relative mt-4 flex flex-col gap-3 rounded-xl border bg-background p-4">
      <ToggleGroup variant="outline" value={[playing ? "employee" : "owner"]}>
        <ToggleGroupItem value="owner" className="aria-pressed:bg-primary-subtle">
          {t("owner")}
        </ToggleGroupItem>
        <ToggleGroupItem value="employee" className="aria-pressed:bg-primary-subtle">
          {t("employee")}
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="@container">
        <p className="text-small text-muted-foreground">{t("profitLabel")}</p>
        <p className="lp-blurred text-display">{formatSom(profit, locale)}</p>
      </div>
      <p className="absolute bottom-6 left-4 flex translate-y-1.5 items-center gap-2 text-muted-foreground opacity-0 transition duration-400 group-data-play/card:translate-y-0 group-data-play/card:opacity-100">
        <LockIcon aria-hidden className="size-4" />
        {t("hidden")}
      </p>
    </div>
  )
}
