import { cookies, headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"

import { isLocale, LOCALE_COOKIE, localeFromAcceptLanguage } from "./config"

/** Language of the request: an explicit override (pages that stay Russian), the cookie, then the browser. */
export default getRequestConfig(async ({ locale: override }) => {
  let locale = isLocale(override) ? override : undefined
  if (!locale) {
    const cookie = (await cookies()).get(LOCALE_COOKIE)?.value
    locale = isLocale(cookie) ? cookie : localeFromAcceptLanguage((await headers()).get("accept-language"))
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "Asia/Bishkek",
  }
})
