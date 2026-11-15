"use server"

import { cookies } from "next/headers"

import { isLocale, LOCALE_COOKIE, LOCALE_COOKIE_OPTIONS, type Locale } from "./config"

/** Remembers the language. Setting a cookie in a Server Action re-renders the open page in it. */
export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return
  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS)
}
