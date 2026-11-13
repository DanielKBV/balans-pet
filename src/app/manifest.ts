import type { MetadataRoute } from "next"

/** Install on a phone: name, icons, full screen. Colors match the light theme (`--background`, logo). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Balans — доходы и расходы бизнеса",
    short_name: "Balans",
    description: "Онлайн-тетрадь доходов и расходов для небольшого бизнеса",
    lang: "ru",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#F6F7F9",
    theme_color: "#F6F7F9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
