"use client"

import type { ComponentProps } from "react"
import { useLocale } from "next-intl"

import { Input } from "@/components/ui/input"
import type { Locale } from "@/i18n/config"
import { currencyLabel } from "@/lib/format"
import { cn } from "@/lib/utils"

const NBSP = " "

/**
 * «1000000» → «1 000 000» while typing. Only whole soms: letters are dropped,
 * but a dot or comma stays so the form shows «Только целые сомы» instead of
 * silently turning «100.50» into 10050. The schema removes the spaces again.
 */
export function formatAmountInput(value: string, locale: Locale = "ru"): string {
  // English groups thousands with commas («5,400»); in Russian a comma is still read as a decimal point.
  const en = locale === "en"
  const cleaned = value.replace(/[^\d\s.,]/g, "")
  const digits = cleaned.replace(en ? /[\s,]/g : /\s/g, "")
  if (!/^\d*$/.test(digits)) return cleaned
  const trimmed = digits.replace(/^0+(?=\d)/, "")
  return trimmed.replace(/\B(?=(\d{3})+(?!\d))/g, en ? "," : NBSP)
}

/** Amount field: 56px, numeric keyboard, «сом» / «KGS» inside on the right. Works with `register` (uncontrolled). */
export function AmountInput({ className, onChange, ...props }: ComponentProps<"input">) {
  const locale = useLocale() as Locale
  // Characters that count as typed: digits and a decimal mark (the grouping separator moves around).
  const typed = locale === "en" ? /[\d.]/ : /[\d.,]/
  return (
    <div className="relative">
      <Input
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        maxLength={16}
        className={cn("h-14 pr-16 text-heading tabular-nums", className)}
        onChange={(event) => {
          const input = event.target
          const caret = input.selectionStart ?? input.value.length
          // Keep the caret after the same number of digits once spaces move.
          const digitsBefore = [...input.value.slice(0, caret)].filter((char) => typed.test(char)).length
          const formatted = formatAmountInput(input.value, locale)
          if (formatted !== input.value) {
            input.value = formatted
            let position = 0
            for (let seen = 0; position < formatted.length && seen < digitsBefore; position++) {
              if (typed.test(formatted[position])) seen++
            }
            input.setSelectionRange(position, position)
          }
          onChange?.(event)
        }}
        {...props}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground">
        {currencyLabel(locale)}
      </span>
    </div>
  )
}
