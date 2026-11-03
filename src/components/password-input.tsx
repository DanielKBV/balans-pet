"use client"

import { useState, type ComponentProps } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

/** Password field with a show/hide toggle inside on the right. */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOffIcon : EyeIcon

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-11 md:pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        aria-pressed={visible}
        disabled={props.disabled}
        className="absolute top-0 right-0 flex size-control items-center justify-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <Icon aria-hidden className="size-5" />
      </button>
    </div>
  )
}
