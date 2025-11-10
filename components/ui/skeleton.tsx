import type React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted/50 animate-pulse rounded-lg border border-border/30 shadow-[0_0_8px_rgba(71,215,255,0.05)]",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
