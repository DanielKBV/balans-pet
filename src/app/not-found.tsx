import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuthShell } from "./login/auth-shell"

export const metadata: Metadata = {
  title: "Страница не найдена · Balans",
}

// «/» sends a signed-in person to the cabinet, a guest to the landing.
export default function NotFound() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-title">Страница не найдена</h1>
        <p className="text-muted-foreground">Возможно, ссылка устарела или в адресе опечатка.</p>
      </div>
      <Link href="/" className={cn(buttonVariants(), "w-full")}>
        На главную
      </Link>
    </AuthShell>
  )
}
