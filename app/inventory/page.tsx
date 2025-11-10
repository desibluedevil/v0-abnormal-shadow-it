"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useShadowStore } from "@/store/shadowStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RiskLevel, AppStatus } from "@/types/shadow-it"
import { columns } from "@/components/inventory/columns"
import { DataTable } from "@/components/inventory/data-table"
import AppDrawer from "@/components/inventory/app-drawer"
import PlanPreview from "@/components/agent/plan-preview"
import { CISOBanner } from "@/components/rbac/ciso-banner"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { ErrorBoundary } from "@/components/errors/error-boundary"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

function InventoryPageContent() {
  const [isBooting, setIsBooting] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const router = useRouter()
  const searchParams = useSearchParams()

  const { filteredApps, filters, setFilters, persona } = useShadowStore()
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
        {persona === "CISO" && <CISOBanner />}
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {persona === "CISO" && <CISOBanner />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-semibold">Shadow App Inventory</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              ref={searchInputRef}
              placeholder="Search by app, publisher, or tag…"
              value={filters.q}
              onChange={(e) => updateFilters({ q: e.target.value })}
              className="w-80"
              aria-label="Search apps by name, publisher, or tag"
            />
            <Button variant="outline" onClick={handleExportCsv} aria-label="Export inventory to CSV">
              Export CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-neutral-600">Risk:</div>
              <Tabs
                value={filters.risk || "All"}
                onValueChange={(v) => updateFilters({ risk: v as RiskLevel | "All" })}
              >
                <TabsList>
                  <TabsTrigger value="All" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="High" className="text-xs">
                    High
                  </TabsTrigger>
                  <TabsTrigger value="Medium" className="text-xs">
                    Medium
                  </TabsTrigger>
                  <TabsTrigger value="Low" className="text-xs">
                    Low
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-neutral-600">Status:</div>
              <Tabs
                value={filters.status || "All"}
                onValueChange={(v) => updateFilters({ status: v as AppStatus | "All" })}
              >
                <TabsList>
                  <TabsTrigger value="All" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="Unsanctioned" className="text-xs">
                    Unsanctioned
                  </TabsTrigger>
                  <TabsTrigger value="Sanctioned" className="text-xs">
                    Sanctioned
                  </TabsTrigger>
                  <TabsTrigger value="Revoked" className="text-xs">
                    Revoked
                  </TabsTrigger>
                  <TabsTrigger value="Dismissed" className="text-xs">
                    Dismissed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {apps.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-6xl">🔍</div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">No apps found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasActiveFilters ? "Try adjusting your filters to see more results" : "No shadow apps detected yet"}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Link href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost">View Documentation</Button>
                </Link>
              </div>
            </div>
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
