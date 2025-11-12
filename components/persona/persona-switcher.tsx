"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, Shield, Briefcase } from "lucide-react"
import { useShadowStore } from "@/store/shadowStore"
import { cn } from "@/lib/utils"
import type { Persona } from "@/types/shadow-it"

const PERSONAS: Persona[] = ["SecOps", "CISO"]

const PersonaIcon: Record<Persona, React.ReactNode> = {
  SecOps: <Shield className="mr-2 h-4 w-4" aria-hidden="true" />,
  CISO: <Briefcase className="mr-2 h-4 w-4" aria-hidden="true" />,
}

const PersonaInitials: Record<Persona, string> = {
  SecOps: "SO",
  CISO: "CI",
}

export const PersonaSwitcher: React.FC = () => {
  const { persona, setPersona } = useShadowStore()
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    // console.log("[v0] PersonaSwitcher mounted")
    // console.log("[v0] Current persona:", persona)
    // console.log("[v0] Available personas:", PERSONAS)
    // console.log("[v0] Personas are deduped:", new Set(PERSONAS).size === PERSONAS.length)
  }, [persona])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 px-3 gap-2 rounded-lg",
            "border-[var(--accent-cyan)] bg-[var(--bg-elev-0)]/60",
            "hover:bg-[var(--bg-elev-1)] hover:border-[var(--accent-cyan)]",
            "hover:shadow-[0_0_12px_rgba(71,215,255,0.15)]",
            "hover:text-[var(--text-primary)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elev-0)]",
            "transition-all duration-200",
            "text-[var(--text-primary)] font-semibold text-sm",
          )}
          aria-label={`Current persona: ${persona}. Click to change persona`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <span className="inline-flex items-center">
            {PersonaIcon[persona]}
            {persona}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "min-w-[180px] z-[60]",
          "rounded-lg border border-[var(--bg-elev-1)]",
          "bg-[var(--bg-elev-0)]/95 backdrop-blur-md",
          "p-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        )}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="text-xs text-[var(--text-secondary)] font-medium px-2 py-1.5">
          Switch persona
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--bg-elev-1)]" />
        {PERSONAS.map((p) => {
          const active = p === persona
          return (
            <DropdownMenuItem
              key={p}
              onClick={() => {
                // console.log("[v0] Switching persona to:", p)
                setPersona(p)
                setIsOpen(false)
              }}
              className={cn(
                "flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer",
                "text-[var(--text-primary)]",
                "hover:bg-[var(--bg-elev-1)] hover:text-[var(--text-primary)]",
                "focus:bg-[var(--bg-elev-1)] focus:text-[var(--text-primary)]",
                "transition-colors duration-150",
                active && "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]",
              )}
              role="menuitemradio"
              aria-checked={active}
            >
              <span className="inline-flex items-center flex-1 gap-2">
                {PersonaIcon[p]}
                <span className={cn("font-medium", active && "font-semibold")}>{p}</span>
              </span>
              {active && <Check className="h-4 w-4 text-[var(--accent-cyan)]" aria-hidden="true" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
