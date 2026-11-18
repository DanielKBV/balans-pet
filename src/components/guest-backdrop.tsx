import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

type Coin = {
  name: "som" | "usd" | "eur" | "rub" | "btc" | "b" | "som-far"
  size: number
  left: string
  top: string
  tilt: number
  time: number
  delay: number
  /** Blurred and dimmed: further away. */
  far?: boolean
  /** Shown on phones too (smaller, at the edges); the rest only from 768px. */
  phone?: { left: string; top: string } | true
}

/**
 * Silver coins of the landing (the same Blender render) slowly drifting at the edges of the guest pages
 * (sign-in, new password, invite, onboarding, 404, errors), with a soft indigo glow behind the card.
 * Pure server markup, no JS. Hidden from screen readers, never takes clicks, still with reduced motion.
 */
const COINS: Coin[] = [
  { name: "som", size: 150, left: "5%", top: "12%", tilt: -8, time: 24, delay: 0, phone: { left: "5%", top: "8%" } },
  { name: "eur", size: 80, left: "26%", top: "6%", tilt: 0, time: 30, delay: -6, far: true },
  { name: "usd", size: 140, left: "80%", top: "14%", tilt: 10, time: 26, delay: -3, phone: { left: "78%", top: "8%" } },
  { name: "rub", size: 90, left: "70%", top: "70%", tilt: 0, time: 28, delay: -12, far: true },
  { name: "b", size: 76, left: "12%", top: "60%", tilt: 6, time: 20, delay: -9 },
  { name: "btc", size: 150, left: "84%", top: "68%", tilt: -6, time: 22, delay: -15, phone: { left: "64%", top: "84%" } },
  { name: "som-far", size: 96, left: "3%", top: "84%", tilt: 0, time: 18, delay: -4, far: true, phone: true },
]

export function GuestBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="guest-glow absolute inset-0" />
      {COINS.map((coin) => {
        const phone = typeof coin.phone === "object" ? coin.phone : { left: coin.left, top: coin.top }
        return (
          <div
            key={coin.name}
            className={cn("guest-coin absolute", coin.far && "guest-coin-far", !coin.phone && "max-md:hidden")}
            style={
              {
                "--s": `${coin.size}px`,
                "--x": coin.left,
                "--y": coin.top,
                "--xm": phone.left,
                "--ym": phone.top,
                "--r": `${coin.tilt}deg`,
                backgroundImage: `url(/images/guest/coin-${coin.name}.webp)`,
                animationDuration: `${coin.time}s`,
                animationDelay: `${coin.delay}s`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
