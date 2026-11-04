import { z } from "zod"

export const PAGE_SIZE = 20

const isoDate = z.iso.date()

// Anything malformed in the address falls back to the default instead of an error page.
const paramsSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  from: isoDate.or(z.literal("")).catch(""),
  to: isoDate.or(z.literal("")).catch(""),
  type: z.enum(["income", "expense", ""]).catch(""),
  category: z.uuid().or(z.literal("")).catch(""),
  sort: z.enum(["date", "amount"]).catch("date"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
  page: z.coerce.number().int().min(1).catch(1),
})

export type OperationsParams = z.output<typeof paramsSchema>
export const DEFAULT_PARAMS = paramsSchema.parse({})

type RawParams = Record<string, string | string[] | undefined>

export function parseParams(raw: RawParams): OperationsParams {
  const first = (key: string) => {
    const value = raw[key]
    return Array.isArray(value) ? value[0] : value
  }
  return paramsSchema.parse(Object.fromEntries(Object.keys(DEFAULT_PARAMS).map((key) => [key, first(key) ?? ""])))
}

/** Query string with only the values that differ from the defaults: «?type=expense&page=2». */
export function toSearch(params: OperationsParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== DEFAULT_PARAMS[key as keyof OperationsParams]) search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

export function hasFilters(params: OperationsParams): boolean {
  return Boolean(params.q || params.from || params.to || params.type || params.category)
}
