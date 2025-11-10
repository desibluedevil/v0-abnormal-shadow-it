"use client"

import { useEffect, useMemo, useState, useRef, memo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  X,
  Shield,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Mail,
  FileText,
  Copy,
  Lock,
  Sparkles,
} from "lucide-react"
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

const RiskPill = memo(function RiskPill({ level }: { level: ShadowApp["riskLevel"] }) {
  const cls =
    level === "High"
      ? "bg-[#FF4D4D] text-white border border-[#FF4D4D]"
      : level === "Medium"
        ? "bg-[#FFB02E] text-white border border-[#FFB02E]"
        : "bg-[#39D98A] text-white border border-[#39D98A]"
  return <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${cls} shadow-sm`}>{level} Risk</span>
})

const StatusPill = memo(function StatusPill({ status }: { status: ShadowApp["status"] }) {
  const cls =
    status === "Revoked"
      ? "bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30"
      : status === "Sanctioned"
        ? "bg-[#39D98A]/10 text-[#39D98A] border border-[#39D98A]/30"
        : status === "Dismissed"
          ? "bg-muted text-muted-foreground border border-border"
          : "bg-[#FFB02E]/10 text-[#FFB02E] border border-[#FFB02E]/30"
  return <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${cls}`}>{status}</span>
})

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

  const copyEmails = () => {
    const emails = app.users.map((u) => u.email).join(", ")
    navigator.clipboard.writeText(emails)
    toast({
      title: "Emails copied",
      description: `Copied ${app.users.length} email addresses to clipboard`,
    })
  }

  return (
    <Drawer open={localOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="h-full p-0 bg-[#0B0F12] max-w-2xl border-l border-[#47D7FF]/20">
        {isCISO && (
          <div className="px-6 pt-4">
            <Alert className="border-[#47D7FF]/30 bg-[#47D7FF]/10" data-testid="ciso-banner-drawer">
              <AlertDescription className="text-[#47D7FF] font-medium text-sm flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Read-only view (CISO). Only SecOps can perform actions.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DrawerHeader className="sticky top-0 z-10 bg-[#0B0F12]/95 backdrop-blur-md border-b border-[#47D7FF]/20 shadow-[0_2px_16px_rgba(0,0,0,0.35)] px-6 py-4">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div
                className="w-12 h-12 bg-[#12171C] rounded-lg border border-[#47D7FF]/30 flex items-center justify-center text-[#47D7FF] text-lg font-bold flex-shrink-0 shadow-[0_0_12px_rgba(71,215,255,0.15)]"
                role="img"
                aria-label={`${app.name} logo`}
              >
                {app.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <DrawerTitle
                  ref={titleRef}
                  tabIndex={-1}
                  data-testid="drawer-title"
                  className="text-xl font-bold text-[#E9EEF2] focus:outline-none focus:ring-2 focus:ring-[#47D7FF] focus:ring-offset-2 focus:ring-offset-[#0B0F12] rounded mb-1"
                >
                  {app.name}
                </DrawerTitle>
                <div className="text-sm text-[#A7B0B8] mb-3">
                  {app.publisher} • {app.category}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskPill level={app.riskLevel} />
                  <StatusPill status={app.status} />
                </div>
              </div>
            </div>

            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-[#12171C] hover:text-[#47D7FF] text-[#A7B0B8] transition-colors flex-shrink-0"
                aria-label="Close drawer"
                type="button"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {isDrawerLoading ? (
          <DrawerSkeleton />
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto bg-[#0B0F12] pb-24">
            {showSuccessBanner && bannerData && (
              <Alert className="border-[#39D98A]/30 bg-[#39D98A]/10" role="status" aria-live="polite">
                <AlertDescription className="flex items-center justify-between text-[#39D98A]">
                  <span className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {bannerData.action} on {bannerData.ts} by {bannerData.actor}
                  </span>
                  <Link href={`/audit?appId=${app.id}`} className="underline hover:text-[#39D98A]/80 font-medium ml-4">
                    View Audit →
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <Card className="bg-[#12171C] border border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-[#E9EEF2] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#47D7FF]" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[#A7B0B8] space-y-3">
                <p className="leading-relaxed">{app.about || app.description || "No description available."}</p>
                <div className="flex items-center gap-4 text-xs text-[#A7B0B8] pt-2 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    First seen {new Date(app.firstSeen).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last seen {new Date(app.lastSeen).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#12171C] border border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-[#E9EEF2] flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#47D7FF]" />
                  Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.scopes.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {app.scopes.map((s, i) => (
                        <TooltipProvider key={i}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="bg-[#0B0F12] border border-border/50 text-[#E9EEF2] hover:border-[#47D7FF]/30 cursor-help transition-colors"
                              >
                                {s.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">{s.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-[#A7B0B8]">(none special)</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#12171C] border border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-[#E9EEF2] flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#47D7FF]" />
                    Top Users
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyEmails}
                    className="h-8 text-xs text-[#47D7FF] hover:text-[#47D7FF] hover:bg-[#47D7FF]/10"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Emails
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {app.topUsers ? (
                  <p className="text-sm text-[#E9EEF2] leading-relaxed">{app.topUsers}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {app.users.slice(0, 8).map((u) => (
                      <TooltipProvider key={u.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="bg-[#0B0F12] border-border/50 text-[#E9EEF2] hover:border-[#47D7FF]/30 cursor-help transition-colors"
                            >
                              {u.name}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs font-medium">{u.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {u.dept}
                              {u.role ? ` • ${u.role}` : ""}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {app.users.length > 8 && (
                      <Badge variant="secondary" className="bg-[#0B0F12] border border-border/50 text-[#A7B0B8]">
                        +{app.users.length - 8} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#12171C] border border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-[#E9EEF2] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#FFB02E]" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {app.riskFactors ? (
                  <p className="text-sm text-[#A7B0B8] leading-relaxed">{app.riskFactors}</p>
                ) : (
                  <ul className="space-y-2">
                    {uniqueRiskFactors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#A7B0B8]">
                        <Shield className="h-4 w-4 text-[#FF4D4D] mt-0.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card
              id="ai-explain"
              className="bg-[#12171C] border border-[#47D7FF]/30 shadow-[0_0_12px_rgba(71,215,255,0.1)]"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-[#E9EEF2] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#47D7FF]" />
                  AI Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.aiExplanation ? (
                  <p className="text-sm text-[#E9EEF2] leading-relaxed font-medium bg-[#47D7FF]/5 p-3 rounded-lg border border-[#47D7FF]/20">
                    {app.aiExplanation}
                  </p>
                ) : app.rationale?.summary ? (
                  <p className="text-sm text-[#E9EEF2] leading-relaxed font-medium bg-[#47D7FF]/5 p-3 rounded-lg border border-[#47D7FF]/20">
                    {app.rationale.summary}
                  </p>
                ) : (
                  <div className="text-sm text-[#A7B0B8]">No AI explanation available.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {persona === "SecOps" && (
          <div className="sticky bottom-0 z-10 bg-[#0B0F12]/95 backdrop-blur-md border-t border-[#47D7FF]/20 shadow-[0_-2px_16px_rgba(0,0,0,0.35)] px-6 py-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-[#A7B0B8]">Actions</div>
              <div className="flex items-center gap-2 flex-wrap">
                {app.status !== "Revoked" ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmOpen(true)}
                    className="bg-[#FF4D4D] hover:bg-[#FF4D4D]/90 shadow-[0_0_8px_rgba(255,77,77,0.3)]"
                    aria-label={`Revoke access to ${app.name}`}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Revoke
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button variant="destructive" size="sm" disabled className="cursor-not-allowed opacity-50">
                            <Ban className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">App is already revoked</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {app.status !== "Sanctioned" && app.status !== "Revoked" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      sanctionApp(app.id)
                      toast({
                        title: "App Sanctioned",
                        description: `${app.name} has been marked as sanctioned`,
                      })
                    }}
                    className="bg-[#12171C] hover:bg-[#12171C]/80 border border-border/50"
                    aria-label={`Mark ${app.name} as sanctioned`}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Mark Sanctioned
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button variant="secondary" size="sm" disabled className="cursor-not-allowed opacity-50">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark Sanctioned
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {app.status === "Sanctioned" ? "App is already sanctioned" : "Cannot sanction a revoked app"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openFor(app.id)}
                  className="bg-[#12171C] hover:bg-[#12171C]/80 border border-border/50"
                  aria-label={`Notify users of ${app.name}`}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Notify Users
                </Button>

                {app.status === "Revoked" ? (
                  <Link href={`/audit?appId=${app.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-[#47D7FF] hover:bg-[#47D7FF]/90 text-[#0B0F12] shadow-[0_0_12px_rgba(71,215,255,0.3)]"
                      aria-label={`View audit log for ${app.name}`}
                    >
                      View Audit
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const url = new URL(window.location.href)
                      url.searchParams.set("plan", app.id)
                      router.push(url.pathname + url.search + url.hash)
                    }}
                    className="bg-[#12171C] hover:bg-[#12171C]/80 border border-border/50"
                    aria-label={`Prepare remediation plan for ${app.name}`}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Prepare Plan
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {isCISO && (
          <div className="sticky bottom-0 z-10 bg-[#0B0F12]/95 backdrop-blur-md border-t border-[#47D7FF]/20 shadow-[0_-2px_16px_rgba(0,0,0,0.35)] px-6 py-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-[#A7B0B8]">Actions disabled for CISO role</span>
              <div className="flex items-center gap-2 flex-wrap">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="destructive" size="sm" disabled className="cursor-not-allowed opacity-50">
                          <Ban className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">Only SecOps can perform this action</p>
                      <p className="text-xs text-muted-foreground mt-1">Required: SecOps role</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="secondary" size="sm" disabled className="cursor-not-allowed opacity-50">
                          <Mail className="h-4 w-4 mr-1" />
                          Notify Users
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">Only SecOps can perform this action</p>
                      <p className="text-xs text-muted-foreground mt-1">Required: SecOps role</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="secondary" size="sm" disabled className="cursor-not-allowed opacity-50">
                          <FileText className="h-4 w-4 mr-1" />
                          Prepare Plan
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">Only SecOps can perform this action</p>
                      <p className="text-xs text-muted-foreground mt-1">Required: SecOps role</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Link href={`/audit?appId=${app.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#47D7FF] hover:bg-[#47D7FF]/90 text-[#0B0F12] shadow-[0_0_12px_rgba(71,215,255,0.3)]"
                    aria-label={`View audit log for ${app.name}`}
                  >
                    View Audit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="bg-[#12171C] border-2 border-[#FF4D4D]/30">
            <DialogHeader>
              <DialogTitle className="text-[#E9EEF2] flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#FF4D4D]" />
                Revoke access to {app.name}?
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[#A7B0B8] leading-relaxed">
              This will remove the app's OAuth permissions for all affected users. You can notify users afterward.
            </p>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setConfirmOpen(false)}
                className="bg-[#0B0F12] hover:bg-[#0B0F12]/80 border border-border/50"
              >
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
                className="bg-[#FF4D4D] hover:bg-[#FF4D4D]/90 shadow-[0_0_8px_rgba(255,77,77,0.3)]"
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
