"use client"

interface DataPoint {
  week: string
  count: number
}

export default function LineChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-sm text-text-muted">No data available</div>
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const width = 600
  const height = 200
  const padding = 40

  const xStep = (width - padding * 2) / (data.length - 1 || 1)
  const yScale = (height - padding * 2) / maxCount

  // Create path for line
  const linePath = data
    .map((d, i) => {
      const x = padding + i * xStep
      const y = height - padding - d.count * yScale
      return `${i === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")

  return (
    <div className="h-64">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i * (height - padding * 2)) / 4
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgb(var(--border-subtle))"
              strokeOpacity="0.5"
            />
          )
        })}

        {/* Line */}
        <path d={linePath} fill="none" stroke="rgb(var(--color-accent-500))" strokeWidth="2" />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + i * xStep
          const y = height - padding - d.count * yScale
          return (
            <g key={`point-${i}`}>
              <circle cx={x} cy={y} r="4" fill="rgb(var(--color-accent-500))" />
              <title>
                {d.week}: {d.count}
              </title>
            </g>
          )
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding + i * xStep
          return (
            <text key={`label-${i}`} x={x} y={height - 10} textAnchor="middle" className="text-xs fill-text-muted">
              {d.week}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
