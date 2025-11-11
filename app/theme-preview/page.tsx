"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AlertCircle, CheckCircle2, AlertTriangle, Shield, Activity, FileText } from "lucide-react"
import { motion } from "framer-motion"
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
  BarChart,
  Bar,
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
  { name: "High", value: 35, color: "var(--risk-high)" },
  { name: "Med", value: 45, color: "var(--risk-med)" },
  { name: "Low", value: 20, color: "var(--risk-low)" },
]

const barData = [
  { name: "Jan", high: 12, med: 8, low: 4 },
  { name: "Feb", high: 10, med: 12, low: 6 },
  { name: "Mar", high: 8, med: 14, low: 8 },
  { name: "Apr", high: 6, med: 10, low: 12 },
]

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.02 },
}

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

export default function ThemePreview() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground mb-2">
            Abnormal Design System
          </h1>
          <p className="text-base font-normal leading-relaxed text-muted-foreground">
            Cyberpunk-inspired, clean geometry, sharp edges, layered motion with professional enterprise polish
          </p>
        </motion.header>

        {/* Typography */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>
                Inter as architectural grotesk — Display 40/700, Title 24/600, Body 16/400, Mono for numerics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-mono">Display · 40px / 700</div>
                <h1 className="text-5xl font-bold leading-tight tracking-tight">Shadow IT Detection Platform</h1>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-mono">Title · 24px / 600</div>
                <h2 className="text-2xl font-semibold leading-tight">Critical Alerts Dashboard</h2>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-mono">Body · 16px / 400</div>
                <p className="text-base font-normal leading-relaxed">
                  Monitor and remediate unsanctioned applications across your enterprise with real-time insights and
                  automated workflows.
                </p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-mono">Mono · Tabular nums</div>
                <p className="font-mono tabular-nums text-lg">1,247 · 92.3% · $142,547.89</p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Colors */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle>Color Tokens</CardTitle>
              <CardDescription>Cyberpunk palette — surfaces, accents, and risk indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm font-semibold mb-3">Surfaces · Layered elevation</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="w-full h-20 rounded-lg bg-[var(--bg-elev-0)] border border-border"></div>
                    <div className="text-xs mt-2 font-mono">--bg-elev-0</div>
                    <div className="text-xs text-muted-foreground">#0B0F12</div>
                  </div>
                  <div>
                    <div className="w-full h-20 rounded-lg bg-[var(--bg-elev-1)] border border-border"></div>
                    <div className="text-xs mt-2 font-mono">--bg-elev-1</div>
                    <div className="text-xs text-muted-foreground">#12171C</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-3">Accents · Cyberpunk vibes</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="w-full h-20 rounded-lg bg-[var(--accent-lime)]"></div>
                    <div className="text-xs mt-2 font-mono">--accent-lime</div>
                    <div className="text-xs text-muted-foreground">#C9F70A</div>
                  </div>
                  <div>
                    <div className="w-full h-20 rounded-lg bg-[var(--accent-cyan)]"></div>
                    <div className="text-xs mt-2 font-mono">--accent-cyan</div>
                    <div className="text-xs text-muted-foreground">#47D7FF</div>
                  </div>
                  <div>
                    <div className="w-full h-20 rounded-lg bg-[var(--accent-magenta)]"></div>
                    <div className="text-xs mt-2 font-mono">--accent-magenta</div>
                    <div className="text-xs text-muted-foreground">#FF3EB5</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-3">Risk · Status indicators</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="w-full h-20 rounded-lg bg-[var(--risk-high)]"></div>
                    <div className="text-xs mt-2 font-mono">--risk-high</div>
                    <div className="text-xs text-muted-foreground">#FF4D4D</div>
                  </div>
                  <div>
                    <div className="w-full h-20 rounded-lg bg-[var(--risk-med)]"></div>
                    <div className="text-xs mt-2 font-mono">--risk-med</div>
                    <div className="text-xs text-muted-foreground">#FFB02E</div>
                  </div>
                  <div>
                    <div className="w-full h-20 rounded-lg bg-[var(--risk-low)]"></div>
                    <div className="text-xs mt-2 font-mono">--risk-low</div>
                    <div className="text-xs text-muted-foreground">#39D98A</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-3">Text · Hierarchy</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-8 rounded bg-[var(--text-primary)]"></div>
                    <div className="flex-1">
                      <div className="text-xs font-mono">--text-primary</div>
                      <div className="text-xs text-muted-foreground">#E9EEF2</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-8 rounded bg-[var(--text-secondary)]"></div>
                    <div className="flex-1">
                      <div className="text-xs font-mono">--text-secondary</div>
                      <div className="text-xs text-muted-foreground">#A7B0B8</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>8px radius with glowing cyan focus rings · hover scale 1.02 / 0.16s</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button>Primary Action</Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button variant="secondary">Secondary</Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button variant="destructive">Destructive</Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button variant="outline">Outline</Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button variant="ghost">Ghost</Button>
                </motion.div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button size="sm">Small</Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button size="default">Default</Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button size="lg">Large</Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" transition={{ duration: 0.16 }}>
                  <Button size="icon" aria-label="Alert">
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-mono">Focus state (try Tab key navigation)</div>
                <div className="flex gap-4">
                  <Button>Keyboard Focus Demo</Button>
                  <Button variant="outline">Tab to Me</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle>Inputs & Badges</CardTitle>
              <CardDescription>Form controls with cyan focus rings and 8px radius</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Text Input</label>
                  <Input placeholder="Enter application name..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Input</label>
                  <Input type="search" placeholder="Search apps..." />
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-3">Badges / Chips</div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge className="bg-[var(--risk-high)] text-white hover:bg-[var(--risk-high)]/90">High Risk</Badge>
                  <Badge className="bg-[var(--risk-med)] text-[var(--bg-elev-0)] hover:bg-[var(--risk-med)]/90">
                    Medium
                  </Badge>
                  <Badge className="bg-[var(--risk-low)] text-[var(--bg-elev-0)] hover:bg-[var(--risk-low)]/90">
                    Low Risk
                  </Badge>
                  <Badge className="bg-[var(--accent-lime)] text-[var(--bg-elev-0)] hover:bg-[var(--accent-lime)]/90">
                    Lime
                  </Badge>
                  <Badge className="bg-[var(--accent-cyan)] text-[var(--bg-elev-0)] hover:bg-[var(--accent-cyan)]/90">
                    Cyan
                  </Badge>
                  <Badge className="bg-[var(--accent-magenta)] text-white hover:bg-[var(--accent-magenta)]/90">
                    Magenta
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle>Tabs & Segmented Controls</CardTitle>
              <CardDescription>Navigation and toggle components with cubic transitions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm font-semibold mb-3">Tabs Component</div>
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList>
                    <TabsTrigger value="dashboard">
                      <Activity className="h-4 w-4 mr-2" />
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="inventory">
                      <Shield className="h-4 w-4 mr-2" />
                      Inventory
                    </TabsTrigger>
                    <TabsTrigger value="reports">
                      <FileText className="h-4 w-4 mr-2" />
                      Reports
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="dashboard" className="space-y-2">
                    <p className="text-sm text-muted-foreground">Dashboard view with real-time metrics and alerts</p>
                  </TabsContent>
                  <TabsContent value="inventory" className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Comprehensive inventory of all detected applications
                    </p>
                  </TabsContent>
                  <TabsContent value="reports" className="space-y-2">
                    <p className="text-sm text-muted-foreground">Audit reports and compliance documentation</p>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <div className="text-sm font-semibold mb-3">Segmented Control (Toggle Group)</div>
                <ToggleGroup type="single" defaultValue="all" className="justify-start">
                  <ToggleGroupItem value="all" aria-label="Show all">
                    All Apps
                  </ToggleGroupItem>
                  <ToggleGroupItem value="high" aria-label="Show high risk">
                    High Risk
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" aria-label="Show medium risk">
                    Medium
                  </ToggleGroupItem>
                  <ToggleGroupItem value="low" aria-label="Show low risk">
                    Low Risk
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle>Charts with Accent Colors</CardTitle>
              <CardDescription>Recharts with cyberpunk palette · clear legends and compact tooltips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <div className="text-sm font-semibold mb-4">Time Series · Line Chart</div>
                  <ResponsiveContainer width="100%" height={220}>
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
                        dot={{ fill: "var(--accent-cyan)", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-4">Risk Distribution · Pie Chart</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
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

                <div className="md:col-span-2">
                  <div className="text-sm font-semibold mb-4">Stacked Trends · Bar Chart</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData}>
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
                      <Bar dataKey="high" fill="var(--risk-high)" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="med" fill="var(--risk-med)" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="low" fill="var(--risk-low)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Alerts */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle>Alert Banners</CardTitle>
              <CardDescription>Status messages with accessible icon labeling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Informational Alert</AlertTitle>
                <AlertDescription>
                  New shadow IT applications detected in the last 24 hours. Review recommended.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Alert</AlertTitle>
                <AlertDescription>
                  12 high-risk applications require immediate review and remediation action.
                </AlertDescription>
              </Alert>

              <Alert className="border-[var(--risk-low)] bg-[var(--risk-low)]/10">
                <CheckCircle2 className="h-4 w-4 text-[var(--risk-low)]" />
                <AlertTitle className="text-[var(--risk-low)]">Success</AlertTitle>
                <AlertDescription>
                  All remediation actions completed successfully. Security posture improved.
                </AlertDescription>
              </Alert>

              <Alert className="border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10">
                <Activity className="h-4 w-4 text-[var(--accent-cyan)]" />
                <AlertTitle className="text-[var(--accent-cyan)]">System Update</AlertTitle>
                <AlertDescription>Detection engine updated with latest threat intelligence patterns.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.section>

        {/* Empty State */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)]">
            <CardHeader>
              <CardTitle>Empty States</CardTitle>
              <CardDescription>Placeholder content for zero-state views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                  className="rounded-full bg-muted/20 p-6 mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Shield className="h-12 w-12 text-muted-foreground" />
                </motion.div>
                <motion.h3
                  className="text-lg font-semibold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  No Applications Found
                </motion.h3>
                <motion.p
                  className="text-sm text-muted-foreground max-w-sm mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  There are no unsanctioned applications to display. Start by connecting your identity provider to begin
                  monitoring.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button>Connect Identity Provider</Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial="initial"
          animate="animate"
          variants={cardVariants}
          transition={{ duration: 0.18, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="shadow-[0_2px_16px_rgba(0,0,0,0.35)] border-[var(--accent-lime)]">
            <CardHeader>
              <CardTitle>Design System Specifications</CardTitle>
              <CardDescription>Complete implementation guide for Abnormal cyberpunk aesthetic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Brand Vibe</div>
                    <p className="text-sm text-muted-foreground">
                      Cyberpunk-inspired, clean geometry, sharp edges, layered motion with professional enterprise
                      polish
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Typography</div>
                    <p className="text-sm text-muted-foreground font-mono">
                      Inter (architectural grotesk) · Display 40/700 · Title 24/600 · Body 16/400 · Mono for numerics
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Radius</div>
                    <p className="text-sm text-muted-foreground font-mono">
                      8px base (0.5rem) · Sharp geometric corners
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Shadows</div>
                    <p className="text-sm text-muted-foreground font-mono">
                      0 2px 16px rgba(0,0,0,.35) · Subtle depth with layering
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Motion</div>
                    <p className="text-sm text-muted-foreground font-mono">
                      Hover scale 1.02 / 0.16s · Drawer/accordion 0.18s cubic · Respects prefers-reduced-motion
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Focus Rings</div>
                    <p className="text-sm text-muted-foreground font-mono">
                      Cyan glow (#47D7FF) · 2px ring with offset
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Accessibility</div>
                    <p className="text-sm text-muted-foreground">
                      4.5:1 contrast ratio · Visible focus states · Full keyboard navigation · ARIA labels on icon
                      buttons
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--accent-cyan)] mb-1">Components</div>
                    <p className="text-sm text-muted-foreground">
                      shadcn/ui primitives with Abnormal theming · Framer Motion for micro-interactions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
