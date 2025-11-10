"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RbacBanner() {
  return (
    <div className="bg-muted border-l-4 border-primary p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">Development Mode: RBAC Not Implemented</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Role-based access control (RBAC) is not yet implemented. All users currently have full access to all
            features. This banner will be removed once proper authentication and authorization are in place.
          </p>
          <Button variant="outline" size="sm" className="bg-transparent">
            Learn About RBAC Implementation
          </Button>
        </div>
      </div>
    </div>
  )
}
