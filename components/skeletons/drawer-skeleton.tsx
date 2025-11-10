export function DrawerSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
        <div className="h-4 w-32 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
        <div className="h-6 w-20 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card/30 p-4 space-y-2 backdrop-blur-sm">
            <div className="h-4 w-24 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
            <div className="h-3 w-full bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
            <div className="h-3 w-3/4 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
