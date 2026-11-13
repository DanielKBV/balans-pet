import { cache } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import { createClient } from "@/lib/supabase/server"

type Membership = {
  role: "owner" | "employee"
  display_name: string | null
  email: string | null
  business: { name: string; activity: string }
}

/** Current user's membership, or null if they have no business yet. `isDemo`: anonymous demo guest. */
export const getMembership = cache(async () => {
  // Supabase reads the clock (token expiry), so render at request time.
  await connection()
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  if (!auth?.claims) redirect("/login")

  const { data, error } = await supabase
    .from("business_members")
    .select("role, display_name, email, business:businesses(name, activity)")
    .eq("user_id", auth.claims.sub)
    .maybeSingle<Membership>()

  // Throw instead of returning null: a failed request must not look like "no business".
  if (error) throw new Error(error.message)
  return data && { ...data, isDemo: auth.claims.is_anonymous === true }
})
