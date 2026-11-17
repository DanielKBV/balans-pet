import type { MetadataRoute } from "next"

const SITE = "https://balans-pet.vercel.app"

/** Search engines see only the landing and the privacy policy: the cabinet, sign-in, invites and service pages stay out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/operations",
        "/add",
        "/categories",
        "/team",
        "/settings",
        "/onboarding",
        "/reset-password",
        "/login",
        "/invite/",
        "/auth/",
        "/admin",
        "/design",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
