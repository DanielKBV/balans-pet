import { CircleAlertIcon, InboxIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Empty or error state for any list or chart. Pass the action button as `action`. */
export function StateMessage({
  variant,
  title,
  description,
  action,
  icon,
  className,
}: {
  variant: "empty" | "error"
  title: string
  description?: string
  action?: React.ReactNode
  icon?: LucideIcon
  className?: string
}) {
  const Icon = icon ?? (variant === "error" ? CircleAlertIcon : InboxIcon)

  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center gap-2 px-4 py-10 text-center",
        className
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "mb-1 size-6",
          variant === "error" ? "text-destructive-text" : "text-muted-foreground"
        )}
      />
      <p className="font-medium">{title}</p>
      {description && (
        <p className="max-w-sm text-small text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
