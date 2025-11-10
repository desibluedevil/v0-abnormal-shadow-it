"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useShadowStore } from "@/store/shadowStore"
import NotifyModal from "@/components/notify/notify-modal"
import { KeyboardHelpModal } from "@/components/keyboard/help-modal"
import {
  LayoutDashboard,
  Package,
  FileSearch,
  ShieldCheck,
  Settings,
  ChevronDown,
  Clock,
  RotateCcw,
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Review", href: "/review", icon: FileSearch },
  { name: "Audit", href: "/audit", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
]

const personas = [
  { id: "SecOps", label: "SecOps" },
  { id: "CISO", label: "CISO" },
] as const

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { persona, setPersona } = useShadowStore()
  const [lastUpdated, setLastUpdated] = React.useState(new Date())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 60000) // Update every minute
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

  const handlePersonaChange = (newPersona: "SecOps" | "CISO") => {
    console.log("[v0] Persona changed from", persona, "to", newPersona)
    setPersona(newPersona)
  }

  const handleDemoRefresh = () => {
    console.log("[v0] Demo data refresh initiated")
    // Clear localStorage and reload
    if (typeof window !== "undefined") {
      localStorage.removeItem("shadow-it-store")
      window.location.reload()
    }
  }

  console.log("[v0] DashboardLayout rendered with persona:", persona)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col" aria-label="Main navigation">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold text-foreground">Shadow IT</h1>
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
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent-cyan/10 text-accent-cyan"
                    : "text-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-cyan rounded-r-full shadow-[0_0_12px_rgba(71,215,255,0.5)]"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive
                      ? "text-accent-cyan drop-shadow-[0_0_8px_rgba(71,215,255,0.3)]"
                      : "group-hover:drop-shadow-[0_0_6px_rgba(71,215,255,0.2)]",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          className="h-16 border-b border-border bg-card text-foreground flex items-center justify-between px-6"
          role="banner"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">{getPageTitle()}</h2>
            <div className="flex items-center gap-2 text-xs text-foreground" aria-live="polite" aria-atomic="true">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDemoRefresh}
              className="gap-2 text-muted-foreground hover:text-[#47D7FF] hover:bg-[#47D7FF]/10 transition-all duration-200"
              aria-label="Reset demo data to initial state"
            >
              <RotateCcw className="h-4 w-4" />
              Demo Reset
            </Button>

            {/* Persona Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="gap-2 rounded-full px-4 py-2 hover:shadow-[0_0_12px_rgba(71,215,255,0.2)] transition-all duration-200"
                  onClick={() => console.log("[v0] Dropdown trigger clicked")}
                  aria-label={`Current persona: ${persona}. Click to change persona`}
                >
                  {persona}
                  <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {personas.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => {
                      console.log("[v0] MenuItem clicked:", p.id)
                      handlePersonaChange(p.id)
                    }}
                    className={cn(persona === p.id && "bg-accent text-accent-foreground")}
                  >
                    {p.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="flex-1 overflow-auto p-6" role="main">
          {children}
        </main>
      </div>

      {/* NotifyModal */}
      <NotifyModal />

      {/* Keyboard Help Modal */}
      <KeyboardHelpModal />
    </div>
  )
}
