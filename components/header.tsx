"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, LayoutDashboard, Plus, History, Calendar, BarChart3, Award, Settings, Shield } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/wizard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <Plus className="size-4" />
            New Entry
          </Link>
          <Link
            href="/history"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <History className="size-4" />
            History
          </Link>
          <Link
            href="/calendar"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <Calendar className="size-4" />
            Calendar
          </Link>
          <Link
            href="/analytics"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <BarChart3 className="size-4" />
            Analytics
          </Link>
          <Link
            href="/achievements"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <Award className="size-4" />
            Achievements
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
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
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                <LayoutDashboard className="size-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/wizard")}>
                <Plus className="size-4" />
                New Entry
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/history")}>
                <History className="size-4" />
                History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/calendar")}>
                <Calendar className="size-4" />
                Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/analytics")}>
                <BarChart3 className="size-4" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/achievements")}>
                <Award className="size-4" />
                Achievements
              </DropdownMenuItem>
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
