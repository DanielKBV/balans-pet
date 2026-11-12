"use client"

import { useRef, useState } from "react"
import { CalendarIcon, XIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { todayInBishkek } from "@/lib/entry"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

/** «2026-11-04» ↔ local Date at midnight: the calendar works with days, so no time zone can shift them. */
function toDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Date field instead of the browser's native one: looks like an Input, opens a calendar.
 * Values are «YYYY-MM-DD» strings, "" when empty. `clearable` adds a cross (filters).
 */
export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = "Выберите дату",
  clearable = false,
  className,
  ...aria
}: {
  id: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
  clearable?: boolean
  className?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const showClear = clearable && !!value

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("relative", className)}>
        <PopoverTrigger
          id={id}
          className={cn(
            "flex h-control w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left text-base tabular-nums transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            showClear && "pr-11"
          )}
          {...aria}
        >
          <span className={cn("truncate", !value && "text-subtle-foreground")}>
            {value ? formatDate(value) : placeholder}
          </span>
          {!showClear && <CalendarIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />}
        </PopoverTrigger>
        {showClear && (
          <button
            type="button"
            aria-label="Очистить дату"
            title="Очистить"
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-0 inline-flex size-control items-center justify-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <XIcon aria-hidden className="size-5" />
          </button>
        )}
      </div>
      {/* Focus lands on the selected day (or today), so arrows move between days right away. */}
      <PopoverContent
        initialFocus={() => {
          const root = calendarRef.current
          const selectors = ["[data-selected=true] button", "[data-today=true] button:not(:disabled)", "button[data-day]:not(:disabled)"]
          // In order of preference: a selector list would return the first match in the document instead.
          for (const selector of selectors) {
            const day = root?.querySelector<HTMLElement>(selector)
            if (day) return day
          }
          return true
        }}
      >
        <div ref={calendarRef}>
          <DayGrid
            value={value}
            min={min}
            max={max}
            onSelect={(day) => {
              // Clicking the selected day again gives no date: keep the value, just close.
              if (day) onChange(day)
              setIsOpen(false)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Rendered only while the popup is open: reading «today» here keeps the field itself
 * free of the clock, so statically prerendered pages (/design) can show it.
 */
function DayGrid({
  value,
  min,
  max,
  onSelect,
}: {
  value: string
  min?: string
  max?: string
  onSelect: (day: string | undefined) => void
}) {
  const today = todayInBishkek()
  const selected = value ? toDate(value) : undefined

  return (
    <Calendar
      mode="single"
      required={false}
      selected={selected}
      defaultMonth={selected ?? toDate(max && max < today ? max : today)}
      today={toDate(today)}
      startMonth={min ? toDate(min) : undefined}
      endMonth={max ? toDate(max) : undefined}
      disabled={[...(min ? [{ before: toDate(min) }] : []), ...(max ? [{ after: toDate(max) }] : [])]}
      onSelect={(date) => onSelect(date && toIso(date))}
    />
  )
}
