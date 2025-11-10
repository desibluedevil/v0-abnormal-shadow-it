"use client"
import { useShadowStore } from "@/store/shadowStore"

export default function Sanity() {
  const { kpis, filteredApps, revokeApp, setPersona, persona } = useShadowStore()
  const { totalUnsanctioned, highRisk, usersInvolved, remediated } = kpis()
  const apps = filteredApps()

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Store Sanity</h1>
        <button
          onClick={() => setPersona(persona === "SecOps" ? "CISO" : "SecOps")}
          className="px-3 py-2 rounded bg-primary text-primary-foreground"
        >
          Persona: {persona} (toggle)
        </button>
      </div>

      <div className="text-sm">
        Unsanctioned: <b>{totalUnsanctioned}</b> | High: <b>{highRisk}</b> | Users: <b>{usersInvolved}</b> | Remediated:{" "}
        <b>{remediated}</b>
      </div>

      <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={() => revokeApp("app_sketchymail")}>
        Revoke SketchyMailApp
      </button>

      <ul className="text-sm text-muted-foreground list-disc pl-5">
        {apps.slice(0, 5).map((a) => (
          <li key={a.id}>
            {a.name} — <i>{a.status}</i> — Risk {a.riskLevel}
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        After clicking <b>Revoke</b>, the KPIs above should update immediately, and the app's status will become{" "}
        <b>Revoked</b>.
      </p>
    </div>
  )
}
