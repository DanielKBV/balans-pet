import { getTranslations } from "next-intl/server"

import { leaveDemo } from "@/app/demo/actions"
import { Button } from "@/components/ui/button"
import { getMembership } from "@/lib/business"

/** Top of every cabinet page for a demo guest: what this is and the way to a real account. */
export async function DemoBanner() {
  const membership = await getMembership()
  if (!membership?.isDemo) return null
  const t = await getTranslations("demo")

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg bg-primary-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span className="font-medium">{t("bannerLead")}</span> {t("bannerText")}
      </p>
      <form action={leaveDemo} className="shrink-0">
        <Button type="submit" className="w-full sm:w-auto">
          {t("createBusiness")}
        </Button>
      </form>
    </div>
  )
}
