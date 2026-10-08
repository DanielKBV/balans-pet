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

import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

type NavItem = { href: string; label: string; Icon: LucideIcon; inBottomNav: boolean }

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Дашборд", Icon: LayoutDashboardIcon, inBottomNav: true },
  { href: "/operations", label: "Операции", Icon: ArrowLeftRightIcon, inBottomNav: true },
  { href: "/add", label: "Добавить", Icon: PlusIcon, inBottomNav: true },
  { href: "/categories", label: "Категории", Icon: TagsIcon, inBottomNav: false },
  { href: "/team", label: "Команда", Icon: UsersIcon, inBottomNav: false },
  { href: "/settings", label: "Настройки", Icon: SettingsIcon, inBottomNav: true },
]

/** Left menu, 240px. The caller decides visibility (shown from lg). */
export function Sidebar({ active, className }: { active?: string; className?: string }) {
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
      <nav aria-label="Главное меню" className="flex flex-col gap-0.5 p-2">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = href === active
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-row items-center gap-3 rounded-lg px-3 outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive && "bg-primary-subtle font-medium text-primary-text hover:bg-primary-subtle"
              )}
            >
              <Icon aria-hidden className={cn("size-5", !isActive && "text-muted-foreground")} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

/** Phone bottom menu, 64px + iPhone safe area. The caller positions it (fixed, below lg). */
export function BottomNav({ active, className }: { active?: string; className?: string }) {
  return (
    <nav
      aria-label="Главное меню"
      className={cn(
        "border-t border-border bg-card pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <ul className="flex h-bottom-nav">
        {navItems
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
                  {label}
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
      <Logo className="lg:hidden" />
      <div className="min-w-0 flex-1">{children}</div>
      <ThemeToggle />
    </header>
  )
}
