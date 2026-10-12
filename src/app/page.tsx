import Link from "next/link"
import { ClockIcon } from "lucide-react"

import { Logo } from "@/components/logo"
import { Money } from "@/components/money"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CabinetPreview } from "./cabinet-preview"

const REPO_URL = "https://github.com/DanielKBV/balans-pet"

const topExpenses = [
  { name: "Аренда", amount: 45000 },
  { name: "Зарплата", amount: 38000 },
  { name: "Расходники", amount: 12500 },
]

const features = [
  {
    title: "Запись за минуту с телефона",
    text: "Сумма, категория одной кнопкой, дата уже стоит сегодняшняя. Администратор вносит выручку в конце смены и идёт домой.",
    example: (
      <Card className="flex-row items-center justify-between gap-4 px-(--card-spacing)">
        <div className="flex min-w-0 flex-col gap-1">
          <Badge variant="income">Доход</Badge>
          <span className="truncate text-small text-muted-foreground">Комплексная мойка</span>
        </div>
        <Money amount={16000} type="income" className="text-heading" />
      </Card>
    ),
  },
  {
    title: "Итоги считаются сами",
    text: "Выручка, расходы и прибыль за день и за месяц. Без формул, калькулятора и Excel.",
    example: (
      <Card className="gap-0 py-2">
        <div className="flex min-h-row items-center justify-between gap-4 px-(--card-spacing)">
          <span>Выручка за день</span>
          <Money amount={16000} type="income" />
        </div>
        <div className="flex min-h-row items-center justify-between gap-4 px-(--card-spacing)">
          <span>Расходы за день</span>
          <Money amount={3500} type="expense" />
        </div>
        <div className="flex min-h-row items-center justify-between gap-4 border-t px-(--card-spacing) font-medium">
          <span>Итог дня</span>
          <Money amount={12500} />
        </div>
      </Card>
    ),
  },
  {
    title: "Видно, куда уходят деньги",
    text: "Самые большие статьи расходов за месяц. Сразу понятно, на чём можно сэкономить.",
    example: (
      <Card className="gap-0 py-2">
        {topExpenses.map(({ name, amount }) => (
          <div
            key={name}
            className="flex min-h-row items-center justify-between gap-4 border-b px-(--card-spacing) last:border-b-0"
          >
            <span>{name}</span>
            <Money amount={amount} type="expense" />
          </div>
        ))}
      </Card>
    ),
  },
  {
    title: "Сотрудники вносят записи, но не видят прибыль",
    text: "Владелец отправляет ссылку-приглашение в WhatsApp или Telegram. Сотрудник видит только свои записи, итоги видит только владелец.",
    example: (
      <Card className="gap-1 px-(--card-spacing)">
        <span className="text-small text-muted-foreground">Ссылка-приглашение</span>
        <span className="truncate font-medium">…/invite/k7Qm2x</span>
      </Card>
    ),
  },
]

function CallToAction() {
  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-small text-muted-foreground">
        <ClockIcon aria-hidden className="size-4 shrink-0" />
        Регистрация и демо откроются в ближайших обновлениях
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button size="lg" disabled>
          Попробовать бесплатно
        </Button>
        <Button size="lg" variant="outline" disabled>
          Посмотреть демо
        </Button>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <header className="border-b">
        <div className="page-container flex h-header items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" disabled>
              Войти
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <section className="page-container grid items-center gap-10 py-10 md:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <h1 className="max-w-xl text-hero text-balance">
              Доходы и расходы вашего сервиса. Прибыль считается сама.
            </h1>
            <p className="max-w-lg text-muted-foreground text-pretty">
              Онлайн-тетрадь для автомойки, барбершопа, СТО. Администратор вносит записи с телефона
              за минуту, владелец видит итоги месяца.
            </p>
            <CallToAction />
          </div>
          <CabinetPreview />
        </section>

        <section className="page-container py-12 md:py-20" aria-labelledby="features">
          <h2 id="features" className="mb-4 text-title md:mb-8">
            Что умеет Balans
          </h2>
          <ul className="border-t">
            {features.map(({ title, text, example }) => (
              <li
                key={title}
                className="grid gap-4 border-b py-8 md:grid-cols-2 md:items-center md:gap-10 md:py-10"
              >
                <div className="flex max-w-md flex-col gap-2">
                  <h3 className="text-heading text-balance">{title}</h3>
                  <p className="text-muted-foreground text-pretty">{text}</p>
                </div>
                <div className="w-full max-w-md md:max-w-none">{example}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="page-container pt-4 pb-16 md:pb-24" aria-labelledby="cta">
          <div className="flex flex-col items-start gap-6 rounded-xl border bg-card p-6 md:p-10">
            <h2 id="cta" className="max-w-2xl text-title text-balance">
              Хватит считать прибыль в тетради. Её посчитает Balans.
            </h2>
            <CallToAction />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="page-container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-small text-muted-foreground">
          <p>Pet-проект Даниэла</p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm text-primary-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Код на GitHub
          </a>
        </div>
      </footer>
    </>
  )
}
