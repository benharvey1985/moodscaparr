"use client"

import { type ReactNode } from "react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
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
        <header className="flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center gap-2 border-b px-4 pt-[env(safe-area-inset-top)] lg:hidden">
          <SidebarTrigger className="-ml-1 max-lg:size-11" />
          <div className="flex-1" />
          <Link
            href="/wizard"
            aria-label="Create a new mood entry"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">New Entry</span>
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </>
  )
}
