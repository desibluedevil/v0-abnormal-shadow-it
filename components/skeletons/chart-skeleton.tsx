export function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-lg border border-border bg-card/50 shadow-sm p-6 space-y-4 animate-pulse backdrop-blur-sm">
        <div className="h-5 w-48 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
        <div className="h-64 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
      </div>
      <div className="rounded-lg border border-border bg-card/50 shadow-sm p-6 space-y-4 animate-pulse backdrop-blur-sm">
        <div className="h-5 w-32 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
        <div className="h-64 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
      </div>
    </div>
  )
}
