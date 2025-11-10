import { RbacBanner } from "@/components/dev/RbacBanner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function QAPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <RbacBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">QA Dashboard</h1>
          <p className="text-text-secondary">Review and test shadow IT detections</p>
        </div>
        <Button variant="accent">Run New Test</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Tests</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">1,234</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passed</CardTitle>
            <CardDescription>Success rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-risk-low">98.5%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed</CardTitle>
            <CardDescription>Needs attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-risk-high">1.5%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
          <CardDescription>Latest QA test executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Email Detection Test", status: "passed", risk: "low" },
              { name: "API Validation Test", status: "passed", risk: "low" },
              { name: "Data Export Test", status: "warning", risk: "medium" },
              { name: "Permission Test", status: "failed", risk: "high" },
            ].map((test, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-surface-0 rounded-lg border border-border-subtle"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium text-text-primary">{test.name}</div>
                  <Badge
                    variant={test.risk === "high" ? "riskHigh" : test.risk === "medium" ? "riskMedium" : "riskLow"}
                  >
                    {test.risk}
                  </Badge>
                </div>
                <Badge variant={test.status === "failed" ? "destructive" : "default"}>{test.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
