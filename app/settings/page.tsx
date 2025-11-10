"use client"

import { useState } from "react"
import Link from "next/link"
import { useShadowStore } from "@/store/shadowStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CISOBanner } from "@/components/rbac/ciso-banner"

export default function SettingsPage() {
  const { alerts, setAlerts, apps, persona, sendTestAlert } = useShadowStore()
  const { toast } = useToast()

  // Local state for unsaved changes
  const [emailEnabled, setEmailEnabled] = useState(alerts.email)
  const [slackEnabled, setSlackEnabled] = useState(alerts.slack)
  const [threshold, setThreshold] = useState(alerts.riskThreshold)
  const [slackWebhook, setSlackWebhook] = useState(alerts.slackWebhook || "")

  // Get SketchyMail app for preview
  const sketchyMail = apps.find((a) => a.id === "app_sketchymail")

  // RBAC: CISO can only view
  const isReadOnly = persona === "CISO"

  const handleSave = () => {
    setAlerts({
      email: emailEnabled,
      slack: slackEnabled,
      riskThreshold: threshold,
      slackWebhook: slackWebhook || undefined,
    })
    toast({
      title: "Alert preferences saved",
      description: "Your notification settings have been updated.",
    })
  }

  const handleTestAlert = () => {
    sendTestAlert()
    toast({
      title: "Test alert sent",
      description: "Check the Audit page to verify receipt creation.",
    })
  }

  const hasChanges =
    emailEnabled !== alerts.email ||
    slackEnabled !== alerts.slack ||
    threshold !== alerts.riskThreshold ||
    slackWebhook !== (alerts.slackWebhook || "")

  const slackValidation = slackEnabled && slackWebhook.trim().length === 0
  const isValid = !slackValidation

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Alert Settings</h1>
        <p className="text-sm text-muted-foreground">Configure notification preferences and alert channels</p>
      </div>

      {isReadOnly && <CISOBanner />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="bg-muted/30">
            <CardTitle>Alert Channels</CardTitle>
            <CardDescription>Choose how you want to receive security alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Email Toggle */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="email-alerts" className="text-sm font-medium leading-none">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch
                id="email-alerts"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
                disabled={isReadOnly}
              />
            </div>

            {/* Slack Toggle */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="slack-alerts" className="text-sm font-medium leading-none">
                  Slack Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive alerts in Slack</p>
              </div>
              <Switch
                id="slack-alerts"
                checked={slackEnabled}
                onCheckedChange={setSlackEnabled}
                disabled={isReadOnly}
              />
            </div>

            {slackEnabled && (
              <div className="space-y-2 pt-2 pb-2 px-4 bg-muted/30 rounded-lg border border-border">
                <Label htmlFor="slack-webhook" className="text-sm font-medium">
                  Slack Webhook URL
                </Label>
                <Input
                  id="slack-webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  disabled={isReadOnly}
                  className={slackValidation ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {slackValidation && (
                  <p className="text-xs text-destructive flex items-center gap-1.5 mt-2">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Webhook URL is required when Slack notifications are enabled
                  </p>
                )}
                {slackEnabled && slackWebhook.trim().length > 0 && (
                  <p className="text-xs text-green-600 flex items-center gap-1.5 mt-2">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Webhook URL configured
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <Label htmlFor="risk-threshold" className="text-sm font-medium">
                  Alert Threshold
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Only receive alerts for apps at or above this risk level
                </p>
              </div>
              <div className="grid gap-2">
                <Button
                  variant={threshold === "High" ? "default" : "outline"}
                  className="justify-start h-11"
                  onClick={() => setThreshold("High")}
                  disabled={isReadOnly}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-danger"></span>
                    High Risk Only
                  </span>
                </Button>
                <Button
                  variant={threshold === "Medium" ? "default" : "outline"}
                  className="justify-start h-11"
                  onClick={() => setThreshold("Medium")}
                  disabled={isReadOnly}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-warning"></span>
                    Medium Risk & Above
                  </span>
                </Button>
                <Button
                  variant={threshold === "Low" ? "default" : "outline"}
                  className="justify-start h-11"
                  onClick={() => setThreshold("Low")}
                  disabled={isReadOnly}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success"></span>
                    All Risk Levels
                  </span>
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center gap-3">
              <Button onClick={handleSave} disabled={!hasChanges || !isValid || isReadOnly} className="flex-1">
                {hasChanges ? "Save Changes" : "No Changes"}
              </Button>
              <Button variant="outline" onClick={handleTestAlert} disabled={isReadOnly}>
                Send Test Alert
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/30">
            <CardTitle>Alert Preview</CardTitle>
            <CardDescription>Example of how alerts will appear</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Alert className="border-2 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  <AlertTitle className="font-semibold text-sm text-red-900">
                    New High-Risk App: {sketchyMail?.name || "SketchyMailApp"}
                  </AlertTitle>
                  <AlertDescription className="text-xs text-red-800">
                    {sketchyMail?.rationale.summary ||
                      "High-risk OAuth app with organization-wide read scopes, installed by an executive."}
                  </AlertDescription>
                  <div className="pt-2">
                    <Button asChild size="sm" variant="destructive" className="h-8 text-xs">
                      <Link
                        href={`/inventory?focus=${sketchyMail?.id || "app_sketchymail"}&plan=${sketchyMail?.id || "app_sketchymail"}`}
                      >
                        Review & Remediate →
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>

            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current Configuration
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-foreground min-w-28 pt-0.5">Alert Timing:</span>
                  <span className="text-xs text-muted-foreground">
                    When new apps meeting your risk threshold are detected
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-foreground min-w-28 pt-0.5">Risk Threshold:</span>
                  <span className="text-xs text-muted-foreground">
                    {threshold === "High"
                      ? "High Risk Only"
                      : threshold === "Medium"
                        ? "Medium Risk & Above"
                        : "All Risk Levels"}
                    {hasChanges && <span className="ml-2 text-amber-600 font-medium">(unsaved)</span>}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-medium text-foreground min-w-28 pt-0.5">Delivery Channels:</span>
                  <span className="text-xs text-muted-foreground">
                    {emailEnabled && slackEnabled
                      ? "Email and Slack"
                      : emailEnabled
                        ? "Email only"
                        : slackEnabled
                          ? "Slack only"
                          : "No channels enabled"}
                    {hasChanges && <span className="ml-2 text-amber-600 font-medium">(unsaved)</span>}
                  </span>
                </div>
                {slackEnabled && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-foreground min-w-28 pt-0.5">Slack Webhook:</span>
                    <span className="text-xs text-muted-foreground">
                      {slackWebhook.trim().length > 0 ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-600 font-medium">Configured</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <svg className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span className="text-red-600 font-medium">Not configured</span>
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
