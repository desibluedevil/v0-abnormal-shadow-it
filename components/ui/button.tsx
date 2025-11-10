import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/20",
    outline: "border border-neutral-300 bg-white shadow-sm hover:bg-neutral-50 hover:text-neutral-900",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    accent:
      "bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-accent-600)] text-[var(--surface-0)] shadow-ab-1 hover:shadow-ab-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-400)]/50 focus:ring-offset-2",
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
