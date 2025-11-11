"use client"

import type * as React from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useConfirm } from "@/hooks/use-confirm"

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { state, close } = useConfirm()

  return (
    <>
      {children}
      <ConfirmDialog
        open={state.open}
        onOpenChange={close}
        title={state.title}
        description={state.description}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        variant={state.variant}
        onConfirm={state.onConfirm}
      />
    </>
  )
}
