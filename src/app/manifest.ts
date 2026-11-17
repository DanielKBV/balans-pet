import type { MetadataRoute } from "next"
import { getLocale, getTranslations } from "next-intl/server"

/** Install on a phone: name, icons, full screen, in the visitor's language. Colors match the light theme (`--background`, logo). */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations("meta")
  return {
    name: t("manifestName"),
    short_name: "Balans",
    description: t("description"),
    lang: await getLocale(),
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
