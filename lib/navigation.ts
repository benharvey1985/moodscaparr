import {
  LayoutDashboard,
  History,
  Calendar,
  BarChart3,
  Award,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Only shown to admin users */
  adminOnly?: boolean
}

export const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "History", href: "/history", icon: History },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Achievements", href: "/achievements", icon: Award },
]

export const secondaryNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true },
]
