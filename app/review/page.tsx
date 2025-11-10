"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useShadowStore } from "@/store/shadowStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { CISOBanner } from "@/components/rbac/ciso-banner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CardSkeleton } from "@/components/skeletons/card-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import Link from "next/link"

type SortOption = "priority" | "impact" | "confidence" | "lastEvent"

const ChevronRightIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

function ReviewPageContent() {
  const [isBooting, setIsBooting] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { cases, apps, sanctionApp, dismissApp, kpis, persona } = useShadowStore()
  const { toast } = useToast()

  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 450)
    return () => clearTimeout(timer)
  }, [])

  const sortBy = (searchParams.get("sort") || "priority") as SortOption

  const handleSort = (newSort: SortOption) => {
    const url = new URL(window.location.href)
    url.searchParams.set("sort", newSort)
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleEscalate = (appId: string) => {
    router.push(`/inventory?focus=${appId}`)
  }

  const handleApprove = async (appId: string) => {
    const app = apps.find((a) => a.id === appId)
    if (!app) return

    setActionInProgress(appId)
    const before = kpis()
    sanctionApp(appId)

    await new Promise((r) => setTimeout(r, 100))

    const after = kpis()
    setActionInProgress(null)

    toast({
      title: "App Sanctioned",
      description: `${app.name} has been approved and marked as sanctioned`,
    })

    window.dispatchEvent(
      new CustomEvent("review:action", {
        detail: { type: "sanction", appId, before, after },
      }),
    )
  }

  const handleDismiss = async (appId: string) => {
    const app = apps.find((a) => a.id === appId)
    if (!app) return

    setActionInProgress(appId)
    const before = kpis()
    dismissApp(appId)

    await new Promise((r) => setTimeout(r, 100))

    const after = kpis()
    setActionInProgress(null)

    toast({
      title: "Case Dismissed",
      description: `${app.name} has been dismissed as a false positive`,
    })

    window.dispatchEvent(
      new CustomEvent("review:action", {
        detail: { type: "dismiss", appId, before, after },
      }),
    )
  }

  const enrichedCases = useMemo(() => {
    const joined = cases
      .map((c) => ({
        case: c,
        app: apps.find((a) => a.id === c.appId),
      }))
      .filter((item) => item.app !== undefined)

    const sorted = joined.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { P0: 0, P1: 1, P2: 2 }
          return priorityOrder[a.case.priority] - priorityOrder[b.case.priority]
        case "impact":
          return b.case.impact - a.case.impact
        case "confidence":
          return b.case.confidence - a.case.confidence
        case "lastEvent":
          const aLastTs = a.case.timeline[a.case.timeline.length - 1]?.ts || ""
          const bLastTs = b.case.timeline[b.case.timeline.length - 1]?.ts || ""
          return bLastTs.localeCompare(aLastTs)
        default:
          return 0
      }
    })

    return sorted
  }, [cases, apps, sortBy])

  const isCISO = persona === "CISO"
  const restrictedTooltip = "Restricted to SecOps role"

  if (isBooting) {
    return (
      <div className="space-y-6">
        {persona === "CISO" && <CISOBanner />}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isCISO && <CISOBanner />}

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {enrichedCases.length} case{enrichedCases.length !== 1 ? "s" : ""} pending review
          </p>
        </div>

        {enrichedCases.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-600">Sort by:</span>
            <Tabs value={sortBy} onValueChange={(v) => handleSort(v as SortOption)}>
              <TabsList>
                <TabsTrigger value="priority" className="text-xs">
                  Priority
                </TabsTrigger>
                <TabsTrigger value="impact" className="text-xs">
                  Impact
                </TabsTrigger>
                <TabsTrigger value="confidence" className="text-xs">
                  Confidence
                </TabsTrigger>
                <TabsTrigger value="lastEvent" className="text-xs">
                  Last Event
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {enrichedCases.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircleIcon />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  No cases pending review. Check high-risk apps for proactive monitoring.
                </p>
              </div>
              <Link href="/inventory?risk=High">
                <Button variant="default">View High-Risk Apps</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          enrichedCases.map(({ case: reviewCase, app }) => {
            if (!app) return null

            const lastEvent = reviewCase.timeline[reviewCase.timeline.length - 1]
            const lastEventDate = lastEvent ? new Date(lastEvent.ts).toLocaleString() : "N/A"
            const isProcessing = actionInProgress === app.id

            return (
              <Card key={reviewCase.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">{app.name}</CardTitle>
                        <Badge
                          variant={
                            reviewCase.priority === "P0"
                              ? "destructive"
                              : reviewCase.priority === "P1"
                                ? "default"
                                : "secondary"
                          }
                          className="font-semibold"
                        >
                          {reviewCase.priority}
                        </Badge>
                        {reviewCase.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {reviewCase.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{reviewCase.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Confidence</div>
                          <div className="font-medium">{Math.round(reviewCase.confidence * 100)}%</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Impact</div>
                          <div className="font-medium">{Math.round(reviewCase.impact * 100)}%</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">Publisher</div>
                          <div className="font-medium truncate">{app.publisher}</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <ClockIcon />
                            Last Event
                          </div>
                          <div className="font-medium text-xs">{lastEventDate}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(app.id)}
                                disabled={isCISO || isProcessing}
                                aria-disabled={isCISO || isProcessing}
                                className={isCISO ? "cursor-not-allowed" : ""}
                              >
                                {isProcessing ? "Processing..." : "Approve"}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{isCISO ? restrictedTooltip : "Mark as sanctioned"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEscalate(app.id)}
                          disabled={isProcessing}
                        >
                          View Details
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismiss(app.id)}
                                disabled={isCISO || isProcessing}
                                aria-disabled={isCISO || isProcessing}
                                className={`w-full ${isCISO ? "cursor-not-allowed" : ""}`}
                              >
                                Dismiss
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{isCISO ? restrictedTooltip : "Mark as false positive"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Timeline
                      <Badge variant="secondary" className="text-xs">
                        {reviewCase.timeline.length} event{reviewCase.timeline.length !== 1 ? "s" : ""}
                      </Badge>
                    </h3>
                    <div className="space-y-2.5 pl-4 border-l-2 border-neutral-200">
                      {reviewCase.timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-4 text-sm relative">
                          <div className="absolute -left-[21px] top-2 w-3 h-3 rounded-full bg-white border-2 border-neutral-300" />
                          <span className="text-muted-foreground min-w-[180px] font-mono text-xs pt-1">
                            {new Date(event.ts).toLocaleString()}
                          </span>
                          <span className="text-foreground flex-1">{event.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Recommendations
                      <Badge variant="secondary" className="text-xs">
                        {reviewCase.recommendations.length}
                      </Badge>
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {reviewCase.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3 items-start">
                          <ChevronRightIcon />
                          <span className="text-muted-foreground flex-1">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <ErrorBoundary>
      <ReviewPageContent />
    </ErrorBoundary>
  )
}
