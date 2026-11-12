/** Where to go after sign-in: only a path on this site, never «//evil.com» or a full URL. */
export function safeNext(value: unknown, fallback = "/dashboard"): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback
}
