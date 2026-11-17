// Variant A of the link preview, moved 1:1 from docs/launch/og/og_reference.tsx.
// Satori JSX (next/og): flex only, inline styles. Images arrive as data URIs from assets/og/.
/* eslint-disable @next/next/no-img-element */

export type Lang = "en" | "ru";
export type Img = Record<string, string>; // name -> data URI

const C = {
  bg: "#09090c", bg2: "#0f1015", box: "#16181f", box2: "#1d2029",
  line: "#22252e", line2: "#30343f", fg: "#ededf2", mut: "#8e92a3", dim: "#5d6170",
  acc: "#6e6cff", acc2: "#a5a4ff", inc: "#3ecf8e", exp: "#f0605d",
};

const COPY = {
  en: {
    pill: "Money tracking for car washes and barbershops",
    h1: "How much did you make this month?",
    sub: "Balans does the math. You just look.",
    profitLabel: "Profit for November", profit: "142,800 som",
    rows: [["Full wash", "+1,200", 1], ["Shampoo", "−3,400", 0], ["Interior clean", "+900", 1], ["Rent", "−25,000", 0]] as [string, string, number][],
  },
  ru: {
    pill: "Учёт денег для автомойки и барбершопа",
    h1: "Сколько вы заработали в этом месяце?",
    sub: "Balans сам считает прибыль. Вы просто смотрите.",
    profitLabel: "Прибыль за ноябрь", profit: "142 800 сом",
    rows: [["Комплекс", "+1 200", 1], ["Шампунь", "−3 400", 0], ["Химчистка салона", "+900", 1], ["Аренда", "−25 000", 0]] as [string, string, number][],
  },
};
const SITE = "balans-pet.vercel.app";

function Logo({ size = 44 }: { size?: number }) {
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

function Pill({ text }: { text: string }) {
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
  return <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 20, color: C.dim }}>{SITE}</div>;
}

// soft background: indigo glow + faint grid that fades out
function Backdrop({ glowX = "75%", glowY = "40%" }: { glowX?: string; glowY?: string }) {
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

function Phone({ t, w = 300 }: { t: typeof COPY.en; w?: number }) {
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

/* A. Hero: text left, phone + Blender coins right */
export function OgA({ lang, img }: { lang: Lang; img: Img }) {
  const t = COPY[lang];
  return (
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: C.bg, fontFamily: "Inter", overflow: "hidden" }}>
      <Backdrop glowX="78%" glowY="45%" />
      <img src={img.ring} alt="" width={740} height={682} style={{ position: "absolute", left: 660, top: -26 }} />
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
