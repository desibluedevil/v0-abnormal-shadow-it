"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useShadowStore } from "@/store/shadowStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import Link from "next/link"
import dynamic from "next/dynamic"
import { KpiSkeleton } from "@/components/skeletons/kpi-skeleton"
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton"
import { CardSkeleton } from "@/components/skeletons/card-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import DonutChart from "@/components/dashboard/donut-chart"
import { TrendingUp, TrendingDown, AlertCircle, Play } from "lucide-react"
import { motion, useInView } from "framer-motion"

const LineChart = dynamic(() => import("@/components/dashboard/line-chart"), { ssr: false })
const Sparkline = dynamic(() => import("@/components/dashboard/sparkline").then((m) => ({ default: m.Sparkline })), {
  ssr: false,
})

function StickyHeader({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div
      id={id}
      className="sticky top-0 z-10 -mx-6 px-6 py-3 mb-4 backdrop-blur-md bg-background/80 border-b border-border/50"
    >
      <h2 className="text-lg font-semibold text-foreground">{children}</h2>
    </div>
  )
}

function useIdleAnimation(enabled = true) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setShouldAnimate(true)
      return
    }

    // Use requestIdleCallback if available, otherwise setTimeout
    const idleCallback =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1)

    const handle = idleCallback(() => {
      setShouldAnimate(true)
    })

    return () => {
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(handle as number)
      } else {
        clearTimeout(handle as number)
      }
    }
  }, [enabled])

  return shouldAnimate
}

function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const shouldAnimate = useIdleAnimation()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView && shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

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
    <div className="space-y-8">
      <section>
        <StickyHeader id="overview-section">Overview</StickyHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedCard delay={0}>
            <KpiCard title="Total Unsanctioned" value={totalUnsanctioned} trend={0} sparkData={[12, 15, 14, 18, 20]} />
          </AnimatedCard>
          <AnimatedCard delay={0.1}>
            <KpiCard title="High Risk" value={highRisk} trend={0} sparkData={[8, 10, 9, 7, 6]} />
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <KpiCard title="Users Involved" value={usersInvolved} trend={4} sparkData={[45, 48, 52, 58, 63]} />
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <KpiCard title="Remediated" value={remediated} tone="success" trend={12} sparkData={[5, 8, 10, 12, 15]} />
          </AnimatedCard>
        </div>
      </section>

      <section>
        <StickyHeader id="trends-section">Trends</StickyHeader>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <AnimatedCard delay={0}>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>New Apps per Week (12w)</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={weekly} />
                <p className="text-xs text-muted-foreground mt-3 italic">Q4 vendor pilots drove weeks 9–12.</p>
              </CardContent>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart high={risk.high} med={risk.med} low={risk.low} />
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </section>

      <section>
        <StickyHeader id="remediation-section">Remediation</StickyHeader>
        <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time to Remediate (hrs)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Last 14 days</p>
            </CardHeader>
            <CardContent>
              {ttrData.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Play className="w-6 h-6" />
                    </EmptyMedia>
                    <EmptyTitle>No remediation data</EmptyTitle>
                    <EmptyDescription>Run a remediation plan to populate time-to-remediate metrics</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Link href="/review">
                      <Button variant="primary" size="sm">
                        Start Remediation
                      </Button>
                    </Link>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Avg</div>
                      <div className="text-2xl font-bold text-foreground">9.6h</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">P90</div>
                      <div className="text-2xl font-bold text-foreground">12.4h</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Best</div>
                      <div className="text-2xl font-bold text-risk-low">7.6h</div>
                    </div>
                  </div>
                  <Sparkline data={ttrData} />
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </section>

      <section>
        <StickyHeader id="high-risk-section">High-Risk Apps</StickyHeader>
        <AnimatedCard>
          <HighRiskApps />
        </AnimatedCard>
      </section>

      <section>
        <StickyHeader id="summary-section">Summary</StickyHeader>
        <AnimatedCard>
          <GeneratedSummary />
        </AnimatedCard>
      </section>
    </div>
  )
}

function KpiCard({
  title,
  value,
  tone,
  trend,
  sparkData,
}: {
  title: string
  value: number | string
  tone?: "destructive" | "success"
  trend?: number
  sparkData?: number[]
}) {
  const toneCls = tone === "destructive" ? "text-risk-high" : tone === "success" ? "text-risk-low" : "text-foreground"
  const trendPositive = trend && trend > 0
  const trendNeutral = trend === 0
  const trendCls = trendNeutral ? "text-muted-foreground" : trendPositive ? "text-risk-low" : "text-risk-high"

  return (
    <Card className="shadow-abnormal">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <div className={`text-4xl font-bold leading-none ${toneCls}`}>{value}</div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trendCls}`}>
              {!trendNeutral &&
                (trendPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        {sparkData && <MiniSparkline data={sparkData} />}
      </CardContent>
    </Card>
  )
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 120
  const height = 24

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} className="opacity-50">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function HighRiskApps() {
  const { apps } = useShadowStore()
  const highRiskApps = apps.filter((a) => a.riskLevel === "High" && a.status === "Unsanctioned").slice(0, 5)

  if (highRiskApps.length === 0) return null

  return (
    <Card className="shadow-abnormal">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-risk-high" />
          High-Risk Apps Detected
        </CardTitle>
        <Link href="/inventory?risk=High">
          <Button variant="secondary" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {highRiskApps.map((app, index) => (
          <AnimatedCard key={app.id} delay={index * 0.05}>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                {app.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">{app.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{app.publisher}</span>
                  <span>•</span>
                  <span>
                    {app.users.length} user{app.users.length !== 1 ? "s" : ""}
                  </span>
                  <span>•</span>
                  <span>First seen {new Date(app.firstSeen).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {app.scopes.slice(0, 3).map((scope, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">
                      {typeof scope === "string" ? scope : scope.name}
                    </Badge>
                  ))}
                  {app.scopes.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      +{app.scopes.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              <Link href={`/inventory?focus=${app.id}`}>
                <Button variant="primary" size="sm">
                  Review
                </Button>
              </Link>
            </div>
          </AnimatedCard>
        ))}
      </CardContent>
    </Card>
  )
}

function GeneratedSummary() {
  const { kpis, apps } = useShadowStore()
  const { totalUnsanctioned, highRisk, remediated } = kpis()
  const topRiskApps = apps
    .filter((a) => a.riskLevel === "High")
    .slice(0, 3)
    .map((a) => a.name)

  return (
    <Card className="border-dashed shadow-abnormal">
      <CardHeader>
        <CardTitle className="text-base">Generated Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-accent-cyan mt-0.5">•</span>
            <span>
              Currently tracking <span className="font-semibold">{totalUnsanctioned}</span> unsanctioned applications
              across your organization
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-cyan mt-0.5">•</span>
            <span>
              <Badge variant="destructive" className="mr-1">
                {highRisk}
              </Badge>
              high-risk apps require immediate attention and review
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-cyan mt-0.5">•</span>
            <span>
              <span className="font-semibold">{remediated}</span> remediation actions completed in the current period
            </span>
          </li>
          {topRiskApps.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-accent-cyan mt-0.5">•</span>
              <span>
                Top risk apps:{" "}
                {topRiskApps.map((name, i) => (
                  <span key={i}>
                    <span className="font-medium text-risk-high">{name}</span>
                    {i < topRiskApps.length - 1 && ", "}
                  </span>
                ))}
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-accent-cyan mt-0.5">•</span>
            <span className="text-muted-foreground italic">
              Focus: Drive down high-risk OAuth grants and notify affected users
            </span>
          </li>
        </ul>
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
