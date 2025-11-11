"use client"

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { TrendingUp } from "lucide-react"
import { useState } from "react"

interface DataPoint {
  week: string
  count: number
}

export default function LineChart({ data }: { data: DataPoint[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

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
    <div className="h-64 relative" role="img" aria-label="Line chart showing new apps per week">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
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
              strokeOpacity="0.4"
              strokeDasharray="4 4"
            />
          )
        })}

        <path
          d={linePath}
          fill="none"
          stroke="var(--accent-cyan)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(71, 215, 255, 0.4))" }}
        />

        {data.map((d, i) => {
          const x = padding + i * xStep
          const y = height - padding - d.count * yScale
          const isHovered = hoveredPoint === i

          return (
            <g key={`point-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? "7" : "5"}
                fill="var(--accent-cyan)"
                stroke="hsl(var(--background))"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ filter: isHovered ? "drop-shadow(0 0 6px rgba(71, 215, 255, 0.6))" : undefined }}
              />
              {isHovered && (
                <g>
                  <rect
                    x={x - 35}
                    y={y - 50}
                    width="70"
                    height="35"
                    rx="4"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))" }}
                  />
                  <text
                    x={x}
                    y={y - 35}
                    textAnchor="middle"
                    className="text-xs font-semibold"
                    fill="hsl(var(--foreground))"
                  >
                    {d.week}
                  </text>
                  <text x={x} y={y - 22} textAnchor="middle" className="text-sm font-bold" fill="var(--accent-cyan)">
                    {d.count} apps
                  </text>
                </g>
              )}
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
                className="text-xs font-medium"
                fill="hsl(var(--muted-foreground))"
              >
                {d.week}
              </text>
            )
          }
          return null
        })}

        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i * (height - padding * 2)) / 4
          const value = Math.round(maxCount - (i * maxCount) / 4)
          return (
            <text
              key={`y-label-${i}`}
              x={padding - 15}
              y={y + 4}
              textAnchor="end"
              className="text-xs font-medium"
              fill="hsl(var(--muted-foreground))"
            >
              {value}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 120
  const height = 32

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
