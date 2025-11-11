"use client"

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { PieChart } from "lucide-react"

export default function DonutChart({ high, med, low }: { high: number; med: number; low: number }) {
  const total = high + med + low

  if (total === 0) {
    return (
      <div className="h-64">
        <Empty className="border-0 bg-transparent">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PieChart className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>No data available</EmptyTitle>
            <EmptyDescription>Risk distribution will display once apps are detected</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
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

  // Helper to get label position
  const getLabelPosition = (startAngle: number, endAngle: number) => {
    const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180)
    const radius = 75 // Between inner and outer radius
    const cx = 120
    const cy = 120
    return {
      x: cx + radius * Math.cos(midAngle),
      y: cy + radius * Math.sin(midAngle),
    }
  }

  let currentAngle = 0
  const segments = [
    { name: "High", value: high, pct: highPct, color: "var(--risk-high)", angle: highAngle },
    { name: "Med", value: med, pct: medPct, color: "var(--risk-med)", angle: medAngle },
    { name: "Low", value: low, pct: lowPct, color: "var(--risk-low)", angle: lowAngle },
  ].filter((s) => s.value > 0)

  return (
    <div className="h-64 flex flex-col items-center justify-center">
      <svg width="240" height="240" viewBox="0 0 240 240" className="mb-4">
        {segments.map((segment) => {
          const startAngle = currentAngle
          const endAngle = currentAngle + segment.angle
          const labelPos = getLabelPosition(startAngle, endAngle)
          currentAngle = endAngle

          return (
            <g key={segment.name}>
              <path
                d={createArc(startAngle, endAngle)}
                fill={segment.color}
                stroke="hsl(var(--background))"
                strokeWidth="2"
                className="transition-opacity hover:opacity-90 cursor-pointer"
              />
              {segment.pct >= 10 && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  className="text-sm font-bold fill-background pointer-events-none"
                >
                  {Math.round(segment.pct)}%
                </text>
              )}
            </g>
          )
        })}
        <text x="120" y="110" textAnchor="middle" className="text-4xl font-bold fill-foreground font-mono">
          {total}
        </text>
        <text x="120" y="135" textAnchor="middle" className="text-sm fill-muted-foreground font-medium">
          Total Apps
        </text>
      </svg>

      <div className="flex gap-4 text-sm text-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: "var(--risk-high)" }} />
          <span className="font-medium">High ({high})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: "var(--risk-med)" }} />
          <span className="font-medium">Med ({med})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: "var(--risk-low)" }} />
          <span className="font-medium">Low ({low})</span>
        </div>
      </div>
    </div>
  )
}
