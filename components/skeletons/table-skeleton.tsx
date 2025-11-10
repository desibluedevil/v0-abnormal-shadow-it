export function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-6 space-y-4 animate-pulse backdrop-blur-sm">
      <div className="h-5 w-48 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
        ))}
      </div>
    </div>
  )
}
