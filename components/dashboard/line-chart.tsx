"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import Link from "next/link"
import { useReducedMotion } from "@/lib/use-reduced-motion"

interface DataPoint {
  week: string
  count: number
}

export default function NewAppsChart({ data, loading }: { data: DataPoint[]; loading?: boolean }) {
  const reduceMotion = useReducedMotion()

  if (loading) {
    return (
      <div className="h-[280px] flex items-center justify-center bg-neutral-900/30 rounded-md border border-neutral-700 animate-pulse">
        <div className="text-neutral-400 text-sm">Loading chart...</div>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="h-[280px]">
        <Empty className="border-0 bg-transparent h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrendingUp className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>No new apps in the last 12 weeks</EmptyTitle>
            <EmptyDescription>Start monitoring to populate this chart</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/inventory">
              <Button variant="default" size="sm" className="bg-accent-cyan text-background hover:bg-accent-cyan/90">
                View Inventory
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  // Sort data by week and coerce nulls to 0
  const sortedData = [...data]
    .sort((a, b) => a.week.localeCompare(b.week))
    .map((d) => ({
      week: d.week,
      count: Number.isFinite(d.count) ? d.count : 0,
    }))

  // Calculate delta for tooltip
  const getDelta = (index: number) => {
    if (index === 0) return null
    const diff = sortedData[index].count - sortedData[index - 1].count
    return {
      value: Math.abs(diff),
      isPositive: diff > 0,
      isNeutral: diff === 0,
    }
  }

  return (
    <div
      className="h-[280px]"
      role="img"
      aria-label="Line chart showing new apps discovered per week over the last 12 weeks"
      aria-describedby="new-apps-chart-desc"
    >
      <span id="new-apps-chart-desc" className="sr-only">
        New apps added each week over last 12 weeks
      </span>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sortedData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          {/* Grid lines at 12% opacity */}
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="0" vertical={false} />

          {/* X-axis with 12px font - using text-secondary color */}
          <XAxis
            dataKey="week"
            tick={{ fill: "#a7b0b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            height={32}
          />

          {/* Y-axis with 12px font, auto-format integers - using text-secondary color */}
          <YAxis
            tick={{ fill: "#a7b0b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
            allowDecimals={false}
          />

          {/* Tooltip with delta */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#12171c",
              border: "1px solid #1e262d",
              borderRadius: "6px",
              fontSize: "12px",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#e9eef2", fontWeight: 600, marginBottom: "4px" }}
            formatter={(value: number, name: string, props: any) => {
              const delta = getDelta(props.payload && sortedData.indexOf(props.payload))
              return [
                <div key="tooltip" className="flex flex-col gap-1">
                  <span className="text-accent-cyan font-semibold">{value} new apps</span>
                  {delta && !delta.isNeutral && (
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: delta.isPositive ? "#39d98a" : "#ff3eb5" }}
                    >
                      {delta.isPositive ? "▲" : "▼"} {delta.value} vs prior week
                    </span>
                  )}
                </div>,
                "",
              ]
            }}
          />

          {/* Line with accent cyan (#47d7ff), 2px stroke */}
          <Line
            type="monotone"
            dataKey="count"
            stroke="#47d7ff"
            strokeWidth={2}
            dot={{ r: 3, fill: "#47d7ff", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#47d7ff", strokeWidth: 2, stroke: "#0b0f12" }}
            isAnimationActive={!reduceMotion}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
