import { headers } from "next/headers"

/** «https://balans-pet.vercel.app» or «http://localhost:3000», from the request headers. */
export async function siteOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}
