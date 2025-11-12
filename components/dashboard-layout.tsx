"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useShadowStore } from "@/store/shadowStore"
import NotifyModal from "@/components/notify/notify-modal"
import { KeyboardHelpModal } from "@/components/keyboard/help-modal"
import { PersonaSwitcher } from "@/components/persona/persona-switcher"
import { LayoutDashboard, Package, FileSearch, ShieldCheck, Settings, RefreshCw, Shield } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Review", href: "/review", icon: FileSearch },
  { name: "Audit", href: "/audit", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { persona } = useShadowStore()
  const isCISO = persona === "CISO"
  const [lastUpdated, setLastUpdated] = React.useState(new Date())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Shadow IT Dashboard"
      case "/inventory":
        return "Shadow App Inventory"
      case "/review":
        return "Review Queue"
      case "/audit":
        return "Case Audit"
      case "/settings":
        return "Settings"
      default:
        return "Security Dashboard"
    }
  }

  const getPageDescription = () => {
    switch (pathname) {
      case "/dashboard":
        return "Monitor risk trends, remediation progress, and organization-wide shadow IT metrics"
      case "/inventory":
        return "Discover and triage sanctioned/unsanctioned OAuth apps across your organization"
      case "/review":
        return "Approve or dismiss pending security cases with recommended actions"
      case "/audit":
        return "Complete record of all remediation actions and system events"
      case "/settings":
        return "Configure notification preferences and alert channels"
      default:
        return ""
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-elev-0)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-accent-foreground focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <aside
        className="w-64 border-r border-[var(--bg-elev-1)] bg-[var(--bg-elev-0)] flex flex-col shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[var(--bg-elev-1)]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hMLQgBXYIJyMkH4EN2P0ETWvg46XZJ.png"
                alt="Abnormal Security"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Shadow<span className="text-[var(--accent-cyan)]">IT</span>
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">ABNORMAL SECURITY</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1" role="navigation" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elev-0)]",
                  isActive
                    ? "bg-[color:color-mix(in_srgb,var(--accent-cyan)_10%,transparent)] text-[var(--accent-cyan)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elev-1)]",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--accent-cyan)] rounded-r-full shadow-[0_0_12px_var(--accent-cyan)]"
                    aria-hidden="true"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-150",
                    isActive && "drop-shadow-[0_0_8px_var(--accent-cyan)]",
                  )}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-[var(--bg-elev-1)]">
          <div className="text-[10px] font-mono text-[var(--text-secondary)] space-y-0.5">
            <div>v2.1.0-beta</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--risk-low)] animate-pulse" />
              System Operational
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="sticky top-0 z-20 h-16 border-b border-[var(--bg-elev-1)] bg-[var(--bg-elev-0)]/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.2)] flex items-center justify-between px-6"
          role="banner"
        >
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{getPageTitle()}</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{getPageDescription()}</p>
          </div>

          <div className="flex items-center gap-3">
            <DemoDataRefresh />
            <PersonaSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="flex-1 overflow-auto p-6 bg-[var(--bg-elev-0)]" role="main" tabIndex={-1}>
          {/* CISO banner at top of all pages when in CISO view */}
          {isCISO && (
            <div className="mb-6 p-4 rounded-lg border-2 border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30">
                  <Shield className="h-5 w-5 text-[var(--accent-cyan)]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[var(--text-primary)]">CISO: Executive View - Read Only</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Monitoring and reporting mode. Switch to SecOps persona to take action.
                  </div>
                </div>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>

      <NotifyModal />
      <KeyboardHelpModal />
    </div>
  )
}

function DemoDataRefresh() {
  const { toast } = useToast()

  const handleRefresh = () => {
    // Clear all localStorage and sessionStorage
    if (typeof window !== "undefined") {
      localStorage.clear()
      sessionStorage.clear()
    }

    toast({
      title: "Demo data refreshed",
      description: "The page will reload with fresh demo data",
      duration: 2000,
    })

    // Reload the page after a brief delay
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRefresh}
      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elev-1)]"
      aria-label="Reset demo data to initial state"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  )
}
