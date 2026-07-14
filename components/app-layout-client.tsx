"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function AppLayoutClient({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4 lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <Link href="/wizard">
            <Button variant="default" size="sm">
              <Plus className="size-4" />
              <span className="hidden sm:inline">New Entry</span>
            </Button>
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex-1 pb-16">{children}</main>
      </div>
      <MobileBottomNav />
    </>
  )
}
