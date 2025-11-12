"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useShadowStore } from "@/store/shadowStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Search, FileDown, FolderSearch, X } from "lucide-react"
import type { RiskLevel, AppStatus } from "@/types/shadow-it"
import { columns } from "@/components/inventory/columns"
import { DataTable } from "@/components/inventory/data-table"
import AppDrawer from "@/components/inventory/app-drawer"
import PlanPreview from "@/components/agent/plan-preview"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

function InventoryPageContent() {
  const [isBooting, setIsBooting] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const router = useRouter()
  const searchParams = useSearchParams()

  const { filteredApps, filters, setFilters, persona, appendReceipt } = useShadowStore()
  const { toast } = useToast()

  const isInitialMount = useRef(true)

  const [changedRowIds, setChangedRowIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isInitialMount.current) return
    isInitialMount.current = false

    const risk = searchParams.get("risk") as RiskLevel | "All" | null
    const status = searchParams.get("status") as AppStatus | "All" | null
    const q = searchParams.get("q") || ""

    setFilters({
      risk: risk || "All",
      status: status || "All",
      q,
    })
  }, [searchParams, setFilters])

  useEffect(() => {
    const handleReviewAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ appId: string }>
      const appId = customEvent.detail?.appId
      if (appId) {
        setChangedRowIds((prev) => new Set(prev).add(appId))
        setTimeout(() => {
          setChangedRowIds((prev) => {
            const next = new Set(prev)
            next.delete(appId)
            return next
          })
        }, 1200)
      }
    }

    window.addEventListener("review:action", handleReviewAction)
    return () => window.removeEventListener("review:action", handleReviewAction)
  }, [])

  const apps = filteredApps()

  const focusAppId = searchParams.get("focus")

  const updateFilters = (updates: Partial<typeof filters>) => {
    setFilters(updates)
    const params = new URLSearchParams(searchParams.toString())

    if (updates.risk !== undefined) {
      if (updates.risk === "All") params.delete("risk")
      else params.set("risk", updates.risk)
    }
    if (updates.status !== undefined) {
      if (updates.status === "All") params.delete("status")
      else params.set("status", updates.status)
    }
    if (updates.q !== undefined) {
      if (updates.q === "") params.delete("q")
      else params.set("q", updates.q)
    }

    router.push(`/inventory?${params.toString()}`, { scroll: false })
  }

  const handleExportCsv = () => {
    const headers = ["Name", "Publisher", "Risk", "Users", "First Seen", "Last Seen", "Status", "Tags"]
    const rows = apps.map((a) => [
      a.name,
      a.publisher,
      a.riskLevel,
      a.users.length.toString(),
      a.firstSeen,
      a.lastSeen,
      a.status,
      a.tags.join("|"),
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "shadow_apps.csv"
    a.click()
    URL.revokeObjectURL(url)

    appendReceipt({
      id: `export_${Date.now()}`,
      ts: new Date().toISOString(),
      tool: "notify.email",
      status: "ok",
      details: `Exported ${apps.length} app${apps.length === 1 ? "" : "s"} to CSV (shadow_apps.csv)`,
      appId: "system",
      actor: persona === "CISO" ? "CISO" : "Sam (SecOps)",
    })

    toast({
      title: "CSV exported",
      description: `Successfully exported ${apps.length} app${apps.length === 1 ? "" : "s"} to shadow_apps.csv`,
      duration: 3000,
    })
  }

  const handleClearFilters = () => {
    setFilters({ risk: "All", status: "All", q: "" })
    router.push("/inventory", { scroll: false })
  }

  const hasActiveFilters = filters.risk !== "All" || filters.status !== "All" || filters.q !== ""

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

      if (e.key === "f" && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      if (e.key === "Escape" && focusAppId) {
        e.preventDefault()
        const url = new URL(window.location.href)
        url.searchParams.delete("focus")
        url.hash = ""
        router.push(url.pathname + url.search)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [focusAppId, router])

  if (isBooting) {
    return (
      <div className="p-6 space-y-4">
        <TableSkeleton />
      </div>
    )
  }

  const canExport = apps.length > 0

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-semibold">Shadow App Inventory</CardTitle>
          <div className="flex items-center gap-2">
            <InputGroup className="w-80">
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <Search className="size-4 text-[#47D7FF]" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                ref={searchInputRef}
                placeholder="Search by app, publisher, tag, or receipt id…"
                value={filters.q}
                onChange={(e) => updateFilters({ q: e.target.value })}
                aria-label="Search apps by name, publisher, tag, or receipt id"
              />
              {filters.q && (
                <InputGroupAddon align="inline-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ q: "" })}
                    className="h-6 w-6 p-0 hover:bg-[#47D7FF]/10"
                    aria-label="Clear search"
                  >
                    <X className="size-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                </InputGroupAddon>
              )}
            </InputGroup>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="primary"
                      onClick={handleExportCsv}
                      disabled={!canExport}
                      aria-label="Export inventory to CSV"
                      className="gap-2"
                    >
                      <FileDown className="size-4" />
                      Export CSV
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canExport && (
                  <TooltipContent>
                    <p>Export becomes available once a search returns results.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-muted-foreground">Risk:</div>
              <ToggleGroup
                type="single"
                value={filters.risk || "All"}
                onValueChange={(v) => v && updateFilters({ risk: v as RiskLevel | "All" })}
                className="border border-border rounded-lg bg-muted/30"
              >
                <ToggleGroupItem
                  value="All"
                  aria-pressed={filters.risk === "All"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="High"
                  aria-pressed={filters.risk === "High"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  High
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Medium"
                  aria-pressed={filters.risk === "Medium"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Medium
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Low"
                  aria-pressed={filters.risk === "Low"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Low
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-muted-foreground">Status:</div>
              <ToggleGroup
                type="single"
                value={filters.status || "All"}
                onValueChange={(v) => v && updateFilters({ status: v as AppStatus | "All" })}
                className="border border-border rounded-lg bg-muted/30"
              >
                <ToggleGroupItem
                  value="All"
                  aria-pressed={filters.status === "All"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Unsanctioned"
                  aria-pressed={filters.status === "Unsanctioned"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Unsanctioned
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Sanctioned"
                  aria-pressed={filters.status === "Sanctioned"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Sanctioned
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Revoked"
                  aria-pressed={filters.status === "Revoked"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Revoked
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Dismissed"
                  aria-pressed={filters.status === "Dismissed"}
                  className="data-[state=on]:bg-[#47D7FF]/10 data-[state=on]:text-[#47D7FF] data-[state=on]:border-b-2 data-[state=on]:border-[#47D7FF] data-[state=on]:shadow-[0_0_8px_rgba(71,215,255,0.3)] transition-all duration-200"
                >
                  Dismissed
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {apps.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderSearch className="w-6 h-6" />
                </EmptyMedia>
                <EmptyTitle>No apps found</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters ? "Try adjusting your filters to see more results" : "No shadow apps detected yet"}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {hasActiveFilters && (
                  <Button variant="primary" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Link href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">View Documentation</Button>
                </Link>
              </EmptyContent>
            </Empty>
          ) : (
            <DataTable columns={columns} data={apps} focusId={focusAppId || undefined} changedRowIds={changedRowIds} />
          )}
        </CardContent>
      </Card>

      <AppDrawer />
      <PlanPreview />
    </div>
  )
}

export default function InventoryPage() {
  return (
    <ErrorBoundary>
      <InventoryPageContent />
    </ErrorBoundary>
  )
}
