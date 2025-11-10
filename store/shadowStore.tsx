"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { ShadowApp, ReviewCase, Receipt, AppStatus, ShadowState, Persona, Filters } from "@/types/shadow-it"
import { toWeekLabel, textMatch, nowIso, genId } from "@/utils/helpers"

const RECEIPTS_KEY = "shadow_it_receipts_v1"
const ALERTS_KEY = "shadow_it_alerts_v1"
const ALERTED_APPS_KEY = "shadow_it_alerted_apps_v1"

const seedData = {
  apps: [
    {
      id: "app_sketchymail",
      name: "SketchyMailApp",
      publisher: "Unknown Vendor",
      category: "Utilities",
      riskScore: 92,
      riskLevel: "High",
      scopes: [
        { name: "Mail.Read", description: "Read user mail", riskTag: "Mail" },
        { name: "Files.Read.All", description: "Read files in all site collections", riskTag: "Files" },
      ],
      users: [{ id: "u_cfo", name: "Alex Rivera", email: "alex.rivera@example.com", dept: "Exec", role: "CFO" }],
      firstSeen: "2025-01-05T08:15:23Z",
      lastSeen: "2025-01-09T16:42:11Z",
      status: "Unsanctioned",
      tags: ["OAuth", "Exec", "New App", "Malicious Pattern"],
      description: "Third-party mail helper with broad access.",
      rationale: {
        summary: "High-risk OAuth app with organization-wide read scopes, installed by an executive.",
        reasons: [
          { text: "Has access to read all organization files via Files.Read.All", citation: 1 },
          { text: "Unique to CFO account — possible targeted attack", citation: 0 },
          { text: "First seen this week — anomalous timing" },
        ],
        sources: [
          {
            title: "Internal anomaly rule: unique high-privilege grant",
            url: "https://example.internal/rules/unique-grant",
          },
          {
            title: "Microsoft Graph Scopes — Files.Read.All",
            url: "https://learn.microsoft.com/graph/permissions-reference",
          },
        ],
      },
    },
    {
      id: "app_calendarsync",
      name: "CalendarSync",
      publisher: "Calendr LLC",
      category: "Productivity",
      riskScore: 84,
      riskLevel: "High",
      scopes: [{ name: "Calendars.ReadWrite", description: "Read and write calendars", riskTag: "Calendar" }],
      users: [
        { id: "u_1", name: "Priya Shah", email: "priya.shah@example.com", dept: "Engineering" },
        { id: "u_2", name: "Miguel Santos", email: "miguel.santos@example.com", dept: "Sales" },
        { id: "u_3", name: "Jamie Chen", email: "jamie.chen@example.com", dept: "Finance" },
        { id: "u_12", name: "Taylor Kim", email: "taylor.kim@example.com", dept: "Marketing" },
        { id: "u_13", name: "Jordan Lee", email: "jordan.lee@example.com", dept: "Sales" },
        { id: "u_14", name: "Casey Morgan", email: "casey.morgan@example.com", dept: "Engineering" },
        { id: "u_15", name: "Riley Brooks", email: "riley.brooks@example.com", dept: "Finance" },
      ],
      firstSeen: "2024-12-28T11:23:45Z",
      lastSeen: "2025-01-08T19:17:33Z",
      status: "Unsanctioned",
      tags: ["OAuth", "New App"],
      description: "Cross-device calendar sync with write access.",
      rationale: {
        summary: "Elevated risk due to write permissions and growing adoption.",
        reasons: [{ text: "Can modify calendars across multiple users" }, { text: "Rapid adoption within one week" }],
        sources: [
          {
            title: "Microsoft Graph Scopes — Calendars.ReadWrite",
            url: "https://learn.microsoft.com/graph/permissions-reference",
          },
        ],
      },
    },
    {
      id: "app_dropbox",
      name: "Dropbox",
      publisher: "Dropbox Inc.",
      category: "Storage",
      riskScore: 55,
      riskLevel: "Medium",
      scopes: [{ name: "Files.Read", description: "Read user files", riskTag: "Files" }],
      users: [
        { id: "u_4", name: "Sara Ali", email: "sara.ali@example.com", dept: "Marketing" },
        { id: "u_5", name: "Leo Park", email: "leo.park@example.com", dept: "Marketing" },
        { id: "u_6", name: "Nina Patel", email: "nina.patel@example.com", dept: "Sales" },
        { id: "u_7", name: "Ken Adams", email: "ken.adams@example.com", dept: "Sales" },
        { id: "u_8", name: "Ivy Zhang", email: "ivy.zhang@example.com", dept: "Engineering" },
        { id: "u_16", name: "Alex Martinez", email: "alex.martinez@example.com", dept: "Marketing" },
        { id: "u_17", name: "Sam Rivera", email: "sam.rivera@example.com", dept: "Sales" },
        { id: "u_18", name: "Dana Wilson", email: "dana.wilson@example.com", dept: "Marketing" },
        { id: "u_19", name: "Morgan Bailey", email: "morgan.bailey@example.com", dept: "Engineering" },
        { id: "u_20", name: "Quinn Foster", email: "quinn.foster@example.com", dept: "Sales" },
        { id: "u_21", name: "Avery Cooper", email: "avery.cooper@example.com", dept: "Marketing" },
        { id: "u_22", name: "Blake Turner", email: "blake.turner@example.com", dept: "Sales" },
        { id: "u_23", name: "Cameron Hayes", email: "cameron.hayes@example.com", dept: "Engineering" },
        { id: "u_24", name: "Drew Phillips", email: "drew.phillips@example.com", dept: "Marketing" },
        { id: "u_25", name: "Ellis Campbell", email: "ellis.campbell@example.com", dept: "Sales" },
      ],
      firstSeen: "2024-09-24T10:08:17Z",
      lastSeen: "2025-01-07T15:32:48Z",
      status: "Unsanctioned",
      tags: ["OAuth", "Collaboration"],
      description: "Cloud storage app — potential data egress.",
      rationale: {
        summary: "Moderate risk due to external storage and multi-team adoption.",
        reasons: [
          { text: "External storage enables off-tenant data movement" },
          { text: "Adoption across Marketing and Sales" },
        ],
        sources: [],
      },
    },
    {
      id: "app_notion",
      name: "Notion",
      publisher: "Notion Labs",
      category: "Productivity",
      riskScore: 48,
      riskLevel: "Medium",
      scopes: [{ name: "Files.Read", description: "Read user files", riskTag: "Files" }],
      users: [
        { id: "u_9", name: "Olivia Turner", email: "olivia.turner@example.com", dept: "Marketing" },
        { id: "u_10", name: "Mark Liu", email: "mark.liu@example.com", dept: "Marketing" },
        { id: "u_26", name: "Finley Reed", email: "finley.reed@example.com", dept: "Marketing" },
        { id: "u_27", name: "Harper Stone", email: "harper.stone@example.com", dept: "Marketing" },
        { id: "u_28", name: "Indigo Price", email: "indigo.price@example.com", dept: "Engineering" },
        { id: "u_29", name: "Jade Bennett", email: "jade.bennett@example.com", dept: "Marketing" },
        { id: "u_30", name: "Kai Sullivan", email: "kai.sullivan@example.com", dept: "Marketing" },
        { id: "u_31", name: "Lane Fisher", email: "lane.fisher@example.com", dept: "Sales" },
        { id: "u_32", name: "Mari Webb", email: "mari.webb@example.com", dept: "Marketing" },
      ],
      firstSeen: "2024-07-15T09:34:52Z",
      lastSeen: "2025-01-06T17:21:09Z",
      status: "Unsanctioned",
      tags: ["Collaboration"],
      description: "Workspace tool for notes and docs.",
      rationale: {
        summary: "Medium risk collaboration tool used by Marketing.",
        reasons: [{ text: "External docs repository used by multiple users" }],
        sources: [],
      },
    },
    {
      id: "app_zoom",
      name: "Zoom",
      publisher: "Zoom Video Communications",
      category: "Communication",
      riskScore: 15,
      riskLevel: "Low",
      scopes: [],
      users: [
        { id: "u_11", name: "Brian Holt", email: "brian.holt@example.com", dept: "Engineering" },
        { id: "u_33", name: "Noel Carter", email: "noel.carter@example.com", dept: "Sales" },
        { id: "u_34", name: "Ocean James", email: "ocean.james@example.com", dept: "Marketing" },
        { id: "u_35", name: "Parker Ross", email: "parker.ross@example.com", dept: "Finance" },
        { id: "u_36", name: "Quinn Davis", email: "quinn.davis@example.com", dept: "HR" },
        { id: "u_37", name: "Reese Bell", email: "reese.bell@example.com", dept: "Engineering" },
        { id: "u_38", name: "Sage Murphy", email: "sage.murphy@example.com", dept: "Sales" },
        { id: "u_39", name: "Tate Collins", email: "tate.collins@example.com", dept: "Marketing" },
        { id: "u_40", name: "Uma Stewart", email: "uma.stewart@example.com", dept: "Engineering" },
        { id: "u_41", name: "Val Morris", email: "val.morris@example.com", dept: "Finance" },
        { id: "u_42", name: "West Rogers", email: "west.rogers@example.com", dept: "Sales" },
        { id: "u_43", name: "Xen Powell", email: "xen.powell@example.com", dept: "HR" },
        { id: "u_44", name: "Yael Cruz", email: "yael.cruz@example.com", dept: "Marketing" },
        { id: "u_45", name: "Zion Gray", email: "zion.gray@example.com", dept: "Engineering" },
        { id: "u_46", name: "Ash Perry", email: "ash.perry@example.com", dept: "Sales" },
        { id: "u_47", name: "Bay Russell", email: "bay.russell@example.com", dept: "Finance" },
        { id: "u_48", name: "Cam Hughes", email: "cam.hughes@example.com", dept: "Marketing" },
        { id: "u_49", name: "Dev Flores", email: "dev.flores@example.com", dept: "Engineering" },
        { id: "u_50", name: "Echo Sanders", email: "echo.sanders@example.com", dept: "HR" },
        { id: "u_51", name: "Fox Jenkins", email: "fox.jenkins@example.com", dept: "Sales" },
        { id: "u_52", name: "Gene Patterson", email: "gene.patterson@example.com", dept: "Marketing" },
        { id: "u_53", name: "Hollis Bryant", email: "hollis.bryant@example.com", dept: "Engineering" },
      ],
      firstSeen: "2024-01-08T00:12:34Z",
      lastSeen: "2025-01-04T10:45:18Z",
      status: "Unsanctioned",
      tags: ["OAuth"],
      description: "Video conferencing app with widespread adoption.",
      rationale: {
        summary: "Low risk communication app with broad organizational usage.",
        reasons: [{ text: "Widely used across all departments" }],
        sources: [],
      },
    },
  ] as ShadowApp[],
  cases: [
    {
      id: "case_sketchymail",
      appId: "app_sketchymail",
      priority: "P0",
      confidence: 0.92,
      impact: 0.9,
      tags: ["Exec", "Broad Scopes", "New App"],
      timeline: [
        { ts: "2025-01-05T08:17:15Z", event: "Grant detected for CFO account" },
        { ts: "2025-01-06T09:23:41Z", event: "Risk score computed: 92 (High)" },
      ],
      recommendations: ["Revoke OAuth grant", "End active sessions", "Notify affected user", "Create tracking ticket"],
    },
    {
      id: "case_calendarsync",
      appId: "app_calendarsync",
      priority: "P1",
      confidence: 0.8,
      impact: 0.7,
      tags: ["Write Scope", "New App"],
      timeline: [
        { ts: "2024-12-28T11:24:52Z", event: "First grant observed" },
        { ts: "2025-01-08T19:18:06Z", event: "7 users affected" },
      ],
      recommendations: ["Revoke OAuth grant for all affected users", "Notify users", "Create tracking ticket"],
    },
  ] as ReviewCase[],
}

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
  console.log("[v0] ShadowStoreProvider initializing...")
  console.log("[v0] Seed data:", seedData)

  const [persona, setPersona] = useState<Persona>("SecOps")
  const [apps, setApps] = useState<ShadowApp[]>(seedData.apps)
  const [cases, setCases] = useState<ReviewCase[]>(seedData.cases)
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
    // Generate week labels for the last 12 weeks (W40-W51)
    const today = new Date()
    const weeks = []

    for (let i = 11; i >= 0; i--) {
      const weekDate = new Date(today)
      weekDate.setDate(today.getDate() - i * 7)
      weeks.push(toWeekLabel(weekDate))
    }

    const data = [3, 4, 4, 5, 4, 3, 4, 5, 6, 4, 5, 5]

    return weeks.map((week, index) => ({
      week,
      count: data[index],
    }))
  }, [])

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
    const data = [12.4, 10.1, 8.7, 7.9, 12.0, 11.2, 9.8, 8.5, 7.7, 9.3, 8.9, 7.6, 8.2, 7.8]

    // Generate timestamps for last 14 days
    const now = new Date()
    return data.map((hours, index) => {
      const date = new Date(now)
      date.setDate(now.getDate() - (13 - index)) // 13 days ago to today
      return {
        ts: date.toISOString(),
        hours,
      }
    })
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
