import { leaveDemo } from "@/app/demo/actions"
import { Button } from "@/components/ui/button"
import { getMembership } from "@/lib/business"

/** Top of every cabinet page for a demo guest: what this is and the way to a real account. */
export async function DemoBanner() {
  const membership = await getMembership()
  if (!membership?.isDemo) return null

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg bg-primary-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span className="font-medium">Это демо.</span> Меняйте что угодно: данные видите только вы, через сутки они
        удалятся.
      </p>
      <form action={leaveDemo} className="shrink-0">
        <Button type="submit" className="w-full sm:w-auto">
          Создать свой бизнес
        </Button>
      </form>
    </div>
  )
}
