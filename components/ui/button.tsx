import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    primary:
      "bg-accent-cyan text-background shadow-lg hover:shadow-[0_0_16px_rgba(71,215,255,0.4)] focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:ring-offset-2 transition-all duration-200",
    secondary: "bg-muted text-foreground hover:bg-muted/80 shadow-sm transition-all duration-200",
    destructive:
      "bg-risk-high text-white shadow-lg hover:shadow-[0_0_16px_rgba(255,77,77,0.4)] focus:outline-none focus:ring-2 focus:ring-risk-high/50 focus:ring-offset-2 transition-all duration-200",
    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    accent:
      "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2",
  },
  size: {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-sm",
    lg: "h-10 rounded-md px-6",
    icon: "size-9",
  },
}

type ButtonVariant = keyof typeof buttonVariants.variant
type ButtonSize = keyof typeof buttonVariants.size

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

function Button({ className, variant = "default", size = "default", asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  const variantClass = buttonVariants.variant[variant]
  const sizeClass = buttonVariants.size[size]

  return (
    <Comp
      data-slot="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "btn-scale focus-glow",
        variantClass,
        sizeClass,
        className,
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
