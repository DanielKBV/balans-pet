import type { Viewport } from "next"
import Link from "next/link"
import { connection } from "next/server"
import { useTranslations } from "next-intl"

import { LocaleToggle } from "@/components/locale-toggle"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { currentMonth } from "@/lib/month"
import { AuthorCard } from "./_landing/author-card"
import { Features } from "./_landing/features"
import { Magnetic } from "./_landing/magnetic"
import { Spotlight } from "./_landing/motion"
import { Problem } from "./_landing/problem"
import { ProductWindow } from "./_landing/product-window"
import { DemoButton } from "./demo/demo-button"

// The landing is dark only: the browser bar matches --background of the dark theme.
export const viewport: Viewport = { themeColor: "#0E0F12" }

const SECTIONS = [
  { id: "problem", label: "why" },
  { id: "cabinet", label: "cabinet" },
  { id: "features", label: "features" },
] as const

/** Landing primary action: a light pill (DESIGN.md §13). */
const primaryPill = "rounded-full bg-foreground text-background hover:bg-primary-foreground"

const footerLink =
  "inline-flex min-h-11 items-center rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"

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
  return (
    <>
      <Spotlight />
      <header className="sticky top-0 z-40 border-b border-transparent bg-background edge-on-scroll">
        <div className="page-container flex h-header items-center gap-2">
          <Link href="/" className="-ml-2 rounded-lg p-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            {/* Phone: only the mark, so «Sign in» and the demo button fit at 360px. */}
            <Logo className="max-sm:[&>span+span]:sr-only" />
          </Link>
          <nav aria-label={t("landing.nav.aria")} className="ml-4 hidden items-center gap-1 md:flex">
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
            <DemoButton variant="default" arrow className={cn(primaryPill, "h-control px-4")} />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* Stage 1 placeholder: step 0 of the scroll hero; the 3D scene replaces the frame in stage 2. */}
        <section
          id="top"
          className="page-container grid min-h-[calc(100svh-var(--spacing-header))] items-center gap-10 py-12 lg:grid-cols-2"
        >
          <div className="flex flex-col items-start gap-6">
            <p className="rounded-full inline-flex items-center gap-2 border bg-card py-1 pr-3 pl-1 text-small text-muted-foreground">
              <b className="rounded-full bg-primary-subtle px-2 py-0.5 font-medium text-primary-text">Balans</b>
              {t("landing.hero.badge")}
            </p>
            <h1 className="max-w-2xl text-hero text-balance">{t("landing.hero.title")}</h1>
            <p className="max-w-xl text-muted-foreground text-pretty">{t("landing.hero.lead")}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <DemoButton variant="default" arrow className={primaryPill} />
              <p className="text-small text-subtle-foreground">{t("landing.hero.scroll")} ↓</p>
            </div>
          </div>
          <div aria-hidden className="-order-1 flex justify-center lg:order-none">
            <div className="aspect-[1/2] h-[min(20rem,34svh)] rounded-2xl border bg-card shadow-showcase lg:h-[min(36rem,70svh)]" />
          </div>
        </section>

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
              <DemoButton variant="default" arrow className={cn(primaryPill, "h-13.5 px-6.5 transition-shadow hover:shadow-cta")} />
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
