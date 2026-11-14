"use client"

import Link from "next/link"
import { Controller, useForm, useWatch, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { AmountInput, formatAmountInput } from "@/components/amount-input"
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
    label: "Доход",
    pressed: "aria-pressed:border-income aria-pressed:bg-income-subtle aria-pressed:text-income aria-pressed:hover:bg-income-subtle aria-pressed:hover:text-income",
  },
  {
    value: "expense",
    label: "Расход",
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
  successMessage = "Запись добавлена",
}: {
  categories: EntryCategory[]
  today: string
  isOwner: boolean
  save: (values: EntryFormValues) => Promise<EntrySaveResult>
  onSaved?: () => void
  /** In a dialog: shows «Отмена» to the left of the save button, closing without changes. */
  onCancel?: () => void
  defaultValues?: EntryFormValues
  successMessage?: string
}) {
  const form = useForm<EntryFormValues, unknown, EntryValues>({
    resolver: zodResolver(entrySchema),
    // Editing opens the stored amount already grouped: «1 000».
    defaultValues: defaultValues
      ? { ...defaultValues, amount: formatAmountInput(defaultValues.amount) }
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
    toast.success(successMessage)
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
            aria-label="Тип записи"
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
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      />

      <Field data-invalid={!!errors.amount}>
        <FieldLabel htmlFor="amount">Сумма</FieldLabel>
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
            <FieldLegend>Категория</FieldLegend>
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
                {type === "income" ? "Нет категорий доходов. " : "Нет категорий расходов. "}
                {isOwner ? (
                  <Link href="/categories" className="text-primary-text underline-offset-4 hover:underline">
                    Добавить категорию
                  </Link>
                ) : (
                  "Попросите владельца добавить категорию."
                )}
              </p>
            )}
            <FieldError id="category-error" errors={[fieldState.error]} />
          </FieldSet>
        )}
      />

      <Field data-invalid={!!errors.date}>
        <FieldLabel htmlFor="date">Дата</FieldLabel>
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
          Комментарий <span className="font-normal text-muted-foreground">(необязательно)</span>
        </FieldLabel>
        <Textarea
          id="comment"
          maxLength={MAX_COMMENT}
          placeholder="Например: 3 машины, Toyota Camry"
          aria-invalid={!!errors.comment}
          aria-describedby={errors.comment ? "comment-error" : undefined}
          {...form.register("comment")}
        />
        <FieldError id="comment-error" errors={[errors.comment]} />
      </Field>

      {onCancel ? (
        // Short «Сохранить» (as in other dialogs) so both buttons fit half the width on a phone.
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={!isChanged || isSubmitting}>
            {isSubmitting && <Spinner />}
            Сохранить
          </Button>
        </DialogFooter>
      ) : (
        <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Сохранить запись
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
