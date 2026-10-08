"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { toast } from "sonner"
import { RotateCwIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatSom } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
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

const chartConfig = {
  income: { label: "Доход", color: "var(--chart-income)" },
  expense: { label: "Расход", color: "var(--chart-expense)" },
} satisfies ChartConfig

export function IncomeExpenseChart() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={monthly} barGap={2} margin={{ left: 0, right: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={72}
          ticks={[0, 50000, 100000, 150000, 200000, 250000]}
          tickFormatter={(v: number) => (v === 0 ? "0" : `${v / 1000} тыс.`)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent valueFormatter={formatSom} />} />
        <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  )
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

  function pickType(next: "income" | "expense") {
    setType(next)
    setCategory((next === "income" ? incomeCategories : expenseCategories)[0])
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
      <div role="radiogroup" aria-label="Тип записи" className="grid grid-cols-2 gap-2">
        {(["income", "expense"] as const).map((value) => (
          <Button
            key={value}
            type="button"
            role="radio"
            aria-checked={type === value}
            variant="outline"
            onClick={() => pickType(value)}
            className={cn(
              type === value && value === "income" && "border-income bg-income-subtle text-income hover:bg-income-subtle",
              type === value && value === "expense" && "border-expense bg-expense-subtle text-expense hover:bg-expense-subtle"
            )}
          >
            {value === "income" ? "Доход" : "Расход"}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Сумма</Label>
        <div className="relative">
          <Input id="amount" inputMode="numeric" placeholder="0" className="pr-14 tabular-nums" />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            сом
          </span>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-medium">Категория</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((name) => (
            <Button
              key={name}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={cn(
                category === name &&
                  "border-primary bg-primary-subtle text-primary-text hover:bg-primary-subtle"
              )}
            >
              {name}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Дата</Label>
          <Input id="date" type="date" defaultValue="2026-10-08" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="comment">Комментарий</Label>
          <Input id="comment" placeholder="Необязательно" />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost">
          Отмена
        </Button>
        <Button type="submit" onClick={() => toast.success("Запись сохранена")}>
          Сохранить
        </Button>
      </div>
    </form>
  )
}
