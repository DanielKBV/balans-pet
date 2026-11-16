import Link from "next/link"
import {
  ArrowLeftRightIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  TagsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { LocaleToggle } from "@/components/locale-toggle"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

/** `label` is a key in the `nav` dictionary section. */
type NavItem = {
  href: string
  label: "dashboard" | "operations" | "add" | "categories" | "team" | "settings"
  Icon: LucideIcon
  inBottomNav: boolean
  ownerOnly: boolean
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "dashboard", Icon: LayoutDashboardIcon, inBottomNav: true, ownerOnly: true },
  { href: "/operations", label: "operations", Icon: ArrowLeftRightIcon, inBottomNav: true, ownerOnly: false },
  { href: "/add", label: "add", Icon: PlusIcon, inBottomNav: true, ownerOnly: false },
  { href: "/categories", label: "categories", Icon: TagsIcon, inBottomNav: false, ownerOnly: true },
  { href: "/team", label: "team", Icon: UsersIcon, inBottomNav: false, ownerOnly: true },
  { href: "/settings", label: "settings", Icon: SettingsIcon, inBottomNav: true, ownerOnly: false },
]

/** Menu items for the role: an employee sees only Transactions, Add and Settings. */
export function navItemsFor(isOwner: boolean) {
  return navItems.filter((item) => isOwner || !item.ownerOnly)
}

/** Left menu, 240px. The caller decides visibility (shown from lg). */
export function Sidebar({
  active,
  isOwner = true,
  prefetch,
  className,
}: {
  active?: string
  isOwner?: boolean
  /** false on the landing preview: its links are inert and must not preload cabinet pages. */
  prefetch?: false
  className?: string
}) {
  const t = useTranslations("nav")
  return (
    <aside
      className={cn(
        "flex w-sidebar shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex h-header items-center px-4">
        <Logo />
      </div>
      <nav aria-label={t("main")} className="flex flex-col gap-0.5 p-2">
        {navItemsFor(isOwner).map(({ href, label, Icon }) => {
          const isActive = href === active
          return (
            <Link
              key={href}
              href={href}
              prefetch={prefetch}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-row items-center gap-3 rounded-lg px-3 outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive && "bg-primary-subtle font-medium text-primary-text hover:bg-primary-subtle"
              )}
            >
              <Icon aria-hidden className={cn("size-5", !isActive && "text-muted-foreground")} />
              {t(label)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

/** Phone bottom menu, 64px + iPhone safe area. The caller positions it (fixed, below lg). */
export function BottomNav({ active, isOwner = true, className }: { active?: string; isOwner?: boolean; className?: string }) {
  const t = useTranslations("nav")
  return (
    <nav
      aria-label={t("main")}
      className={cn(
        "border-t border-border bg-card pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <ul className="flex h-bottom-nav">
        {navItemsFor(isOwner)
          .filter((item) => item.inBottomNav)
          .map(({ href, label, Icon }) => {
            const isActive = href === active
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-small text-muted-foreground outline-none focus-visible:bg-accent",
                    isActive && "font-medium text-primary-text"
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                  {t(label)}
                </Link>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}

/** Top bar, 56px. Logo shows only where the sidebar is hidden. */
export function AppHeader({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex h-header items-center gap-3 border-b border-border bg-background px-4 md:px-6",
        className
      )}
    >
      {/* On a phone only the «B» mark: the business name needs the room next to the language and theme buttons. */}
      <Logo withWordmark={false} className="sm:hidden" />
      <Logo className="hidden sm:inline-flex lg:hidden" />
      <div className="min-w-0 flex-1">{children}</div>
      <LocaleToggle />
      <ThemeToggle />
    </header>
  )
}
