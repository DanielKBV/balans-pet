"use client"

import { useEffect } from "react"
import { useOffline } from "next/offline"
import { WifiOffIcon } from "lucide-react"

/** Registers public/sw.js, which shows /offline.html when a page cannot load without network. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    // The offline page is a nicety: if registration fails, the site works as before.
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {})
  }, [])
  return null
}

/** Bar on top while the open app has no network. Next keeps saves and navigations pending until it returns. */
export function OfflineBanner() {
  const isOffline = useOffline()
  if (!isOffline) return null

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-warning-subtle px-4 py-2 text-center text-small text-warning"
    >
      <WifiOffIcon aria-hidden className="size-4 shrink-0" />
      Нет соединения. Проверьте интернет.
    </div>
  )
}
