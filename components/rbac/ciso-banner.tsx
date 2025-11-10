"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"

export function CISOBanner() {
  return (
    <Alert className="border-blue-300 bg-blue-50" data-testid="ciso-banner">
      <AlertDescription className="text-blue-900 font-medium">
        📋 Read-only view (CISO). Switch persona to SecOps to take action.
      </AlertDescription>
    </Alert>
  )
}
