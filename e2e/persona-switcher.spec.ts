import { test, expect } from "@playwright/test"

test.describe("PersonaSwitcher", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
    // Wait for page to load
    await page.waitForLoadState("networkidle")
  })

  test("shows exactly two persona options without duplicates", async ({ page }) => {
    // Click the persona switcher button
    await page.getByRole("button", { name: /current persona/i }).click()

    // Wait for menu to appear
    await page.waitForSelector('[role="menuitemradio"]')

    // Get all menu items
    const items = page.getByRole("menuitemradio")
    await expect(items).toHaveCount(2)

    // Verify both personas are present
    const firstItem = items.nth(0)
    const secondItem = items.nth(1)

    const firstText = await firstItem.textContent()
    const secondText = await secondItem.textContent()

    expect([firstText, secondText]).toEqual(expect.arrayContaining(["SecOps", "CISO"]))

    // Verify no duplicates
    expect(firstText).not.toBe(secondText)
  })

  test("highlights the active persona with checkmark", async ({ page }) => {
    // Click the persona switcher
    await page.getByRole("button", { name: /current persona/i }).click()

    // Find the checked item
    const checkedItem = page.getByRole("menuitemradio", { checked: true })
    await expect(checkedItem).toBeVisible()

    // Verify it has a checkmark (Check icon)
    const checkIcon = checkedItem.locator('svg[class*="lucide-check"]')
    await expect(checkIcon).toBeVisible()
  })

  test("switches persona and updates button text", async ({ page }) => {
    // Get initial persona
    const button = page.getByRole("button", { name: /current persona/i })
    const initialText = await button.textContent()

    // Open menu
    await button.click()

    // Find and click the inactive persona
    const items = await page.getByRole("menuitemradio").all()
    let inactiveItem = null

    for (const item of items) {
      const isChecked = await item.getAttribute("aria-checked")
      if (isChecked === "false") {
        inactiveItem = item
        break
      }
    }

    expect(inactiveItem).not.toBeNull()
    await inactiveItem!.click()

    // Wait for menu to close
    await expect(page.getByRole("menuitemradio").first()).not.toBeVisible()

    // Verify button text changed
    const newText = await button.textContent()
    expect(newText).not.toBe(initialText)
    expect(["SecOps", "CISO"]).toContain(newText?.trim())
  })

  test("menu aligns to the right with proper offset", async ({ page }) => {
    const button = page.getByRole("button", { name: /current persona/i })
    await button.click()

    const menu = page.locator('[role="menu"]').first()
    await expect(menu).toBeVisible()

    // Get bounding boxes
    const buttonBox = await button.boundingBox()
    const menuBox = await menu.boundingBox()

    expect(buttonBox).not.toBeNull()
    expect(menuBox).not.toBeNull()

    // Verify menu is aligned to the right of button
    // Menu right edge should be close to button right edge
    const buttonRight = buttonBox!.x + buttonBox!.width
    const menuRight = menuBox!.x + menuBox!.width

    // Allow 10px tolerance for alignment
    expect(Math.abs(buttonRight - menuRight)).toBeLessThan(10)

    // Verify menu has vertical offset (should be below button with gap)
    expect(menuBox!.y).toBeGreaterThan(buttonBox!.y + buttonBox!.height)
  })

  test("closes menu on ESC key", async ({ page }) => {
    // Open menu
    await page.getByRole("button", { name: /current persona/i }).click()

    const menu = page.getByRole("menuitemradio").first()
    await expect(menu).toBeVisible()

    // Press ESC
    await page.keyboard.press("Escape")

    // Verify menu closed
    await expect(menu).not.toBeVisible()
  })

  test("closes menu when clicking outside", async ({ page }) => {
    // Open menu
    await page.getByRole("button", { name: /current persona/i }).click()

    const menu = page.getByRole("menuitemradio").first()
    await expect(menu).toBeVisible()

    // Click outside (on the page title)
    await page.getByRole("heading", { name: /shadow it dashboard/i }).click()

    // Verify menu closed
    await expect(menu).not.toBeVisible()
  })

  test("has proper accessibility attributes", async ({ page }) => {
    const button = page.getByRole("button", { name: /current persona/i })

    // Verify button has aria-label
    await expect(button).toHaveAttribute("aria-label", /current persona/i)

    // Verify aria-expanded changes
    await expect(button).toHaveAttribute("aria-expanded", "false")

    await button.click()
    await expect(button).toHaveAttribute("aria-expanded", "true")

    // Verify menu items have proper role
    const items = page.getByRole("menuitemradio")
    expect(await items.count()).toBe(2)

    // Verify one item is checked
    const checkedItems = await page.getByRole("menuitemradio", { checked: true }).count()
    expect(checkedItems).toBe(1)
  })

  test("has visible focus ring on keyboard navigation", async ({ page }) => {
    const button = page.getByRole("button", { name: /current persona/i })

    // Tab to focus the button
    await page.keyboard.press("Tab")

    // Check if button is focused (we can't directly test focus ring visibility,
    // but we can verify the button receives focus)
    await expect(button).toBeFocused()

    // Verify button has focus-visible styles (ring-2 ring-accent-cyan)
    const className = await button.getAttribute("class")
    expect(className).toContain("focus-visible:ring-2")
    expect(className).toContain("focus-visible:ring-[var(--accent-cyan)]")
  })
})
