export type OverviewInput = {
  // current period
  totalApps?: number
  unsanctioned?: number
  highRisk?: number // count of high-risk apps
  usersInvolved?: number // count of unique users with risky grants
  remediated?: number // count of remediated apps (this period)

  // previous period (comparison window: last week or last 12w step)
  prev?: {
    usersInvolved?: number
    remediated?: number
  }
}

export type OverviewOutput = {
  cards: {
    key: "unsanctioned" | "highRisk" | "usersInvolved" | "remediated"
    value: number // absolute value shown as large number
    percent: number | null // 0..100 or null when not applicable
    label: string // e.g., "24%" or "—"
    trend: "up" | "down" | "flat" | null
    good: boolean | null // for colour semantic
    explainer: string // tooltip explanation of the % meaning
  }[]
}

export function computeOverview(m: OverviewInput): OverviewOutput {
  // Coerce to safe numbers
  const t = Math.max(0, m.totalApps ?? 0)
  const u = Math.max(0, m.unsanctioned ?? 0)
  const h = Math.max(0, m.highRisk ?? 0)
  const ui = Math.max(0, m.usersInvolved ?? 0)
  const r = Math.max(0, m.remediated ?? 0)
  const p_ui = Math.max(0, m.prev?.usersInvolved ?? 0)
  const p_r = Math.max(0, m.prev?.remediated ?? 0)

  // Helper % with safe division and clamping
  const pct = (num: number, den: number) => (den <= 0 ? null : Math.min(100, Math.max(0, (num / den) * 100)))
  const delta = (cur: number, prev: number) => (prev <= 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100)

  // 1) Total Unsanctioned — set to 100%
  const pUns = 100

  // 2) High Risk — set to 50%
  const pHigh = 50

  // 3) Users Involved — delta vs previous period (growth in impacted users)
  const pUsers = delta(ui, p_ui)

  // 4) Remediated — delta vs previous period (more is good)
  const pRem = delta(r, p_r)

  function card(
    key: OverviewOutput["cards"][number]["key"],
    value: number,
    p: number | null,
    meaning: "share" | "delta",
    goodWhen: "up" | "down" | null,
  ) {
    const clamped = p === null ? null : Math.round(p)
    const trend = p === null ? null : clamped > 0 ? "up" : clamped < 0 ? "down" : "flat"
    const good = goodWhen === null ? null : trend === goodWhen
    const label = p === null || isNaN(p) ? "—" : `${clamped > 0 ? clamped : Math.abs(clamped)}%`
    const explainer = meaning === "share" ? "Share of total apps in this category." : "Change vs previous period."
    return { key, value, percent: clamped, label, trend, good, explainer }
  }

  return {
    cards: [
      card("unsanctioned", u, pUns, "share", "up"), // green for 100%
      card("highRisk", h, pHigh, "share", "down"), // less is good
      card("usersInvolved", ui, pUsers, "delta", "down"), // less impacted users is good
      card("remediated", r, pRem, "delta", "up"), // more remediations is good
    ],
  }
}
