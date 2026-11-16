import type { Viewport } from "next"
import Link from "next/link"
import { connection } from "next/server"
import { ArrowUpRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { LocaleToggle } from "@/components/locale-toggle"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { currentMonth } from "@/lib/month"
import { Author } from "./_landing/author"
import { Features } from "./_landing/features"
import { HeroVisual } from "./_landing/hero-visual"
import { REPO_URL } from "./_landing/links"
import { ProductWindow } from "./_landing/product-window"
import { UnderTheHood } from "./_landing/under-the-hood"
import { DemoButton } from "./demo/demo-button"

// The landing is dark only: the browser bar matches --background of the dark theme.
export const viewport: Viewport = { themeColor: "#0E0F12" }

const SECTIONS = [
  { id: "product", label: "product" },
  { id: "under-the-hood", label: "howBuilt" },
  { id: "author", label: "author" },
] as const

const footerLink =
  "inline-flex min-h-11 items-center rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"

function SectionHeading({ id, title, text }: { id: string; title: string; text?: string }) {
  return (
    <div className="reveal flex flex-col gap-2">
      <h2 id={id} className="text-title text-balance">
        {title}
      </h2>
      {text && <p className="text-muted-foreground text-pretty">{text}</p>}
    </div>
  )
}

// The sample data is dated «today in Bishkek», so the page renders per request (it already does: the language is a cookie).
export default async function Home() {
  await connection()
  return <Landing />
}

function Landing() {
  const t = useTranslations()
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-transparent bg-background edge-on-scroll">
        <div className="page-container flex h-header items-center justify-between gap-4">
          <Link href="/" className="-ml-2 rounded-lg p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Logo />
          </Link>
          <nav aria-label={t("landing.nav.aria")} className="hidden items-center gap-1 md:flex">
            {SECTIONS.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className={buttonVariants({ variant: "ghost", className: "text-muted-foreground" })}>
                {t(`landing.nav.${label}`)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <LocaleToggle />
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              {t("common.signIn")}
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <section className="page-container grid items-center gap-8 pt-8 pb-16 md:pt-16 lg:grid-cols-2 lg:gap-12 lg:pt-20 lg:pb-24">
          <div className="flex flex-col items-start gap-6">
            <a
              href="#author"
              className="inline-flex min-h-11 items-center rounded-lg text-small text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {t("landing.eyebrow")}
            </a>
            <h1 className="-mt-4 max-w-2xl text-hero text-balance">{t("landing.title")}</h1>
            <p className="max-w-xl text-muted-foreground text-pretty">{t("landing.lead")}</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <DemoButton variant="default" />
              <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "lg" })}>
                {t("landing.github")}
                <ArrowUpRightIcon aria-hidden data-icon="inline-end" />
                <span className="sr-only">({t("landing.newTab")})</span>
              </a>
            </div>
            <p className="text-small text-muted-foreground text-balance">{t("landing.demoNote")}</p>
          </div>
          <HeroVisual label={t("landing.heroAria")} />
        </section>

        <section aria-labelledby="product" className="page-container flex scroll-mt-header flex-col gap-10 py-16 md:py-24">
          <SectionHeading id="product" title={t("landing.productTitle")} />
          <ProductWindow />
        </section>

        <section aria-labelledby="features" className="page-container flex flex-col gap-10 py-16 md:py-24">
          <SectionHeading id="features" title={t("landing.featuresTitle")} />
          <Features />
        </section>

        <section aria-labelledby="under-the-hood" className="page-container flex scroll-mt-header flex-col gap-10 py-16 md:py-24">
          <SectionHeading id="under-the-hood" title={t("landing.hoodTitle")} text={t("landing.hoodText")} />
          <UnderTheHood />
        </section>

        <section aria-labelledby="author" className="page-container flex scroll-mt-header flex-col gap-10 py-16 md:py-24">
          <SectionHeading id="author" title={t("landing.authorTitle")} />
          <Author />
        </section>
      </main>

      <footer className="border-t">
        <div className="page-container flex flex-col gap-2 py-6 text-small text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Logo withWordmark={false} />
            <p>{t("landing.copyright", { year: currentMonth().slice(0, 4) })}</p>
          </div>
          <div className="flex flex-wrap gap-x-6">
            <Link href="/privacy" className={footerLink}>
              {t("landing.privacy")}
            </Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={footerLink}>
              GitHub
              <span className="sr-only"> ({t("landing.newTab")})</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
