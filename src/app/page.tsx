import type { Metadata, Viewport } from "next"
import Link from "next/link"
import { connection } from "next/server"
import { useLocale, useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"

import { LocaleToggle } from "@/components/locale-toggle"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isLocale, type Locale } from "@/i18n/config"
import { formatChange } from "@/lib/format"
import { currentMonth, monthName } from "@/lib/month"
import { AuthorCard } from "./_landing/author-card"
import { CONTACTS } from "./_landing/links"
import { Features } from "./_landing/features"
import { Hero } from "./_landing/hero"
import { Magnetic } from "./_landing/magnetic"
import { Spotlight } from "./_landing/motion"
import { Problem } from "./_landing/problem"
import { ProductWindow } from "./_landing/product-window"
import { changePercent, sampleMonths } from "./_landing/sample-data"
import { PRIMARY_PILL } from "./_landing/styles"
import { DemoButton } from "./demo/demo-button"

// The landing is dark only: the browser bar matches --background of the dark theme.
export const viewport: Viewport = { themeColor: "#0E0F12" }

const SECTIONS = [
  { id: "problem", label: "why" },
  { id: "cabinet", label: "cabinet" },
  { id: "features", label: "features" },
] as const

const footerLink =
  "inline-flex min-h-11 items-center rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"

// Title and description follow the page language. Link preview: ?lang= picks the language
// (the RU resume links to /?lang=ru); the clean address is always English.
export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const param = (await searchParams).lang
  const lang: Locale = isLocale(param) ? param : "en"
  const page = await getTranslations("meta")
  const t = await getTranslations({ locale: lang, namespace: "meta" })
  const title = t("manifestName")
  const description = t("description")
  const image = `/og?lang=${lang}`
  return {
    title: { absolute: page("manifestName") },
    description: page("description"),
    // The clean address picks the language by the visitor; ?lang= pins it.
    alternates: {
      canonical: isLocale(param) ? `/?lang=${param}` : "/",
      languages: { en: "/?lang=en", ru: "/?lang=ru", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: "Balans",
      url: lang === "ru" ? "/?lang=ru" : "/",
      title,
      description,
      locale: lang === "ru" ? "ru_RU" : "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

// Per-request by design (see Home): opt out of the dev-only instant-navigation check
// (node_modules/next/dist/docs/01-app/02-guides/adopting-partial-prefetching.md).
export const instant = false

// The sample data is dated «today in Bishkek», so the page renders per request (it already does: the language is a cookie).
export default async function Home() {
  await connection()
  return <Landing />
}

function Landing() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const [previous, current] = sampleMonths().slice(-2)
  const profit = current.income - current.expense
  // What the 3D screen card shows, in the visitor's language.
  const screen = {
    brand: "Balans",
    today: t("landing.hero.screenToday"),
    newEntry: t("landing.hero.screenNewEntry"),
    income: t("common.income"),
    expense: t("common.expense"),
    // Short chip labels, as in the prototype: the full category names do not fit the 3D screen.
    chips: [t("landing.hero.screenChip1"), t("landing.hero.screenChip2"), t("landing.hero.screenChip3")] as [string, string, string],
    save: t("entries.submit"),
    profitTitle: t("dashboard.profitFor", { month: monthName(current.month, locale) }),
    profitChange: `↗ ${formatChange(changePercent(profit, previous.income - previous.expense), locale)} ${t("dashboard.vsLastMonth")}`,
  }
  // Structured data for search engines: what the site is and who built it.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Balans",
    url: "https://balans-pet.vercel.app",
    description: t("meta.description"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: t("landing.author.name"),
      url: CONTACTS.github.href,
      sameAs: [CONTACTS.linkedin.href, CONTACTS.telegram.href],
    },
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Spotlight />
      <header className="sticky top-0 z-40 border-b border-transparent bg-background edge-on-scroll">
        <div className="page-container flex h-(--landing-header) items-center gap-2">
          <Link href="/" className="-ml-2 rounded-lg p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            {/* Phone: only the mark, so «Sign in» and the demo button fit at 360px. */}
            <Logo size="lg" className="max-sm:[&>span+span]:sr-only" />
          </Link>
          <nav aria-label={t("landing.nav.aria")} className="ml-6 hidden items-center gap-1 min-[900px]:flex">
            {SECTIONS.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className={buttonVariants({ variant: "ghost", className: "text-muted-foreground" })}>
                {t(`landing.nav.${label}`)}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
              {t("common.signIn")}
            </Link>
            <DemoButton variant="default" arrow className={cn(PRIMARY_PILL, "h-control px-4")} />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Hero screen={screen}>
          <p className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-small text-muted-foreground short:hidden">
            <b className="rounded-full bg-primary-subtle px-2 py-0.5 font-medium text-primary-text">Balans</b>
            {t("landing.hero.badge")}
          </p>
          <h1 id="hero-title" className="max-w-2xl text-hero text-balance">
            {t("landing.hero.title")}
          </h1>
          <p className="max-w-xl text-muted-foreground text-pretty">{t("landing.hero.lead")}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <DemoButton variant="default" arrow className={PRIMARY_PILL} />
            <p className="text-small text-subtle-foreground">{t("landing.hero.scroll")} ↓</p>
          </div>
        </Hero>

        <Problem />
        <ProductWindow />
        <Features />

        <section id="cta" aria-labelledby="cta-title" className="relative overflow-hidden py-28 md:py-38">
          <div aria-hidden className="absolute top-1/2 left-1/2 size-175 max-w-[120vw] -translate-1/2 bg-glow" />
          <div className="page-container relative flex flex-col items-center gap-6 text-center">
            <h2 id="cta-title" className="max-w-[16ch] text-hero text-balance">
              {t("landing.cta.title")}
            </h2>
            <p className="max-w-xl text-muted-foreground text-pretty">{t("landing.cta.text")}</p>
            <Magnetic>
              <DemoButton variant="default" arrow className={cn(PRIMARY_PILL, "h-13.5 px-6.5 transition-shadow hover:shadow-cta")} />
            </Magnetic>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="page-container flex flex-wrap items-center justify-between gap-6 py-10">
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/" className="-ml-2 rounded-lg p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <Logo />
            </Link>
            <AuthorCard />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 text-small text-muted-foreground">
            <LocaleToggle />
            <Link href="/privacy" className={footerLink}>
              {t("landing.privacy")}
            </Link>
            <p>© {currentMonth().slice(0, 4)}</p>
          </div>
        </div>
      </footer>
    </>
  )
}
