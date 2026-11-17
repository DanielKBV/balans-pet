"use client"

import Link from "next/link"
import { Controller, useForm, useWatch, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { AmountInput, formatAmountInput } from "@/components/amount-input"
import type { Locale } from "@/i18n/config"
import { DatePicker } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  entrySchema,
  MAX_COMMENT,
  MIN_DATE,
  type EntryFormValues,
  type EntrySaveResult,
  type EntryType,
  type EntryValues,
} from "@/lib/entry"

export type EntryCategory = { id: string; name: string; type: EntryType }

const TYPES = [
  {
    value: "income",
    pressed: "aria-pressed:border-income aria-pressed:bg-income-subtle aria-pressed:text-income aria-pressed:hover:bg-income-subtle aria-pressed:hover:text-income",
  },
  {
    value: "expense",
    pressed: "aria-pressed:border-expense aria-pressed:bg-expense-subtle aria-pressed:text-expense aria-pressed:hover:bg-expense-subtle aria-pressed:hover:text-expense",
  },
] as const

/**
 * Add or edit an entry. Without `onSaved` the form clears for the next entry;
 * with it (the edit dialog) the caller decides what happens after saving.
 */
export function EntryForm({
  categories,
  today,
  isOwner,
  save,
  onSaved,
  onCancel,
  defaultValues,
  successMessage,
}: {
  categories: EntryCategory[]
  today: string
  isOwner: boolean
  save: (values: EntryFormValues) => Promise<EntrySaveResult>
  onSaved?: () => void
  /** In a dialog: shows «Cancel» to the left of the save button, closing without changes. */
  onCancel?: () => void
  defaultValues?: EntryFormValues
  successMessage?: string
}) {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const form = useForm<EntryFormValues, unknown, EntryValues>({
    resolver: zodResolver(entrySchema(t)),
    // Editing opens the stored amount already grouped: «1 000».
    defaultValues: defaultValues
      ? { ...defaultValues, amount: formatAmountInput(defaultValues.amount, locale) }
      : { type: "income", amount: "", categoryId: "", date: today, comment: "" },
  })
  const type = useWatch({ control: form.control, name: "type" })
  const typeCategories = categories.filter((category) => category.type === type)
  const { errors, isSubmitting } = form.formState
  const isChanged = useIsChanged(form.control, defaultValues)

  // The server parses the raw strings with the same schema, so send them as typed.
  const onSubmit = form.handleSubmit(async () => {
    const values = form.getValues()
    const result = await save(values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(successMessage ?? t("entries.added"))
    if (onSaved) {
      onSaved()
      return
    }
    // Type and date stay: the next entry of the shift is usually the same kind and day.
    form.reset({ ...values, amount: "", categoryId: "", comment: "" })
    form.setFocus("amount")
  })

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <Controller
        name="type"
        control={form.control}
        render={({ field }) => (
          <ToggleGroup
            aria-label={t("entries.typeAria")}
            variant="outline"
            className="w-full"
            value={[field.value]}
            onValueChange={(value) => {
              // Pressing the selected item again would empty the group: keep the choice.
              if (!value[0] || value[0] === field.value) return
              field.onChange(value[0])
              form.resetField("categoryId", { defaultValue: "" })
            }}
          >
            {TYPES.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value} className={`flex-1 ${item.pressed}`}>
                {t(`common.${item.value}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      />

      <Field data-invalid={!!errors.amount}>
        <FieldLabel htmlFor="amount">{t("entries.amount")}</FieldLabel>
        <AmountInput
          id="amount"
          aria-invalid={!!errors.amount}
          aria-describedby={errors.amount ? "amount-error" : undefined}
          {...form.register("amount")}
        />
        <FieldError id="amount-error" errors={[errors.amount]} />
      </Field>

      <Controller
        name="categoryId"
        control={form.control}
        render={({ field, fieldState }) => (
          // A fieldset is as wide as its widest child by default: min-w-0 keeps long categories inside the card.
          <FieldSet data-invalid={fieldState.invalid} className="min-w-0">
            <FieldLegend>{t("entries.category")}</FieldLegend>
            {typeCategories.length ? (
              <ToggleGroup
                variant="outline"
                className="w-full flex-wrap"
                value={field.value ? [field.value] : []}
                onValueChange={(value) => value[0] && field.onChange(value[0])}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "category-error" : undefined}
              >
                {typeCategories.map((category, index) => (
                  <ToggleGroupItem
                    key={category.id}
                    value={category.id}
                    // RHF focuses the first item when the category is missing.
                    ref={index === 0 ? field.ref : undefined}
                    className="max-w-full"
                  >
                    <span className="min-w-0 truncate" title={category.name}>{category.name}</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : (
              <p className="text-small text-muted-foreground">
                {type === "income" ? t("entries.noIncomeCategories") : t("entries.noExpenseCategories")}{" "}
                {isOwner ? (
                  <Link href="/categories" className="text-primary-text underline-offset-4 hover:underline">
                    {t("entries.addCategory")}
                  </Link>
                ) : (
                  t("entries.askOwner")
                )}
              </p>
            )}
            <FieldError id="category-error" errors={[fieldState.error]} />
          </FieldSet>
        )}
      />

      <Field data-invalid={!!errors.date}>
        <FieldLabel htmlFor="date">{t("entries.date")}</FieldLabel>
        <Controller
          name="date"
          control={form.control}
          render={({ field }) => (
            <DatePicker
              id="date"
              value={field.value}
              onChange={field.onChange}
              min={MIN_DATE}
              max={today}
              className="w-full sm:w-56"
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "date-error" : undefined}
            />
          )}
        />
        <FieldError id="date-error" errors={[errors.date]} />
      </Field>

      <Field data-invalid={!!errors.comment}>
        <FieldLabel htmlFor="comment">
          {t("entries.comment")} <span className="font-normal text-muted-foreground">{t("entries.optional")}</span>
        </FieldLabel>
        <Textarea
          id="comment"
          maxLength={MAX_COMMENT}
          placeholder={t("entries.commentPlaceholder")}
          aria-invalid={!!errors.comment}
          aria-describedby={errors.comment ? "comment-error" : undefined}
          {...form.register("comment")}
        />
        <FieldError id="comment-error" errors={[errors.comment]} />
      </Field>

      {onCancel ? (
        // Short «Save» (as in other dialogs) so both buttons fit half the width on a phone.
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={!isChanged || isSubmitting}>
            {isSubmitting && <Spinner />}
            {t("common.save")}
          </Button>
        </DialogFooter>
      ) : (
        <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {t("entries.submit")}
        </Button>
      )}
    </form>
  )
}

/** Values as the server will store them: spaces inside the amount and around the comment do not count. */
function normalized(values: Partial<EntryFormValues>) {
  return JSON.stringify([
    values.type,
    values.amount?.replace(/\s/g, ""),
    values.categoryId,
    values.date,
    values.comment?.trim(),
  ])
}

/** Editing: saving is allowed only after a real change. A new entry (no defaults) is always "changed". */
function useIsChanged(control: Control<EntryFormValues, unknown, EntryValues>, defaultValues?: EntryFormValues) {
  const current = useWatch({ control })
  return !defaultValues || normalized(current) !== normalized(defaultValues)
}
