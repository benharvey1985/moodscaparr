import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-actions"
import { WizardEdit } from "./wizard-edit"
import { WizardSkeleton } from "@/components/ui/loading-skeleton"
import { Header } from "@/components/header"

export default async function WizardPageWrapper() {
  const session = await requireAuth()

  return (
    <>
      <Header
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: (session.user as { role?: string }).role,
        }}
      />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <Suspense fallback={<WizardSkeleton />}>
          <WizardEdit />
        </Suspense>
      </main>
    </>
  )
}
