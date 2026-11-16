import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { REPO_URL } from "./links"

const FACTS = ["stack", "data", "access", "demo", "screens", "design"] as const

// Verbatim from supabase/migrations/0003_entries.sql and 0005_team.sql.
const POLICIES = `create policy "Owner reads entries"
  on public.entries for select to authenticated
  using (
    business_id = (select public.current_business_id())
    and exists (
      select 1 from public.business_members
      where user_id = (select auth.uid()) and role = 'owner'
    )
  );

create policy "Employees read own entries"
  on public.entries for select to authenticated
  using (business_id = (select public.current_business_id())
    and created_by = (select auth.uid()));`

/** For developers: the facts that matter and a real piece of the database rules. */
export function UnderTheHood() {
  const t = useTranslations("landing")
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-8">
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-[auto_1fr]">
          {FACTS.map((fact) => (
            <div key={fact} className="reveal grid gap-1 sm:col-span-2 sm:grid-cols-subgrid sm:gap-x-6">
              <dt className="font-medium">{t(`facts.${fact}Term`)}</dt>
              <dd className="text-muted-foreground text-pretty">{t(`facts.${fact}`)}</dd>
            </div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>
            {t("source")}
            <ArrowUpRightIcon aria-hidden data-icon="inline-end" />
            <span className="sr-only">({t("newTab")})</span>
          </a>
          <Link href="/design" prefetch={false} className={buttonVariants({ variant: "outline" })}>
            {t("designSystem")}
          </Link>
        </div>
      </div>

      <figure className="reveal flex min-w-0 flex-col gap-3">
        {/* Scrolls sideways on a phone: focusable so the keyboard can scroll it too. */}
        <pre
          tabIndex={0}
          aria-label={t("codeAria")}
          className="overflow-x-auto rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 border bg-card p-4 font-mono text-small text-muted-foreground shadow-highlight md:p-6">
          <code>{POLICIES}</code>
        </pre>
        <figcaption className="text-small text-muted-foreground text-balance">{t("codeCaption")}</figcaption>
      </figure>
    </div>
  )
}
