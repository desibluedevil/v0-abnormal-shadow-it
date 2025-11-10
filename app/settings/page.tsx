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
import { Mail, MessageSquare, Shield, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SettingsPage() {
  const { alerts, setAlerts, apps, persona, sendTestAlert, audit, setAudit } = useShadowStore()
  const { toast } = useToast()

  // Local state for unsaved changes
  const [emailEnabled, setEmailEnabled] = useState(alerts.email)
  const [slackEnabled, setSlackEnabled] = useState(alerts.slack)
  const [threshold, setThreshold] = useState(alerts.riskThreshold)
  const [slackWebhook, setSlackWebhook] = useState(alerts.slackWebhook || "")

  const sketchyMail = apps.find((a) => a.id === "app_sketchymail")
  const mediumRiskApp = apps.find((a) => a.risk === "Medium") || apps[1]
  const lowRiskApp = apps.find((a) => a.risk === "Low") || apps[2]

  const previewApp = threshold === "High" ? sketchyMail : threshold === "Medium" ? mediumRiskApp : lowRiskApp

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
    const channels: string[] = []
    if (emailEnabled) channels.push("Email")
    if (slackEnabled) channels.push("Slack")

    // Create audit log entry
    const newReceipt = {
      id: `rcpt_test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Notify ${channels.join(" & ")}`,
      app: sketchyMail?.name || "SketchyMailApp",
      actor: persona === "SecOps" ? "secops@abnormalsecurity.com" : "admin@abnormalsecurity.com",
      status: "Success" as const,
      details: `Test alert sent to ${channels.join(" and ")} for ${sketchyMail?.name || "SketchyMailApp"}`,
    }

    setAudit([newReceipt, ...audit])
    sendTestAlert()

    toast({
      title: "Test alert sent successfully",
      description: `Alert delivered via ${channels.join(" and ")}. Check the Audit page to verify receipt.`,
    })
  }

  const hasChanges =
    emailEnabled !== alerts.email ||
    slackEnabled !== alerts.slack ||
    threshold !== alerts.riskThreshold ||
    slackWebhook !== (alerts.slackWebhook || "")

  const slackValidation = slackEnabled && slackWebhook.trim().length === 0
  const isValid = !slackValidation

  const canSendTest = (emailEnabled || slackEnabled) && isValid

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Alert Settings</h1>
        <p className="text-sm text-muted-foreground">Configure notification preferences and alert channels</p>
      </div>

      {isReadOnly && <CISOBanner />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-abnormal">
          <CardHeader className="bg-[#12171C] border-b border-border/50">
            <CardTitle className="text-lg font-bold">Alert Channels</CardTitle>
            <CardDescription>Choose how you want to receive security alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border border-border/50 bg-[#0B0F12] hover:border-[#47D7FF]/30 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#47D7FF]/10 border border-[#47D7FF]/30">
                  <Mail className="h-4 w-4 text-[#47D7FF]" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="email-alerts" className="text-sm font-semibold leading-none cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Receive alerts via email</p>
                </div>
              </div>
              <Switch
                id="email-alerts"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
                disabled={isReadOnly}
                aria-label="Toggle email notifications"
              />
            </div>

            <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border border-border/50 bg-[#0B0F12] hover:border-[#47D7FF]/30 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#47D7FF]/10 border border-[#47D7FF]/30">
                  <MessageSquare className="h-4 w-4 text-[#47D7FF]" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="slack-alerts" className="text-sm font-semibold leading-none cursor-pointer">
                    Slack Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Receive alerts in Slack</p>
                </div>
              </div>
              <Switch
                id="slack-alerts"
                checked={slackEnabled}
                onCheckedChange={setSlackEnabled}
                disabled={isReadOnly}
                aria-label="Toggle Slack notifications"
              />
            </div>

            {slackEnabled && (
              <div className="space-y-2 pt-2 pb-2 px-4 bg-[#0B0F12] rounded-lg border border-[#47D7FF]/20">
                <Label
                  htmlFor="slack-webhook"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Slack Webhook URL
                </Label>
                <Input
                  id="slack-webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  disabled={isReadOnly}
                  className={slackValidation ? "border-[#FF4D4D] focus-visible:ring-[#FF4D4D]/20" : ""}
                />
                {slackValidation && (
                  <p className="text-xs text-[#FF4D4D] flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Webhook URL is required when Slack notifications are enabled
                  </p>
                )}
                {slackEnabled && slackWebhook.trim().length > 0 && (
                  <p className="text-xs text-[#39D98A] flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Webhook URL configured
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Alert Threshold
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Only receive alerts for apps at or above this risk level
                </p>
              </div>
              <RadioGroup
                value={threshold}
                onValueChange={(val) => setThreshold(val as "High" | "Medium" | "Low")}
                disabled={isReadOnly}
              >
                <label
                  htmlFor="threshold-high"
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    threshold === "High"
                      ? "border-[#47D7FF] bg-[#47D7FF]/5 shadow-[0_0_12px_rgba(71,215,255,0.3)]"
                      : "border-border/50 bg-[#0B0F12] hover:border-[#47D7FF]/30"
                  } ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem value="High" id="threshold-high" className="mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#FF4D4D] shadow-[0_0_6px_rgba(255,77,77,0.6)]"></span>
                      <span className="text-sm font-semibold text-foreground">High Risk Only</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Critical apps requiring immediate attention</p>
                  </div>
                </label>

                <label
                  htmlFor="threshold-medium"
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    threshold === "Medium"
                      ? "border-[#47D7FF] bg-[#47D7FF]/5 shadow-[0_0_12px_rgba(71,215,255,0.3)]"
                      : "border-border/50 bg-[#0B0F12] hover:border-[#47D7FF]/30"
                  } ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem value="Medium" id="threshold-medium" className="mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#FFB02E] shadow-[0_0_6px_rgba(255,176,46,0.6)]"></span>
                      <span className="text-sm font-semibold text-foreground">Medium Risk & Above</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Apps with elevated security concerns</p>
                  </div>
                </label>

                <label
                  htmlFor="threshold-low"
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    threshold === "Low"
                      ? "border-[#47D7FF] bg-[#47D7FF]/5 shadow-[0_0_12px_rgba(71,215,255,0.3)]"
                      : "border-border/50 bg-[#0B0F12] hover:border-[#47D7FF]/30"
                  } ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem value="Low" id="threshold-low" className="mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#39D98A] shadow-[0_0_6px_rgba(57,217,138,0.6)]"></span>
                      <span className="text-sm font-semibold text-foreground">All Risk Levels</span>
                    </div>
                    <p className="text-xs text-muted-foreground">All detected apps regardless of risk</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <div className="pt-4 border-t border-border/50 flex items-center gap-3">
              <Button onClick={handleSave} disabled={!hasChanges || !isValid || isReadOnly} className="flex-1">
                {hasChanges ? "Save Changes" : "No Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleTestAlert}
                disabled={!canSendTest || isReadOnly}
                className="border-border/50 bg-transparent"
              >
                Send Test Alert
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-abnormal">
          <CardHeader className="bg-[#12171C] border-b border-border/50">
            <CardTitle className="text-lg font-bold">Alert Preview</CardTitle>
            <CardDescription>Example of how alerts will appear based on your threshold</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Alert
              className={`border-2 ${
                previewApp?.risk === "High"
                  ? "border-[#FF4D4D]/30 bg-[#FF4D4D]/5"
                  : previewApp?.risk === "Medium"
                    ? "border-[#FFB02E]/30 bg-[#FFB02E]/5"
                    : "border-[#39D98A]/30 bg-[#39D98A]/5"
              }`}
              data-preview-card
              data-testid="alert-preview"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    previewApp?.risk === "High"
                      ? "bg-[#FF4D4D]/20 border border-[#FF4D4D]/30"
                      : previewApp?.risk === "Medium"
                        ? "bg-[#FFB02E]/20 border border-[#FFB02E]/30"
                        : "bg-[#39D98A]/20 border border-[#39D98A]/30"
                  }`}
                >
                  <Shield
                    className={`h-5 w-5 ${
                      previewApp?.risk === "High"
                        ? "text-[#FF4D4D]"
                        : previewApp?.risk === "Medium"
                          ? "text-[#FFB02E]"
                          : "text-[#39D98A]"
                    }`}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <AlertTitle className="font-bold text-sm text-foreground">
                    New {previewApp?.risk || "High"}-Risk App: {previewApp?.name || "SketchyMailApp"}
                  </AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground">
                    {previewApp?.rationale.summary ||
                      "High-risk OAuth app with organization-wide read scopes, installed by an executive."}
                  </AlertDescription>
                  <div className="pt-2">
                    <Button asChild size="sm" variant="default" className="h-8 text-xs gap-1.5">
                      <Link
                        href={`/inventory?focus=${previewApp?.id || "app_sketchymail"}&plan=${previewApp?.id || "app_sketchymail"}`}
                      >
                        Review & Remediate
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>

            <div className="space-y-3 rounded-lg border border-[#47D7FF]/20 bg-[#0B0F12] p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-[#47D7FF]">Current Configuration</div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-foreground min-w-32 pt-0.5">Alert Timing:</span>
                  <span className="text-xs text-muted-foreground">
                    When new apps meeting your risk threshold are detected
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-foreground min-w-32 pt-0.5">Risk Threshold:</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${
                        threshold === "High"
                          ? "border-[#FF4D4D]/30 bg-[#FF4D4D]/10 text-[#FF4D4D]"
                          : threshold === "Medium"
                            ? "border-[#FFB02E]/30 bg-[#FFB02E]/10 text-[#FFB02E]"
                            : "border-[#39D98A]/30 bg-[#39D98A]/10 text-[#39D98A]"
                      }`}
                    >
                      {threshold === "High"
                        ? "High Risk Only"
                        : threshold === "Medium"
                          ? "Medium Risk & Above"
                          : "All Risk Levels"}
                    </span>
                    {hasChanges && <span className="text-[#FFB02E] font-semibold">(unsaved)</span>}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-foreground min-w-32 pt-0.5">Delivery Channels:</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    {emailEnabled && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#47D7FF]/30 bg-[#47D7FF]/10 text-[#47D7FF]">
                        <Mail className="h-3 w-3" />
                        Email
                      </span>
                    )}
                    {slackEnabled && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#47D7FF]/30 bg-[#47D7FF]/10 text-[#47D7FF]">
                        <MessageSquare className="h-3 w-3" />
                        Slack
                      </span>
                    )}
                    {!emailEnabled && !slackEnabled && (
                      <span className="text-muted-foreground">No channels enabled</span>
                    )}
                    {hasChanges && <span className="text-[#FFB02E] font-semibold">(unsaved)</span>}
                  </span>
                </div>
                {slackEnabled && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold text-foreground min-w-32 pt-0.5">Slack Webhook:</span>
                    <span className="text-xs text-muted-foreground">
                      {slackWebhook.trim().length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#39D98A]/30 bg-[#39D98A]/10 text-[#39D98A]">
                          <CheckCircle2 className="h-3 w-3" />
                          Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#FF4D4D]/30 bg-[#FF4D4D]/10 text-[#FF4D4D]">
                          <AlertTriangle className="h-3 w-3" />
                          Not configured
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
