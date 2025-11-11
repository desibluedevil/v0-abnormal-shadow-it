"use client"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import type { LucideIcon } from "lucide-react"

interface EmptyWithCTAProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

export function EmptyWithCTA({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyWithCTAProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {(actionLabel || secondaryActionLabel) && (
        <EmptyContent>
          <div className="flex flex-col sm:flex-row gap-3">
            {actionLabel && onAction && (
              <Button
                onClick={onAction}
                className="bg-[#47D7FF] text-[#0B0F12] hover:bg-[#47D7FF]/90 shadow-[0_0_16px_rgba(71,215,255,0.3)]"
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button onClick={onSecondaryAction} variant="outline">
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        </EmptyContent>
      )}
    </Empty>
  )
}
