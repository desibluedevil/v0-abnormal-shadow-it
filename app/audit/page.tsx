"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useShadowStore } from "@/store/shadowStore"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import {
  Search,
  X,
  ChevronRight,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Download,
  CalendarIcon,
} from "lucide-react"
import { format } from "date-fns"

type ActionFilter = "all" | "graph.revokeGrant" | "end.sessions" | "notify.email" | "ticket.create"
type StatusFilter = "all" | "ok" | "error"

function AuditPageContent() {
  const [isBooting, setIsBooting] = useState(true)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [isFromDateOpen, setIsFromDateOpen] = useState(false)
  const [isToDateOpen, setIsToDateOpen] = useState(false)
  const { receipts, apps, seedReceiptsIfEmpty, appendReceipt } = useShadowStore()
  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 450)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (receipts.length === 0) seedReceiptsIfEmpty()
  }, [receipts.length, seedReceiptsIfEmpty])

  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFromDateOpen(false)
        setIsToDateOpen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const app = apps.find((a) => a.id === receipt.appId)
        const matchesSearch =
          receipt.actor.toLowerCase().includes(query) ||
          receipt.tool.toLowerCase().includes(query) ||
          receipt.id.toLowerCase().includes(query) ||
          receipt.details?.toLowerCase().includes(query) ||
          app?.name.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      if (actionFilter !== "all" && receipt.tool !== actionFilter) return false
      if (statusFilter !== "all" && receipt.status !== statusFilter) return false

      if (dateFrom) {
        const fromStr = format(dateFrom, "yyyy-MM-dd")
        if (receipt.ts < fromStr) return false
      }
      if (dateTo) {
        const toStr = format(dateTo, "yyyy-MM-dd") + "T23:59:59"
        if (receipt.ts > toStr) return false
      }

      return true
    })
  }, [receipts, apps, searchQuery, actionFilter, statusFilter, dateFrom, dateTo])

  const formatTime = (ts: string) => {
    const date = new Date(ts)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToCSV = () => {
    const headers = ["ts", "actor", "appName", "tool", "id", "status", "details"]
    const csvRows = [headers.join(",")]

    filteredReceipts.forEach((receipt) => {
      const app = apps.find((a) => a.id === receipt.appId)
      const row = [
        receipt.ts,
        `"${receipt.actor}"`,
        `"${app?.name || receipt.appId}"`,
        receipt.tool,
        receipt.id,
        receipt.status,
        `"${(receipt.details || "").replace(/"/g, '""')}"`,
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "audit_receipts.csv"
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "CSV exported",
      description: `Successfully exported ${filteredReceipts.length} receipt${filteredReceipts.length === 1 ? "" : "s"} to audit_receipts.csv`,
      duration: 3000,
    })

    const nowIso = () => new Date().toISOString()
    const genId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`
    appendReceipt({
      id: genId("export"),
      ts: nowIso(),
      tool: "notify.email",
      status: "ok",
      details: `Exported ${filteredReceipts.length} audit receipts to CSV`,
      appId: "system",
      actor: "Sam (SecOps)",
    })
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
        duration: 2000,
      })
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const toggleRowExpansion = (receiptId: string) => {
    setExpandedRowId(expandedRowId === receiptId ? null : receiptId)
  }

  const getActionLabel = (tool: string) => {
    const labels: Record<string, string> = {
      "graph.revokeGrant": "Revoke Grant",
      "end.sessions": "End Sessions",
      "notify.email": "Notify Email",
      "ticket.create": "Create Ticket",
      "graph.restoreGrant": "Restore Grant",
      "ticket.update": "Update Ticket",
    }
    return labels[tool] || tool
  }

  if (isBooting) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Complete record of all remediation actions and system events
          </p>
        </div>

        {filteredReceipts.length > 0 && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total receipts:</span>
              <span className="font-semibold text-foreground">{filteredReceipts.length}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Successful:</span>
              <span className="font-semibold text-green-600">
                {filteredReceipts.filter((r) => r.status === "ok").length}
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Errors:</span>
              <span className="font-semibold text-red-600">
                {filteredReceipts.filter((r) => r.status === "error").length}
              </span>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription className="mt-1">
                Refine results by search, action type, status, or date range
              </CardDescription>
            </div>
            <Button
              onClick={exportToCSV}
              variant="primary"
              size="sm"
              disabled={filteredReceipts.length === 0}
              aria-label={
                filteredReceipts.length === 0
                  ? "Export becomes available once results are visible"
                  : `Export ${filteredReceipts.length} receipts to CSV file`
              }
              title={filteredReceipts.length === 0 ? "Export becomes available once results are visible" : undefined}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Search className="h-4 w-4 text-[#47D7FF]" />
              Search
            </label>
            <div className="relative max-w-2xl">
              <Input
                type="text"
                placeholder="Search by app, publisher, action, receipt ID, or details…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[#47D7FF]/10 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Action Type</label>
              <ToggleGroup
                type="single"
                value={actionFilter}
                onValueChange={(value) => {
                  if (value) setActionFilter(value as ActionFilter)
                }}
                className="justify-start flex-wrap gap-2"
              >
                <ToggleGroupItem
                  value="all"
                  aria-label="Show all actions"
                  className="data-[state=on]:bg-[#47D7FF]/15 data-[state=on]:text-[#47D7FF] data-[state=on]:border data-[state=on]:border-[#47D7FF]/50 data-[state=on]:shadow-[0_0_12px_rgba(71,215,255,0.25)] transition-all duration-200 font-medium"
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="graph.revokeGrant"
                  aria-label="Show revoke grant actions"
                  className="data-[state=on]:bg-[#47D7FF]/15 data-[state=on]:text-[#47D7FF] data-[state=on]:border data-[state=on]:border-[#47D7FF]/50 data-[state=on]:shadow-[0_0_12px_rgba(71,215,255,0.25)] transition-all duration-200 font-medium"
                >
                  Revoke
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="end.sessions"
                  aria-label="Show end sessions actions"
                  className="data-[state=on]:bg-[#47D7FF]/15 data-[state=on]:text-[#47D7FF] data-[state=on]:border data-[state=on]:border-[#47D7FF]/50 data-[state=on]:shadow-[0_0_12px_rgba(71,215,255,0.25)] transition-all duration-200 font-medium"
                >
                  Sessions
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="notify.email"
                  aria-label="Show notify email actions"
                  className="data-[state=on]:bg-[#47D7FF]/15 data-[state=on]:text-[#47D7FF] data-[state=on]:border data-[state=on]:border-[#47D7FF]/50 data-[state=on]:shadow-[0_0_12px_rgba(71,215,255,0.25)] transition-all duration-200 font-medium"
                >
                  Notify
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="ticket.create"
                  aria-label="Show ticket creation actions"
                  className="data-[state=on]:bg-[#47D7FF]/15 data-[state=on]:text-[#47D7FF] data-[state=on]:border data-[state=on]:border-[#47D7FF]/50 data-[state=on]:shadow-[0_0_12px_rgba(71,215,255,0.25)] transition-all duration-200 font-medium"
                >
                  Ticket
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <ToggleGroup
                type="single"
                value={statusFilter}
                onValueChange={(value) => {
                  if (value) setStatusFilter(value as StatusFilter)
                }}
                className="justify-start gap-2"
              >
                <ToggleGroupItem
                  value="all"
                  aria-label="Show all statuses"
                  className="data-[state=on]:bg-[#47D7FF]/15 data-[state=on]:text-[#47D7FF] data-[state=on]:border data-[state=on]:border-[#47D7FF]/50 data-[state=on]:shadow-[0_0_12px_rgba(71,215,255,0.25)] transition-all duration-200 font-medium"
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="ok"
                  aria-label="Show successful actions"
                  className="data-[state=on]:bg-[#47D7FF]/15 data-[state=on]:text-[#47D7FF] data-[state=on]:border data-[state=on]:border-[#47D7FF]/50 data-[state=on]:shadow-[0_0_12px_rgba(71,215,255,0.25)] transition-all duration-200 font-medium"
                >
                  Success
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="error"
                  aria-label="Show failed actions"
                  className="data-[state=on]:bg-[#47D7FF]/15 data-[state=on]:text-[#47D7FF] data-[state=on]:border data-[state=on]:border-[#47D7FF]/50 data-[state=on]:shadow-[0_0_12px_rgba(71,215,255,0.25)] transition-all duration-200 font-medium"
                >
                  Error
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From Date</label>
              <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-transparent hover:bg-muted/50 hover:border-[#47D7FF]/30 transition-colors"
                    aria-label="Select from date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#47D7FF]" />
                    {dateFrom ? format(dateFrom, "PPP") : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => {
                      setDateFrom(date)
                      setIsFromDateOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-transparent hover:bg-muted/50 hover:border-[#47D7FF]/30 transition-colors"
                    aria-label="Select to date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#47D7FF]" />
                    {dateTo ? format(dateTo, "PPP") : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => {
                      setDateTo(date)
                      setIsToDateOpen(false)
                    }}
                    initialFocus
                    disabled={(date) => (dateFrom ? date < dateFrom : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Audit Receipts
                <Badge variant="secondary" className="ml-2 font-normal">
                  {filteredReceipts.length}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">Chronological record of all remediation actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredReceipts.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardList className="w-6 h-6" />
                </EmptyMedia>
                <EmptyTitle>No audit receipts yet</EmptyTitle>
                <EmptyDescription>
                  Receipts are automatically created when you perform remediation actions on apps in your inventory
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => seedReceiptsIfEmpty()} variant="outline">
                  Generate Demo Receipts
                </Button>
                <Link href="/inventory?focus=app_calendarsync">
                  <Button variant="primary">Review Apps</Button>
                </Link>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="divide-y divide-border">
              {filteredReceipts.map((receipt) => {
                const app = apps.find((a) => a.id === receipt.appId)
                const isExpanded = expandedRowId === receipt.id
                return (
                  <div key={receipt.id} className="transition-colors hover:bg-muted/30">
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer group"
                      onClick={() => toggleRowExpansion(receipt.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} details for receipt ${receipt.id}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          toggleRowExpansion(receipt.id)
                        }
                      }}
                    >
                      {/* Large chevron click target */}
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 group-hover:bg-[#47D7FF]/10 transition-all duration-200 ${
                          isExpanded ? "rotate-90 bg-[#47D7FF]/15" : ""
                        }`}
                      >
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#47D7FF]" />
                      </div>

                      {/* Receipt summary - responsive grid */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4 items-center min-w-0">
                        {/* Timestamp */}
                        <div className="lg:col-span-1">
                          <div className="text-xs text-muted-foreground mb-0.5 lg:hidden">Timestamp</div>
                          <div className="text-sm font-mono text-foreground whitespace-nowrap">
                            {formatTime(receipt.ts)}
                          </div>
                        </div>

                        {/* Actor */}
                        <div className="lg:col-span-1">
                          <div className="text-xs text-muted-foreground mb-0.5 lg:hidden">Actor</div>
                          <div className="text-sm font-medium text-foreground truncate">{receipt.actor}</div>
                        </div>

                        {/* Application */}
                        <div className="lg:col-span-1">
                          <div className="text-xs text-muted-foreground mb-0.5 lg:hidden">Application</div>
                          {app ? (
                            <Link
                              href={`/inventory?focus=${receipt.appId}`}
                              className="text-sm text-[#47D7FF] hover:underline font-medium inline-flex items-center gap-1 truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="truncate">{app.name}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground truncate">{receipt.appId}</span>
                          )}
                        </div>

                        {/* Action */}
                        <div className="lg:col-span-1">
                          <div className="text-xs text-muted-foreground mb-0.5 lg:hidden">Action</div>
                          <Badge variant="outline" className="font-normal text-xs border-border/50">
                            {getActionLabel(receipt.tool)}
                          </Badge>
                        </div>

                        {/* Receipt ID */}
                        <div className="lg:col-span-1">
                          <div className="text-xs text-muted-foreground mb-0.5 lg:hidden">Receipt ID</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(receipt.id, "Receipt ID")
                            }}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/70 transition-colors group/copy"
                            aria-label={`Copy receipt ID ${receipt.id}`}
                          >
                            <code className="text-xs font-mono text-foreground group-hover/copy:text-[#47D7FF] transition-colors truncate max-w-[120px]">
                              {receipt.id}
                            </code>
                            <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover/copy:text-[#47D7FF] transition-colors shrink-0" />
                          </button>
                        </div>

                        {/* Status */}
                        <div className="lg:col-span-1">
                          <div className="text-xs text-muted-foreground mb-0.5 lg:hidden">Status</div>
                          {receipt.status === "ok" ? (
                            <Badge
                              variant="outline"
                              className="font-normal border-[#39D98A]/30 bg-[#39D98A]/10 text-[#39D98A] gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="font-normal border-[#FF4D4D]/30 bg-[#FF4D4D]/10 text-[#FF4D4D] gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-[#0B0F12] border-t border-border/50 p-6">
                        <div className="space-y-6 max-w-5xl">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-[#47D7FF]" />
                              Action Details
                            </h4>
                            <div className="text-sm text-muted-foreground leading-relaxed bg-background/50 p-4 rounded-lg border border-border/50">
                              {receipt.details || "No additional details available"}
                            </div>
                          </div>

                          <Separator className="bg-border/50" />

                          {/* Labelled detail rows */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left column */}
                            <div className="space-y-5">
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Receipt ID
                                </label>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm bg-background px-3 py-2.5 rounded-lg border border-border/50 font-mono flex-1 text-foreground break-all">
                                    {receipt.id}
                                  </code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(receipt.id, "Receipt ID")}
                                    className="shrink-0 hover:bg-[#47D7FF]/10 hover:border-[#47D7FF]/50 hover:text-[#47D7FF]"
                                    aria-label="Copy receipt ID"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Timestamp
                                </label>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm bg-background px-3 py-2.5 rounded-lg border border-border/50 font-mono flex-1 text-foreground">
                                    {receipt.ts}
                                  </code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(receipt.ts, "Timestamp")}
                                    className="shrink-0 hover:bg-[#47D7FF]/10 hover:border-[#47D7FF]/50 hover:text-[#47D7FF]"
                                    aria-label="Copy timestamp"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Actor
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm bg-background px-3 py-2.5 rounded-lg border border-border/50 flex-1 text-foreground">
                                    {receipt.actor}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(receipt.actor, "Actor")}
                                    className="shrink-0 hover:bg-[#47D7FF]/10 hover:border-[#47D7FF]/50 hover:text-[#47D7FF]"
                                    aria-label="Copy actor name"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Right column */}
                            <div className="space-y-5">
                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Application
                                </label>
                                <div className="flex items-center gap-2">
                                  {app ? (
                                    <Link
                                      href={`/inventory?focus=${receipt.appId}`}
                                      className="text-sm bg-background px-3 py-2.5 rounded-lg border border-border/50 flex-1 text-[#47D7FF] hover:underline font-medium inline-flex items-center gap-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {app.name}
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                  ) : (
                                    <div className="text-sm bg-background px-3 py-2.5 rounded-lg border border-border/50 flex-1 text-muted-foreground">
                                      {receipt.appId}
                                    </div>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(app?.name || receipt.appId, "Application")}
                                    className="shrink-0 hover:bg-[#47D7FF]/10 hover:border-[#47D7FF]/50 hover:text-[#47D7FF]"
                                    aria-label="Copy application name"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Action Type
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm bg-background px-3 py-2.5 rounded-lg border border-border/50 flex-1 text-foreground">
                                    {getActionLabel(receipt.tool)}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(receipt.tool, "Action type")}
                                    className="shrink-0 hover:bg-[#47D7FF]/10 hover:border-[#47D7FF]/50 hover:text-[#47D7FF]"
                                    aria-label="Copy action type"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Status
                                </label>
                                <div>
                                  {receipt.status === "ok" ? (
                                    <Badge
                                      variant="outline"
                                      className="font-normal border-[#39D98A]/30 bg-[#39D98A]/10 text-[#39D98A] gap-1.5 px-3 py-1.5"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Success
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="font-normal border-[#FF4D4D]/30 bg-[#FF4D4D]/10 text-[#FF4D4D] gap-1.5 px-3 py-1.5"
                                    >
                                      <AlertCircle className="h-3.5 w-3.5" />
                                      Error
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {app && (
                            <div className="pt-4 border-t border-border/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#47D7FF] hover:text-[#47D7FF] hover:bg-[#47D7FF]/10 gap-2 h-auto py-2"
                                asChild
                              >
                                <Link href={`/inventory?focus=${receipt.appId}`}>
                                  <ExternalLink className="h-4 w-4" />
                                  Open source event in inventory
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuditPage() {
  return (
    <ErrorBoundary>
      <AuditPageContent />
    </ErrorBoundary>
  )
}
