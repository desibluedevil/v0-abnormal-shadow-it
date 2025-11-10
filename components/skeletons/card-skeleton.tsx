export function CardSkeleton() {
  return (
    <div className="rounded-md border bg-surface-1 shadow-ab-1 p-6 space-y-4 animate-pulse">
      <div className="h-5 w-32 bg-muted rounded" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
        <div className="h-4 w-4/6 bg-muted rounded" />
      </div>
    </div>
  )
}
