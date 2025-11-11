"use client"

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { PieChart } from "lucide-react"
import { useState } from "react"

export default function DonutChart({ high, med, low }: { high: number; med: number; low: number }) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)

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

  const highPct = (high / total) * 100
  const medPct = (med / total) * 100
  const lowPct = (low / total) * 100

  const highAngle = (highPct / 100) * 360
  const medAngle = (medPct / 100) * 360
  const lowAngle = (lowPct / 100) * 360

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

  const getLabelPosition = (startAngle: number, endAngle: number) => {
    const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180)
    const radius = 75
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
    <div
      className="h-64 flex flex-col items-center justify-center"
      role="img"
      aria-label={`Risk distribution: ${high} high risk, ${med} medium risk, ${low} low risk apps`}
    >
      <svg width="240" height="240" viewBox="0 0 240 240" className="mb-4" preserveAspectRatio="xMidYMid meet">
        {segments.map((segment) => {
          const startAngle = currentAngle
          const endAngle = currentAngle + segment.angle
          const labelPos = getLabelPosition(startAngle, endAngle)
          currentAngle = endAngle
          const isHovered = hoveredSegment === segment.name

          return (
            <g key={segment.name}>
              <path
                d={createArc(startAngle, endAngle)}
                fill={segment.color}
                stroke="hsl(var(--background))"
                strokeWidth="2"
                className="transition-all duration-200 cursor-pointer"
                style={{
                  opacity: isHovered ? 1 : hoveredSegment ? 0.5 : 0.9,
                  filter: isHovered ? "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))" : undefined,
                  transform: isHovered ? "scale(1.02)" : "scale(1)",
                  transformOrigin: "120px 120px",
                }}
                onMouseEnter={() => setHoveredSegment(segment.name)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              {segment.pct >= 10 && (
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  className="text-sm font-bold pointer-events-none"
                  fill="hsl(var(--background))"
                >
                  {Math.round(segment.pct)}%
                </text>
              )}
            </g>
          )
        })}
        <text
          x="120"
          y="110"
          textAnchor="middle"
          className="text-4xl font-bold font-mono"
          fill="hsl(var(--foreground))"
        >
          {total}
        </text>
        <text x="120" y="135" textAnchor="middle" className="text-sm font-medium" fill="hsl(var(--muted-foreground))">
          Total Apps
        </text>
      </svg>

      <div className="flex gap-4 text-sm">
        {segments.map((segment) => {
          const isHovered = hoveredSegment === segment.name
          return (
            <div
              key={segment.name}
              className="flex items-center gap-1.5 cursor-pointer transition-all duration-200"
              style={{ opacity: isHovered ? 1 : hoveredSegment ? 0.5 : 1 }}
              onMouseEnter={() => setHoveredSegment(segment.name)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className="w-3 h-3 rounded-sm border border-border/40 transition-transform duration-200"
                style={{
                  backgroundColor: segment.color,
                  transform: isHovered ? "scale(1.2)" : "scale(1)",
                }}
              />
              <span className="font-medium text-foreground">
                {segment.name} ({segment.value})
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
