export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Test Page - No Custom Classes</h1>
        <p className="text-base text-muted-foreground mb-6">
          This page uses only standard Tailwind classes. If this loads correctly, the issue is with cached build
          artifacts in the v0 preview environment.
        </p>
        <div className="p-4 bg-card rounded-lg border border-border">
          <p className="text-sm">
            The error "text-[2.5rem]font-bold" has been removed from all code files. The persistent error indicates a
            stale build cache in the v0 platform.
          </p>
        </div>
      </div>
    </div>
  )
}
