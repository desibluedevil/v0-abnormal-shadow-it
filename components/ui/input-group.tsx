import type * as React from "react"
import { cn } from "@/lib/utils"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-group" className={cn("relative flex items-stretch", className)} {...props} />
}

function InputGroupAddon({
  align = "inline-start",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "inline-start" | "inline-end"
}) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex items-center",
        align === "inline-start" && "pr-0",
        align === "inline-end" && "pl-0",
        className,
      )}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("flex items-center justify-center px-3 text-muted-foreground", className)}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "flex-1 min-w-0 h-9 rounded-md border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput }
