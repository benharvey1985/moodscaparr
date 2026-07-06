"use client"

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[--radius-standard] bg-muted ${className}`}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3 rounded-xl border p-4">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border p-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WizardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-8 p-6">
      <div className="flex justify-center gap-2">
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="size-3 rounded-full" />
      </div>
      <Skeleton className="mx-auto h-6 w-48" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 21 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
      <Skeleton className="mx-auto h-10 w-32" />
    </div>
  )
}
