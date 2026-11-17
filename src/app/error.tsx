"use client"

import { useTranslations } from "next-intl"

import { GuestBackdrop } from "@/components/guest-backdrop"
import { Button } from "@/components/ui/button"
import { StateMessage } from "@/components/state-message"

// Lives at the root to also catch errors from the cabinet layout,
// which an error file in (cabinet) would not cover.
export default function Error({ retry }: { retry: () => void }) {
  const t = useTranslations()
  return (
    <main id="main" className="page-container flex flex-1 items-center justify-center">
      <GuestBackdrop />
      <StateMessage
        variant="error"
        title={t("errors.pageTitle")}
        description={t("errors.pageDescription")}
        action={<Button onClick={() => retry()}>{t("common.retry")}</Button>}
      />
    </main>
  )
}
