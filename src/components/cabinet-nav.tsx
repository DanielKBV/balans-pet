"use client"

import { usePathname } from "next/navigation"

import { BottomNav, Sidebar } from "@/components/app-nav"

/** Menus with the active item taken from the current address. */
export function CabinetSidebar({ isOwner, className }: { isOwner: boolean; className?: string }) {
  return <Sidebar active={usePathname()} isOwner={isOwner} className={className} />
}

export function CabinetBottomNav({ isOwner, className }: { isOwner: boolean; className?: string }) {
  return <BottomNav active={usePathname()} isOwner={isOwner} className={className} />
}
