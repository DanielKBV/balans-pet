import { cn } from "@/lib/utils"

export function Logo({
  withWordmark = true,
  size = "md",
  className,
}: {
  withWordmark?: boolean
  /** `lg` for the landing header: 36px mark, 24px wordmark. */
  size?: "md" | "lg"
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", size === "lg" && "gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "flex size-8 items-center justify-center rounded-lg bg-primary text-heading leading-none text-primary-foreground",
          size === "lg" && "size-9"
        )}
      >
        B
      </span>
      {withWordmark ? (
        <span className={size === "lg" ? "text-title tracking-tight" : "text-heading"}>Balans</span>
      ) : (
        <span className="sr-only">Balans</span>
      )}
    </span>
  )
}
