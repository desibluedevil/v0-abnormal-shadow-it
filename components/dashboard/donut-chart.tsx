"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Label, Tooltip } from "recharts"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { PieChartIcon } from "lucide-react"
import { useState } from "react"

const RISK_COLORS = {
  High: "#ff4d4d", // --risk-high
  Med: "#ffb02e", // --risk-med
  Low: "#39d98a", // --risk-low
}

interface DonutChartProps {
  high: number
  med: number
  low: number
}

export default function RiskDistributionChart({ high, med, low }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const total = high + med + low

  if (total === 0) {
    return (
      <div className="h-[280px]">
        <Empty className="border-0 bg-transparent h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PieChartIcon className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>No risk data available</EmptyTitle>
            <EmptyDescription>Risk distribution will display once apps are detected</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const data = [
    { name: "High", value: high || 0 },
    { name: "Med", value: med || 0 },
    { name: "Low", value: low || 0 },
  ].filter((d) => d.value > 0)

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0)
    return `${percent}%`
  }

  return (
    <div
      className="h-[280px]"
      role="img"
      aria-label={`Risk distribution: ${high} high risk, ${med} medium risk, ${low} low risk apps`}
      aria-describedby="risk-dist-desc"
    >
      <span id="risk-dist-desc" className="sr-only">
        Share of apps by risk level: High, Medium, Low
      </span>

      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            label={renderLabel}
            labelLine={{
              stroke: "#a7b0b8",
              strokeWidth: 1,
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  filter: activeIndex === index ? "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))" : undefined,
                }}
              />
            ))}
            {/* Center annotation with DS colors */}
            <Label
              value={`${total}`}
              position="center"
              fill="#e9eef2"
              style={{ fontSize: "32px", fontWeight: 700, fontFamily: "monospace" }}
            />
            <Label
              value="Total Apps"
              position="center"
              dy={20}
              fill="#a7b0b8"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#12171c",
              border: "1px solid #1e262d",
              borderRadius: "6px",
              fontSize: "12px",
              padding: "8px 12px",
            }}
            formatter={(value: number, name: string) => [
              <div key="tooltip" className="flex flex-col">
                <span className="font-semibold">{name} Risk</span>
                <span>
                  {value} apps ({((value / total) * 100).toFixed(1)}%)
                </span>
              </div>,
              "",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend with DS colors */}
      <div className="flex justify-center gap-4 text-sm mt-2" role="list">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
            style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.5 }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex(null)}
            tabIndex={0}
            role="listitem"
            aria-label={`${entry.name} risk: ${entry.value} apps`}
          >
            <div
              className="w-3 h-3 rounded-sm border border-border/40 transition-transform duration-200"
              style={{
                backgroundColor: RISK_COLORS[entry.name as keyof typeof RISK_COLORS],
                transform: activeIndex === index ? "scale(1.2)" : "scale(1)",
              }}
            />
            <span className="font-medium text-foreground">
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
