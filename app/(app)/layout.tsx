import { requireAuth } from "@/lib/auth-actions"
import { AppLayoutClient } from "@/components/app-layout-client"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <AppLayoutClient>
      {children}
    </AppLayoutClient>
  )
}
