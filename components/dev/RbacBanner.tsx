"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RbacBanner() {
  return (
    <div className="bg-accent-50 dark:bg-accent-900/10 border-l-4 border-accent-500 p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-accent-600 dark:text-accent-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-accent-900 dark:text-accent-100 mb-1">
            Development Mode: RBAC Not Implemented
          </h3>
          <p className="text-sm text-accent-800 dark:text-accent-200 mb-3">
            Role-based access control (RBAC) is not yet implemented. All users currently have full access to all
            features. This banner will be removed once proper authentication and authorization are in place.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-accent-300 text-accent-700 hover:bg-accent-100 dark:border-accent-700 dark:text-accent-300 dark:hover:bg-accent-900/20 bg-transparent"
          >
            Learn About RBAC Implementation
          </Button>
        </div>
      </div>
    </div>
  )
}
