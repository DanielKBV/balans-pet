"use client"

import { usePathname } from "next/navigation"

import { BottomNav, Sidebar } from "@/components/app-nav"

/** Menus with the active item taken from the current address. */
export function CabinetSidebar({ className }: { className?: string }) {
  return <Sidebar active={usePathname()} className={className} />
}

export function CabinetBottomNav({ className }: { className?: string }) {
  return <BottomNav active={usePathname()} className={className} />
}
