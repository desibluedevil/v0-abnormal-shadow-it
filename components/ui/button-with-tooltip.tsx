"use client"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ButtonWithTooltipProps extends ButtonProps {
  tooltip?: string
  showTooltipWhenDisabled?: boolean
}

export function ButtonWithTooltip({
  tooltip,
  showTooltipWhenDisabled = true,
  disabled,
  children,
  ...props
}: ButtonWithTooltipProps) {
  // Only show tooltip if button is disabled and tooltip is provided
  const shouldShowTooltip = disabled && showTooltipWhenDisabled && tooltip

  if (!shouldShowTooltip) {
    return (
      <Button disabled={disabled} {...props}>
        {children}
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block" tabIndex={0}>
            <Button disabled={disabled} {...props}>
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs border-[#47D7FF]/20 bg-card/95 text-foreground backdrop-blur-sm">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
