export default function AchievementsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Achievements</h1>
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-64 animate-pulse rounded bg-muted" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-40 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
