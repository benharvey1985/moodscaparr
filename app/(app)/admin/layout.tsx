import { requireAdmin } from "@/lib/auth-actions"

export const metadata = {
  title: "Admin - Moodscaparr",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return <>{children}</>
}
