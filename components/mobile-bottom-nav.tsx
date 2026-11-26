"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { isNavItemActive, mainNavItems } from "@/lib/navigation"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

const bottomTabs = [
  ...mainNavItems.slice(0, 4),
  { label: "Settings", href: "/settings", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed right-0 bottom-0 left-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex h-16 items-center justify-around">
        {bottomTabs.map((item) => {
          const active = isNavItemActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
