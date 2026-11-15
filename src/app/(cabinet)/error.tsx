"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StateMessage } from "@/components/state-message"

// A failed cabinet page shows its error inside the cabinet: the menu and header stay,
// so the person can go to another page. Layout errors still reach app/error.tsx.
export default function CabinetError({ retry }: { retry: () => void }) {
  const t = useTranslations()
  return (
    <Card className="py-0">
      <StateMessage
        variant="error"
        title={t("errors.pageTitle")}
        description={t("common.checkInternet")}
        action={<Button onClick={() => retry()}>{t("common.retry")}</Button>}
      />
    </Card>
  )
}
