export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/50 shadow-sm p-6 space-y-4 animate-pulse backdrop-blur-sm">
      <div className="h-5 w-32 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
        <div className="h-4 w-5/6 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
        <div className="h-4 w-4/6 bg-muted/50 rounded-md shadow-[0_0_8px_rgba(71,215,255,0.05)]" />
      </div>
    </div>
  )
}
