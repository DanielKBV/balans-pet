"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast gap-3! rounded-xl! pr-12! shadow-popover! text-body!",
          title: "font-medium! text-body!",
          description: "text-small! text-current!",
          success: "border-income/40! bg-income-subtle! text-income!",
          error: "border-destructive/40! bg-destructive-subtle! text-destructive-text!",
          warning: "border-warning/40! bg-warning-subtle! text-warning!",
          // Inside the toast on the right, in the toast's own colour; 44px touch area via ::after
          closeButton:
            "top-1/2! right-2! left-auto! size-7! -translate-y-1/2 transform-none! border-0! bg-transparent! text-current! opacity-70 hover:opacity-100 [&>svg]:size-4! after:absolute after:-inset-2 after:content-['']",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
