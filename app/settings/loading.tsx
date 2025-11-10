export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  )
}
