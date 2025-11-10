"use client"

import { useState, useEffect, useCallback } from "react"
import { useShadowStore } from "@/store/shadowStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

let _open = false
let _appId: string | null = null
let _subscribers: Array<(state: { open: boolean; appId: string | null }) => void> = []

function publish() {
  _subscribers.forEach((fn) => fn({ open: _open, appId: _appId }))
}

export function useNotify() {
  return {
    openFor: (appId: string) => {
      _open = true
      _appId = appId
      publish()
    },
    close: () => {
      _open = false
      publish()
    },
  }
}

export default function NotifyModal() {
  const { toast } = useToast()
  const { apps, notifyUsers } = useShadowStore()
  const [{ open, appId }, setState] = useState<{ open: boolean; appId: string | null }>({ open: false, appId: null })
  const [subject, setSubject] = useState<string>("")
  const [body, setBody] = useState<string>("")

  useEffect(() => {
    const subscriber = (v: { open: boolean; appId: string | null }) => setState(v)
    _subscribers.push(subscriber)
    return () => {
      _subscribers = _subscribers.filter((x) => x !== subscriber)
    }
  }, [])

  const app = apps.find((a) => a.id === appId)

  const ensureDefault = useCallback(() => {
    if (app && !subject && !body) {
      const reason = app.rationale?.reasons?.[0]?.text || "elevated risk"
      setSubject(`Security notice — ${app.name}`)
      setBody(
        `The security team determined ${app.name} poses ${reason}.\n\nPlease discontinue usage or contact IT for alternatives.\n\nThank you,\nSecurity Team`,
      )
    }
  }, [app, subject, body])

  if (open) ensureDefault()

  const onClose = () => {
    _open = false
    publish()
    setSubject("")
    setBody("")
  }

  const onSend = async () => {
    if (!app) return
    const fullMessage = `Subject: ${subject}\n\n${body}`
    await notifyUsers(app.id, fullMessage)
    toast({
      title: "Notification Sent",
      description: `Email sent to ${app.users.length} users of ${app.name}`,
    })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notify Users — {app?.name || ""}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
              className="font-medium"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="body">Message Body</Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full min-h-[160px] resize-y border rounded-md p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter message (supports markdown formatting)"
            />
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-md p-4 bg-muted/50 min-h-[120px]">
              <div className="space-y-3">
                <div className="font-semibold text-sm border-b pb-2">
                  {subject || <span className="text-muted-foreground">Subject preview...</span>}
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                  {body || <span className="text-muted-foreground">Message body preview...</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSend} disabled={!subject.trim() || !body.trim()}>
              Send Notification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
