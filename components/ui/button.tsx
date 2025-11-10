import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20",
    outline: "border border-border bg-card shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
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
        variantClass,
        sizeClass,
        className,
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
