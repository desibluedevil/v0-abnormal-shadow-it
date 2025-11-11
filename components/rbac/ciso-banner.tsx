"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function CISOBanner() {
  return (
    <Alert
      className={cn(
        "bg-[color:color-mix(in_srgb,var(--accent-cyan)_8%,transparent)]",
        "border border-[var(--accent-cyan)]/30",
        "text-[var(--text-primary)]",
        "rounded-lg p-4 shadow-[0_2px_12px_rgba(71,215,255,0.1)]",
      )}
      data-testid="ciso-banner"
    >
      <div className="flex items-center gap-3">
        <Info className="h-5 w-5 text-[var(--accent-cyan)]" aria-hidden="true" />
        <AlertDescription className="font-medium text-sm">
          Read-only view (CISO). Switch persona to SecOps to take action.
        </AlertDescription>
      </div>
    </Alert>
  )
}

import { cn } from "@/lib/utils"
