export type RiskLevel = "High" | "Medium" | "Low"
export type AppStatus = "Unsanctioned" | "Sanctioned" | "Revoked" | "Dismissed"

export interface Scope {
  name: string
  description: string
  riskTag?: "Mail" | "Files" | "Calendar" | "Identity" | "Admin"
}

export interface AppUser {
  id: string
  name: string
  email: string
  dept: "Finance" | "Marketing" | "Sales" | "Engineering" | "HR" | "Exec"
  role?: string
}

export interface RationaleSource {
  title: string
  url: string
}

export interface RationaleReason {
  text: string
  citation?: number
}

export interface Rationale {
  summary: string
  reasons: RationaleReason[]
  sources: RationaleSource[]
}

export interface ShadowApp {
  id: string
  name: string
  publisher: string
  category: "Communication" | "Storage" | "Productivity" | "Utilities" | "Developer" | "Other"
  logoUrl?: string
  riskScore: number
  riskLevel: RiskLevel
  scopes: Scope[]
  users: AppUser[]
  firstSeen: string
  lastSeen: string
  status: AppStatus
  tags: string[]
  description?: string
  rationale: Rationale
}

export interface CaseEvent {
  ts: string
  event: string
}

export interface Receipt {
  id: string
  ts: string
  tool: "graph.revokeGrant" | "end.sessions" | "notify.email" | "ticket.create"
  status: "ok" | "error"
  details?: string
  appId: string
  actor: string
}

export interface ReviewCase {
  id: string
  appId: string
  priority: "P0" | "P1" | "P2"
  confidence: number
  impact: number
  tags: string[]
  timeline: CaseEvent[]
  recommendations: string[]
  receipts?: Receipt[]
}

export type Persona = "SecOps" | "CISO"

export interface Filters {
  q: string
  risk?: RiskLevel | "All"
  status?: AppStatus | "All"
  tags: string[]
}

export interface ShadowState {
  // core state
  persona: Persona
  apps: ShadowApp[]
  cases: ReviewCase[]
  receipts: Receipt[]
  filters: Filters
  alerts: {
    email: boolean
    slack: boolean
    riskThreshold: "High" | "Medium" | "Low"
    slackWebhook?: string // Add slackWebhook to alerts type
  }

  // selectors
  kpis: () => {
    totalUnsanctioned: number
    highRisk: number
    usersInvolved: number
    remediated: number
  }
  riskDistribution: () => { high: number; med: number; low: number }
  weeklyNewApps: () => Array<{ week: string; count: number }>
  filteredApps: () => ShadowApp[]
  ttrSeries: () => Array<{ ts: string; hours: number }> // Add ttrSeries selector

  // setters
  setPersona: (p: Persona) => void
  setFilters: (f: Partial<Filters>) => void
  clearFilters: () => void
  setAlerts: (
    partial: Partial<{
      email: boolean
      slack: boolean
      riskThreshold: "High" | "Medium" | "Low"
      slackWebhook?: string // Add slackWebhook to setAlerts signature
    }>,
  ) => void

  // mutations
  revokeApp: (appId: string, actor?: string) => string // Returns receipt ID
  unrevokeApp: (appId: string, actor?: string) => void
  sanctionApp: (appId: string, actor?: string) => string // Returns receipt ID
  unsanctionApp: (appId: string, actor?: string) => void
  dismissApp: (appId: string, actor?: string) => string // Returns receipt ID
  undismissApp: (appId: string, actor?: string) => void
  notifyUsers: (appId: string, message: string, actor?: string) => Promise<{ ok: boolean; id: string; ts: string }> // notifyUsers now returns Promise with result object
  appendReceipt: (r: Receipt) => void
  seedReceiptsIfEmpty: () => void
  clearReceipts: () => void
  sendTestAlert: () => void // Add sendTestAlert method
}
