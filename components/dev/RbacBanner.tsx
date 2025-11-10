"use client"

interface RbacBannerProps {
  persona: string
}

export default function RbacBanner({ persona }: RbacBannerProps) {
  if (persona !== "CISO") return null

  return (
    <div
      className="mb-4 rounded-md border p-3 text-sm"
      style={{
        background: "color-mix(in srgb, var(--color-accent-500) 10%, transparent)",
        borderColor: "color-mix(in srgb, var(--color-accent-500) 40%, white)",
        color: "var(--text-primary)",
      }}
    >
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="font-semibold">Read-Only Mode</span>
      </div>
      <p className="mt-1 text-xs opacity-90">You are viewing this page in CISO read-only mode. Actions are disabled.</p>
    </div>
  )
}
