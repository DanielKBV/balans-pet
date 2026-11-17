import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { OgA } from "./og-card"

// Fonts and the coin ring live outside public/ and do not depend on the request: read them once.
const asset = (name: string) => readFile(join(process.cwd(), "assets/og", name))

const [inter400, inter600, inter700, geistMono500, ring] = await Promise.all([
  asset("fonts/Inter-400.ttf"),
  asset("fonts/Inter-600.ttf"),
  asset("fonts/Inter-700.ttf"),
  asset("fonts/GeistMono-500.ttf"),
  asset("coins-ring.png"),
])

const fonts = [
  { name: "Inter", data: inter400, weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: inter600, weight: 600 as const, style: "normal" as const },
  { name: "Inter", data: inter700, weight: 700 as const, style: "normal" as const },
  { name: "Geist Mono", data: geistMono500, weight: 500 as const, style: "normal" as const },
]

const img = { ring: `data:image/png;base64,${ring.toString("base64")}` }

// Link preview (Open Graph) 1200x630: English by default, Russian with ?lang=ru.
export function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang") === "ru" ? "ru" : "en"
  return new ImageResponse(<OgA lang={lang} img={img} />, {
    width: 1200,
    height: 630,
    fonts,
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400" },
  })
}
