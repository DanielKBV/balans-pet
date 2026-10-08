import { cn } from "@/lib/utils"
import { formatSom } from "@/lib/format"

/** Amount in soms. With `type`, shows a sign and the income/expense colour. */
export function Money({
  amount,
  type,
  className,
}: {
  amount: number
  type?: "income" | "expense"
  className?: string
}) {
  const value = type === "expense" ? -Math.abs(amount) : amount

  return (
    <span
      className={cn(
        "whitespace-nowrap tabular-nums",
        type === "income" && "text-income",
        type === "expense" && "text-expense",
        className
      )}
    >
      {formatSom(value, { signed: type === "income" })}
    </span>
  )
}
