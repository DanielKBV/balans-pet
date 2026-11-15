import { NextResponse, type NextRequest } from "next/server"

import { isLocale, LOCALE_COOKIE, LOCALE_COOKIE_OPTIONS } from "@/i18n/config"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)

  // «/?lang=en» on any page: remember the language and go to the clean address.
  const lang = request.nextUrl.searchParams.get("lang")
  if (request.method !== "GET" || !isLocale(lang)) return response

  // Supabase may already be redirecting (a guest to /login, a signed-in person to the cabinet): keep its target.
  const location = response.headers.get("location")
  const url = location ? new URL(location, request.url) : request.nextUrl.clone()
  url.searchParams.delete("lang")
  const redirect = NextResponse.redirect(url)
  // Keep refreshed session cookies on the redirect.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  redirect.cookies.set(LOCALE_COOKIE, lang, LOCALE_COOKIE_OPTIONS)
  return redirect
}

export const config = {
  // Everything except static files, images, app icons and the PWA files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|sw.js|offline.html|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
