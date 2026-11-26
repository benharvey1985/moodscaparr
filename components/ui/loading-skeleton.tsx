"use client"

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[--radius-standard] bg-muted motion-reduce:animate-none ${className}`}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6" role="status" aria-label="Loading dashboard">
      <span className="sr-only">Loading dashboard...</span>
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
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl border p-4">
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
    <div className="mx-auto w-full max-w-lg space-y-8 p-6" role="status" aria-label="Loading mood entry form">
      <span className="sr-only">Loading mood entry form...</span>
      <div className="flex justify-center gap-2">
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="size-3 rounded-full" />
      </div>
      <Skeleton className="mx-auto h-6 w-48" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 21 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-xl" />
        ))}
      </div>
      <Skeleton className="mx-auto h-10 w-32" />
    </div>
  )
}
