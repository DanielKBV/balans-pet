import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Inline loading indicator for a pending action. The button around it carries the meaning. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2Icon aria-hidden className={cn("size-4 animate-spin", className)} />
}
