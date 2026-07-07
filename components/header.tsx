"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { Drawer } from "@base-ui/react/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, LayoutDashboard, Plus, History, Calendar, BarChart3, Award, Settings, Shield, Menu, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "History", href: "/history", icon: History },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Achievements", href: "/achievements", icon: Award },
]

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/auth/login")
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold">
          Moodscaparr
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <Drawer.Root swipeDirection="right">
            <Drawer.Trigger className="flex size-8 items-center justify-center rounded-md hover:bg-accent">
              <Menu className="size-5" />
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
              <Drawer.Viewport className="fixed inset-0 z-50 flex items-stretch justify-end">
                <Drawer.Popup className="h-full w-72 border-l bg-background p-6 text-foreground outline-none transition-transform duration-300 data-starting-style:translate-x-full data-ending-style:translate-x-full">
                  <div className="mb-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Menu
                    </span>
                    <Drawer.Close className="flex size-8 items-center justify-center rounded-md hover:bg-accent">
                      <X className="size-5" />
                    </Drawer.Close>
                  </div>
                  <Drawer.Content>
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "justify-start",
                          )}
                        >
                          <item.icon className="size-4" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        </div>

        <Link
          href="/wizard"
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Entry</span>
        </Link>

        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {user?.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="size-8 rounded-full"
                />
              ) : (
                initials
              )}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  <Shield className="size-4" />
                  Admin
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
