import type { MetadataRoute } from "next"

const SITE = "https://balans-pet.vercel.app"

/** The two public pages. The landing exists in English and Russian (?lang=). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      alternates: { languages: { en: `${SITE}/?lang=en`, ru: `${SITE}/?lang=ru` } },
    },
    { url: `${SITE}/privacy` },
  ]
}
