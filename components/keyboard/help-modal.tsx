"use client"

import { useEffect, useState } from "react"
import { useShadowStore } from "@/store/shadowStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function KeyboardHelpModal() {
  const [open, setOpen] = useState(false)
  const { persona } = useShadowStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        // Ignore if typing in input/textarea
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
        e.preventDefault()
        setOpen(true)
      }
      // Close modal with Escape
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Current Persona</h3>
            <Badge variant={persona === "SecOps" ? "default" : "secondary"}>{persona}</Badge>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Global Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Show this help</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Inventory Page</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Focus search box</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Close app drawer</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Keyboard shortcuts help you navigate faster and work more efficiently.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
