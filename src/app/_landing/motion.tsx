"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Feeds the cursor position to every `.spotlight` card on the page. One listener for all of them. */
export function Spotlight() {
  useEffect(() => {
    if (!matchMedia("(hover: hover)").matches) return
    const onMove = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>(".spotlight")
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`)
      card.style.setProperty("--my", `${event.clientY - rect.top}px`)
    }
    document.addEventListener("pointermove", onMove, { passive: true })
    return () => document.removeEventListener("pointermove", onMove)
  }, [])
  return null
}

/** Calls `onEnter` once, when the element is a quarter visible. */
export function useOnceInView<T extends Element>(onEnter: () => void, threshold = 0.25) {
  const ref = useRef<T>(null)
  const callback = useRef(onEnter)
  useEffect(() => {
    callback.current = onEnter
  })
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        callback.current()
      },
      { threshold }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}

/** `round` grows each time the card starts playing, so a scripted demo can restart. */
const PlayContext = createContext({ playing: false, round: 0 })
export const usePlay = () => useContext(PlayContext)

/**
 * A card whose mini-animation plays on hover. On touch screens it plays once, when it scrolls into view.
 * Children react to `data-play` (CSS: `group-data-play/card:`) or to `usePlay()`.
 */
export function PlayCard({ className, children }: { className?: string; children: ReactNode }) {
  const [state, setState] = useState({ playing: false, round: 0 })
  const start = () => setState((s) => (s.playing ? s : { playing: true, round: s.round + 1 }))
  const ref = useOnceInView<HTMLLIElement>(() => {
    if (!matchMedia("(hover: hover)").matches) start()
  })

  return (
    <li
      ref={ref}
      data-play={state.playing || undefined}
      onPointerEnter={(event) => event.pointerType === "mouse" && start()}
      onPointerLeave={(event) => event.pointerType === "mouse" && setState((s) => ({ ...s, playing: false }))}
      className={cn("group/card spotlight", className)}
    >
      <PlayContext.Provider value={state}>{children}</PlayContext.Provider>
    </li>
  )
}
