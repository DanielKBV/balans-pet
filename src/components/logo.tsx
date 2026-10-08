import { cn } from "@/lib/utils"

export function Logo({
  withWordmark = true,
  className,
}: {
  withWordmark?: boolean
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-heading leading-none text-primary-foreground"
      >
        B
      </span>
      {withWordmark ? (
        <span className="text-heading">Balans</span>
      ) : (
        <span className="sr-only">Balans</span>
      )}
    </span>
  )
}
