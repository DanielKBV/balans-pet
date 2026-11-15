import type messages from "../../messages/ru.json"
import type { Locale } from "./config"

// Message keys and the locale are checked by TypeScript: a typo in t("…") fails the build.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
