"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { buttonVariants } from "@/components/ui/button"
import { isNavItemActive, mainNavItems, secondaryNavItems } from "@/lib/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()
  const visibleSecondaryNavItems = secondaryNavItems.filter(
    (item) => !item.adminOnly || session?.user.role === "admin"
  )

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              aria-label="Moodscaparr dashboard"
              render={<Link href="/dashboard" />}
            >
              <span className="text-xl font-bold">M</span>
              <span className="text-base font-semibold">Moodscaparr</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <div className="px-3 py-2">
        <Link
          href="/wizard"
          className={buttonVariants({ className: "w-full max-lg:h-11" })}
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>New Entry</span>
        </Link>
      </div>
      <nav aria-label="Primary navigation" className="flex min-h-0 flex-1 flex-col">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => {
                  const active = isNavItemActive(pathname, item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        aria-current={active ? "page" : undefined}
                        tooltip={item.label}
                        className="max-lg:h-11"
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleSecondaryNavItems.map((item) => {
                  const active = isNavItemActive(pathname, item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        aria-current={active ? "page" : undefined}
                        tooltip={item.label}
                        className="max-lg:h-11"
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </nav>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
