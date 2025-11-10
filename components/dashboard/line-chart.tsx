"use client"

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { TrendingUp } from "lucide-react"

interface DataPoint {
  week: string
  count: number
}

export default function LineChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64">
        <Empty className="border-0 bg-transparent">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrendingUp className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>No data available</EmptyTitle>
            <EmptyDescription>Chart will display once data is collected</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
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
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i * (height - padding * 2)) / 4
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="hsl(var(--border))"
              strokeOpacity="0.1"
            />
          )
        })}

        <path d={linePath} fill="none" stroke="#47D7FF" strokeWidth="2.5" />

        {data.map((d, i) => {
          const x = padding + i * xStep
          const y = height - padding - d.count * yScale
          return (
            <g key={`point-${i}`}>
              <circle cx={x} cy={y} r="5" fill="#47D7FF" stroke="#0B0F12" strokeWidth="2" />
              <title>
                {d.week}: {d.count} apps
              </title>
            </g>
          )
        })}

        {data.map((d, i) => {
          if (i % 2 === 0 || data.length <= 6) {
            const x = padding + i * xStep
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-sm fill-muted-foreground font-medium"
              >
                {d.week}
              </text>
            )
          }
          return null
        })}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i * (height - padding * 2)) / 4
          const value = Math.round(maxCount - (i * maxCount) / 4)
          return (
            <text
              key={`y-label-${i}`}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              className="text-sm fill-muted-foreground font-medium"
            >
              {value}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
