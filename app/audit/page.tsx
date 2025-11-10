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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"

type ActionFilter = "all" | "graph.revokeGrant" | "end.sessions" | "notify.email" | "ticket.create"
type StatusFilter = "all" | "ok" | "error"

const DownloadIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
)

const CopyIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
)

const ClipboardIcon = () => (
  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="h-4 w-4 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

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
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

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
      if (dateFrom && receipt.ts < dateFrom) return false
      if (dateTo && receipt.ts > dateTo + "T23:59:59") return false

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

  const copyReceiptId = async (receiptId: string) => {
    try {
      await navigator.clipboard.writeText(receiptId)
      toast({
        title: "Copied",
        description: `Receipt ID ${receiptId} copied to clipboard`,
        duration: 2000,
      })
    } catch (err) {
      console.error("Failed to copy:", err)
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
              variant="default"
              size="sm"
              disabled={filteredReceipts.length === 0}
              aria-label={`Export ${filteredReceipts.length} receipts to CSV file`}
              className="gap-2"
            >
              <DownloadIcon />
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
              <Tabs value={actionFilter} onValueChange={(v) => setActionFilter(v as ActionFilter)}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="graph.revokeGrant" className="text-xs">
                    Revoke
                  </TabsTrigger>
                  <TabsTrigger value="end.sessions" className="text-xs">
                    Sessions
                  </TabsTrigger>
                  <TabsTrigger value="notify.email" className="text-xs">
                    Notify
                  </TabsTrigger>
                  <TabsTrigger value="ticket.create" className="text-xs">
                    Ticket
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="ok" className="text-xs">
                    Success
                  </TabsTrigger>
                  <TabsTrigger value="error" className="text-xs">
                    Error
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From Date</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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
            <div className="text-center py-16 space-y-4 px-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-50 p-4 text-blue-400">
                  <ClipboardIcon />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">No audit receipts yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Receipts are automatically created when you perform remediation actions on apps in your inventory
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => seedReceiptsIfEmpty()} variant="outline">
                  Generate Demo Receipts
                </Button>
                <Link href="/inventory?focus=app_calendarsync">
                  <Button variant="default">Review Apps</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="border-t overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                    <TableHead className="font-semibold">Actor</TableHead>
                    <TableHead className="font-semibold">App</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Receipt ID</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
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
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleRowExpansion(receipt.id)}
                        >
                          <TableCell>
                            <div className={`transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}>
                              <ChevronDownIcon />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap font-mono">
                            {formatTime(receipt.ts)}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{receipt.actor}</TableCell>
                          <TableCell>
                            {app ? (
                              <Link
                                href={`/inventory?focus=${receipt.appId}`}
                                className="text-primary hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {app.name}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">{receipt.appId}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal text-xs">
                              {getActionLabel(receipt.tool)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyReceiptId(receipt.id)
                              }}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-mono group"
                              aria-label={`Copy receipt ID ${receipt.id}`}
                            >
                              <span className="group-hover:underline">{receipt.id}</span>
                              <CopyIcon />
                            </button>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={receipt.status === "ok" ? "default" : "destructive"}
                              className="font-normal"
                            >
                              {receipt.status === "ok" ? "Success" : "Error"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${receipt.id}-expanded`} className="hover:bg-transparent">
                            <TableCell colSpan={7} className="bg-muted/30 p-0">
                              <div className="p-6 space-y-6">
                                {/* Details section */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Action Details</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {receipt.details || "No additional details available"}
                                  </p>
                                </div>

                                <Separator />

                                {/* Metadata grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Receipt ID
                                      </div>
                                      <code className="text-sm bg-background px-3 py-1.5 rounded border font-mono block">
                                        {receipt.id}
                                      </code>
                                    </div>

                                    <div className="space-y-1.5">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Timestamp
                                      </div>
                                      <div className="text-sm text-foreground font-mono">{receipt.ts}</div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Action Type
                                      </div>
                                      <Badge variant="secondary" className="font-normal">
                                        {getActionLabel(receipt.tool)}
                                      </Badge>
                                    </div>

                                    <div className="space-y-1.5">
                                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Status
                                      </div>
                                      <Badge
                                        variant={receipt.status === "ok" ? "default" : "destructive"}
                                        className="font-normal"
                                      >
                                        {receipt.status === "ok" ? "Success" : "Error"}
                                      </Badge>
                                    </div>
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
