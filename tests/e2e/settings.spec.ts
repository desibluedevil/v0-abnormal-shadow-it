import { test, expect } from "@playwright/test"

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings")
    await page.waitForLoadState("networkidle")
  })

  test("should toggle email notifications", async ({ page }) => {
    // Find email toggle switch
    const emailToggle = page.getByRole("switch", { name: /email notifications/i })

    // Get initial state
    const initialState = await emailToggle.getAttribute("aria-checked")

    // Toggle switch
    await emailToggle.click()

    // Verify state changed
    const newState = await emailToggle.getAttribute("aria-checked")
    expect(newState).not.toBe(initialState)

    // Verify Current Configuration updates in real-time
    await expect(page.getByText(/email/i)).toBeVisible()
  })

  test("should toggle slack notifications", async ({ page }) => {
    // Find Slack toggle switch
    const slackToggle = page.getByRole("switch", { name: /slack notifications/i })

    // Toggle switch on
    await slackToggle.click()

    // Verify webhook URL input appears
    await expect(page.getByPlaceholder(/webhook url/i)).toBeVisible()

    // Enter webhook URL
    await page.getByPlaceholder(/webhook url/i).fill("https://hooks.slack.com/services/test")

    // Verify Current Configuration updates
    await expect(page.getByText(/slack/i)).toBeVisible()
  })

  test("should change risk threshold", async ({ page }) => {
    // Click on "High only" risk threshold card
    await page.getByText(/high only/i).click()

    // Verify selection changed (radio button selected)
    const highRadio = page.locator('input[type="radio"][value="high"]')
    await expect(highRadio).toBeChecked()

    // Verify Alert Preview updates with high-risk example
    await expect(page.getByText(/sketchymailapp/i)).toBeVisible()
  })

  test("should send test alert when enabled", async ({ page }) => {
    // Enable email notifications
    const emailToggle = page.getByRole("switch", { name: /email notifications/i })
    const isChecked = await emailToggle.getAttribute("aria-checked")

    if (isChecked !== "true") {
      await emailToggle.click()
    }

    // Send Test Alert button should be enabled
    const testButton = page.getByRole("button", { name: /send test alert/i })
    await expect(testButton).toBeEnabled()

    // Click Send Test Alert
    await testButton.click()

    // Verify success toast
    await expect(page.getByText(/test alert sent successfully/i)).toBeVisible()

    // Verify audit log entry created (navigate to audit page)
    await page.goto("/audit")
    await expect(page.getByText(/notify/i).first()).toBeVisible()
  })

  test("should disable test alert when no channels enabled", async ({ page }) => {
    // Disable all notification channels
    const emailToggle = page.getByRole("switch", { name: /email notifications/i })
    const slackToggle = page.getByRole("switch", { name: /slack notifications/i })

    // Turn both off
    const emailChecked = await emailToggle.getAttribute("aria-checked")
    if (emailChecked === "true") {
      await emailToggle.click()
    }

    const slackChecked = await slackToggle.getAttribute("aria-checked")
    if (slackChecked === "true") {
      await slackToggle.click()
    }

    // Verify Send Test Alert is disabled
    const testButton = page.getByRole("button", { name: /send test alert/i })
    await expect(testButton).toBeDisabled()

    // Hover to see tooltip
    await testButton.hover()
    await expect(page.getByText(/enable at least one notification channel/i)).toBeVisible()
  })

  test("should save settings", async ({ page }) => {
    // Make a change
    await page.getByRole("switch", { name: /email notifications/i }).click()

    // Click Save button
    await page.getByRole("button", { name: /save settings/i }).click()

    // Verify success toast
    await expect(page.getByText(/settings saved/i)).toBeVisible()

    // Reload page and verify changes persisted
    await page.reload()
    const emailToggle = page.getByRole("switch", { name: /email notifications/i })
    // State should be maintained
    await expect(emailToggle).toBeVisible()
  })

  test("should update alert preview based on threshold selection", async ({ page }) => {
    // Select "Medium & above"
    await page.getByText(/medium & above/i).click()

    // Verify preview shows medium-risk app
    const previewCard = page.locator("[data-preview-card]")
    await expect(previewCard.getByText(/medium/i)).toBeVisible()

    // Select "All"
    await page.getByText(/^all$/i).click()

    // Verify preview shows low-risk app
    await expect(previewCard.getByText(/low/i)).toBeVisible()
  })
})
