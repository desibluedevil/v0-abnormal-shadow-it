"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useShadowStore } from "@/store/shadowStore"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import {
  CalendarIcon,
  FileDown,
  ChevronRight,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
} from "lucide-react"
import { format } from "date-fns"

type ActionFilter = "all" | "graph.revokeGrant" | "end.sessions" | "notify.email" | "ticket.create"
type StatusFilter = "all" | "ok" | "error"

function AuditPageContent() {
  const [isBooting, setIsBooting] = useState(true)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const { receipts, apps, seedReceiptsIfEmpty } = useShadowStore()
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Trail</h1>
        <p className="text-sm text-muted-foreground">
          Prove remediation outcomes with exportable, time-stamped receipts for compliance and reporting
        </p>
      </div>

      <div className="space-y-4">
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
              aria-label={`Export ${filteredReceipts.length} receipts to CSV file`}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Search</label>
            <Input
              type="text"
              placeholder="Search by actor, app, action, receipt ID, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-2xl"
            />
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
                className="justify-start flex-wrap"
              >
                <ToggleGroupItem
                  value="all"
                  aria-label="Show all actions"
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="graph.revokeGrant"
                  aria-label="Show revoke grant actions"
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Revoke
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="end.sessions"
                  aria-label="Show end sessions actions"
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Sessions
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="notify.email"
                  aria-label="Show notify email actions"
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Notify
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="ticket.create"
                  aria-label="Show ticket creation actions"
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
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
                className="justify-start"
              >
                <ToggleGroupItem
                  value="all"
                  aria-label="Show all statuses"
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="ok"
                  aria-label="Show successful actions"
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Success
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="error"
                  aria-label="Show failed actions"
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-transparent"
                    aria-label="Select from date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#47D7FF]" />
                    {dateFrom ? format(dateFrom, "PPP") : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-transparent"
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
                    onSelect={setDateTo}
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
            <div className="border-t overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="w-[48px]"></TableHead>
                    <TableHead className="font-semibold text-foreground">Timestamp</TableHead>
                    <TableHead className="font-semibold text-foreground">Actor</TableHead>
                    <TableHead className="font-semibold text-foreground">Application</TableHead>
                    <TableHead className="font-semibold text-foreground">Action</TableHead>
                    <TableHead className="font-semibold text-foreground">Receipt ID</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => {
                    const app = apps.find((a) => a.id === receipt.appId)
                    const isExpanded = expandedRowId === receipt.id
                    return (
                      <>
                        <TableRow
                          key={receipt.id}
                          className="cursor-pointer hover:bg-muted/70 hover:shadow-[0_2px_8px_rgba(71,215,255,0.08)] transition-all duration-200 border-b"
                          onClick={() => toggleRowExpansion(receipt.id)}
                        >
                          <TableCell className="py-4">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded hover:bg-[#47D7FF]/10 transition-all duration-200 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            >
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground whitespace-nowrap font-mono py-4">
                            {formatTime(receipt.ts)}
                          </TableCell>
                          <TableCell className="font-medium text-foreground py-4">{receipt.actor}</TableCell>
                          <TableCell className="py-4">
                            {app ? (
                              <Link
                                href={`/inventory?focus=${receipt.appId}`}
                                className="text-[#47D7FF] hover:underline font-medium inline-flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {app.name}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">{receipt.appId}</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="font-normal text-xs border-border/50">
                              {getActionLabel(receipt.tool)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(receipt.id, "Receipt ID")
                              }}
                              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted transition-colors group"
                              aria-label={`Copy receipt ID ${receipt.id}`}
                            >
                              <code className="text-xs font-mono text-foreground group-hover:text-[#47D7FF] transition-colors">
                                {receipt.id}
                              </code>
                              <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#47D7FF] transition-colors" />
                            </button>
                          </TableCell>
                          <TableCell className="py-4">
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
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${receipt.id}-expanded`} className="hover:bg-transparent border-b">
                            <TableCell colSpan={7} className="bg-[#0B0F12] p-0">
                              <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    Action Details
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 p-4 rounded-lg border border-border/50">
                                    {receipt.details || "No additional details available"}
                                  </p>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Receipt ID
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <code className="text-sm bg-background px-3 py-2 rounded-lg border border-border/50 font-mono flex-1 text-foreground">
                                          {receipt.id}
                                        </code>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard(receipt.id, "Receipt ID")}
                                          className="shrink-0"
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Timestamp
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <code className="text-sm bg-background px-3 py-2 rounded-lg border border-border/50 font-mono flex-1 text-foreground">
                                          {receipt.ts}
                                        </code>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard(receipt.ts, "Timestamp")}
                                          className="shrink-0"
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Actor
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-sm bg-background px-3 py-2 rounded-lg border border-border/50 flex-1 text-foreground">
                                          {receipt.actor}
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard(receipt.actor, "Actor")}
                                          className="shrink-0"
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Action Type
                                      </div>
                                      <Badge variant="outline" className="font-normal border-border/50">
                                        {getActionLabel(receipt.tool)}
                                      </Badge>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Status
                                      </div>
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

                                    {receipt.details && (
                                      <div className="space-y-2">
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                          Source Event
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-[#47D7FF] hover:text-[#47D7FF] hover:bg-[#47D7FF]/10 gap-2"
                                          asChild
                                        >
                                          <a href="#" onClick={(e) => e.preventDefault()}>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Open source event
                                          </a>
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
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
