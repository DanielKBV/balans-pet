import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PROTECTED = [
  "/dashboard",
  "/operations",
  "/add",
  "/categories",
  "/team",
  "/settings",
  "/onboarding",
  "/reset-password",
]
const AUTH_ONLY_FOR_GUESTS = ["/login"]

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** Refreshes the Supabase session cookie and redirects by auth state. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Must run right after creating the client: it refreshes an expired session.
  const { data } = await supabase.auth.getClaims()
  const isSignedIn = Boolean(data?.claims)
  const { pathname } = request.nextUrl

  // Redirect page loads only. Server Action POSTs must get their own response,
  // otherwise the client receives HTML and throws "unexpected response".
  if (request.method !== "GET") return response

  const redirectTo = !isSignedIn && matches(pathname, PROTECTED)
    ? "/login"
    : isSignedIn && matches(pathname, AUTH_ONLY_FOR_GUESTS)
      ? "/dashboard"
      : null

  if (!redirectTo) return response

  const url = request.nextUrl.clone()
  url.pathname = redirectTo
  url.search = ""
  const redirect = NextResponse.redirect(url)
  // Keep refreshed session cookies on the redirect.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}
