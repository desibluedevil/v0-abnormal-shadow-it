"use client"

import type { ShadowApp } from "@/types/shadow-it"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useShadowStore } from "@/store/shadowStore"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useNotify } from "@/components/notify/notify-modal"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function RiskBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const colors = {
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-amber-100 text-amber-800 border-amber-200",
    Low: "bg-green-100 text-green-800 border-green-200",
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={colors[level]}>
            {level}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Risk based on scopes and usage patterns</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function StatusBadge({ status }: { status: ShadowApp["status"] }) {
  const colors = {
    Unsanctioned: "bg-neutral-100 text-neutral-700 border-neutral-300",
    Sanctioned: "bg-blue-100 text-blue-700 border-blue-300",
    Revoked: "bg-red-100 text-red-700 border-red-300",
    Dismissed: "bg-neutral-100 text-neutral-500 border-neutral-200",
  }
  return (
    <Badge variant="outline" className={`${colors[status]} text-xs`}>
      {status}
    </Badge>
  )
}

function MoreHorizontalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

function ActionsCell({ app }: { app: ShadowApp }) {
  const router = useRouter()
  const { sanctionApp, unsanctionApp, dismissApp, undismissApp, revokeApp, unrevokeApp, persona } = useShadowStore()
  const { toast } = useToast()
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const notify = useNotify()

  const handleExplain = () => {
    router.push(`/inventory?focus=${app.id}#ai-explain`)
  }

  const handleRevokeConfirm = () => {
    if (app.status === "Revoked") {
      unrevokeApp(app.id)
      setRevokeDialogOpen(false)
      toast({
        title: "Access Restored",
        description: `Restored ${app.name} for all users`,
      })
    } else {
      revokeApp(app.id)
      setRevokeDialogOpen(false)
      toast({
        title: "Access Revoked",
        description: `Revoked ${app.name} for all ${app.users.length} users`,
      })
    }
  }

  const handleSanction = () => {
    if (app.status === "Sanctioned") {
      unsanctionApp(app.id)
      toast({
        title: "Sanction Removed",
        description: `${app.name} sanction has been removed`,
      })
    } else {
      sanctionApp(app.id)
      toast({
        title: "App Sanctioned",
        description: `${app.name} has been sanctioned`,
      })
    }
  }

  const handleNotify = () => {
    console.log("[v0] Notify button clicked for app:", app.id)
    notify.openFor(app.id)
  }

  const handleDismiss = () => {
    if (app.status === "Dismissed") {
      undismissApp(app.id)
      toast({
        title: "Dismiss Removed",
        description: `${app.name} has been restored`,
      })
    } else {
      dismissApp(app.id)
      toast({
        title: "App Dismissed",
        description: `${app.name} has been dismissed`,
      })
    }
  }

  const isCISO = persona === "CISO"
  const restrictedTooltip = "Restricted to SecOps role"

  return (
    <div className="flex items-center gap-1.5">
      {/* Explain - always visible primary action */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExplain}
              aria-label={`Explain risk analysis for ${app.name}`}
            >
              Explain
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">View detailed risk analysis</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dropdown menu for all other actions - better for responsive */}
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label={`More actions for ${app.name}`}>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">More actions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {!isCISO && (
            <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  {app.status === "Revoked" ? "Restore Access" : "Revoke Access"}
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{app.status === "Revoked" ? "Restore Access" : "Revoke Access"}</DialogTitle>
                  <DialogDescription>
                    {app.status === "Revoked"
                      ? `Are you sure you want to restore ${app.name} for all ${app.users.length} users? This will grant them access again.`
                      : `Are you sure you want to revoke ${app.name} for all ${app.users.length} users? This action will immediately remove their access.`}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleRevokeConfirm}>
                    {app.status === "Revoked" ? "Restore Access" : "Revoke Access"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {!isCISO && (
            <DropdownMenuItem onClick={handleSanction}>
              {app.status === "Sanctioned" ? "Remove Sanction" : "Sanction App"}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={handleNotify}
            disabled={isCISO}
            className={isCISO ? "cursor-not-allowed opacity-60" : ""}
          >
            {isCISO && "🔒 "}Notify Users
          </DropdownMenuItem>

          {!isCISO && (
            <DropdownMenuItem onClick={handleDismiss}>
              {app.status === "Dismissed" ? "Restore" : "Dismiss"}
            </DropdownMenuItem>
          )}

          {isCISO && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {restrictedTooltip}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns = [
  {
    id: "name",
    header: "Name",
    accessor: "name" as keyof ShadowApp,
    size: 200,
    cell: (app: ShadowApp) => {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
            {app.name.charAt(0)}
          </div>
          <span className="font-semibold text-neutral-900">{app.name}</span>
        </div>
      )
    },
  },
  {
    id: "publisher",
    header: "Publisher",
    accessor: "publisher" as keyof ShadowApp,
    size: 150,
    className: "hidden lg:table-cell",
    cell: (app: ShadowApp) => <span className="text-sm text-neutral-600">{app.publisher}</span>,
  },
  {
    id: "riskLevel",
    header: "Risk",
    accessor: "riskLevel" as keyof ShadowApp,
    size: 100,
    sortingFn: (a: ShadowApp, b: ShadowApp) => {
      const order = { High: 3, Medium: 2, Low: 1 }
      return order[a.riskLevel] - order[b.riskLevel]
    },
    cell: (app: ShadowApp) => <RiskBadge level={app.riskLevel} />,
  },
  {
    id: "users",
    header: "Users",
    accessor: (app: ShadowApp) => app.users.length,
    size: 80,
    className: "hidden md:table-cell",
    sortingFn: (a: ShadowApp, b: ShadowApp) => a.users.length - b.users.length,
    cell: (app: ShadowApp) => <div className="text-right font-mono text-sm">{app.users.length}</div>,
  },
  {
    id: "firstSeen",
    header: "First Seen",
    accessor: "firstSeen" as keyof ShadowApp,
    size: 120,
    className: "hidden lg:table-cell",
    cell: (app: ShadowApp) => (
      <span className="whitespace-nowrap font-mono text-xs text-neutral-600">{formatDate(app.firstSeen)}</span>
    ),
  },
  {
    id: "lastSeen",
    header: "Last Seen",
    accessor: "lastSeen" as keyof ShadowApp,
    size: 120,
    className: "hidden xl:table-cell",
    cell: (app: ShadowApp) => (
      <span className="whitespace-nowrap font-mono text-xs text-neutral-600">{formatDate(app.lastSeen)}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessor: "status" as keyof ShadowApp,
    size: 110,
    className: "hidden md:table-cell",
    cell: (app: ShadowApp) => <StatusBadge status={app.status} />,
  },
  {
    id: "tags",
    header: "Tags",
    accessor: "tags" as keyof ShadowApp,
    size: 180,
    className: "hidden xl:table-cell",
    cell: (app: ShadowApp) => (
      <div className="flex flex-wrap gap-1">
        {app.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs bg-neutral-100 text-neutral-700">
            {tag}
          </Badge>
        ))}
        {app.tags.length > 2 && (
          <Badge variant="secondary" className="text-xs bg-neutral-100">
            +{app.tags.length - 2}
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-left">Actions</div>,
    size: 140,
    cell: (app: ShadowApp) => <ActionsCell app={app} />,
  },
]
