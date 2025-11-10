export function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-md border bg-surface-1 shadow-ab-1 p-6 space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
      <div className="rounded-md border bg-surface-1 shadow-ab-1 p-6 space-y-4 animate-pulse">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    </div>
  )
}
