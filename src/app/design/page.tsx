import type { Metadata } from "next"
import { PlusIcon, ReceiptTextIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatSom } from "@/lib/format"
import { AppHeader, BottomNav, Sidebar } from "@/components/app-nav"
import { Logo } from "@/components/logo"
import { Money } from "@/components/money"
import { StatCard, StatCardSkeleton } from "@/components/stat-card"
import { StateMessage } from "@/components/state-message"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DialogDemo, EntryFormDemo, IncomeExpenseChart, RetryError, ToastDemo } from "./demos"

export const metadata: Metadata = {
  title: "Дизайн-система · Balans",
  description: "Токены и компоненты интерфейса Balans",
}

const colorGroups: { title: string; tokens: [string, string][] }[] = [
  {
    title: "Поверхности",
    tokens: [
      ["background", "Фон страницы"],
      ["card", "Карточка"],
      ["popover", "Всплывающее окно"],
      ["muted", "Подложка, скелетон"],
      ["border", "Граница"],
      ["input", "Граница поля"],
      ["ring", "Фокус"],
      ["overlay", "Затемнение"],
    ],
  },
  {
    title: "Текст",
    tokens: [
      ["foreground", "Основной"],
      ["muted-foreground", "Второстепенный"],
      ["subtle-foreground", "Приглушённый"],
      ["primary-text", "Ссылка"],
      ["destructive-text", "Текст ошибки"],
    ],
  },
  {
    title: "Действие",
    tokens: [
      ["primary", "Главная кнопка"],
      ["primary-hover", "Наведение"],
      ["primary-subtle", "Выбранный пункт"],
    ],
  },
  {
    title: "Смысл",
    tokens: [
      ["income", "Доход"],
      ["income-subtle", "Фон дохода"],
      ["expense", "Расход"],
      ["expense-subtle", "Фон расхода"],
      ["warning", "Предупреждение"],
      ["warning-subtle", "Фон предупреждения"],
      ["destructive", "Опасная кнопка"],
      ["destructive-subtle", "Фон ошибки"],
    ],
  },
  {
    title: "Графики",
    tokens: [
      ["chart-income", "Доход"],
      ["chart-expense", "Расход"],
      ["chart-profit", "Прибыль"],
      ["chart-1", "Категория 1"],
      ["chart-2", "Категория 2"],
      ["chart-3", "Категория 3"],
      ["chart-4", "Категория 4"],
      ["chart-5", "Категория 5"],
      ["chart-6", "Категория 6"],
      ["chart-other", "Прочее"],
    ],
  },
]

const typeScale = [
  { cls: "text-display", meta: "28 → 36 px · 600 · цифры", sample: formatSom(1234567) },
  { cls: "text-title", meta: "24 → 28 px · 600", sample: "Операции за октябрь" },
  { cls: "text-heading", meta: "20 px · 600", sample: "Расходы по категориям" },
  { cls: "text-body", meta: "16 / 1.5 · 400", sample: "Съешь же ещё этих мягких французских булок, да выпей чаю. Ёж, щука, юла." },
  { cls: "text-small", meta: "14 px · подписи, даты", sample: "8 октября 2026 · внёс Азамат" },
  { cls: "text-axis", meta: "13 px · только оси графиков", sample: "Май  Июнь  Июль  Авг  Сен  Окт" },
]

const operations = [
  { date: "8 окт", category: "Комплексная мойка", comment: "Camry, 2 машины", author: "Азамат", type: "income", amount: 16000 },
  { date: "8 окт", category: "Расходники", comment: "Шампунь 20 л", author: "Бекзат", type: "expense", amount: 3500 },
  { date: "7 окт", category: "Химчистка салона", comment: "", author: "Азамат", type: "income", amount: 8900 },
  { date: "5 окт", category: "Аренда", comment: "Октябрь", author: "Владелец", type: "expense", amount: 45000 },
] as const

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-20 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-heading">
          {title}
        </h2>
        {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Palette({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className={cn(theme, "flex flex-col gap-6 rounded-xl border border-border bg-background p-4 text-foreground md:p-6")}>
      <p className="font-medium">{theme === "light" ? "Светлая тема" : "Тёмная тема"}</p>
      {colorGroups.map((group) => (
        <div key={group.title} className="flex flex-col gap-3">
          <p className="text-small text-muted-foreground">{group.title}</p>
          <ul className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-3">
            {group.tokens.map(([token, role]) => (
              <li key={token} className="flex items-center gap-3">
                <span
                  className="size-10 shrink-0 rounded-lg border border-border"
                  style={{ background: `var(--${token})` }}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-mono text-small">{token}</span>
                  <span className="truncate text-small text-muted-foreground">{role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function DesignPage() {
  return (
    <>
      <AppHeader className="sticky top-0 z-10">
        <span className="hidden font-medium sm:inline lg:hidden">Дизайн-система</span>
        <Logo className="hidden lg:inline-flex" />
      </AppHeader>

      <main className="page-container flex flex-col gap-16 py-8 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-title">Дизайн-система Balans</h1>
          <p className="max-w-2xl text-muted-foreground">
            Токены и компоненты, по которым собирается каждый экран. Правила и объяснения в
            docs/DESIGN.md. Тема переключается кнопкой в шапке.
          </p>
        </div>

        <Section id="colors" title="Цвета" description="Обе темы рядом. Цвет только там, где он что-то значит: действие, доход, расход, ошибка.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Palette theme="light" />
            <Palette theme="dark" />
          </div>
        </Section>

        <Section id="type" title="Типографика" description="Шрифт Geist. Основной текст 16 px на всех экранах.">
          <Card className="gap-0 py-0">
            {typeScale.map(({ cls, meta, sample }) => (
              <div
                key={cls}
                className="flex flex-col gap-1 border-b border-border px-(--card-spacing) py-4 last:border-b-0 md:grid md:grid-cols-[13rem_1fr] md:items-baseline md:gap-6"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-small">{cls}</span>
                  <span className="text-small text-muted-foreground">{meta}</span>
                </div>
                <p className={cn(cls, "min-w-0 break-words")}>{sample}</p>
              </div>
            ))}
          </Card>
        </Section>

        <Section id="shape" title="Скругления и тени" description="База 8 px, максимум 16 px. Тень только у всплывающих слоёв.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["rounded-md", "6 px · бейдж"],
              ["rounded-lg", "8 px · кнопка, поле"],
              ["rounded-xl", "12 px · карточка"],
              ["rounded-2xl", "16 px · диалог"],
            ].map(([cls, label]) => (
              <div key={cls} className="flex flex-col gap-2">
                <div className={cn(cls, "h-20 border border-border bg-card")} />
                <span className="text-small text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-xl border border-border bg-popover shadow-popover" />
              <span className="text-small text-muted-foreground">shadow-popover · меню</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-20 rounded-2xl border border-border bg-popover shadow-dialog" />
              <span className="text-small text-muted-foreground">shadow-dialog · окно</span>
            </div>
          </div>
        </Section>

        <Section id="buttons" title="Кнопки" description="44 px на телефоне, 40 px на компьютере. Одна основная кнопка на экран.">
          <Card className="px-(--card-spacing)">
            <div className="flex flex-wrap items-center gap-3">
              <Button>
                <PlusIcon data-icon="inline-start" />
                Добавить запись
              </Button>
              <Button variant="outline">Второстепенная</Button>
              <Button variant="destructive">Удалить</Button>
              <Button variant="ghost">Призрачная</Button>
              <Button variant="link">Ссылка</Button>
              <Button disabled>Неактивна</Button>
              <Button variant="outline" size="icon" aria-label="Добавить">
                <PlusIcon />
              </Button>
            </div>
            <p className="text-small text-muted-foreground">
              Наведите мышь, нажмите, перейдите клавишей Tab, чтобы увидеть рамку фокуса.
            </p>
          </Card>
        </Section>

        <Section id="forms" title="Поля и формы" description="Форма добавления записи: сумма с цифровой клавиатурой, категории кнопками.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="px-(--card-spacing)">
              <EntryFormDemo />
            </Card>
            <Card className="gap-5 px-(--card-spacing)">
              <div className="flex flex-col gap-2">
                <Label htmlFor="business">Название бизнеса</Label>
                <Input id="business" defaultValue="Автомойка Азамата" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sum-error">Сумма</Label>
                <Input id="sum-error" defaultValue="-500" aria-invalid aria-describedby="sum-error-text" />
                <p id="sum-error-text" className="text-small text-destructive-text">
                  Сумма должна быть больше нуля
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="disabled">Неактивное поле</Label>
                <Input id="disabled" disabled defaultValue="Владелец" />
              </div>
            </Card>
          </div>
        </Section>

        <Section id="badges" title="Бейджи">
          <div className="flex flex-wrap gap-2">
            <Badge variant="income">Доход</Badge>
            <Badge variant="expense">Расход</Badge>
            <Badge variant="warning">Скрыта</Badge>
            <Badge variant="destructive">Ошибка</Badge>
            <Badge variant="outline">Сотрудник</Badge>
            <Badge variant="outline">Владелец</Badge>
          </div>
        </Section>

        <Section id="stats" title="Карточки с цифрой" description="Изменение к прошлому месяцу: стрелка, знак и цвет. Для расходов рост красный.">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Выручка за октябрь" amount={226000} change={12.4} />
            <StatCard label="Расходы за октябрь" amount={147000} change={-5.2} goodWhen="down" />
            <StatCard label="Прибыль за октябрь" amount={79000} change={-3} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </Section>

        <Section id="table" title="Таблица" description="Суммы справа, цифры одинаковой ширины. На телефоне строки становятся карточками.">
          <Card className="gap-0 py-0">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Дата</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead>Внёс</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((op, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-small text-muted-foreground">{op.date}</TableCell>
                      <TableCell>{op.category}</TableCell>
                      <TableCell className="text-muted-foreground">{op.comment || "—"}</TableCell>
                      <TableCell>{op.author}</TableCell>
                      <TableCell>
                        <Badge variant={op.type}>{op.type === "income" ? "Доход" : "Расход"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Money amount={op.amount} type={op.type} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-y divide-border md:hidden">
              {operations.map((op, i) => (
                <li key={i} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{op.category}</span>
                    <span className="truncate text-small text-muted-foreground">
                      {op.date} · {op.author}
                      {op.comment && ` · ${op.comment}`}
                    </span>
                  </div>
                  <Money amount={op.amount} type={op.type} className="font-medium" />
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        <Section id="chart" title="График" description="Зелёный светлее красного, чтобы пара различалась и при дальтонизме. Легенда всегда есть.">
          <Card>
            <CardHeader>
              <CardTitle>Доходы и расходы по месяцам</CardTitle>
              <CardDescription>Май — октябрь 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart />
            </CardContent>
          </Card>
        </Section>

        <Section id="states" title="Состояния" description="У каждого списка и графика: загрузка, пусто, ошибка.">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="gap-3 px-(--card-spacing)" aria-label="Загрузка">
              <p className="text-small text-muted-foreground">Загрузка</p>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </Card>
            <Card className="py-0">
              <StateMessage
                variant="empty"
                icon={ReceiptTextIcon}
                title="Записей пока нет"
                description="Добавьте первую запись, и здесь появится история операций."
                action={
                  <Button>
                    <PlusIcon data-icon="inline-start" />
                    Добавить запись
                  </Button>
                }
              />
            </Card>
            <Card className="py-0">
              <RetryError />
            </Card>
          </div>
        </Section>

        <Section id="navigation" title="Меню и шапка" description="Меню слева видно с 1024 px. Уже — нижнее меню. Шапка сверху этой страницы.">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="w-fit overflow-hidden rounded-xl border border-border">
              <Sidebar active="/operations" className="border-r-0" />
            </div>
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border">
              <BottomNav active="/dashboard" />
            </div>
          </div>
        </Section>

        <Section id="overlays" title="Диалог и уведомления" description="Под диалогом фон затемнён и слегка размыт. Уведомление об успехе зелёное, об ошибке красное.">
          <div className="flex flex-wrap gap-3">
            <DialogDemo />
            <ToastDemo />
          </div>
        </Section>
      </main>
    </>
  )
}
