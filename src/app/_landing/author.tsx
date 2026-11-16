import { ArrowUpRightIcon, DownloadIcon, MailIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { CONTACTS, EMAIL, resumeHref } from "./links"

export function Author() {
  const t = useTranslations("landing")
  const locale = useLocale()
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      <div className="reveal flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-heading">{t("authorName")}</p>
          <p className="text-muted-foreground">{t("authorRole")}</p>
        </div>
        <p className="max-w-xl text-pretty">{t("authorAbout")}</p>
      </div>

      <div className="reveal flex flex-col gap-3 lg:pt-1">
        <a href={resumeHref(locale)} download className={buttonVariants({ size: "lg", className: "w-full sm:w-fit" })}>
          <DownloadIcon aria-hidden data-icon="inline-start" />
          {t("resume")}
        </a>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CONTACTS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", className: "w-full" })}>
                {label}
                <ArrowUpRightIcon aria-hidden data-icon="inline-end" className="text-muted-foreground" />
                <span className="sr-only">({t("newTab")})</span>
              </a>
            </li>
          ))}
          <li className="col-span-2 sm:col-span-2">
            <a href={`mailto:${EMAIL}`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
              <MailIcon aria-hidden data-icon="inline-start" className="text-muted-foreground" />
              <span className="truncate">{EMAIL}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
