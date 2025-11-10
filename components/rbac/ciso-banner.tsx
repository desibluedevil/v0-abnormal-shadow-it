"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"

export function CISOBanner() {
  return (
    <Alert
      className="bg-[color:color-mix(in_srgb,var(--color-accent-500)_10%,transparent)] border border-[color:color-mix(in_srgb,var(--color-accent-500)_40%,white)] text-[rgb(var(--text-primary))] rounded-md p-3"
      data-testid="ciso-banner"
    >
      <AlertDescription className="font-medium">
        📋 Read-only view (CISO). Switch persona to SecOps to take action.
      </AlertDescription>
    </Alert>
  )
}
