export default function SettingsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-14 animate-pulse border-b bg-muted/30" />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </main>
    </div>
  )
}
