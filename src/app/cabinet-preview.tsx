import { Money } from "@/components/money"
import { StatCard } from "@/components/stat-card"
import { Card } from "@/components/ui/card"

// Illustrative numbers: profit = revenue − expenses.
const recent = [
  { category: "Комплексная мойка", meta: "Сегодня, 18:40 · Бекзат", amount: 1200, type: "income" },
  { category: "Химчистка салона", meta: "Сегодня, 16:15 · Бекзат", amount: 3500, type: "income" },
  { category: "Расходники", meta: "Сегодня, 11:02 · Азамат", amount: 2800, type: "expense" },
  { category: "Мойка кузова", meta: "Сегодня, 09:30 · Бекзат", amount: 600, type: "income" },
] as const

/** Owner's dashboard mock built from real components. Replaced by a screenshot at stage 8. */
export function CabinetPreview() {
  return (
    <figure className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <StatCard label="Прибыль за октябрь" amount={84500} change={12.4} />
        </div>
        <StatCard label="Выручка" amount={186400} change={8.3} />
        <StatCard label="Расходы" amount={101900} change={4.1} goodWhen="down" />
      </div>
      <Card className="gap-0 py-2">
        <p className="px-(--card-spacing) py-2 text-small text-muted-foreground">Последние записи</p>
        <ul>
          {recent.map(({ category, meta, amount, type }) => (
            <li
              key={category}
              className="flex min-h-row items-center justify-between gap-4 border-t px-(--card-spacing) py-2"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate">{category}</span>
                <span className="text-small text-muted-foreground">{meta}</span>
              </div>
              <Money amount={amount} type={type} className="font-medium" />
            </li>
          ))}
        </ul>
      </Card>
      <figcaption className="text-small text-muted-foreground">
        Так выглядит кабинет владельца автомойки. Цифры для примера.
      </figcaption>
    </figure>
  )
}
