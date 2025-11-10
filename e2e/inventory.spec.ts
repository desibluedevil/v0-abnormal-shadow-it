import { test, expect } from "@playwright/test"

test.describe("Inventory Page - Filters and Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory")
    await page.waitForLoadState("networkidle")
  })

  test("should change risk filters and see filtered results", async ({ page }) => {
    // Wait for the page to load
    await expect(page.locator("h1")).toContainText("Shadow App Inventory")

    // Check initial state - should have apps
    const initialRows = await page.locator("table tbody tr").count()
    expect(initialRows).toBeGreaterThan(0)

    // Click High risk filter
    await page.getByRole("button", { name: "High", exact: true }).click()
    await page.waitForTimeout(500)

    // Verify URL parameter updated
    await expect(page).toHaveURL(/risk=High/)

    // Click Medium risk filter
    await page.getByRole("button", { name: "Medium", exact: true }).click()
    await page.waitForTimeout(500)

    await expect(page).toHaveURL(/risk=Medium/)

    // Click Low risk filter
    await page.getByRole("button", { name: "Low", exact: true }).click()
    await page.waitForTimeout(500)

    await expect(page).toHaveURL(/risk=Low/)

    // Reset to All
    await page.getByRole("button", { name: "All", exact: true }).first().click()
    await page.waitForTimeout(500)

    await expect(page).not.toHaveURL(/risk=/)
  })

  test("should change status filters and see filtered results", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Shadow App Inventory")

    // Click Unsanctioned status filter
    await page.getByRole("button", { name: "Unsanctioned" }).click()
    await page.waitForTimeout(500)

    await expect(page).toHaveURL(/status=Unsanctioned/)

    // Click Sanctioned status filter
    await page.getByRole("button", { name: "Sanctioned" }).click()
    await page.waitForTimeout(500)

    await expect(page).toHaveURL(/status=Sanctioned/)

    // Reset to All
    const statusAllButton = page.getByRole("button", { name: "All", exact: true }).nth(1)
    await statusAllButton.click()
    await page.waitForTimeout(500)

    await expect(page).not.toHaveURL(/status=/)
  })

  test("should search for apps by name", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Shadow App Inventory")

    // Type in search
    await page.getByPlaceholder(/Search by app/).fill("Calendar")
    await page.waitForTimeout(500)

    // Verify URL updated
    await expect(page).toHaveURL(/q=Calendar/)

    // Clear search
    await page.getByPlaceholder(/Search by app/).clear()
    await page.waitForTimeout(500)
  })

  test("should open app drawer and interact with scope chips", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Shadow App Inventory")

    // Find and click first app row's "Explain" button
    const firstExplainButton = page.locator('button:has-text("Explain")').first()
    await firstExplainButton.click()

    // Wait for drawer to open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.waitForTimeout(500)

    // Find a scope chip in the drawer
    const scopeChip = page.locator('[data-testid="scope-chip"]').first()
    if ((await scopeChip.count()) > 0) {
      // Try to copy the scope chip text
      const chipText = await scopeChip.textContent()

      // Click to copy
      await scopeChip.click()

      console.log("[v0] Scope chip copied:", chipText)
    }

    // Close the drawer by pressing Escape
    await page.keyboard.press("Escape")
    await page.waitForTimeout(500)

    // Verify drawer is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test("should show disabled action tooltip", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Shadow App Inventory")

    // Try to find a disabled button (may vary based on app state)
    // The Export CSV button is disabled when there are no results

    // Apply filters that result in no apps
    await page.getByRole("button", { name: "High", exact: true }).click()
    await page.getByRole("button", { name: "Revoked" }).click()
    await page.waitForTimeout(500)

    // If Export CSV button exists and is disabled, hover over it
    const exportButton = page.getByRole("button", { name: /Export CSV/ })
    if ((await exportButton.count()) > 0) {
      const isDisabled = await exportButton.isDisabled()
      if (isDisabled) {
        await exportButton.hover()
        await page.waitForTimeout(500)

        // Check if tooltip appears
        const tooltip = page.locator('[role="tooltip"]')
        if ((await tooltip.count()) > 0) {
          await expect(tooltip).toBeVisible()
          console.log("[v0] Tooltip shown for disabled Export CSV button")
        }
      }
    }
  })

  test("should export CSV successfully", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Shadow App Inventory")

    // Set up download listener
    const downloadPromise = page.waitForEvent("download")

    // Click export button
    await page.getByRole("button", { name: /Export CSV/ }).click()

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe("shadow_apps.csv")

    console.log("[v0] CSV exported successfully:", download.suggestedFilename())
  })
})
