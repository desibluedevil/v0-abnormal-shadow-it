"use client"

import { useState, useEffect, useMemo, startTransition, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useShadowStore } from "@/store/shadowStore"
import type { Receipt } from "@/types/shadow-it"
import { nowIso, genId } from "@/utils/helpers"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PlanStep {
  id: number
  title: string
  description: string
  tool: Receipt["tool"]
  status: "pending" | "done"
  receiptId?: string
}

export default function PlanPreview() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const planAppId = useMemo(() => searchParams.get("plan"), [searchParams])

  const { apps, revokeApp, notifyUsers, appendReceipt, persona } = useShadowStore()

  const app = apps.find((a) => a.id === planAppId)

  const [localOpen, setLocalOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (planAppId) {
      console.log("[v0] PlanPreview: Opening modal for planAppId:", planAppId)
      setLocalOpen(true)
    } else {
      setLocalOpen(false)
    }
  }, [planAppId])

  const [steps, setSteps] = useState<PlanStep[]>([
    {
      id: 1,
      title: "Revoke OAuth grants",
      description: "Remove app's OAuth permissions for all affected users via Microsoft Graph API",
      tool: "graph.revokeGrant",
      status: "pending",
    },
    {
      id: 2,
      title: "End active sessions",
      description: "Terminate all active sessions for the app to ensure immediate effect",
      tool: "end.sessions",
      status: "pending",
    },
    {
      id: 3,
      title: "Notify affected users",
      description: "Send email notification to all users informing them of the app revocation",
      tool: "notify.email",
      status: "pending",
    },
    {
      id: 4,
      title: "Create tracking ticket",
      description: "Open a governance ticket in ServiceNow for audit and compliance tracking",
      tool: "ticket.create",
      status: "pending",
    },
  ])

  const approveButtonRef = useRef<HTMLButtonElement>(null)
  const triggerElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (localOpen && !triggerElementRef.current) {
      triggerElementRef.current = document.activeElement as HTMLElement
      console.log("[v0] PlanPreview: Stored trigger element for focus return")
    }
  }, [localOpen])

  useEffect(() => {
    if (localOpen && approveButtonRef.current) {
      const timer = setTimeout(() => {
        approveButtonRef.current?.focus()
        console.log("[v0] PlanPreview: Focused Approve button")
      }, 150)
      return () => clearTimeout(timer)
    } else if (!localOpen && triggerElementRef.current) {
      const timer = setTimeout(() => {
        triggerElementRef.current?.focus()
        console.log("[v0] PlanPreview: Returned focus to trigger element")
        triggerElementRef.current = null
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [localOpen])

  useEffect(() => {
    if (!localOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("[v0] PlanPreview: Esc key pressed, closing modal")
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [localOpen])

  const close = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("plan")
    console.log("[v0] PlanPreview: Closing modal and updating URL")
    startTransition(() => {
      router.replace(url.pathname + (url.search ? url.search : ""), { scroll: false })
    })
    setLocalOpen(false)
  }

  const handleApprove = async () => {
    if (busy || !app) return
    setBusy(true)

    try {
      console.log("[v0] PlanPreview: Starting approval process for", app.id)

      const updatedSteps: PlanStep[] = []

      // Step 1: Revoke OAuth grants
      console.log("[v0] PlanPreview: Step 1 - Revoking app")
      const revokeReceiptId = await revokeApp(app.id, "Sam (SecOps)")
      console.log("[v0] PlanPreview: Created revoke receipt", revokeReceiptId)
      updatedSteps.push({ ...steps[0], status: "done", receiptId: revokeReceiptId })
      setSteps([...updatedSteps, ...steps.slice(1)])
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Step 2: End active sessions
      console.log("[v0] PlanPreview: Step 2 - Ending sessions")
      const sessionReceipt: Receipt = {
        id: genId("session"),
        ts: nowIso(),
        tool: "end.sessions",
        status: "ok",
        details: `Terminated all active sessions for ${app.name}`,
        appId: app.id,
        actor: "Sam (SecOps)",
      }
      appendReceipt(sessionReceipt)
      console.log("[v0] PlanPreview: Created session receipt", sessionReceipt.id)
      updatedSteps.push({ ...steps[1], status: "done", receiptId: sessionReceipt.id })
      setSteps([...updatedSteps, ...steps.slice(2)])
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Step 3: Notify affected users
      console.log("[v0] PlanPreview: Step 3 - Notifying users")
      const notifyResult = await notifyUsers(
        app.id,
        `Access to ${app.name} has been revoked due to security policy`,
        "Sam (SecOps)",
      )
      console.log("[v0] PlanPreview: Created notify receipt", notifyResult.id)
      updatedSteps.push({ ...steps[2], status: "done", receiptId: notifyResult.id })
      setSteps([...updatedSteps, ...steps.slice(3)])
      await new Promise((resolve) => setTimeout(resolve, 400))

      // Step 4: Create tracking ticket
      console.log("[v0] PlanPreview: Step 4 - Creating ticket")
      const ticketReceipt: Receipt = {
        id: genId("ticket"),
        ts: nowIso(),
        tool: "ticket.create",
        status: "ok",
        details: `Created ServiceNow ticket for ${app.name} remediation`,
        appId: app.id,
        actor: "Sam (SecOps)",
      }
      appendReceipt(ticketReceipt)
      console.log("[v0] PlanPreview: Created ticket receipt", ticketReceipt.id)
      updatedSteps.push({ ...steps[3], status: "done", receiptId: ticketReceipt.id })
      setSteps(updatedSteps)
      await new Promise((resolve) => setTimeout(resolve, 300))

      window.dispatchEvent(
        new CustomEvent("plan:approved", {
          detail: { appId: app.id, status: "Revoked", ts: new Date().toISOString() },
        }),
      )

      console.log("[v0] PlanPreview: All steps complete, all should show Done")

      await new Promise((resolve) => setTimeout(resolve, 800))

      console.log("[v0] PlanPreview: Closing modal")
      close()
    } finally {
      setBusy(false)
    }
  }

  const handleClose = () => {
    setSteps((prev) => prev.map((s) => ({ ...s, status: "pending", receiptId: undefined })))
    setBusy(false)
    close()
  }

  if (!planAppId || !app) return null

  const isCISO = persona === "CISO"

  return (
    <Dialog
      open={localOpen}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <DialogContent className="bg-card max-w-2xl">
        <DialogHeader data-testid="plan-dialog-header">
          {busy && steps.filter((s) => s.status === "done").length === 0 ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-6 w-64 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ) : (
            <>
              <DialogTitle className="text-xl font-semibold text-foreground">Remediation Plan: {app.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                This automated agent will execute the following steps to revoke access and notify stakeholders.
              </p>
            </>
          )}
        </DialogHeader>

        <div className="space-y-3 py-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                step.status === "done"
                  ? "bg-green-50 border-green-300"
                  : busy && index === steps.filter((s) => s.status === "done").length
                    ? "bg-blue-50 border-blue-300"
                    : "bg-muted border-border"
              }`}
              role="listitem"
              aria-label={`Step ${step.id}: ${step.title} - ${step.status === "done" ? "completed" : "pending"}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.status === "done"
                    ? "bg-green-600 text-white"
                    : busy && index === steps.filter((s) => s.status === "done").length
                      ? "bg-blue-600 text-white animate-pulse"
                      : "bg-muted-foreground/20 text-muted-foreground"
                }`}
                aria-hidden="true"
              >
                {step.status === "done" ? "✓" : step.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  {step.status === "done" && (
                    <Badge variant="secondary" className="text-xs">
                      Done
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                {step.receiptId && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Receipt: {step.receiptId}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={busy} aria-label="Cancel remediation plan">
            Cancel
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={approveButtonRef}
                  onClick={handleApprove}
                  disabled={busy || isCISO}
                  aria-disabled={busy || isCISO}
                  aria-label={`Approve and execute remediation plan for ${app?.name}`}
                >
                  {busy ? "Executing…" : "Approve & Execute"}
                </Button>
              </TooltipTrigger>
              {isCISO && (
                <TooltipContent>
                  <p className="text-xs">Restricted to SecOps role</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>

        {isCISO && (
          <p className="text-xs text-muted-foreground text-center pb-2" role="status">
            Plan approval is restricted to SecOps role
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
