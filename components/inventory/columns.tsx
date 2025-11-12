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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useShadowStore } from "@/store/shadowStore"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useNotify } from "@/components/notify/notify-modal"
import { MoreHorizontal } from "lucide-react"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function RiskBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const colors = {
    High: "bg-[#FF4D4D] text-white border-[#FF4D4D]",
    Medium: "bg-[#FFB02E] text-[#0B0F12] border-[#FFB02E]",
    Low: "bg-[#39D98A] text-[#0B0F12] border-[#39D98A]",
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${colors[level]} text-xs font-medium px-2 py-1 rounded-full shadow-sm`}>{level}</Badge>
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
    Unsanctioned: "bg-muted text-muted-foreground border-border",
    Sanctioned: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    Revoked: "bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]/30",
    Dismissed: "bg-muted/50 text-muted-foreground/70 border-border/50",
  }
  return (
    <Badge variant="outline" className={`${colors[status]} text-xs`}>
      {status}
    </Badge>
  )
}

function ActionsCell({ app }: { app: ShadowApp }) {
  const router = useRouter()
  const { sanctionApp, unsanctionApp, dismissApp, undismissApp, revokeApp, unrevokeApp, persona } = useShadowStore()
  const { toast } = useToast()
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [sanctionDialogOpen, setSanctionDialogOpen] = useState(false)
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false)
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

  const handleSanctionConfirm = () => {
    if (app.status === "Sanctioned") {
      unsanctionApp(app.id)
      setSanctionDialogOpen(false)
      toast({
        title: "Sanction Removed",
        description: `${app.name} sanction has been removed`,
      })
    } else {
      sanctionApp(app.id)
      setSanctionDialogOpen(false)
      toast({
        title: "App Sanctioned",
        description: `${app.name} has been sanctioned`,
      })
    }
  }

  const handleNotify = () => {
    notify.openFor(app.id)
  }

  const handleDismissConfirm = () => {
    if (app.status === "Dismissed") {
      undismissApp(app.id)
      setDismissDialogOpen(false)
      toast({
        title: "Dismiss Removed",
        description: `${app.name} has been restored`,
      })
    } else {
      dismissApp(app.id)
      setDismissDialogOpen(false)
      toast({
        title: "App Dismissed",
        description: `${app.name} has been dismissed`,
      })
    }
  }

  const handleViewDetails = () => {
    router.push(`/inventory?focus=${app.id}`)
  }

  const isCISO = persona === "CISO"
  const restrictedTooltip = "Restricted to SecOps role"

  return (
    <div className="flex items-center gap-1.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExplain}
              aria-label={`Explain risk analysis for ${app.name}`}
              className="text-xs"
            >
              Explain
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">View detailed risk analysis</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={`More actions for ${app.name}`} className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">More actions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetails()
            }}
          >
            View App Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!isCISO && (
            <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  onSelect={(e) => {
                    e.preventDefault()
                  }}
                >
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
            <Dialog open={sanctionDialogOpen} onOpenChange={setSanctionDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  onSelect={(e) => {
                    e.preventDefault()
                  }}
                >
                  {app.status === "Sanctioned" ? "Remove Sanction" : "Sanction App"}
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{app.status === "Sanctioned" ? "Remove Sanction" : "Sanction App"}</DialogTitle>
                  <DialogDescription>
                    {app.status === "Sanctioned"
                      ? `Are you sure you want to remove the sanction from ${app.name}? This will mark it as unsanctioned.`
                      : `Are you sure you want to sanction ${app.name}? This will approve it for company use.`}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSanctionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSanctionConfirm}>
                    {app.status === "Sanctioned" ? "Remove Sanction" : "Sanction App"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              handleNotify()
            }}
            onSelect={(e) => {
              e.preventDefault()
            }}
            disabled={isCISO}
            className={isCISO ? "cursor-not-allowed opacity-60" : ""}
          >
            {isCISO && "🔒 "}Notify Users
          </DropdownMenuItem>

          {!isCISO && (
            <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  onSelect={(e) => {
                    e.preventDefault()
                  }}
                >
                  {app.status === "Dismissed" ? "Restore" : "Dismiss"}
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{app.status === "Dismissed" ? "Restore App" : "Dismiss App"}</DialogTitle>
                  <DialogDescription>
                    {app.status === "Dismissed"
                      ? `Are you sure you want to restore ${app.name}? This will bring it back to the active inventory.`
                      : `Are you sure you want to dismiss ${app.name}? This will hide it from the review queue.`}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDismissDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="secondary" onClick={handleDismissConfirm}>
                    {app.status === "Dismissed" ? "Restore" : "Dismiss"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
    header: "App",
    accessor: "name" as keyof ShadowApp,
    size: 200,
    cell: (app: ShadowApp) => {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-semibold text-muted-foreground">
            {app.name.charAt(0)}
          </div>
          <span className="font-semibold text-foreground">{app.name}</span>
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
    cell: (app: ShadowApp) => <span className="text-sm text-muted-foreground">{app.publisher}</span>,
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
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">{formatDate(app.firstSeen)}</span>
    ),
  },
  {
    id: "lastSeen",
    header: "Last Seen",
    accessor: "lastSeen" as keyof ShadowApp,
    size: 120,
    className: "hidden xl:table-cell",
    cell: (app: ShadowApp) => (
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">{formatDate(app.lastSeen)}</span>
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
          <Badge key={tag} variant="secondary" className="text-xs bg-muted text-muted-foreground">
            {tag}
          </Badge>
        ))}
        {app.tags.length > 2 && (
          <Badge variant="secondary" className="text-xs bg-muted">
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
    sortable: false,
    cell: (app: ShadowApp) => <ActionsCell app={app} />,
  },
]
