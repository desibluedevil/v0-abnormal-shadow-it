"use client"

import * as React from "react"

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => void | Promise<void>
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
}

export function useConfirm() {
  const [state, setState] = React.useState<ConfirmState>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  })

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...options,
        open: true,
        onConfirm: async () => {
          try {
            await options.onConfirm()
            resolve(true)
          } catch (error) {
            console.error("[v0] Confirm action failed:", error)
            resolve(false)
          }
        },
      })
    })
  }, [])

  const close = React.useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  return {
    confirm,
    close,
    state,
  }
}
