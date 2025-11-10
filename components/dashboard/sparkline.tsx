"use client"

interface SparklineProps {
  data: Array<{ ts: string; hours: number }>
}

export function Sparkline({ data }: SparklineProps) {
  if (data.length === 0) {
    return <div className="h-[56px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
  }

  const maxHours = Math.max(...data.map((d) => d.hours), 1)
  const minHours = Math.min(...data.map((d) => d.hours), 0)
  const range = maxHours - minHours || 1

  const width = 300
  const height = 56
  const padding = 5

  const xStep = (width - padding * 2) / (data.length - 1 || 1)
  const yScale = (height - padding * 2) / range

  // Create path for sparkline
  const linePath = data
    .map((d, i) => {
      const x = padding + i * xStep
      const y = height - padding - (d.hours - minHours) * yScale
      return `${i === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  return (
    <svg width="100%" height="56" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
    </svg>
  )
}
