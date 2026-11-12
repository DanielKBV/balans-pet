"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames, type DayButtonProps } from "react-day-picker"
import { ru } from "react-day-picker/locale"

import { cn } from "@/lib/utils"

/**
 * Month grid on react-day-picker (the shadcn Calendar, adapted to Balans tokens).
 * Day and arrow buttons are styled here and do not use the site Button,
 * so changes to one never break the other. Cells: 44px on phone, 40px from md.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ru,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames()
  const navButton =
    "inline-flex size-(--cell-size) items-center justify-center rounded-lg text-muted-foreground outline-none select-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50"

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn("[--cell-size:--spacing(11)] md:[--cell-size:--spacing(10)]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col", defaults.months),
        month: cn("flex flex-col gap-2", defaults.month),
        nav: cn("absolute inset-x-0 top-0 flex items-center justify-between", defaults.nav),
        button_previous: cn(navButton, defaults.button_previous),
        button_next: cn(navButton, defaults.button_next),
        month_caption: cn("flex h-(--cell-size) items-center justify-center", defaults.month_caption),
        caption_label: cn("font-medium capitalize select-none", defaults.caption_label),
        month_grid: cn("border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "w-(--cell-size) text-small font-normal text-muted-foreground capitalize select-none",
          defaults.weekday
        ),
        week: cn("flex", defaults.week),
        day: cn("size-(--cell-size) p-0 text-center", defaults.day),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) =>
          orientation === "left" ? (
            <ChevronLeftIcon aria-hidden className={cn("size-5", className)} />
          ) : (
            <ChevronRightIcon aria-hidden className={cn("size-5", className)} />
          ),
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

/** Selected: `primary`. Today: `muted` underlay. Other month and unavailable days: grey. */
function CalendarDayButton({ className, day, modifiers, ...props }: DayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  // Keyboard navigation moves the focus between days.
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.isoDate}
      className={cn(
        "inline-flex size-full items-center justify-center rounded-lg text-base tabular-nums outline-none select-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        modifiers.outside && "text-muted-foreground",
        modifiers.today && !modifiers.selected && "bg-muted font-medium",
        modifiers.selected &&
          "bg-primary font-medium text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
