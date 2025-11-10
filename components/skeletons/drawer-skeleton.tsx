export function DrawerSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-muted rounded-md" />
        <div className="h-4 w-32 bg-muted rounded-md" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted rounded-md" />
        <div className="h-6 w-20 bg-muted rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md border bg-surface-1 p-4 space-y-2">
            <div className="h-4 w-24 bg-muted rounded-md" />
            <div className="h-3 w-full bg-muted rounded-md" />
            <div className="h-3 w-3/4 bg-muted rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
