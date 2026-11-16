"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

import type { MonthTotals } from "@/components/income-expense-chart"
import { Skeleton } from "@/components/ui/skeleton"

const IncomeExpenseChart = dynamic(
  () => import("@/components/income-expense-chart").then((module) => module.IncomeExpenseChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-lg" /> }
)

/**
 * The chart library (~100 KB) loads only when the block is about to scroll into view, never with the first screen.
 * Same height before and after.
 */
export function LazyChart({ data }: { data: MonthTotals[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsNear(true)
        observer.disconnect()
      },
      { rootMargin: "0px 0px 200px 0px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="h-72 w-full min-w-0">
      {isNear ? <IncomeExpenseChart data={data} /> : <Skeleton className="h-72 w-full rounded-lg" />}
    </div>
  )
}
