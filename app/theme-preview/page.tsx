"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const lineData = [
  { name: "W1", value: 12 },
  { name: "W2", value: 19 },
  { name: "W3", value: 15 },
  { name: "W4", value: 22 },
  { name: "W5", value: 18 },
  { name: "W6", value: 25 },
]

const pieData = [
  { name: "High", value: 35, color: "#FF4D4D" },
  { name: "Med", value: 45, color: "#FFB02E" },
  { name: "Low", value: 20, color: "#39D98A" },
]

export default function ThemePreview() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header>
          <h1 className="text-display text-foreground mb-2">Abnormal Design System</h1>
          <p className="text-body text-muted-foreground">
            Cyberpunk-inspired design tokens for enterprise security dashboards
          </p>
        </header>

        {/* Typography */}
        <section>
          <Card className="shadow-abnormal">
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>Inter as architectural grotesk with specific weights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Display (700 / 32-40px)</div>
                <h1 className="text-display">Shadow IT Detection Platform</h1>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Title (600 / 24px)</div>
                <h2 className="text-title">Critical Alerts Dashboard</h2>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Body (400 / 14-16px)</div>
                <p className="text-body">
                  Monitor and remediate unsanctioned applications across your enterprise with real-time insights.
                </p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Mono (numbers and code)</div>
                <p className="text-mono text-lg">1,247 applications detected</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Colors */}
        <section>
          <Card className="shadow-abnormal">
            <CardHeader>
              <CardTitle>Color Tokens</CardTitle>
              <CardDescription>Cyberpunk-inspired palette with high contrast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm font-medium mb-3">Backgrounds</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="w-full h-16 rounded-lg bg-[var(--bg-elev-0)] border border-border"></div>
                    <div className="text-xs mt-2">bg-elev-0</div>
                    <div className="text-xs text-muted-foreground">#0B0F12</div>
                  </div>
                  <div>
                    <div className="w-full h-16 rounded-lg bg-[var(--bg-elev-1)] border border-border"></div>
                    <div className="text-xs mt-2">bg-elev-1</div>
                    <div className="text-xs text-muted-foreground">#12171C</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-3">Accents</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="w-full h-16 rounded-lg bg-accent-lime"></div>
                    <div className="text-xs mt-2">accent-lime</div>
                    <div className="text-xs text-muted-foreground">#C9F70A</div>
                  </div>
                  <div>
                    <div className="w-full h-16 rounded-lg bg-accent-cyan"></div>
                    <div className="text-xs mt-2">accent-cyan</div>
                    <div className="text-xs text-muted-foreground">#47D7FF</div>
                  </div>
                  <div>
                    <div className="w-full h-16 rounded-lg bg-accent-magenta"></div>
                    <div className="text-xs mt-2">accent-magenta</div>
                    <div className="text-xs text-muted-foreground">#FF3EB5</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-3">Status / Risk</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="w-full h-16 rounded-lg bg-risk-high"></div>
                    <div className="text-xs mt-2">risk-high</div>
                    <div className="text-xs text-muted-foreground">#FF4D4D</div>
                  </div>
                  <div>
                    <div className="w-full h-16 rounded-lg bg-risk-med"></div>
                    <div className="text-xs mt-2">risk-med</div>
                    <div className="text-xs text-muted-foreground">#FFB02E</div>
                  </div>
                  <div>
                    <div className="w-full h-16 rounded-lg bg-risk-low"></div>
                    <div className="text-xs mt-2">risk-low</div>
                    <div className="text-xs text-muted-foreground">#39D98A</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section>
          <Card className="shadow-abnormal">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>8px radius with glowing cyan focus rings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Inputs & Pills */}
        <section>
          <Card className="shadow-abnormal">
            <CardHeader>
              <CardTitle>Inputs & Badges</CardTitle>
              <CardDescription>Form controls with consistent styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Text Input</label>
                  <Input placeholder="Enter application name..." className="focus-ring-abnormal" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Input</label>
                  <Input type="search" placeholder="Search apps..." className="focus-ring-abnormal" />
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-3">Badges / Pills</div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge className="bg-risk-high text-white">High Risk</Badge>
                  <Badge className="bg-risk-med text-black">Medium Risk</Badge>
                  <Badge className="bg-risk-low text-black">Low Risk</Badge>
                  <Badge className="bg-accent-lime text-black">Lime</Badge>
                  <Badge className="bg-accent-cyan text-black">Cyan</Badge>
                  <Badge className="bg-accent-magenta text-white">Magenta</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Charts */}
        <section>
          <Card className="shadow-abnormal">
            <CardHeader>
              <CardTitle>Charts with Accent Colors</CardTitle>
              <CardDescription>Recharts with cyberpunk palette</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium mb-3">Line Chart</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(167, 176, 184, 0.1)" />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bg-elev-1)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--text-primary)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--accent-cyan)"
                        strokeWidth={2}
                        dot={{ fill: "var(--accent-cyan)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3">Risk Distribution</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bg-elev-1)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--text-primary)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Alerts & Empty States */}
        <section>
          <Card className="shadow-abnormal">
            <CardHeader>
              <CardTitle>Alert Banners</CardTitle>
              <CardDescription>Status messages with icons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Informational</AlertTitle>
                <AlertDescription>New shadow IT applications detected in the last 24 hours.</AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Alert</AlertTitle>
                <AlertDescription>12 high-risk applications require immediate review and remediation.</AlertDescription>
              </Alert>

              <Alert className="border-[var(--risk-low)] bg-[var(--risk-low)]/10">
                <CheckCircle2 className="h-4 w-4 text-risk-low" />
                <AlertTitle className="text-risk-low">Success</AlertTitle>
                <AlertDescription>All remediation actions completed successfully.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        {/* Empty State */}
        <section>
          <Card className="shadow-abnormal">
            <CardHeader>
              <CardTitle>Empty States</CardTitle>
              <CardDescription>Placeholder content for empty views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted/20 p-4 mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  There are no unsanctioned applications to display. Start by connecting your identity provider.
                </p>
                <Button>Connect Provider</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
