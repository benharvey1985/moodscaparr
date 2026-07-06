export default function WizardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
      {children}
    </div>
  )
}
