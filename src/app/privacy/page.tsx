import type { Metadata } from "next"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"

import { LocaleToggle } from "@/components/locale-toggle"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy")
  return { title: t("metaTitle") }
}

const ISSUES_URL = "https://github.com/DanielKBV/balans-pet/issues"

const linkClass =
  "rounded-sm text-primary-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"

// Keys in the `privacy` dictionary section.
const sections = [
  { title: "dataTitle", items: ["dataPassword", "dataGoogle", "dataContent", "dataDemo"] },
  { title: "whyTitle", items: ["whySignIn", "whyShow"] },
  { title: "sharingTitle", items: ["sharingNoSale", "sharingServices", "sharingIsolation"] },
  { title: "cookiesTitle", items: ["cookiesText"] },
] as const

export default function PrivacyPage() {
  const t = useTranslations("privacy")
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
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main" className="page-container flex-1 py-10 md:py-16">
        <article className="flex max-w-2xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-title">{t("title")}</h1>
            <p className="text-small text-muted-foreground">{t("updated")}</p>
            <p className="text-muted-foreground text-pretty">{t("intro")}</p>
          </div>

          {sections.map(({ title, items }) => (
            <section key={title} className="flex flex-col gap-3">
              <h2 className="text-heading">{t(title)}</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-pretty">
                {items.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
            </section>
          ))}

          <section className="flex flex-col gap-3">
            <h2 className="text-heading">{t("deletionTitle")}</h2>
            <p className="text-pretty">
              {t.rich("deletionText", {
                link: (chunks) => (
                  <a href={ISSUES_URL} target="_blank" rel="noreferrer" className={linkClass}>
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
