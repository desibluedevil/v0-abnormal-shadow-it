"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useShadowStore } from "@/store/shadowStore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { CISOBanner } from "@/components/rbac/ciso-banner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CardSkeleton } from "@/components/skeletons/card-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Calendar,
  Shield,
  CheckCheck,
  XCircle,
} from "lucide-react"
import Link from "next/link"

type SortOption = "priority" | "impact" | "confidence" | "lastEvent"

function ReviewPageContent() {
  const [isBooting, setIsBooting] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { cases, apps, sanctionApp, dismissApp, kpis, persona } = useShadowStore()
  const { toast } = useToast()

  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set())

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

  const handleBatchApprove = async () => {
    if (selectedCases.size === 0) return

    setActionInProgress("batch")
    const before = kpis()

    for (const caseId of selectedCases) {
      const caseItem = cases.find((c) => c.id === caseId)
      if (caseItem) {
        sanctionApp(caseItem.appId)
      }
    }

    await new Promise((r) => setTimeout(r, 100))

    const after = kpis()
    setActionInProgress(null)
    setSelectedCases(new Set())

    toast({
      title: "Batch Approved",
      description: `${selectedCases.size} case${selectedCases.size !== 1 ? "s" : ""} have been approved and marked as sanctioned`,
    })

    window.dispatchEvent(
      new CustomEvent("review:action", {
        detail: { type: "batch-sanction", count: selectedCases.size, before, after },
      }),
    )
  }

  const handleBatchDismiss = async () => {
    if (selectedCases.size === 0) return

    setActionInProgress("batch")
    const before = kpis()

    for (const caseId of selectedCases) {
      const caseItem = cases.find((c) => c.id === caseId)
      if (caseItem) {
        dismissApp(caseItem.appId)
      }
    }

    await new Promise((r) => setTimeout(r, 100))

    const after = kpis()
    setActionInProgress(null)
    setSelectedCases(new Set())

    toast({
      title: "Batch Dismissed",
      description: `${selectedCases.size} case${selectedCases.size !== 1 ? "s" : ""} have been dismissed as false positives`,
    })

    window.dispatchEvent(
      new CustomEvent("review:action", {
        detail: { type: "batch-dismiss", count: selectedCases.size, before, after },
      }),
    )
  }

  const handleToggleSelect = (caseId: string) => {
    const newSelected = new Set(selectedCases)
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId)
    } else {
      newSelected.add(caseId)
    }
    setSelectedCases(newSelected)
  }

  const handleToggleSelectAll = () => {
    if (selectedCases.size === enrichedCases.length) {
      setSelectedCases(new Set())
    } else {
      setSelectedCases(new Set(enrichedCases.map((ec) => ec.case.id)))
    }
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
  const isBatchProcessing = actionInProgress === "batch"

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
          <div className="space-y-3">
            {selectedCases.size > 0 && (
              <Card className="bg-[#47D7FF]/10 border-[#47D7FF]/30 border-2">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCases.size === enrichedCases.length}
                        onCheckedChange={handleToggleSelectAll}
                        className="data-[state=checked]:bg-[#47D7FF] data-[state=checked]:border-[#47D7FF]"
                      />
                      <span className="text-sm font-medium text-[#47D7FF]">
                        {selectedCases.size} case{selectedCases.size !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleBatchApprove}
                              disabled={isCISO || isBatchProcessing}
                              className="bg-[#47D7FF] text-[#0B0F12] hover:bg-[#47D7FF]/90 shadow-[0_0_8px_rgba(71,215,255,0.3)] gap-2"
                            >
                              <CheckCheck className="h-4 w-4" />
                              {isBatchProcessing ? "Processing..." : "Approve All"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {isCISO ? restrictedTooltip : `Approve ${selectedCases.size} cases`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleBatchDismiss}
                              disabled={isCISO || isBatchProcessing}
                              className="bg-[#12171C] hover:bg-[#12171C]/80 border border-border/50 gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Dismiss All
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {isCISO ? restrictedTooltip : `Dismiss ${selectedCases.size} cases`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
              <ToggleGroup
                type="single"
                value={sortBy}
                onValueChange={(v) => v && handleSort(v as SortOption)}
                className="gap-1"
              >
                <ToggleGroupItem
                  value="priority"
                  className="text-xs data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)]"
                  aria-pressed={sortBy === "priority"}
                >
                  Priority
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="impact"
                  className="text-xs data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)]"
                  aria-pressed={sortBy === "impact"}
                >
                  Impact
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="confidence"
                  className="text-xs data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)]"
                  aria-pressed={sortBy === "confidence"}
                >
                  Confidence
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="lastEvent"
                  className="text-xs data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)]"
                  aria-pressed={sortBy === "lastEvent"}
                >
                  Last Event
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {enrichedCases.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckCircle2 className="w-6 h-6" />
              </EmptyMedia>
              <EmptyTitle>All caught up!</EmptyTitle>
              <EmptyDescription>
                No cases pending review. Check high-risk apps for proactive monitoring.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/inventory?risk=High">
                <Button variant="primary">View High-Risk Apps</Button>
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          enrichedCases.map(({ case: reviewCase, app }) => {
            if (!app) return null

            const lastEvent = reviewCase.timeline[reviewCase.timeline.length - 1]
            const lastEventDate = lastEvent ? new Date(lastEvent.ts) : new Date()
            const lastEventRelative = getRelativeTime(lastEventDate)
            const isProcessing = actionInProgress === app.id
            const isSelected = selectedCases.has(reviewCase.id)

            const getTagColor = (tag: string) => {
              if (tag.includes("Exec")) return "bg-[#FF3EB5]/10 text-[#FF3EB5] border-[#FF3EB5]/30"
              if (tag.includes("Broad")) return "bg-[#FFB02E]/10 text-[#FFB02E] border-[#FFB02E]/30"
              if (tag.includes("New")) return "bg-[#47D7FF]/10 text-[#47D7FF] border-[#47D7FF]/30"
              return "bg-muted/50 text-muted-foreground border-border/50"
            }

            const getPriorityColor = (priority: string) => {
              if (priority === "P0") return "bg-[#FF4D4D] text-white border-[#FF4D4D]"
              if (priority === "P1") return "bg-[#FFB02E] text-white border-[#FFB02E]"
              return "bg-[#47D7FF] text-white border-[#47D7FF]"
            }

            return (
              <Card
                key={reviewCase.id}
                className={`overflow-hidden bg-[#12171C] border transition-all duration-200 ${
                  isSelected
                    ? "border-[#47D7FF] shadow-[0_0_12px_rgba(71,215,255,0.3)]"
                    : "border-border/50 hover:border-[#47D7FF]/30"
                }`}
              >
                <CardHeader className="bg-[#0B0F12] border-b border-border/50 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(reviewCase.id)}
                        className="mt-1 data-[state=checked]:bg-[#47D7FF] data-[state=checked]:border-[#47D7FF]"
                        disabled={isCISO}
                      />

                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-foreground">{app.name}</h3>
                          <Badge
                            className={`font-semibold text-xs px-2 py-1 border ${getPriorityColor(reviewCase.priority)}`}
                          >
                            {reviewCase.priority}
                          </Badge>
                          {reviewCase.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} className={`text-xs px-2 py-1 border ${getTagColor(tag)}`}>
                              {tag}
                            </Badge>
                          ))}
                          {reviewCase.tags.length > 3 && (
                            <Badge className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground border border-border/50">
                              +{reviewCase.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Confidence
                            </div>
                            <div className="font-semibold text-lg text-[#47D7FF]">
                              {Math.round(reviewCase.confidence * 100)}%
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Impact
                            </div>
                            <div className="font-semibold text-lg text-[#FFB02E]">
                              {Math.round(reviewCase.impact * 100)}%
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Publisher
                            </div>
                            <div className="font-medium text-sm text-foreground truncate">{app.publisher}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last Event
                            </div>
                            <div className="font-medium text-sm text-foreground">{lastEventRelative}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(app.id)}
                              disabled={isCISO || isProcessing}
                              className="bg-[#47D7FF] text-[#0B0F12] hover:bg-[#47D7FF]/90 shadow-[0_0_8px_rgba(71,215,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? "Processing..." : "Approve"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{isCISO ? restrictedTooltip : "Mark as sanctioned"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDismiss(app.id)}
                              disabled={isCISO || isProcessing}
                              className="bg-[#12171C] hover:bg-[#12171C]/80 border border-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#47D7FF]" />
                      Timeline
                      <Badge variant="secondary" className="text-xs bg-muted/50">
                        {reviewCase.timeline.length} event{reviewCase.timeline.length !== 1 ? "s" : ""}
                      </Badge>
                    </h4>
                    <div className="space-y-3 pl-6 border-l-2 border-[#47D7FF]/30 relative">
                      {reviewCase.timeline.map((event, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5 relative">
                          <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-[#47D7FF] border-2 border-[#0B0F12] shadow-[0_0_8px_rgba(71,215,255,0.5)]" />
                          <div className="text-xs text-muted-foreground font-mono">
                            {new Date(event.ts).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-sm text-foreground leading-relaxed">{event.event}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#47D7FF]" />
                      Recommendations
                      <Badge variant="secondary" className="text-xs bg-muted/50">
                        {reviewCase.recommendations.length}
                      </Badge>
                    </h4>
                    <Accordion type="single" collapsible className="space-y-2">
                      {reviewCase.recommendations.map((rec, idx) => (
                        <AccordionItem
                          key={idx}
                          value={`rec-${idx}`}
                          className="border border-border/50 rounded-lg bg-[#0B0F12] overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-[#12171C] transition-colors text-sm font-medium text-foreground hover:no-underline">
                            {rec}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                            <div className="space-y-2 pt-2">
                              <p className="leading-relaxed">
                                This recommendation helps mitigate the risk associated with {app.name}. Review the
                                details and take appropriate action.
                              </p>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="bg-[#47D7FF] text-[#0B0F12] hover:bg-[#47D7FF]/90 text-xs"
                                  onClick={() => handleEscalate(app.id)}
                                >
                                  Take Action
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="bg-[#12171C] border border-border/50 text-xs"
                                  onClick={() => {
                                    toast({
                                      title: "Recommendation Dismissed",
                                      description: "This recommendation has been marked as not applicable",
                                    })
                                  }}
                                >
                                  Not Applicable
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEscalate(app.id)}
                      className="text-[#47D7FF] hover:text-[#47D7FF] hover:bg-[#47D7FF]/10 text-sm"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View details in Inventory
                    </Button>
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

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function ReviewPage() {
  return (
    <ErrorBoundary>
      <ReviewPageContent />
    </ErrorBoundary>
  )
}
