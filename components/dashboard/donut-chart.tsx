"use client"

export default function DonutChart({ high, med, low }: { high: number; med: number; low: number }) {
  const total = high + med + low
  if (total === 0) {
    return <div className="h-64 flex items-center justify-center text-sm text-text-muted">No data available</div>
  }

  // Calculate percentages
  const highPct = (high / total) * 100
  const medPct = (med / total) * 100
  const lowPct = (low / total) * 100

  // Calculate angles (starting from top, going clockwise)
  const highAngle = (highPct / 100) * 360
  const medAngle = (medPct / 100) * 360
  const lowAngle = (lowPct / 100) * 360

  // Helper to create SVG arc path
  const createArc = (startAngle: number, endAngle: number) => {
    const radius = 90
    const innerRadius = 60
    const cx = 120
    const cy = 120

    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)
    const x3 = cx + innerRadius * Math.cos(endRad)
    const y3 = cy + innerRadius * Math.sin(endRad)
    const x4 = cx + innerRadius * Math.cos(startRad)
    const y4 = cy + innerRadius * Math.sin(startRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  let currentAngle = 0
  const segments = [
    { name: "High", value: high, pct: highPct, color: "rgb(var(--risk-high))", angle: highAngle },
    { name: "Medium", value: med, pct: medPct, color: "rgb(var(--risk-medium))", angle: medAngle },
    { name: "Low", value: low, pct: lowPct, color: "rgb(var(--risk-low))", angle: lowAngle },
  ].filter((s) => s.value > 0)

  return (
    <div className="h-64 flex flex-col items-center justify-center">
      <svg width="240" height="240" viewBox="0 0 240 240" className="mb-4">
        {segments.map((segment) => {
          const startAngle = currentAngle
          const endAngle = currentAngle + segment.angle
          currentAngle = endAngle

          return (
            <path
              key={segment.name}
              d={createArc(startAngle, endAngle)}
              fill={segment.color}
              stroke="rgb(var(--surface-1))"
              strokeWidth="2"
            />
          )
        })}
        {/* Center text */}
        <text x="120" y="115" textAnchor="middle" className="text-2xl font-semibold fill-text-primary">
          {total}
        </text>
        <text x="120" y="135" textAnchor="middle" className="text-xs fill-text-muted">
          Total Apps
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-text-primary">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-risk-high" />
          <span>High ({high})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-risk-medium" />
          <span>Med ({med})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-risk-low" />
          <span>Low ({low})</span>
        </div>
      </div>
    </div>
  )
}
