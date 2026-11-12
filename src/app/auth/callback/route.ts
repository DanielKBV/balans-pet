import { NextResponse, type NextRequest } from "next/server"

import { safeNext } from "@/lib/safe-next"
import { createClient } from "@/lib/supabase/server"

/** Links from emails (password reset) and OAuth providers land here with a one-time code. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = safeNext(searchParams.get("next"))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  // A return from Google (including a cancelled one) is marked by `from=google` or has no `next`.
  const fromGoogle = searchParams.get("from") === "google" || !searchParams.has("next")
  const reason = fromGoogle ? "google" : "link"
  return NextResponse.redirect(`${origin}/login?error=${reason}`)
}
