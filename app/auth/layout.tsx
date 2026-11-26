import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]">
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
