"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/**
 * The phrase lights up word by word while it scrolls through the screen (only the colour changes).
 * Before hydration and with reduced motion every word is lit, so the text is never left dim.
 */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const words = text.split(/\s+/)
  const [lit, setLit] = useState(words.length)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const update = () => {
      frame = 0
      const element = ref.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const height = innerHeight
      const progress = Math.min(1, Math.max(0, (height * 0.85 - rect.top) / (rect.height + height * 0.35)))
      setLit(Math.floor(progress * words.length * 1.05))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener("scroll", onScroll)
      removeEventListener("resize", onScroll)
    }
  }, [words.length])

  return (
    // The section statement: an h2 between the h1 and the card h3s (visually it is just the phrase).
    <h2 ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span className={cn("transition-colors duration-250", i < lit ? "text-foreground" : "text-faint")}>{word}</span>{" "}
        </span>
      ))}
    </h2>
  )
}
