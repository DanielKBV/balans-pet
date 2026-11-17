// ЭТАЛОН ДИЗАЙНА OG-картинок Balans (варианты A, B, C). Проверено: рендерится satori + resvg в 1200x630.
// Переносить в app/og/route.tsx только выбранный вариант. Картинки (img) приходят как data URI из assets/og/.
// Satori-compatible JSX (same rules as next/og ImageResponse): flex only, inline styles.
import React from "react";

export type Lang = "en" | "ru";
export type Img = Record<string, string>; // name -> data URI

const C = {
  bg: "#09090c", bg2: "#0f1015", box: "#16181f", box2: "#1d2029",
  line: "#22252e", line2: "#30343f", fg: "#ededf2", mut: "#8e92a3", dim: "#5d6170",
  acc: "#6e6cff", acc2: "#a5a4ff", inc: "#3ecf8e", exp: "#f0605d",
};

export const COPY = {
  en: {
    pill: "Money tracking for car washes and barbershops",
    h1: "How much did you make this month?",
    sub: "Balans does the math. You just look.",
    profitLabel: "Profit for November", profit: "142,800 som", profV: "142,800",
    rev: "Revenue", revV: "318,400", expL: "Expenses", expV: "175,600", prof: "Profit",
    rows: [["Full wash", "+1,200", 1], ["Shampoo", "−3,400", 0], ["Interior clean", "+900", 1], ["Rent", "−25,000", 0]] as [string, string, number][],
    demo: "Open the demo",
  },
  ru: {
    pill: "Учёт денег для автомойки и барбершопа",
    h1: "Сколько вы заработали в этом месяце?",
    sub: "Balans сам считает прибыль. Вы просто смотрите.",
    profitLabel: "Прибыль за ноябрь", profit: "142 800 сом", profV: "142 800",
    rev: "Выручка", revV: "318 400", expL: "Расходы", expV: "175 600", prof: "Прибыль",
    rows: [["Комплекс", "+1 200", 1], ["Шампунь", "−3 400", 0], ["Химчистка салона", "+900", 1], ["Аренда", "−25 000", 0]] as [string, string, number][],
    demo: "Открыть демо",
  },
};
const URL = "balans-pet.vercel.app";

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.28, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundImage: `linear-gradient(145deg, #8b89ff, ${C.acc} 55%, #5250e0)`,
        border: "1px solid rgba(255,255,255,.18)", boxShadow: "0 8px 24px rgba(110,108,255,.35)",
        color: "#fff", fontSize: size * 0.56, fontWeight: 700,
      }}>B</div>
      <div style={{ fontSize: size * 0.62, fontWeight: 600, color: C.fg, letterSpacing: -0.5 }}>Balans</div>
    </div>
  );
}

export function Pill({ text }: { text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, alignSelf: "flex-start",
      padding: "8px 16px", borderRadius: 999, border: `1px solid ${C.line2}`, background: "rgba(22,24,31,.7)",
      color: C.mut, fontSize: 20, fontWeight: 500,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: 8, background: C.inc, boxShadow: `0 0 10px ${C.inc}` }} />
      {text}
    </div>
  );
}

function Url() {
  return <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 20, color: C.dim }}>{URL}</div>;
}

// soft background: indigo glow + faint grid that fades out
export function Backdrop({ glowX = "75%", glowY = "40%" }: { glowX?: string; glowY?: string }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.35,
        backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
        backgroundSize: "56px 56px" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex",
        backgroundImage: `radial-gradient(circle at ${glowX} ${glowY}, rgba(110,108,255,.30) 0%, rgba(110,108,255,.08) 30%, rgba(9,9,12,0) 55%)` }} />
    </>
  );
}

export function Phone({ t, w = 300 }: { t: typeof COPY.en; w?: number }) {
  const s = w / 300;
  return (
    <div style={{
      width: w, height: w * 1.86, display: "flex", padding: 9 * s, borderRadius: 44 * s,
      backgroundImage: "linear-gradient(160deg, #4a4e5a, #1b1d24 40%, #2c2f38)",
      border: "1px solid rgba(255,255,255,.10)",
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: 36 * s, background: "#121319", padding: 22 * s, gap: 10 * s }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 * s }}>
          <div style={{ width: 26 * s, height: 26 * s, borderRadius: 7 * s, background: C.acc, color: "#fff", fontSize: 15 * s, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>B</div>
          <div style={{ color: C.fg, fontSize: 17 * s, fontWeight: 600 }}>Balans</div>
        </div>
        <div style={{ marginTop: 14 * s, color: C.mut, fontSize: 14 * s }}>{t.profitLabel}</div>
        <div style={{ color: C.inc, fontSize: 34 * s, fontWeight: 700, letterSpacing: -1 }}>{t.profit}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 * s, marginTop: 10 * s }}>
          {t.rows.map(([name, val, inc]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${11 * s}px ${12 * s}px`, borderRadius: 12 * s, background: C.box2 }}>
              <div style={{ color: C.fg, fontSize: 13 * s }}>{name}</div>
              <div style={{ color: inc ? C.inc : C.exp, fontSize: 13 * s, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- A. Hero: text left, phone + Blender coins right ---------- */
export function OgA({ lang, img }: { lang: Lang; img: Img }) {
  const t = COPY[lang];
  return (
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: C.bg, fontFamily: "Inter", overflow: "hidden" }}>
      <Backdrop glowX="78%" glowY="45%" />
      <img src={img.ring} width={740} height={682} style={{ position: "absolute", left: 660, top: -26 }} />
      <div style={{ position: "absolute", left: 878, top: 72, display: "flex", transform: "rotate(-4deg)" }}>
        <Phone t={t} w={258} />
      </div>
      <div style={{ position: "absolute", left: 72, top: 64, bottom: 60, width: 600, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Logo />
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Pill text={t.pill} />
          <div style={{ fontSize: lang === "ru" ? 60 : 66, lineHeight: 1.04, fontWeight: 700, color: C.fg, letterSpacing: -2.2 }}>{t.h1}</div>
          <div style={{ fontSize: 26, color: C.mut }}>{t.sub}</div>
        </div>
        <Url />
      </div>
    </div>
  );
}

/* ---------- B. Dashboard window rising from the bottom (Linear / Vercel) ---------- */
export function OgB({ lang, img }: { lang: Lang; img: Img }) {
  const t = COPY[lang];
  const bars = [38, 52, 44, 66, 58, 80, 72, 94, 86, 100, 90, 112];
  return (
    <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", background: C.bg, fontFamily: "Inter", overflow: "hidden" }}>
      <Backdrop glowX="50%" glowY="100%" />
      <img src={img.som} width={120} height={145} style={{ position: "absolute", left: 40, top: 190, transform: "rotate(-12deg)" }} />
      <img src={img.euro} width={120} height={116} style={{ position: "absolute", right: 44, top: 200 }} />
      <img src={img.usd} width={70} height={76} style={{ position: "absolute", left: 150, top: 50, opacity: 0.6 }} />
      <img src={img.rub} width={78} height={85} style={{ position: "absolute", right: 150, top: 60, opacity: 0.6 }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 58, gap: 18 }}>
        <Logo size={40} />
        <div style={{ fontSize: lang === "ru" ? 54 : 60, fontWeight: 700, color: C.fg, letterSpacing: -2, textAlign: "center", maxWidth: lang === "ru" ? 760 : 820, lineHeight: 1.05, marginTop: 6 }}>{t.h1}</div>
        <div style={{ fontSize: 24, color: C.mut }}>{t.sub}</div>
      </div>
      {/* window */}
      <div style={{
        position: "absolute", left: 150, right: 150, top: 375, height: 330, display: "flex", flexDirection: "column",
        borderRadius: 18, border: `1px solid ${C.line2}`, background: "rgba(15,16,21,.92)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", borderBottom: `1px solid ${C.line}` }}>
          {["#3a3d48", "#3a3d48", "#3a3d48"].map((c, i) => <div key={i} style={{ width: 11, height: 11, borderRadius: 11, background: c }} />)}
          <div style={{ marginLeft: 16, fontFamily: "Geist Mono", fontSize: 15, color: C.dim }}>{`${URL}/dashboard`}</div>
        </div>
        <div style={{ display: "flex", gap: 16, padding: 20 }}>
          {[[t.rev, t.revV, C.fg], [t.expL, t.expV, C.exp], [t.prof, t.profV, C.inc]].map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: 16, borderRadius: 12, background: C.box, border: `1px solid ${C.line}` }}>
              <div style={{ fontSize: 15, color: C.mut }}>{l}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: c, letterSpacing: -1 }}>{v}</div>
            </div>
          ))}
          <div style={{ flex: 1.3, display: "flex", alignItems: "flex-end", gap: 7, padding: 16, borderRadius: 12, background: C.box, border: `1px solid ${C.line}` }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, height: h * 0.62, borderRadius: 4, backgroundImage: i === bars.length - 1 ? `linear-gradient(${C.acc2}, ${C.acc})` : `linear-gradient(${C.line2}, ${C.box2})` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- C. Minimal: big B mark, wordmark, coins at the edges (Stripe-calm) ---------- */
export function OgC({ lang, img }: { lang: Lang; img: Img }) {
  const t = COPY[lang];
  return (
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: C.bg, fontFamily: "Inter", overflow: "hidden" }}>
      <Backdrop glowX="30%" glowY="50%" />
      <img src={img.som} width={260} height={313} style={{ position: "absolute", right: 120, top: -70, transform: "rotate(14deg)" }} />
      <img src={img.btc} width={250} height={265} style={{ position: "absolute", right: -40, top: 250 }} />
      <img src={img.euro} width={170} height={165} style={{ position: "absolute", right: 300, bottom: -40, opacity: 0.9 }} />
      <img src={img.b} width={70} height={124} style={{ position: "absolute", right: 420, top: 150, opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 80, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        <div style={{
          width: 120, height: 120, borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center",
          backgroundImage: `linear-gradient(145deg, #8b89ff, ${C.acc} 55%, #4f4dd8)`, color: "#fff", fontSize: 72, fontWeight: 700,
          border: "1px solid rgba(255,255,255,.2)", boxShadow: "0 20px 60px rgba(110,108,255,.45)",
        }}>B</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 92, fontWeight: 700, color: C.fg, letterSpacing: -3.5, lineHeight: 1 }}>Balans</div>
          <div style={{ fontSize: 30, color: C.mut, maxWidth: 560, lineHeight: 1.3 }}>{t.pill}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", padding: "12px 22px", borderRadius: 999, background: C.fg, color: C.bg, fontSize: 21, fontWeight: 600 }}>{`${t.demo} →`}</div>
          <Url />
        </div>
      </div>
    </div>
  );
}
