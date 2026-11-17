"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"
import { getImageProps } from "next/image"
import { useLocale, useTranslations } from "next-intl"

import type { Locale } from "@/i18n/config"
import { formatSom } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DemoButton } from "../demo/demo-button"
import { stepOf, type ScreenLabels } from "./hero-shared"
import { PRIMARY_PILL } from "./styles"

const loadScene = () => import("./hero-scene")
const HeroScene = dynamic(loadScene, { ssr: false })

/** One border for CSS and JS (docs/launch/PATCH_MONETY.md): below it the phone hero layout. */
const MOBILE_MAX = 900

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
  const [mobile, setMobile] = useState(false)
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
      setMobile(innerWidth < MOBILE_MAX)
      onScroll()
    }
    const first = requestAnimationFrame(onResize)
    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("resize", onResize)

    const seen = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting && !document.hidden))
    seen.observe(element)
    const onVisibility = () => setActive(!document.hidden && element.getBoundingClientRect().bottom > 0)
    document.addEventListener("visibilitychange", onVisibility)

    // The scene (three.js, ~240 KB) loads on the visitor's first scroll, touch, key or mouse move after `load`:
    // the hero is a scroll story, so it is ready by the time step 1 comes, and the first screen pays nothing for it.
    const WAKE = ["scroll", "pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const
    const wake = () => {
      WAKE.forEach((type) => removeEventListener(type, wake))
      setMode("3d")
      // The coins model and the Draco decoder download in parallel with the scene chunk, not after it
      // (perf-auditor: the chain chunk → GLB → decoder added ~3 s on Slow 4G).
      for (const href of ["/models/balans-coins.glb", "/draco/draco_wasm_wrapper.js", "/draco/draco_decoder.wasm"]) {
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.href = href
        document.head.append(link)
      }
      void loadScene().then((m) => m.preloadCoins())
    }
    const listen = () => WAKE.forEach((type) => addEventListener(type, wake, { passive: true, once: true }))
    const choose = requestAnimationFrame(() => {
      if (fixed !== null) {
        setFrozen(Number(fixed))
        setMode("3d")
      } else if (shouldSkip3D()) setMode("pictures")
      else if (document.readyState === "complete") listen()
      else addEventListener("load", listen, { once: true })
    })

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(first)
      cancelAnimationFrame(choose)
      removeEventListener("scroll", onScroll)
      removeEventListener("resize", onResize)
      removeEventListener("load", listen)
      WAKE.forEach((type) => removeEventListener(type, wake))
      seen.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const labels: ScreenLabels = { ...screen, amount: (value) => formatSom(Math.round(value / 100) * 100, locale) }
  const pictureStep = mode === "pictures" ? step : 0
  const showScene = mode === "3d"

  return (
    <section ref={section} id="top" aria-labelledby="hero-title" className="relative h-[340vh]" data-hero-step={step} data-hero-mode={mode}>
      <div
        ref={sticky}
        className="sticky top-header grid h-[calc(100svh-var(--spacing-header))] grid-rows-[52%_48%] overflow-hidden min-[900px]:grid-cols-2 min-[900px]:grid-rows-1"
      >
        {/* Scene: right half on a computer, top 52% on a phone. Hidden from screen readers. */}
        <div
          aria-hidden
          data-hero-scene
          className="relative row-start-1 overflow-hidden max-[899px]:[mask-image:linear-gradient(#000_88%,transparent)] min-[900px]:col-start-2"
        >
          <div aria-hidden className="absolute top-1/2 left-1/2 size-[min(36rem,90%)] -translate-1/2 bg-glow" />
          {/* Steps 1 and 2 only in the picture mode: otherwise they would share the network with the LCP picture. */}
          {(mode === "pictures" ? [0, 1, 2] : [0]).map((i) => (
            <HeroPicture
              key={i}
              locale={locale}
              step={i}
              className={cn(
                "transition-[opacity,filter] duration-400",
                pictureStep !== i ? "opacity-0" : showScene && ready ? "opacity-0 blur-[6px]" : "opacity-100"
              )}
            />
          ))}
          {showScene && (
            <div className={cn("absolute inset-0 transition-opacity duration-400", ready ? "opacity-100" : "opacity-0")}>
              <HeroScene
                progress={progress}
                labels={labels}
                mobile={mobile}
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
        <div className="relative row-start-2 min-w-0 px-4 min-[900px]:col-start-1 min-[900px]:row-start-1 min-[900px]:pr-8 min-[900px]:pl-[max(2rem,calc((100vw-var(--container-content))/2+2rem))]">
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
                  // Short phones (360×640): tighter steps so «Open the demo» stays on the first screen (PATCH_MONETY §5).
                  "absolute inset-x-0 top-0 flex flex-col items-start gap-5 transition duration-500 short:gap-3 min-[900px]:top-1/2",
                  step === i ? "opacity-100 min-[900px]:-translate-y-1/2" : "pointer-events-none translate-y-3 opacity-0 min-[900px]:-translate-y-[40%]"
                )}
              >
                {content}
              </div>
            ))}
          </div>
          <div aria-hidden className="absolute bottom-6 left-4 flex gap-2 min-[900px]:bottom-10 min-[900px]:left-[max(2rem,calc((100vw-var(--container-content))/2+2rem))]">
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

/**
 * A picture of the scene for one step, in two framings: the right half on a computer, the phone layout below 900 px
 * (scripts/capture-hero.mjs shoots both from the live scene). <picture> downloads only the one that fits.
 * Step 0 is the LCP: eager and high priority from the HTML itself (Next 16 deprecated `priority`).
 */
function HeroPicture({ locale, step, className }: { locale: Locale; step: number; className?: string }) {
  const lcp = step === 0
  const common = { alt: "", loading: lcp ? ("eager" as const) : ("lazy" as const), fetchPriority: lcp ? ("high" as const) : ("auto" as const) }
  const desktop = getImageProps({ ...common, src: `/images/hero/${locale}-d-step-${step}.webp`, width: 900, height: 1000, sizes: "50vw" }).props
  const phone = getImageProps({ ...common, src: `/images/hero/${locale}-m-step-${step}.webp`, width: 800, height: 842, sizes: "100vw" }).props
  return (
    <picture>
      <source media={`(min-width: ${MOBILE_MAX}px)`} srcSet={desktop.srcSet} sizes={desktop.sizes} />
      <img {...phone} alt="" className={cn("absolute inset-0 size-full object-contain", className)} />
    </picture>
  )
}
