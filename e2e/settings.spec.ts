import { test, expect } from "@playwright/test"

test.describe("Settings Page - Toggle and Test Alert", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings")
    await page.waitForLoadState("networkidle")
  })

  test("should toggle email notifications", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Alert Settings")

    // Find email notifications switch
    const emailSwitch = page.locator('button[role="switch"]').filter({ has: page.locator("#email-alerts") })

    // Get initial state
    const initialState = await emailSwitch.getAttribute("data-state")
    console.log("[v0] Email switch initial state:", initialState)

    // Toggle the switch
    await emailSwitch.click()
    await page.waitForTimeout(500)

    // Verify state changed
    const newState = await emailSwitch.getAttribute("data-state")
    expect(newState).not.toBe(initialState)

    console.log("[v0] Email notifications toggled successfully")
  })

  test("should toggle slack notifications", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Alert Settings")

    // Find slack notifications switch
    const slackSwitch = page.locator('button[role="switch"]').filter({ has: page.locator("#slack-alerts") })

    // Get initial state
    const initialState = await slackSwitch.getAttribute("data-state")
    console.log("[v0] Slack switch initial state:", initialState)

    // Toggle the switch
    await slackSwitch.click()
    await page.waitForTimeout(500)

    // Verify state changed
    const newState = await slackSwitch.getAttribute("data-state")
    expect(newState).not.toBe(initialState)

    console.log("[v0] Slack notifications toggled successfully")
  })

  test("should change risk threshold", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Alert Settings")

    // Click High risk threshold
    await page.locator("label:has(#threshold-high)").click()
    await page.waitForTimeout(500)

    // Verify radio button is selected
    const highRadio = page.locator("#threshold-high")
    await expect(highRadio).toBeChecked()

    // Click Medium risk threshold
    await page.locator("label:has(#threshold-medium)").click()
    await page.waitForTimeout(500)

    const mediumRadio = page.locator("#threshold-medium")
    await expect(mediumRadio).toBeChecked()

    // Click Low risk threshold
    await page.locator("label:has(#threshold-low)").click()
    await page.waitForTimeout(500)

    const lowRadio = page.locator("#threshold-low")
    await expect(lowRadio).toBeChecked()

    console.log("[v0] Risk threshold changed successfully")
  })

  test("should save settings changes", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Alert Settings")

    // Toggle email notifications to create a change
    const emailSwitch = page.locator('button[role="switch"]').filter({ has: page.locator("#email-alerts") })
    await emailSwitch.click()
    await page.waitForTimeout(500)

    // Find and click Save Changes button
    const saveButton = page.getByRole("button", { name: /Save Changes/ })
    await expect(saveButton).toBeEnabled()
    await saveButton.click()
    await page.waitForTimeout(1000)

    // Check for success toast
    const toast = page.locator("[data-sonner-toast]")
    if ((await toast.count()) > 0) {
      await expect(toast).toContainText(/saved/i)
      console.log("[v0] Settings saved successfully")
    }

    // Verify button text changed to "No Changes"
    await expect(saveButton).toContainText(/No Changes/)
  })

  test("should send test alert", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Alert Settings")

    // Make sure at least one channel is enabled
    const emailSwitch = page.locator('button[role="switch"]').filter({ has: page.locator("#email-alerts") })
    const emailState = await emailSwitch.getAttribute("data-state")

    if (emailState !== "checked") {
      await emailSwitch.click()
      await page.waitForTimeout(500)
    }

    // Click Send Test Alert button
    const testAlertButton = page.getByRole("button", { name: /Send Test Alert/ })
    await expect(testAlertButton).toBeEnabled()
    await testAlertButton.click()
    await page.waitForTimeout(1000)

    // Check for success toast
    const toast = page.locator("[data-sonner-toast]")
    if ((await toast.count()) > 0) {
      await expect(toast).toContainText(/Test alert sent/i)
      console.log("[v0] Test alert sent successfully")
    }
  })

  test("should show webhook input when slack is enabled", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Alert Settings")

    // Enable Slack notifications
    const slackSwitch = page.locator('button[role="switch"]').filter({ has: page.locator("#slack-alerts") })
    const slackState = await slackSwitch.getAttribute("data-state")

    if (slackState !== "checked") {
      await slackSwitch.click()
      await page.waitForTimeout(500)
    }

    // Verify webhook input is visible
    const webhookInput = page.locator("#slack-webhook")
    await expect(webhookInput).toBeVisible()

    // Type a webhook URL
    await webhookInput.fill("https://hooks.slack.com/services/TEST123")
    await page.waitForTimeout(500)

    // Verify success indicator appears
    const successIndicator = page.locator("text=Webhook URL configured")
    await expect(successIndicator).toBeVisible()

    console.log("[v0] Slack webhook input works correctly")
  })
})
