"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { mainNavItems } from "@/lib/navigation"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

const bottomTabs = [
  ...mainNavItems.slice(0, 4),
  { label: "Profile", href: "/profile", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {bottomTabs.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
