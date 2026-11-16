"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import { CalendarIcon } from "lucide-react"

import { AmountInput } from "@/components/amount-input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Locale } from "@/i18n/config"
import { formatDate, formatNumber, formatSom } from "@/lib/format"
import { monthTitle } from "@/lib/month"

const CATEGORIES = ["exteriorWash", "fullWash", "detailing", "other"] as const

/** The «Add entry» form in a phone frame, filled in and inert. The same components as /add. */
export function EntryPreview({ today }: { today: string }) {
  const t = useTranslations()
  const locale = useLocale()
  // Bottom padding is where the fade happens, so the save button stays fully visible.
  return (
    <div
      inert
      className="mx-auto w-full max-w-80 rounded-2xl border border-b-0 bg-background px-4 pt-6 pb-16 mask-fade-bottom"
    >
      <div className="flex flex-col gap-5">
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
        <Field>
          <FieldLabel htmlFor="preview-amount">{t("entries.amount")}</FieldLabel>
          <AmountInput id="preview-amount" defaultValue={formatNumber(5_400, locale)} readOnly />
        </Field>
        <FieldSet className="min-w-0">
          <FieldLegend>{t("entries.category")}</FieldLegend>
          <ToggleGroup variant="outline" className="w-full flex-wrap" value={["fullWash"]}>
            {CATEGORIES.map((key) => (
              <ToggleGroupItem key={key} value={key} className="max-w-full">
                <span className="min-w-0 truncate">{t(`landing.sample.${key}`)}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldSet>
        {/* Not DatePicker: its calendar (react-day-picker, date-fns, zod) would load with the landing for a popup nobody opens here. */}
        <Field>
          <FieldLabel htmlFor="preview-date">{t("entries.date")}</FieldLabel>
          <div className="relative">
            <Input id="preview-date" readOnly value={formatDate(today, locale)} className="pr-11 tabular-nums" />
            <CalendarIcon aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Field>
        <Button size="lg" className="w-full">
          {t("entries.submit")}
        </Button>
      </div>
    </div>
  )
}

/** RU / EN switch that reformats one amount and date in place. The site language stays as it is. */
export function FormatPreview({ today, initial }: { today: string; initial: Locale }) {
  const t = useTranslations("landing")
  const [locale, setLocale] = useState<Locale>(initial)
  return (
    <div className="flex flex-col gap-5">
      <ToggleGroup
        variant="outline"
        aria-label={t("formatsAria")}
        className="w-fit"
        value={[locale]}
        onValueChange={(value) => value[0] && setLocale(value[0] as Locale)}
      >
        <ToggleGroupItem value="ru" lang="ru" className="px-5">
          RU
        </ToggleGroupItem>
        <ToggleGroupItem value="en" lang="en" className="px-5">
          EN
        </ToggleGroupItem>
      </ToggleGroup>
      <div lang={locale} aria-live="polite" className="flex flex-col gap-1">
        <p className="text-display text-income">{formatSom(16_000, locale, { signed: true })}</p>
        <p className="text-muted-foreground tabular-nums">
          {formatDate(today, locale)} · {monthTitle(today.slice(0, 7), locale)}
        </p>
      </div>
    </div>
  )
}
