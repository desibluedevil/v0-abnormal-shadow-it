export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card/50 shadow-sm p-6 space-y-3 animate-pulse backdrop-blur-sm"
        >
          <div className="h-4 w-24 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
          <div className="h-8 w-16 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
        </div>
      ))}
    </div>
  )
}
