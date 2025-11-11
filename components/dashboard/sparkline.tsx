"use client"

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { TrendingUp } from "lucide-react"

interface SparklineProps {
  data: Array<{ ts: string; hours: number }>
}

export function Sparkline({ data }: SparklineProps) {
  if (data.length === 0) {
    return (
      <div className="h-[56px]">
        <Empty className="border-0 bg-transparent p-2 min-h-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrendingUp className="w-4 h-4" />
            </EmptyMedia>
            <EmptyTitle className="text-xs">No data</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    )
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
    <svg
      width="100%"
      height="56"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Time to remediate trend sparkline"
    >
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 2px rgba(71, 215, 255, 0.3))" }}
      />
    </svg>
  )
}
