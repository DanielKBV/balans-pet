"use client"

import { useState } from "react"
import { toast } from "sonner"
import { RotateCwIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StateMessage } from "@/components/state-message"

const monthly = [
  { month: "Май", income: 182000, expense: 131000 },
  { month: "Июнь", income: 214000, expense: 142000 },
  { month: "Июль", income: 246000, expense: 158000 },
  { month: "Авг", income: 238000, expense: 149000 },
  { month: "Сен", income: 201000, expense: 155000 },
  { month: "Окт", income: 226000, expense: 147000 },
]

export function IncomeExpenseChartDemo() {
  return <IncomeExpenseChart data={monthly} />
}

export function RetryError() {
  return (
    <StateMessage
      variant="error"
      title="Не удалось загрузить записи"
      description="Проверьте интернет и попробуйте ещё раз."
      action={
        <Button variant="outline" onClick={() => toast.success("Данные загружены")}>
          <RotateCwIcon data-icon="inline-start" />
          Повторить
        </Button>
      }
    />
  )
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        <Trash2Icon data-icon="inline-start" />
        Удалить запись
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить запись?</DialogTitle>
          <DialogDescription>
            Мойка кузова, 16 000 сом, 8 октября. Отменить удаление будет нельзя.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Отмена</DialogClose>
          <DialogClose
            render={<Button variant="destructive" />}
            onClick={() => toast.success("Запись удалена")}
          >
            Удалить
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast.success("Запись сохранена")}>
        Успех
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Не удалось сохранить", { description: "Нет соединения с интернетом" })
        }
      >
        Ошибка
      </Button>
    </div>
  )
}

const incomeCategories = ["Мойка кузова", "Комплексная мойка", "Химчистка салона", "Прочее"]
const expenseCategories = ["Аренда", "Зарплата", "Расходники", "Коммунальные", "Прочее"]

export function EntryFormDemo() {
  const [type, setType] = useState<"income" | "expense">("income")
  const [category, setCategory] = useState(incomeCategories[0])
  const categories = type === "income" ? incomeCategories : expenseCategories

  function pickType(next: string | undefined) {
    if (next !== "income" && next !== "expense") return
    setType(next)
    setCategory((next === "income" ? incomeCategories : expenseCategories)[0])
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
      <ToggleGroup
        aria-label="Тип записи"
        variant="outline"
        className="w-full"
        value={[type]}
        onValueChange={(value) => pickType(value[0])}
      >
        <ToggleGroupItem
          value="income"
          className="flex-1 aria-pressed:border-income aria-pressed:bg-income-subtle aria-pressed:text-income aria-pressed:hover:bg-income-subtle aria-pressed:hover:text-income"
        >
          Доход
        </ToggleGroupItem>
        <ToggleGroupItem
          value="expense"
          className="flex-1 aria-pressed:border-expense aria-pressed:bg-expense-subtle aria-pressed:text-expense aria-pressed:hover:bg-expense-subtle aria-pressed:hover:text-expense"
        >
          Расход
        </ToggleGroupItem>
      </ToggleGroup>

      <Field>
        <FieldLabel htmlFor="amount">Сумма</FieldLabel>
        <div className="relative">
          <Input id="amount" inputMode="numeric" placeholder="0" className="h-14 pr-16 text-heading tabular-nums" />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground">
            сом
          </span>
        </div>
      </Field>

      <FieldSet>
        <FieldLegend>Категория</FieldLegend>
        <ToggleGroup
          variant="outline"
          className="w-full flex-wrap"
          value={[category]}
          onValueChange={(value) => value[0] && setCategory(value[0])}
        >
          {categories.map((name) => (
            <ToggleGroupItem key={name} value={name} className="max-w-full">
              <span className="truncate">{name}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FieldSet>

      <Field>
        <FieldLabel htmlFor="date">Дата</FieldLabel>
        <Input id="date" type="date" defaultValue="2026-10-08" className="w-full sm:w-56" />
      </Field>

      <Field>
        <FieldLabel htmlFor="comment">
          Комментарий <span className="font-normal text-muted-foreground">(необязательно)</span>
        </FieldLabel>
        <Textarea id="comment" placeholder="Например: 3 машины, Toyota Camry" />
      </Field>

      <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start" onClick={() => toast.success("Запись добавлена")}>
        Сохранить запись
      </Button>
    </form>
  )
}
