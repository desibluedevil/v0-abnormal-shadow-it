import { test, expect } from "@playwright/test"

test.describe("Navigation and Basic Functionality", () => {
  test("should navigate between all pages", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("h1")).toContainText(/Shadow IT|Dashboard/i)

    // Navigate to Inventory
    await page.getByRole("link", { name: /Inventory/i }).click()
    await expect(page).toHaveURL(/\/inventory/)
    await expect(page.locator("h1")).toContainText("Shadow App Inventory")

    // Navigate to Review
    await page.getByRole("link", { name: /Review/i }).click()
    await expect(page).toHaveURL(/\/review/)
    await expect(page.locator("h1")).toContainText("Review Queue")

    // Navigate to Audit
    await page.getByRole("link", { name: /Audit/i }).click()
    await expect(page).toHaveURL(/\/audit/)
    await expect(page.locator("h1")).toContainText("Audit Trail")

    // Navigate to Settings
    await page.getByRole("link", { name: /Settings/i }).click()
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.locator("h1")).toContainText("Alert Settings")

    console.log("[v0] Navigation tested across all pages")
  })

  test("should show skip to content link on focus", async ({ page }) => {
    await page.goto("/dashboard")

    // Tab to skip link
    await page.keyboard.press("Tab")
    await page.waitForTimeout(200)

    // Check if skip link is focused
    const skipLink = page.locator('a:has-text("Skip to main content")')
    await expect(skipLink).toBeFocused()

    console.log("[v0] Skip to content link is accessible")
  })
})
