"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"

import type { Locale } from "@/i18n/config"
import { formatSom } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DemoButton } from "../demo/demo-button"
import { stepOf, type ScreenLabels } from "./hero-scene"
import { PRIMARY_PILL } from "./styles"

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false })

type Mode = "poster" | "3d" | "pictures"

/** Why the scene stays a picture: the 3D rules of skill balans-launch. */
function shouldSkip3D() {
  if (process.env.NEXT_PUBLIC_HERO_3D === "off") return true
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return true
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  if (nav.connection?.saveData) return true
  if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return true
  try {
    const c = document.createElement("canvas")
    return !(c.getContext("webgl2") || c.getContext("webgl"))
  } catch {
    return true
  }
}

/**
 * Block 1, hero B: a tall section with a sticky screen. Scroll progress p (0..1) drives the step text on the left
 * and the 3D scene on the right (on a phone: scene on top, text below). The picture of step 0 shows first;
 * the scene loads as its own chunk once the page is idle and fades in over it.
 */
export function Hero({ screen, children }: { screen: Omit<ScreenLabels, "amount">; children: ReactNode }) {
  const t = useTranslations("landing.hero")
  const locale = useLocale() as Locale
  const section = useRef<HTMLElement>(null)
  const sticky = useRef<HTMLDivElement>(null)
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const progress = useRef(0)
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<Mode>("poster")
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)
  const [compact, setCompact] = useState(false)
  // ?heroP=0.5 freezes the scroll progress: used by scripts/capture-hero.mjs to shoot the pictures.
  const [frozen, setFrozen] = useState<number | null>(null)

  useEffect(() => {
    const element = section.current!
    const fixed = new URLSearchParams(location.search).get("heroP")
    let frame = 0
    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const range = element.offsetHeight - sticky.current!.offsetHeight
      const p = fixed !== null ? Number(fixed) : Math.min(1, Math.max(0, -rect.top / range))
      progress.current = p
      setStep(stepOf(p))
      bars.current.forEach((bar, i) => bar && (bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p * 3 - i))})`))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onResize = () => {
      setCompact(innerWidth < 768)
      onScroll()
    }
    const first = requestAnimationFrame(onResize)
    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("resize", onResize)

    const seen = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting && !document.hidden))
    seen.observe(element)
    const onVisibility = () => setActive(!document.hidden && element.getBoundingClientRect().bottom > 0)
    document.addEventListener("visibilitychange", onVisibility)

    let idle = 0
    const choose = requestAnimationFrame(() => {
      if (fixed !== null) {
        setFrozen(Number(fixed))
        setMode("3d")
      } else if (shouldSkip3D()) setMode("pictures")
      else {
      const start = () => {
        idle = "requestIdleCallback" in window ? requestIdleCallback(() => setMode("3d"), { timeout: 2500 }) : Number(globalThis.setTimeout(() => setMode("3d"), 1200))
      }
      if (document.readyState === "complete") start()
      else addEventListener("load", start, { once: true })
      }
    })

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(first)
      cancelAnimationFrame(choose)
      removeEventListener("scroll", onScroll)
      removeEventListener("resize", onResize)
      seen.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      if ("cancelIdleCallback" in window) cancelIdleCallback(idle)
      clearTimeout(idle)
    }
  }, [])

  const labels: ScreenLabels = { ...screen, amount: (value) => formatSom(Math.round(value / 100) * 100, locale) }
  const pictureStep = mode === "pictures" ? step : 0
  const showScene = mode === "3d"

  return (
    <section ref={section} id="top" aria-labelledby="hero-title" className="relative h-[340vh]" data-hero-step={step} data-hero-mode={mode}>
      <div
        ref={sticky}
        className="sticky top-header grid h-[calc(100svh-var(--spacing-header))] grid-rows-[52%_48%] overflow-hidden lg:grid-cols-2 lg:grid-rows-1"
      >
        {/* Scene: right half on a computer, top 52% on a phone. Hidden from screen readers. */}
        <div aria-hidden data-hero-scene className="relative row-start-1 overflow-hidden lg:col-start-2">
          <div aria-hidden className="absolute top-1/2 left-1/2 size-[min(36rem,90%)] -translate-1/2 bg-glow" />
          {[0, 1, 2].map((i) => (
            <Image
              key={i}
              src={`/images/hero/${locale}-step-${i}.webp`}
              alt=""
              width={900}
              height={1000}
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={cn(
                "absolute inset-0 size-full object-contain transition-opacity duration-500",
                pictureStep === i && !(showScene && ready) ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
          {showScene && (
            <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
              <HeroScene
                progress={progress}
                labels={labels}
                compact={compact}
                active={active || frozen !== null}
                capture={frozen !== null}
                onReady={() => setReady(true)}
                onFail={() => {
                  setReady(false)
                  setMode("pictures")
                }}
              />
            </div>
          )}
        </div>

        {/* Step texts: all three stay in the DOM; only the current one is visible. */}
        <div className="relative row-start-2 min-w-0 px-4 lg:col-start-1 lg:row-start-1 lg:pr-8 lg:pl-[max(2rem,calc((100vw-var(--container-content))/2+2rem))]">
          <div className="relative h-full">
            {[children, ...(["step1", "step2"] as const).map((key) => (
              <>
                <p className="font-medium text-primary-text">{t(`${key}Kicker`)}</p>
                <h2 className="text-section">{t(`${key}Title`)}</h2>
                <p className="max-w-xl text-muted-foreground text-pretty">{t(`${key}Text`)}</p>
                {key === "step2" && <DemoButton variant="default" arrow className={PRIMARY_PILL} />}
              </>
            ))].map((content, i) => (
              <div
                key={i}
                inert={i > 0 && step !== i}
                className={cn(
                  "absolute inset-x-0 top-0 flex flex-col items-start gap-5 transition duration-500 lg:top-1/2",
                  step === i ? "opacity-100 lg:-translate-y-1/2" : "pointer-events-none translate-y-3 opacity-0 lg:-translate-y-[40%]"
                )}
              >
                {content}
              </div>
            ))}
          </div>
          <div aria-hidden className="absolute bottom-6 left-4 flex gap-2 lg:bottom-10 lg:left-[max(2rem,calc((100vw-var(--container-content))/2+2rem))]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="relative h-0.75 w-9 overflow-hidden rounded-full bg-border">
                <span ref={(el) => void (bars.current[i] = el)} style={{ transform: "scaleX(0)" }} className="absolute inset-0 origin-left bg-foreground" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
