"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useShadowStore } from "@/store/shadowStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import Link from "next/link"
import { KpiSkeleton } from "@/components/skeletons/kpi-skeleton"
import { ChartSkeleton } from "@/components/skeletons/chart-skeleton"
import { CardSkeleton } from "@/components/skeletons/card-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import DonutChart from "@/components/dashboard/donut-chart"
import { AlertCircle, Play } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { computeOverview } from "@/lib/overview-math"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import LineChart from "@/components/dashboard/line-chart" // Import LineChart
import Sparkline from "@/components/dashboard/sparkline" // Import Sparkline

function StickyHeader({ children, id }: { children: React.ReactNode; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        setIsScrolled(rect.top <= 0)
      }
    }

    const scrollContainer = document.getElementById("main-content")
    scrollContainer?.addEventListener("scroll", handleScroll)
    return () => scrollContainer?.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      ref={ref}
      id={id}
      className={cn(
        "sticky top-0 z-10 -mx-6 px-6 py-3 mb-4 transition-all duration-200",
        isScrolled
          ? "backdrop-blur-md bg-[var(--bg-elev-0)]/90 border-b border-[var(--bg-elev-1)] shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
          : "bg-transparent",
      )}
    >
      <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{children}</h2>
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
  const [timePeriod, setTimePeriod] = useState<"today" | "week" | "month" | "quarter">("week")

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const { kpis, riskDistribution, weeklyNewApps, ttrSeries, receipts, apps } = useShadowStore()
  const { totalUnsanctioned, highRisk, usersInvolved, remediated } = kpis()
  const risk = riskDistribution()
  const weekly = weeklyNewApps()
  const ttrData = ttrSeries()

  const totalApps = apps.length
  const overviewData = computeOverview({
    totalApps,
    unsanctioned: totalUnsanctioned,
    highRisk,
    usersInvolved,
    remediated,
    prev: {
      usersInvolved: 60, // Mock previous period data
      remediated: 13, // Mock previous period data
    },
  })

  const [unsanctionedCard, highRiskCard, usersCard, remediatedCard] = overviewData.cards

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
    <>
      <nav
        aria-label="Section navigation"
        className="mb-6 p-4 rounded-lg border border-[var(--bg-elev-1)] bg-[var(--bg-elev-0)]/50 backdrop-blur-sm"
      >
        <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
          Jump to section:
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="#overview-section"
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-[var(--bg-elev-1)] text-[var(--text-primary)] hover:bg-[var(--accent-cyan)]/10 hover:text-[var(--accent-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:ring-offset-2 transition-colors"
          >
            Overview
          </a>
          <a
            href="#trends-section"
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-[var(--bg-elev-1)] text-[var(--text-primary)] hover:bg-[var(--accent-cyan)]/10 hover:text-[var(--accent-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:ring-offset-2 transition-colors"
          >
            Trends
          </a>
          <a
            href="#remediation-section"
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-[var(--bg-elev-1)] text-[var(--text-primary)] hover:bg-[var(--accent-cyan)]/10 hover:text-[var(--accent-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:ring-offset-2 transition-colors"
          >
            Remediation
          </a>
          <a
            href="#high-risk-section"
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-[var(--bg-elev-1)] text-[var(--text-primary)] hover:bg-[var(--accent-cyan)]/10 hover:text-[var(--accent-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:ring-offset-2 transition-colors"
          >
            High-Risk Apps
          </a>
          <a
            href="#summary-section"
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-[var(--bg-elev-1)] text-[var(--text-primary)] hover:bg-[var(--accent-cyan)]/10 hover:text-[var(--accent-cyan)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:ring-offset-2 transition-colors"
          >
            Summary
          </a>
        </div>
      </nav>

      <div className="space-y-8">
        <section>
          <StickyHeader id="overview-section">Overview</StickyHeader>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              Monitoring activity and risk across all connected applications
            </p>
            <ToggleGroup
              type="single"
              value={timePeriod}
              onValueChange={(value) => {
                if (value) setTimePeriod(value as typeof timePeriod)
              }}
              className="border border-[var(--bg-elev-1)] rounded-lg p-1 bg-[var(--bg-elev-0)]"
            >
              <ToggleGroupItem
                value="today"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  "data-[state=on]:bg-[var(--accent-cyan)] data-[state=on]:text-[var(--bg-elev-0)] data-[state=on]:shadow-sm",
                  "data-[state=off]:text-[var(--text-secondary)] data-[state=off]:hover:text-[var(--text-primary)]",
                )}
              >
                Today
              </ToggleGroupItem>
              <ToggleGroupItem
                value="week"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  "data-[state=on]:bg-[var(--accent-cyan)] data-[state=on]:text-[var(--bg-elev-0)] data-[state=on]:shadow-sm",
                  "data-[state=off]:text-[var(--text-secondary)] data-[state=off]:hover:text-[var(--text-primary)]",
                )}
              >
                This Week
              </ToggleGroupItem>
              <ToggleGroupItem
                value="month"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  "data-[state=on]:bg-[var(--accent-cyan)] data-[state=on]:text-[var(--bg-elev-0)] data-[state=on]:shadow-sm",
                  "data-[state=off]:text-[var(--text-secondary)] data-[state=off]:hover:text-[var(--text-primary)]",
                )}
              >
                This Month
              </ToggleGroupItem>
              <ToggleGroupItem
                value="quarter"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  "data-[state=on]:bg-[var(--accent-cyan)] data-[state=on]:text-[var(--bg-elev-0)] data-[state=on]:shadow-sm",
                  "data-[state=off]:text-[var(--text-secondary)] data-[state=off]:hover:text-[var(--text-primary)]",
                )}
              >
                This Quarter
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatedCard delay={0}>
              <KpiCard
                title="Total Unsanctioned"
                value={unsanctionedCard.value}
                label={unsanctionedCard.label}
                trend={unsanctionedCard.trend}
                good={unsanctionedCard.good}
                explainer={unsanctionedCard.explainer}
                sparkData={[12, 15, 14, 18, 20]}
              />
            </AnimatedCard>
            <AnimatedCard delay={0.1}>
              <KpiCard
                title="High Risk"
                value={highRiskCard.value}
                label={highRiskCard.label}
                trend={highRiskCard.trend}
                good={highRiskCard.good}
                explainer={highRiskCard.explainer}
                sparkData={[8, 10, 9, 7, 6]}
              />
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <KpiCard
                title="Users Involved"
                value={usersCard.value}
                label={usersCard.label}
                trend={usersCard.trend}
                good={usersCard.good}
                explainer={usersCard.explainer}
                sparkData={[45, 48, 52, 58, 63]}
              />
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <KpiCard
                title="Remediated"
                value={remediatedCard.value}
                label={remediatedCard.label}
                trend={remediatedCard.trend}
                good={remediatedCard.good}
                explainer={remediatedCard.explainer}
                sparkData={[5, 8, 10, 12, 15]}
              />
            </AnimatedCard>
          </div>
        </section>

        <section>
          <StickyHeader id="trends-section">Trends</StickyHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatedCard delay={0}>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-balance">New Apps per Week (12w)</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={weekly} />
                  <p className="text-xs text-muted-foreground mt-3 italic">Q4 vendor pilots drove weeks 9–12.</p>
                </CardContent>
              </Card>
            </AnimatedCard>
            <AnimatedCard delay={0.1}>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-balance">Risk Distribution</CardTitle>
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
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-accent-cyan text-background hover:bg-accent-cyan/90"
                        >
                          Start Remediation
                        </Button>
                      </Link>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground">Avg</div>
                        <div className="text-3xl font-bold text-foreground font-mono">9.6h</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground">P90</div>
                        <div className="text-3xl font-bold text-foreground font-mono">12.4h</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground">Best</div>
                        <div className="text-3xl font-bold text-risk-low font-mono">7.6h</div>
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
    </>
  )
}

function KpiCard({
  title,
  value,
  label,
  trend,
  good,
  explainer,
  sparkData,
}: {
  title: string
  value: number | string
  label: string
  trend: "up" | "down" | "flat" | null
  good: boolean | null
  explainer: string
  sparkData?: number[]
}) {
  const labelColor = good === null ? "text-accent-cyan" : good ? "text-risk-low" : "text-risk-high"
  const arrow = trend === "up" ? "▲" : trend === "down" ? "▼" : trend === "flat" ? "—" : null

  return (
    <Card className="shadow-abnormal hover:shadow-abnormal-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2" title={explainer}>
          <div className="text-5xl font-bold leading-none font-mono text-foreground">{value}</div>
          {label && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${labelColor}`}>
              {arrow && <span>{arrow}</span>}
              <span>{label}</span>
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

function HighRiskApps() {
  const { apps } = useShadowStore()
  const highRiskApps = apps.filter((a) => a.riskLevel === "High" && a.status === "Unsanctioned").slice(0, 5)

  if (highRiskApps.length === 0) return null

  return (
    <Card className="shadow-abnormal">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="w-5 h-5 text-risk-high" />
          High-Risk Apps Detected
        </CardTitle>
        <Link href="/review">
          <Button variant="secondary" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {highRiskApps.map((app, index) => (
          <AnimatedCard key={app.id} delay={index * 0.05}>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-200">
              <Avatar className="w-12 h-12 border-2 border-border">
                <AvatarFallback className="bg-muted text-foreground font-bold text-base">
                  {app.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base text-foreground truncate">{app.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="font-medium">{app.publisher}</span>
                  <span className="opacity-50">•</span>
                  <span>
                    {app.users.length} user{app.users.length !== 1 ? "s" : ""}
                  </span>
                  <span className="opacity-50">•</span>
                  <span>First seen {new Date(app.firstSeen).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {app.scopes.slice(0, 3).map((scope, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted/80 transition-colors"
                    >
                      {typeof scope === "string" ? scope : scope.name}
                    </Badge>
                  ))}
                  {app.scopes.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50">
                      +{app.scopes.length - 3}
                    </Badge>
                  )}
                </div>
                {(app as any).subtext && (
                  <div className="text-xs text-muted-foreground italic mt-2">{(app as any).subtext}</div>
                )}
              </div>
              <Link href={`/inventory?focus=${app.id}`}>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-accent-cyan text-background hover:bg-accent-cyan/90 font-semibold"
                >
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
  return (
    <Card className="border-dashed shadow-abnormal">
      <CardHeader>
        <CardTitle className="text-base">Generated Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-accent-cyan mt-0.5">•</span>
            <span>Monitoring 5 unsanctioned apps; 2 high-risk need immediate action.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-cyan mt-0.5">•</span>
            <span>54 users affected; Avg TTRemediation 9.6h (14d).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-cyan mt-0.5">•</span>
            <span>Priority: Revoke high-risk OAuth grants + notify impacted users.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-cyan mt-0.5">•</span>
            <span>Expected risk reduction after today's actions: –62% (8→3 users).</span>
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
