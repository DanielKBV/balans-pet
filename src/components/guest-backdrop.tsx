import { cn } from "@/lib/utils"

type Item = { kind: "som" | "b" | "income" | "expense"; size: number; left: string; top: string; time: number; delay: number; phone?: boolean }

/**
 * Slow floating coins with the som sign, a «B» tile and two bars behind the card of the guest pages
 * (sign-in, new password, invite, onboarding, 404, errors): motifs of the landing hero, drawn in SVG + CSS.
 * Pure server markup, no JS. Hidden from screen readers, never takes clicks, still with reduced motion.
 * Items marked `phone` stay at the edges on narrow screens; the rest show from 768px.
 */
const ITEMS: Item[] = [
  { kind: "som", size: 88, left: "7%", top: "16%", time: 26, delay: 0, phone: true },
  { kind: "b", size: 60, left: "86%", top: "12%", time: 30, delay: -8, phone: true },
  { kind: "som", size: 56, left: "88%", top: "62%", time: 24, delay: -4 },
  { kind: "income", size: 92, left: "13%", top: "66%", time: 32, delay: -12 },
  { kind: "expense", size: 64, left: "76%", top: "82%", time: 28, delay: -16, phone: true },
  { kind: "som", size: 44, left: "4%", top: "88%", time: 34, delay: -20, phone: true },
]

function Shape({ kind }: { kind: Item["kind"] }) {
  if (kind === "som")
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        <circle cx="50" cy="50" r="47" className="fill-card stroke-border" strokeWidth="2" />
        <circle cx="50" cy="50" r="39" fill="none" className="stroke-border" strokeWidth="1.5" strokeDasharray="2 4" />
        {/* The som sign: «С» with a bar under it. */}
        <path d="M61 34A17 17 0 1 0 61 60" fill="none" className="stroke-subtle-foreground" strokeWidth="5" />
        <rect x="32" y="66" width="36" height="5" className="fill-subtle-foreground" />
      </svg>
    )
  if (kind === "b")
    return (
      <span className="grid size-full place-items-center rounded-[22%] border border-primary/30 bg-primary-subtle text-heading font-semibold text-primary-text">
        B
      </span>
    )
  return <span className={cn("block h-full w-[34%] rounded-md opacity-40", kind === "income" ? "bg-income" : "bg-expense")} />
}

export function GuestBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {ITEMS.map((item, i) => (
        <div
          key={i}
          className={cn("guest-float absolute opacity-60", !item.phone && "max-md:hidden")}
          style={{
            left: item.left,
            top: item.top,
            width: item.size,
            height: item.size,
            animationDuration: `${item.time}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          <Shape kind={item.kind} />
        </div>
      ))}
    </div>
  )
}
