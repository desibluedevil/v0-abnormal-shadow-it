"use client"

import { useState, useEffect } from "react"
import { useShadowStore } from "@/store/shadowStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import dynamic from "next/dynamic"
import { KpiSkeleton } from "@/components/skeletons/kpi-skeleton"
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton"
import { CardSkeleton } from "@/components/skeletons/card-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import DonutChart from "@/components/dashboard/donut-chart"

const LineChart = dynamic(() => import("@/components/dashboard/line-chart"), { ssr: false })
const Sparkline = dynamic(() => import("@/components/dashboard/sparkline").then((m) => ({ default: m.Sparkline })), {
  ssr: false,
})

function DashboardPageContent() {
  const [isBooting, setIsBooting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const { kpis, riskDistribution, weeklyNewApps, ttrSeries, receipts, apps } = useShadowStore()
  const { totalUnsanctioned, highRisk, usersInvolved, remediated } = kpis()
  const risk = riskDistribution()
  const weekly = weeklyNewApps()
  const ttrData = ttrSeries()

  useEffect(() => {
    console.log("[v0] Dashboard TTR Debug:")
    console.log("[v0] Total receipts:", receipts.length)
    console.log("[v0] Revoke receipts:", receipts.filter((r) => r.tool === "graph.revokeGrant").length)
    console.log("[v0] TTR data points:", ttrData.length)
    console.log("[v0] TTR data:", ttrData)
    console.log("[v0] Apps:", apps.length)
  }, [receipts, ttrData, apps])

  if (isBooting) {
    return (
      <div className="space-y-6">
        <KpiSkeleton />
        <ChartSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Unsanctioned" value={totalUnsanctioned} />
        <KpiCard title="High Risk" value={highRisk} tone="destructive" />
        <KpiCard title="Users Involved" value={usersInvolved} />
        <KpiCard title="Remediated" value={remediated} tone="success" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New Unsanctioned Apps per Week (12w)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={weekly} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart high={risk.high} med={risk.med} low={risk.low} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className={ttrData.length === 0 ? "opacity-50" : ""}>
          <CardHeader>
            <CardTitle className="text-base">Time to Remediate (hrs)</CardTitle>
          </CardHeader>
          <CardContent>
            {ttrData.length === 0 ? (
              <div className="h-[120px] flex flex-col items-center justify-center gap-2 text-center">
                <div className="text-muted-foreground text-sm">No remediations yet</div>
                <div className="text-xs text-muted-foreground">
                  Run a remediation plan or revoke an app to see time-to-remediate metrics
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Sparkline data={ttrData} />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last {ttrData.length} revocations</span>
                  <Badge variant="secondary">Latest: {ttrData[ttrData.length - 1].hours.toFixed(1)}h</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <CriticalAlerts />
      <GeneratedSummary />
    </div>
  )
}

function KpiCard({ title, value, tone }: { title: string; value: number | string; tone?: "destructive" | "success" }) {
  const toneCls = tone === "destructive" ? "text-red-600" : tone === "success" ? "text-green-600" : "text-neutral-900"
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-neutral-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-semibold ${toneCls}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function CriticalAlerts() {
  const { apps } = useShadowStore()
  const critical = apps.filter((a) => a.riskLevel === "High" && a.status === "Unsanctioned").slice(0, 3)
  if (critical.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Badge variant="destructive">Critical</Badge>
          High-Risk Apps Detected
        </CardTitle>
        <Link href="/inventory?risk=High">
          <Button variant="outline" size="sm" aria-label="Review all high-risk apps in inventory">
            Review All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {critical.map((app) => (
          <div key={app.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium">{app.name}</div>
              <div className="text-xs text-neutral-500">
                {app.publisher} • {app.users.length} user{app.users.length !== 1 ? "s" : ""} • First seen{" "}
                {new Date(app.firstSeen).toLocaleDateString()}
              </div>
            </div>
            <Link href={`/inventory?focus=${app.id}`}>
              <Button size="sm" variant="destructive" aria-label={`Review ${app.name} details`}>
                Review
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function GeneratedSummary() {
  const { kpis } = useShadowStore()
  const { totalUnsanctioned, highRisk, remediated } = kpis()
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Generated Summary (beta)</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-neutral-700">
        In the last reporting period, we're tracking <b>{totalUnsanctioned}</b> unsanctioned apps, including{" "}
        <b>{highRisk}</b> high-risk. Remediation actions completed: <b>{remediated}</b>. Focus this week: drive down
        high-risk OAuth grants and notify affected users.
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardPageContent />
    </ErrorBoundary>
  )
}
