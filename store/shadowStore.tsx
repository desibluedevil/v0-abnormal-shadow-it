"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import seed from "@/data/seed.json"
import type { ShadowApp, ReviewCase, Receipt, AppStatus, ShadowState, Persona, Filters } from "@/types/shadow-it"
import { toWeekLabel, textMatch, nowIso, genId } from "@/utils/helpers"

const RECEIPTS_KEY = "shadow_it_receipts_v1"
const ALERTS_KEY = "shadow_it_alerts_v1"
const ALERTED_APPS_KEY = "shadow_it_alerted_apps_v1"

function loadReceipts(): Receipt[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(RECEIPTS_KEY)
    return raw ? (JSON.parse(raw) as Receipt[]) : []
  } catch {
    return []
  }
}

function saveReceipts(next: Receipt[]) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(RECEIPTS_KEY, JSON.stringify(next))
  } catch {}
}

function loadAlerts(): {
  email: boolean
  slack: boolean
  riskThreshold: "High" | "Medium" | "Low"
  slackWebhook?: string
} {
  if (typeof window === "undefined")
    return { email: true, slack: false, riskThreshold: "High", slackWebhook: undefined }
  try {
    const raw = localStorage.getItem(ALERTS_KEY)
    return raw ? JSON.parse(raw) : { email: true, slack: false, riskThreshold: "High", slackWebhook: undefined }
  } catch {
    return { email: true, slack: false, riskThreshold: "High", slackWebhook: undefined }
  }
}

function saveAlerts(alerts: {
  email: boolean
  slack: boolean
  riskThreshold: "High" | "Medium" | "Low"
  slackWebhook?: string
}) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
  } catch {}
}

function loadAlertedApps(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(ALERTED_APPS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveAlertedApps(alertedApps: Set<string>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ALERTED_APPS_KEY, JSON.stringify(Array.from(alertedApps)))
  } catch {}
}

const ShadowContext = createContext<ShadowState | null>(null)

export function ShadowStoreProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>("SecOps")
  const [apps, setApps] = useState<ShadowApp[]>((seed as any).apps as ShadowApp[])
  const [cases, setCases] = useState<ReviewCase[]>((seed as any).cases as ReviewCase[])
  const [receipts, setReceipts] = useState<Receipt[]>(loadReceipts())
  const [filters, setFiltersState] = useState<Filters>({ q: "", risk: "All", status: "All", tags: [] })
  const [alerts, setAlertsState] = useState<{
    email: boolean
    slack: boolean
    riskThreshold: "High" | "Medium" | "Low"
    slackWebhook?: string
  }>(loadAlerts())
  const [alertedApps, setAlertedApps] = useState<Set<string>>(loadAlertedApps())

  const kpis = useCallback(() => {
    const totalUnsanctioned = apps.filter((a) => a.status === "Unsanctioned").length
    const highRisk = apps.filter((a) => a.riskLevel === "High" && a.status === "Unsanctioned").length
    const usersInvolved = new Set(
      apps.filter((a) => a.status !== "Revoked").flatMap((a) => a.users.map((u) => u.email)),
    ).size
    const remediated = apps.filter((a) => a.status === "Revoked").length
    return { totalUnsanctioned, highRisk, usersInvolved, remediated }
  }, [apps])

  const riskDistribution = useCallback(() => {
    return {
      high: apps.filter((a) => a.riskLevel === "High" && a.status !== "Revoked").length,
      med: apps.filter((a) => a.riskLevel === "Medium" && a.status !== "Revoked").length,
      low: apps.filter((a) => a.riskLevel === "Low" && a.status !== "Revoked").length,
    }
  }, [apps])

  const weeklyNewApps = useCallback(() => {
    const buckets = new Map<string, number>()
    for (const a of apps) {
      const label = toWeekLabel(new Date(a.firstSeen))
      buckets.set(label, (buckets.get(label) || 0) + 1)
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([week, count]) => ({ week, count }))
  }, [apps])

  const filteredApps = useCallback(() => {
    const q = filters.q.trim().toLowerCase()
    return apps.filter((a) => {
      const matchesQ =
        q.length === 0 || textMatch(a.name, q) || textMatch(a.publisher, q) || a.tags.some((t) => textMatch(t, q))
      const matchesRisk = !filters.risk || filters.risk === "All" || a.riskLevel === filters.risk
      const matchesStatus = !filters.status || filters.status === "All" || a.status === filters.status
      const matchesTags = filters.tags.length === 0 || filters.tags.every((t) => a.tags.includes(t))
      return matchesQ && matchesRisk && matchesStatus && matchesTags
    })
  }, [apps, filters])

  const setFilters = useCallback((f: Partial<Filters>) => {
    setFiltersState((prev) => ({ ...prev, ...f }))
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({ q: "", risk: "All", status: "All", tags: [] })
  }, [])

  const checkAndSendAlerts = useCallback(() => {
    console.log("[v0] Checking for apps that need alerts...")

    // Determine which risk levels trigger alerts based on threshold
    const riskLevelsToAlert: Array<"High" | "Medium" | "Low"> =
      alerts.riskThreshold === "High"
        ? ["High"]
        : alerts.riskThreshold === "Medium"
          ? ["High", "Medium"]
          : ["High", "Medium", "Low"]

    // Find apps that meet criteria and haven't been alerted yet
    const appsNeedingAlert = apps.filter((app) => {
      const meetsRiskThreshold = riskLevelsToAlert.includes(app.riskLevel)
      const isUnsanctioned = app.status === "Unsanctioned"
      const notYetAlerted = !alertedApps.has(app.id)

      return meetsRiskThreshold && isUnsanctioned && notYetAlerted
    })

    console.log("[v0] Found", appsNeedingAlert.length, "apps needing alerts")

    if (appsNeedingAlert.length === 0) return

    const ts = nowIso()
    const newReceipts: Receipt[] = []
    const newAlertedApps = new Set(alertedApps)

    // Create alert receipts for each app
    for (const app of appsNeedingAlert) {
      if (alerts.email) {
        newReceipts.push({
          id: genId("alert_email"),
          ts,
          tool: "notify.email",
          status: "ok",
          details: `Alert: ${app.riskLevel} risk app detected - ${app.name}`,
          appId: app.id,
          actor: "System",
        })
      }

      if (alerts.slack && alerts.slackWebhook) {
        newReceipts.push({
          id: genId("alert_slack"),
          ts,
          tool: "notify.email",
          status: "ok",
          details: `(Slack) Alert: ${app.riskLevel} risk app detected - ${app.name}`,
          appId: app.id,
          actor: "System",
        })
      }

      newAlertedApps.add(app.id)
    }

    if (newReceipts.length > 0) {
      setReceipts((prev) => {
        const next = [...newReceipts, ...prev]
        saveReceipts(next)
        return next
      })

      setAlertedApps(newAlertedApps)
      saveAlertedApps(newAlertedApps)
    }
  }, [apps, alerts, alertedApps])

  useEffect(() => {
    checkAndSendAlerts()
  }, [checkAndSendAlerts])

  const revokeApp = useCallback((appId: string, actor = "Sam (SecOps)") => {
    console.log("[v0] Revoking app:", appId)
    setApps((prev) => {
      const updated = prev.map((a) =>
        a.id === appId ? { ...a, status: "Revoked" as AppStatus, lastSeen: nowIso() } : a,
      )
      console.log("[v0] Apps updated, new status:", updated.find((a) => a.id === appId)?.status)
      return updated
    })
    const receipt: Receipt = {
      id: genId("revoke"),
      ts: nowIso(),
      tool: "graph.revokeGrant",
      status: "ok",
      details: "Simulated OAuth grant removal for all users",
      appId,
      actor,
    }
    setReceipts((prev) => {
      const next = [receipt, ...prev]
      saveReceipts(next)
      return next
    })
    return receipt.id // Return receipt ID for tracking
  }, [])

  const unrevokeApp = useCallback((appId: string, actor = "Sam (SecOps)") => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "Unsanctioned" as AppStatus, lastSeen: nowIso() } : a)),
    )
    const receipt: Receipt = {
      id: genId("unrevoke"),
      ts: nowIso(),
      tool: "graph.restoreGrant",
      status: "ok",
      details: "Restored access for all users",
      appId,
      actor,
    }
    setReceipts((prev) => [receipt, ...prev])
  }, [])

  const sanctionApp = useCallback((appId: string, actor = "Sam (SecOps)") => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "Sanctioned" as AppStatus, lastSeen: nowIso() } : a)),
    )
    const receipt: Receipt = {
      id: genId("sanction"),
      ts: nowIso(),
      tool: "ticket.create",
      status: "ok",
      details: "Marked as sanctioned; created governance ticket",
      appId,
      actor,
    }
    setReceipts((prev) => {
      const next = [receipt, ...prev]
      saveReceipts(next)
      return next
    })
    return receipt.id // Return for tracking
  }, [])

  const unsanctionApp = useCallback((appId: string, actor = "Sam (SecOps)") => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "Unsanctioned" as AppStatus, lastSeen: nowIso() } : a)),
    )
    const receipt: Receipt = {
      id: genId("unsanction"),
      ts: nowIso(),
      tool: "ticket.update",
      status: "ok",
      details: "Removed sanction status",
      appId,
      actor,
    }
    setReceipts((prev) => [receipt, ...prev])
  }, [])

  const dismissApp = useCallback((appId: string, actor = "Sam (SecOps)") => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "Dismissed" as AppStatus, lastSeen: nowIso() } : a)),
    )
    const receipt: Receipt = {
      id: genId("dismiss"),
      ts: nowIso(),
      tool: "ticket.create",
      status: "ok",
      details: "Dismissed from review queue",
      appId,
      actor,
    }
    setReceipts((prev) => {
      const next = [receipt, ...prev]
      saveReceipts(next)
      return next
    })
    return receipt.id // Return for tracking
  }, [])

  const undismissApp = useCallback((appId: string, actor = "Sam (SecOps)") => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "Unsanctioned" as AppStatus, lastSeen: nowIso() } : a)),
    )
    const receipt: Receipt = {
      id: genId("undismiss"),
      ts: nowIso(),
      tool: "ticket.update",
      status: "ok",
      details: "Restored from dismissed status",
      appId,
      actor,
    }
    setReceipts((prev) => [receipt, ...prev])
  }, [])

  const notifyUsers = useCallback(async (appId: string, message: string, actor = "Sam (SecOps)") => {
    const ts = nowIso()
    const id = genId("notify")

    setReceipts((prev) => {
      const receipt: Receipt = {
        id,
        ts,
        tool: "notify.email",
        status: "ok",
        details: `Sent notification: ${message.slice(0, 120)}…`,
        appId,
        actor,
      }
      const next = [receipt, ...prev]
      saveReceipts(next)
      return next
    })

    // Dispatch event for QA harness
    try {
      window.dispatchEvent(new CustomEvent("notify:sent", { detail: { appId, id, ts } }))
    } catch {}

    return { ok: true, id, ts }
  }, [])

  const appendReceipt = useCallback((r: Receipt) => {
    setReceipts((prev) => {
      const next = [r, ...prev]
      saveReceipts(next)
      return next
    })
  }, [])

  const seedReceiptsIfEmpty = useCallback(() => {
    if (receipts.length > 0) return
    const ts = nowIso()
    const demoApp = apps.find((a) => a.id === "app_calendarsync") || apps[0]
    if (!demoApp) return
    const base: Receipt[] = [
      {
        id: "revoke_seed",
        ts,
        tool: "graph.revokeGrant",
        status: "ok",
        details: `Seed revoke for ${demoApp.name}`,
        appId: demoApp.id,
        actor: "Seeder",
      },
      {
        id: "end_seed",
        ts,
        tool: "end.sessions",
        status: "ok",
        details: "Seed end sessions",
        appId: demoApp.id,
        actor: "Seeder",
      },
      {
        id: "notify_seed",
        ts,
        tool: "notify.email",
        status: "ok",
        details: "Seed notify users",
        appId: demoApp.id,
        actor: "Seeder",
      },
      {
        id: "ticket_seed",
        ts,
        tool: "ticket.create",
        status: "ok",
        details: "Seed ticket for audit",
        appId: demoApp.id,
        actor: "Seeder",
      },
    ]
    const next = [...base, ...receipts]
    saveReceipts(next)
    setReceipts(next)
  }, [receipts, apps])

  const clearReceipts = useCallback(() => {
    saveReceipts([])
    setReceipts([])
  }, [])

  const ttrSeries = useCallback(() => {
    // Find all revoke receipts
    const revokeReceipts = receipts.filter((r) => r.tool === "graph.revokeGrant")

    // Take last 10
    const last10 = revokeReceipts.slice(0, 10)

    // Compute TTR for each
    return last10
      .map((receipt) => {
        const app = apps.find((a) => a.id === receipt.appId)
        if (!app) return null

        // Start time is firstSeen
        const startTs = new Date(app.firstSeen).getTime()
        const revokeTs = new Date(receipt.ts).getTime()

        // Compute hours, cap to >= 0
        const hours = Math.max(0, (revokeTs - startTs) / 3600000)

        return { ts: receipt.ts, hours }
      })
      .filter((item): item is { ts: string; hours: number } => item !== null)
      .reverse() // Show chronological order for sparkline
  }, [receipts, apps])

  const setAlerts = useCallback(
    (
      partial: Partial<{
        email: boolean
        slack: boolean
        riskThreshold: "High" | "Medium" | "Low"
        slackWebhook?: string
      }>,
    ) => {
      setAlertsState((prev) => {
        const next = { ...prev, ...partial }
        saveAlerts(next)
        return next
      })
    },
    [],
  )

  const sendTestAlert = useCallback(() => {
    const app = apps.find((a) => a.id === "app_sketchymail") || apps[0]
    if (!app) return

    const ts = nowIso()
    const recs: Receipt[] = []

    if (alerts.email) {
      recs.push({
        id: genId("test_email"),
        ts,
        tool: "notify.email",
        status: "ok",
        details: `Test alert for ${app.name}`,
        appId: app.id,
        actor: "System",
      })
    }

    if (alerts.slack) {
      recs.push({
        id: genId("test_slack"),
        ts,
        tool: "notify.email",
        status: "ok",
        details: `(Slack) Test alert for ${app.name}`,
        appId: app.id,
        actor: "System",
      })
    }

    setReceipts((prev) => {
      const next = [...recs, ...prev]
      saveReceipts(next)
      return next
    })
  }, [alerts, apps])

  const value: ShadowState = {
    persona,
    apps,
    cases,
    receipts,
    filters,
    alerts,
    kpis,
    riskDistribution,
    weeklyNewApps,
    filteredApps,
    ttrSeries,
    setPersona,
    setFilters,
    clearFilters,
    setAlerts,
    revokeApp,
    unrevokeApp,
    sanctionApp,
    unsanctionApp,
    dismissApp,
    undismissApp,
    notifyUsers,
    appendReceipt,
    seedReceiptsIfEmpty,
    clearReceipts,
    sendTestAlert,
  }

  return <ShadowContext.Provider value={value}>{children}</ShadowContext.Provider>
}

export function useShadowStore() {
  const context = useContext(ShadowContext)
  if (!context) {
    throw new Error("useShadowStore must be used within ShadowStoreProvider")
  }
  return context
}
