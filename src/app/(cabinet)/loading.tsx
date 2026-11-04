import { Skeleton } from "@/components/ui/skeleton"

// Shown instantly on navigation between cabinet pages while their data loads.
export default function CabinetLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
