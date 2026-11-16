"use client"

import { useEffect, useId, useRef, useState } from "react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"

import type { Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"
import photo from "../../../public/images/daniel.jpg"
import { LiveArrow } from "./arrow"
import { CONTACTS, resumeHref } from "./links"

/**
 * «Built by Daniel» pill in the footer. Hover, focus or tap opens a card above it with the photo and links.
 * Closes on Esc and on a click outside.
 */
export function AuthorCard() {
  const t = useTranslations("landing.author")
  const locale = useLocale() as Locale
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => !root.current?.contains(event.target as Node) && setOpen(false)
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const links = [
    CONTACTS.github,
    { label: t("resume"), href: resumeHref(locale) },
    CONTACTS.telegram,
    CONTACTS.linkedin,
  ]

  return (
    <div
      ref={root}
      className="group/author relative"
      onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full flex min-h-11 items-center gap-3 border bg-card py-1.5 pr-4 pl-1.5 text-small text-muted-foreground outline-none transition-colors group-hover/author:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:border-primary/60"
      >
        <Image src={photo} alt="" width={36} height={36} sizes="36px" className="size-9 shrink-0 rounded-full object-cover" />
        <span>
          {t("builtBy")} <b className="font-medium text-foreground">{t("name")}</b>
        </span>
      </button>

      <div
        id={id}
        className={cn(
          "absolute bottom-full left-0 z-30 mb-3 flex before:absolute before:inset-x-0 before:top-full before:h-3 before:content-[''] w-[min(23rem,calc(100vw-2rem))] origin-bottom-left flex-col gap-3.5 rounded-2xl border bg-popover p-4.5 shadow-dialog transition duration-300",
          "pointer-events-none translate-y-2.5 scale-97 opacity-0",
          "group-hover/author:pointer-events-auto group-hover/author:translate-y-0 group-hover/author:scale-100 group-hover/author:opacity-100",
          "group-focus-within/author:pointer-events-auto group-focus-within/author:translate-y-0 group-focus-within/author:scale-100 group-focus-within/author:opacity-100",
          open && "pointer-events-auto translate-y-0 scale-100 opacity-100"
        )}
      >
        <div className="flex items-center gap-3.5">
          <Image src={photo} alt={t("photoAlt")} width={84} height={84} sizes="84px" className="size-21 shrink-0 rounded-2xl object-cover" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="font-medium">{t("name")}</p>
            <p className="text-small text-muted-foreground">{t("role")}</p>
            <p className="flex items-center gap-1.5 text-small text-income">
              <span aria-hidden className="size-2 rounded-full bg-income" />
              {t("open")}
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center justify-between rounded-lg bg-muted px-3 text-small outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {label}
                <LiveArrow />
                <span className="sr-only"> ({t("newTab")})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
