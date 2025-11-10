"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useShadowStore } from "@/store/shadowStore"
import type { ShadowApp, Scope } from "@/types/shadow-it"
import { useNotify } from "@/components/notify/notify-modal"
import { useToast } from "@/hooks/use-toast"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DrawerSkeleton } from "@/components/skeletons/drawer-skeleton"

function groupScopes(scopes: Scope[]) {
  const groups: Record<string, Scope[]> = {}
  for (const s of scopes) {
    const key = s.riskTag || "Other"
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return groups
}

function RiskPill({ level }: { level: ShadowApp["riskLevel"] }) {
  const cls =
    level === "High"
      ? "bg-red-100 text-red-700 border border-red-300"
      : level === "Medium"
        ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
        : "bg-green-100 text-green-700 border border-green-300"
  return <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{level}</span>
}

export default function AppDrawer() {
  const params = useSearchParams()
  const router = useRouter()
  const focusId = params.get("focus")
  const { apps, persona, revokeApp, sanctionApp } = useShadowStore()
  const { openFor } = useNotify()
  const { toast } = useToast()

  const app = useMemo(() => apps.find((a) => a.id === focusId), [apps, focusId])

  const [localOpen, setLocalOpen] = useState(false)
  const [isDrawerLoading, setIsDrawerLoading] = useState(false)

  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [bannerData, setBannerData] = useState<{ action: string; ts: string; actor: string } | null>(null)

  const [planDone, setPlanDone] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const prevStatus = useRef(app?.status)

  const titleRef = useRef<HTMLHeadingElement>(null)
  const triggerElementRef = useRef<HTMLElement | null>(null)

  const isCISO = persona === "CISO"

  useEffect(() => {
    setLocalOpen(Boolean(focusId && app))
    if (!focusId) {
      setShowSuccessBanner(false)
    }
    if (focusId && app) {
      setIsDrawerLoading(true)
      const timer = setTimeout(() => setIsDrawerLoading(false), 250)
      return () => clearTimeout(timer)
    }
  }, [focusId, app])

  useEffect(() => {
    function onApproved(e: any) {
      console.log("[v0] AppDrawer received plan:approved event", e.detail)
      if (e?.detail?.appId === app?.id) {
        console.log("[v0] AppDrawer showing success banner for", app.id)
        setShowSuccessBanner(true)
      }
    }
    window.addEventListener("plan:approved", onApproved as any)
    return () => window.removeEventListener("plan:approved", onApproved as any)
  }, [app?.id])

  useEffect(() => {
    if (!app) return
    if (prevStatus.current && prevStatus.current !== app.status && app.status === "Revoked") {
      console.log("[v0] AppDrawer detected status change to Revoked, showing banner")
      const ts = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      setBannerData({ action: "Revoked", ts, actor: persona === "SecOps" ? "Sam (SecOps)" : persona })
      setShowSuccessBanner(true)
    }
    prevStatus.current = app.status
  }, [app?.status, app, persona])

  useEffect(() => {
    console.log("[v0] AppDrawer - persona:", persona, "isSecOps:", persona === "SecOps")
    if (app) {
      console.log("[v0] AppDrawer - app:", app.id, "status:", app.status)
      console.log(
        "[v0] AppDrawer - canRevoke:",
        persona === "SecOps" && app && app.status !== "Revoked",
        "canSanction:",
        persona === "SecOps" && app && app.status !== "Sanctioned",
      )
      console.log("[v0] AppDrawer - rationale:", app.rationale)
      if (app.rationale) {
        console.log("[v0] AppDrawer - has summary:", !!app.rationale.summary)
        console.log("[v0] AppDrawer - reasons count:", app.rationale.reasons?.length || 0)
        console.log("[v0] AppDrawer - sources count:", app.rationale.sources?.length || 0)
      }
    }
  }, [persona, app])

  useEffect(() => {
    if (focusId && app && !localOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement
      console.log("[v0] AppDrawer stored trigger element:", triggerElementRef.current?.tagName)
    }
  }, [focusId, app, localOpen])

  useEffect(() => {
    if (localOpen && titleRef.current && !isDrawerLoading) {
      setTimeout(() => {
        titleRef.current?.focus()
        console.log("[v0] AppDrawer focused heading, active element:", document.activeElement?.tagName)
      }, 300)
    }
  }, [localOpen, isDrawerLoading])

  useEffect(() => {
    if (!localOpen && triggerElementRef.current) {
      setTimeout(() => {
        triggerElementRef.current?.focus()
        console.log("[v0] AppDrawer returned focus to trigger:", triggerElementRef.current?.tagName)
        triggerElementRef.current = null
      }, 100)
    }
  }, [localOpen])

  useEffect(() => {
    if (!localOpen) return
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    if (hash === "#ai-explain") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      setTimeout(() => {
        document.getElementById("ai-explain")?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        })
      }, 200)
    }
  }, [localOpen])

  // Added keyboard event handler for Esc key
  useEffect(() => {
    if (!localOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("[v0] AppDrawer: Esc key pressed, closing drawer")
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [localOpen])

  const handleClose = () => {
    console.log("[v0] AppDrawer handleClose called")
    const url = new URL(window.location.href)
    url.searchParams.delete("focus")
    url.hash = ""
    window.history.replaceState({}, "", url.pathname + url.search)
    setLocalOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    console.log("[v0] AppDrawer handleOpenChange:", newOpen)
    if (!newOpen) {
      handleClose()
    }
  }

  const uniqueRiskFactors = useMemo(() => {
    if (!app) return []

    const factors: string[] = []

    // Add rationale reasons first
    if (app.rationale?.reasons) {
      app.rationale.reasons.forEach((r) => {
        factors.push(r.text)
      })
    }

    // Add conditional factors only if not already present
    if (app.users.length === 1) {
      const lowAdoptionText = "Low adoption (single user) — potential targeted install."
      const similarExists = factors.some(
        (f) =>
          f.toLowerCase().includes("single user") ||
          f.toLowerCase().includes("unique to") ||
          f.toLowerCase().includes("low adoption"),
      )
      if (!similarExists) {
        factors.push(lowAdoptionText)
      }
    }

    if (app.tags.includes("New App")) {
      const newAppText = "Recently first seen — anomalous timing."
      const similarExists = factors.some(
        (f) =>
          f.toLowerCase().includes("anomalous timing") ||
          f.toLowerCase().includes("first seen") ||
          f.toLowerCase().includes("recently"),
      )
      if (!similarExists) {
        factors.push(newAppText)
      }
    }

    return factors
  }, [app])

  if (!app) return null

  const scopeGroups = groupScopes(app.scopes)

  return (
    <Drawer open={localOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="h-full p-0 max-w-xl">
        {isCISO && (
          <div className="px-6 pt-4">
            <Alert
              className="border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
              data-testid="ciso-banner-drawer"
            >
              <AlertDescription className="text-blue-900 dark:text-blue-300 font-medium text-sm">
                📋 Read-only view (CISO). Only SecOps can perform actions.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DrawerHeader className="sticky top-0 z-10 bg-card/90 backdrop-blur border-b border-border shadow-sm px-6 py-4">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex-1 min-w-0">
              <DrawerTitle
                ref={titleRef}
                tabIndex={-1}
                data-testid="drawer-title"
                className="text-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                {app.name}
              </DrawerTitle>
              <div className="mt-1 text-xs text-muted-foreground">
                {app.publisher} • {app.category}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <RiskPill level={app.riskLevel} />
                <Badge variant="secondary" className="text-xs">
                  {app.status}
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-start gap-2">
              <div
                className="w-10 h-10 bg-muted rounded border border-border flex items-center justify-center text-muted-foreground text-xs"
                role="img"
                aria-label={`${app.name} logo`}
              >
                Logo
              </div>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  aria-label="Close drawer"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        {isDrawerLoading ? (
          <DrawerSkeleton />
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto pb-24">
            {showSuccessBanner && bannerData && (
              <Alert
                className="border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                role="status"
                aria-live="polite"
              >
                <AlertDescription className="flex items-center justify-between text-green-800 dark:text-green-300">
                  <span className="font-medium">
                    ✓ {bannerData.action} on {bannerData.ts} by {bannerData.actor}
                  </span>
                  <Link href={`/audit?appId=${app.id}`} className="underline hover:opacity-80 font-medium ml-4">
                    View Audit →
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">About</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>{app.description || "No description available."}</div>
                <div className="text-xs text-muted-foreground">
                  First seen {new Date(app.firstSeen).toLocaleDateString()} • Last seen{" "}
                  {new Date(app.lastSeen).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(scopeGroups).map(([group, scopes]) => (
                  <div key={group}>
                    <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                      {group}
                    </div>
                    <ul className="pl-4 list-disc text-sm space-y-1">
                      {scopes.map((s, i) => (
                        <li key={i}>
                          <span className="font-medium">{s.name}</span> — {s.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {app.scopes.length === 0 && (
                  <div className="text-sm text-muted-foreground">No special permissions found.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Top Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  {app.users.slice(0, 8).map((u) => (
                    <li key={u.id}>
                      <span className="font-medium">{u.name}</span> — {u.email} • {u.dept}
                      {u.role ? ` • ${u.role}` : ""}
                    </li>
                  ))}
                  {app.users.length > 8 && (
                    <li className="text-xs text-muted-foreground">{`+${app.users.length - 8} more`}</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {uniqueRiskFactors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card id="ai-explain">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">AI Explanation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {app.rationale?.summary && <div className="text-sm font-medium">{app.rationale.summary}</div>}
                {app.rationale?.reasons && app.rationale.reasons.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Reasons
                    </div>
                    <ol className="list-decimal pl-5 text-sm space-y-1">
                      {app.rationale.reasons.map((r, i) => (
                        <li key={i}>
                          {r.text}
                          {r.citation !== undefined && <sup className="text-primary ml-1">[{r.citation}]</sup>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {app.rationale?.sources && app.rationale.sources.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Sources
                    </div>
                    <ul className="text-sm space-y-1">
                      {app.rationale.sources.map((s, i) => (
                        <li key={i}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            [{i}] {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!app.rationale?.summary && !app.rationale?.reasons?.length && (
                  <div className="text-sm text-muted-foreground">No AI explanation available.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {persona === "SecOps" && (
          <div className="sticky bottom-0 z-10 bg-card/90 backdrop-blur border-t border-border shadow-lg px-6 py-3 flex items-center justify-end gap-2">
            {app.status !== "Revoked" && (
              <Button
                variant="destructive"
                onClick={() => {
                  console.log("[v0] Revoke button clicked")
                  setConfirmOpen(true)
                }}
                aria-label={`Revoke access to ${app.name}`}
              >
                Revoke
              </Button>
            )}
            {app.status !== "Sanctioned" && app.status !== "Revoked" && (
              <Button
                variant="outline"
                onClick={() => {
                  console.log("[v0] Sanction button clicked")
                  sanctionApp(app.id)
                  toast({
                    title: "App Sanctioned",
                    description: `${app.name} has been marked as sanctioned`,
                  })
                }}
                aria-label={`Mark ${app.name} as sanctioned`}
              >
                Mark Sanctioned
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                console.log("[v0] Notify button clicked")
                openFor(app.id)
              }}
              aria-label={`Notify users of ${app.name}`}
            >
              Notify Users
            </Button>

            {app.status === "Revoked" ? (
              <Link href={`/audit?appId=${app.id}`}>
                <Button aria-label={`View audit log for ${app.name}`}>View Audit</Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  console.log("[v0] Prepare Plan button clicked")
                  const url = new URL(window.location.href)
                  url.searchParams.set("plan", app.id)
                  router.push(url.pathname + url.search + url.hash)
                }}
                aria-label={`Prepare remediation plan for ${app.name}`}
              >
                Prepare Plan
              </Button>
            )}
          </div>
        )}

        {isCISO && (
          <div className="sticky bottom-0 z-10 bg-card/90 backdrop-blur border-t border-border shadow-lg px-6 py-3 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Actions disabled for CISO role</span>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block">
                      <Button
                        variant="outline"
                        disabled
                        aria-disabled="true"
                        aria-label="Revoke access (disabled for CISO)"
                        className="cursor-not-allowed opacity-60 bg-transparent"
                      >
                        Revoke
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Only SecOps can perform this action</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block">
                      <Button
                        variant="outline"
                        disabled
                        aria-disabled="true"
                        aria-label="Notify users (disabled for CISO)"
                        className="cursor-not-allowed opacity-60 bg-transparent"
                      >
                        Notify Users
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Only SecOps can perform this action</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block">
                      <Button
                        variant="outline"
                        disabled
                        aria-disabled="true"
                        aria-label="Prepare plan (disabled for CISO)"
                        className="cursor-not-allowed opacity-60 bg-transparent"
                      >
                        Prepare Plan
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Only SecOps can perform this action</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Link href={`/audit?appId=${app.id}`}>
                <Button aria-label={`View audit log for ${app.name}`}>View Audit</Button>
              </Link>
            </div>
          </div>
        )}

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revoke access to {app.name}?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will remove the app's OAuth permissions for all affected users. You can notify users afterward.
            </p>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  revokeApp(app.id)
                  setConfirmOpen(false)
                  toast({
                    title: "App Revoked",
                    description: `Successfully revoked ${app.name} for all ${app.users.length} users`,
                  })
                }}
              >
                Confirm Revoke
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DrawerContent>
    </Drawer>
  )
}
