import type { Metadata } from "next"
import Link from "next/link"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Политика конфиденциальности · Balans",
}

const ISSUES_URL = "https://github.com/DanielKBV/balans-pet/issues"

const linkClass =
  "rounded-sm text-primary-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"

const sections = [
  {
    title: "Какие данные мы храним",
    items: [
      "Почту и пароль, если вы регистрируетесь по почте. Пароль хранится только в зашифрованном виде.",
      "Почту, имя и фото профиля, если вы входите через Google. Доступа к Gmail, Диску, контактам и другим данным Google у Balans нет.",
      "То, что вы вносите сами: название бизнеса, категории, суммы доходов и расходов, комментарии.",
    ],
  },
  {
    title: "Зачем",
    items: [
      "Чтобы вы могли войти в свой аккаунт.",
      "Чтобы показывать записи, итоги и графики вашего бизнеса вам и вашей команде.",
    ],
  },
  {
    title: "Кому мы их передаём",
    items: [
      "Никому не продаём и не показываем рекламу.",
      "Данные хранятся в Supabase (база данных и вход), сайт работает на Vercel. Эти сервисы обрабатывают данные только для работы Balans.",
      "Записи одного бизнеса не видят другие бизнесы. Сотрудник не видит итогов и чужих записей.",
    ],
  },
  {
    title: "Cookies",
    items: [
      "Только для входа: чтобы вам не приходилось вводить пароль на каждой странице. Сторонней аналитики и рекламных cookies нет.",
    ],
  },
]

export default function PrivacyPage() {
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
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="page-container flex-1 py-10 md:py-16">
        <article className="flex max-w-2xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-title">Политика конфиденциальности</h1>
            <p className="text-small text-muted-foreground">Обновлено 3 ноября 2026 года</p>
            <p className="text-muted-foreground text-pretty">
              Balans — учебный pet-проект: онлайн-тетрадь доходов и расходов для небольшого бизнеса.
              Здесь коротко о том, какие данные он хранит и как ими пользуется.
            </p>
          </div>

          {sections.map(({ title, items }) => (
            <section key={title} className="flex flex-col gap-3">
              <h2 className="text-heading">{title}</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-pretty">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section className="flex flex-col gap-3">
            <h2 className="text-heading">Удаление данных и связь</h2>
            <p className="text-pretty">
              Чтобы удалить аккаунт и все данные или задать вопрос, напишите в{" "}
              <a href={ISSUES_URL} target="_blank" rel="noreferrer" className={linkClass}>
                Issues репозитория на GitHub
              </a>
              . Данные удаляются полностью, без резервной копии.
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
