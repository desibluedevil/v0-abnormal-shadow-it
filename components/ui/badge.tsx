import type * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "border-transparent bg-red-100 text-red-900 hover:bg-red-200",
  outline: "text-foreground",
  riskHigh: "border-transparent bg-risk-high text-white hover:bg-risk-high/90",
  riskMedium: "border-transparent bg-risk-medium text-black hover:bg-risk-medium/90",
  riskLow: "border-transparent bg-risk-low text-white hover:bg-risk-low/90",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
