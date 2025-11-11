"use client"

import type * as React from "react"
import { Spinner } from "@/components/ui/spinner"
import { CardSkeleton } from "@/components/skeletons/card-skeleton"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { KpiSkeleton } from "@/components/skeletons/kpi-skeleton"
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton"
import { DrawerSkeleton } from "@/components/skeletons/drawer-skeleton"

interface LoadingStateProps {
  loading: boolean
  children: React.ReactNode
  variant?: "spinner" | "card" | "table" | "kpi" | "chart" | "drawer"
  className?: string
}

export function LoadingState({ loading, children, variant = "spinner", className }: LoadingStateProps) {
  if (!loading) {
    return <>{children}</>
  }

  switch (variant) {
    case "card":
      return <CardSkeleton />
    case "table":
      return <TableSkeleton />
    case "kpi":
      return <KpiSkeleton />
    case "chart":
      return <ChartSkeleton />
    case "drawer":
      return <DrawerSkeleton />
    case "spinner":
    default:
      return (
        <div className={`flex items-center justify-center p-8 ${className || ""}`}>
          <Spinner className="h-8 w-8 text-[#47D7FF]" />
        </div>
      )
  }
}
