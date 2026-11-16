"use client"

import { useEffect, useRef, type ReactNode } from "react"

const RADIUS = 320

/**
 * Pulls its child towards the cursor anywhere inside the parent section. The pull fades smoothly to zero
 * at RADIUS px (smoothstep), and the button follows with inertia, so there is no jump at the edge.
 * Off on touch screens and with reduced motion.
 */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    const area = element?.closest("section")
    if (!element || !area) return
    if (!matchMedia("(hover: hover)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let target = { x: 0, y: 0 }
    const now = { x: 0, y: 0 }
    let frame = 0
    const step = () => {
      now.x += (target.x - now.x) * 0.12
      now.y += (target.y - now.y) * 0.12
      element.style.transform = `translate3d(${now.x.toFixed(2)}px, ${now.y.toFixed(2)}px, 0)`
      frame = Math.abs(target.x - now.x) + Math.abs(target.y - now.y) > 0.05 ? requestAnimationFrame(step) : 0
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2 - now.x)
      const dy = event.clientY - (rect.top + rect.height / 2 - now.y)
      const f = Math.max(0, 1 - Math.hypot(dx, dy) / RADIUS)
      const k = f * f * (3 - 2 * f)
      target = { x: dx * 0.28 * k, y: dy * 0.34 * k }
      kick()
    }
    const onLeave = () => {
      target = { x: 0, y: 0 }
      kick()
    }
    area.addEventListener("pointermove", onMove, { passive: true })
    area.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(frame)
      area.removeEventListener("pointermove", onMove)
      area.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <div ref={ref} className="will-change-transform">
      {children}
    </div>
  )
}
