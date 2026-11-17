import { NextResponse, type NextRequest } from "next/server"

import { isLocale, LOCALE_COOKIE, LOCALE_COOKIE_OPTIONS } from "@/i18n/config"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  // «/?lang=en» on any page: this request renders in that language (link-preview bots see it in the first response)
  // and the cookie remembers it. No redirect, so ?lang stays in the address.
  const param = request.nextUrl.searchParams.get("lang")
  const lang = request.method === "GET" && isLocale(param) ? param : null
  if (lang) request.cookies.set(LOCALE_COOKIE, lang)

  const response = await updateSession(request)
  if (!lang) return response

  // Supabase may already be redirecting (a guest to /login, a signed-in person to the cabinet): keep its target.
  const location = response.headers.get("location")
  if (!location) {
    response.cookies.set(LOCALE_COOKIE, lang, LOCALE_COOKIE_OPTIONS)
    return response
  }
  const url = new URL(location, request.url)
  url.searchParams.delete("lang")
  const redirect = NextResponse.redirect(url)
  // Keep refreshed session cookies on the redirect.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  redirect.cookies.set(LOCALE_COOKIE, lang, LOCALE_COOKIE_OPTIONS)
  return redirect
}

export const config = {
  // Everything except static files, images, app icons, the link preview (/og keeps its ?lang) and the PWA files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|og|icon|apple-icon|manifest.webmanifest|sw.js|offline.html|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
