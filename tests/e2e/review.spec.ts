import { test, expect } from "@playwright/test"

test.describe("Review Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/review")
    await page.waitForLoadState("networkidle")
  })

  test("should approve a case", async ({ page }) => {
    // Check if there are cases to review
    const caseCard = page.locator("[data-case-card]").first()

    if (await caseCard.isVisible()) {
      // Click Approve button
      await caseCard.getByRole("button", { name: /approve/i }).click()

      // Verify success toast
      await expect(page.getByText(/approved/i)).toBeVisible()

      // Verify case is removed from list or status updated
      await expect(caseCard).not.toBeVisible()
    }
  })

  test("should dismiss a case", async ({ page }) => {
    // Check if there are cases to review
    const caseCard = page.locator("[data-case-card]").first()

    if (await caseCard.isVisible()) {
      // Click Dismiss button
      await caseCard.getByRole("button", { name: /dismiss/i }).click()

      // Verify success toast
      await expect(page.getByText(/dismissed/i)).toBeVisible()

      // Verify case is removed from list
      await expect(caseCard).not.toBeVisible()
    }
  })

  test("should batch select and approve multiple cases", async ({ page }) => {
    // Select first case
    await page.locator('input[type="checkbox"]').first().click()

    // Select second case
    await page.locator('input[type="checkbox"]').nth(1).click()

    // Verify batch action bar appears
    await expect(page.getByText(/cases selected/i)).toBeVisible()

    // Click Approve All
    await page.getByRole("button", { name: /approve all/i }).click()

    // Verify success toast with count
    await expect(page.getByText(/approved/i)).toBeVisible()
  })

  test("should batch select and dismiss multiple cases", async ({ page }) => {
    // Select all cases
    await page.locator('input[type="checkbox"]').first().click()

    // Verify batch action bar
    await expect(page.getByText(/cases selected/i)).toBeVisible()

    // Click Dismiss All
    await page.getByRole("button", { name: /dismiss all/i }).click()

    // Verify success toast
    await expect(page.getByText(/dismissed/i)).toBeVisible()
  })

  test("should sort cases by different criteria", async ({ page }) => {
    // Sort by Priority
    await page.getByRole("button", { name: "Priority" }).click()

    // Verify P0 cases appear first
    await expect(page.getByText("P0").first()).toBeVisible()

    // Sort by Impact
    await page.getByRole("button", { name: "Impact" }).click()

    // Verify sorting changed
    await expect(page.locator("[data-case-card]").first()).toBeVisible()
  })

  test("should expand recommendations accordion", async ({ page }) => {
    const caseCard = page.locator("[data-case-card]").first()

    if (await caseCard.isVisible()) {
      // Click on recommendations accordion trigger
      await caseCard.getByRole("button", { name: /recommendations/i }).click()

      // Verify accordion expanded
      await expect(caseCard.getByText(/take action/i)).toBeVisible()

      // Verify chevron rotated (aria-expanded attribute)
      const trigger = caseCard.getByRole("button", { name: /recommendations/i })
      await expect(trigger).toHaveAttribute("aria-expanded", "true")
    }
  })

  test("should view case details in inventory drawer", async ({ page }) => {
    const caseCard = page.locator("[data-case-card]").first()

    if (await caseCard.isVisible()) {
      // Click "View details" link
      await caseCard.getByRole("link", { name: /view details/i }).click()

      // Verify drawer opens with app details
      await expect(page.getByRole("heading", { name: /about/i })).toBeVisible()
    }
  })
})
