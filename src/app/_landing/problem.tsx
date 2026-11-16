import { useTranslations } from "next-intl"

import { PlayCard } from "./motion"
import { WordReveal } from "./word-reveal"

const card = "flex min-w-0 flex-col gap-3.5 rounded-2xl border bg-card p-6"

/** Block 2: the phrase that lights up on scroll and three pains, each with its own mini-animation. */
export function Problem() {
  const t = useTranslations("landing.problem")
  return (
    <section id="problem" aria-label={t("aria")} className="page-container scroll-mt-header py-24 md:py-36">
      <WordReveal
        text={t("phrase")}
        className="max-w-[20ch] text-statement"
      />
      <ul className="mt-16 grid gap-4 md:mt-18 md:grid-cols-3">
        <PlayCard className={card}>
          <div aria-hidden className="lp-ill lp-note">
            <i />
            <i />
            <i />
            <i />
          </div>
          <h3 className="text-heading">{t("notebookTitle")}</h3>
          <p className="text-muted-foreground text-pretty">{t("notebookText")}</p>
        </PlayCard>
        <PlayCard className={card}>
          <div aria-hidden className="lp-ill lp-sheet">
            <b className="lp-error">{t("excelError")}</b>
            <span className="lp-cursor" />
            {Array.from({ length: 24 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <h3 className="text-heading">{t("excelTitle")}</h3>
          <p className="text-muted-foreground text-pretty">{t("excelText")}</p>
        </PlayCard>
        <PlayCard className={card}>
          <div aria-hidden className="lp-ill lp-leak">
            <i />
            <i />
            <i />
            <i />
          </div>
          <h3 className="text-heading">{t("leakTitle")}</h3>
          <p className="text-muted-foreground text-pretty">{t("leakText")}</p>
        </PlayCard>
      </ul>
    </section>
  )
}
