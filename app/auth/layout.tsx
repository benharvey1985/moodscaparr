import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm rounded-[--radius-moderate]">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold tracking-tight">
            Moodscaparr
          </h1>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
