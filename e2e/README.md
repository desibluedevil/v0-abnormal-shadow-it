# E2E Tests for Shadow IT Dashboard

This directory contains Playwright end-to-end tests for the Shadow IT Dashboard application.

## Test Coverage

### Inventory Page (`inventory.spec.ts`)
- Change risk filters (High, Medium, Low, All)
- Change status filters (Unsanctioned, Sanctioned, Revoked, Dismissed, All)
- Search for apps by name, publisher, or tag
- Open app drawer and interact with scope chips
- Copy scope chips to clipboard
- Test disabled action tooltips
- Export inventory data to CSV

### Review Page (`review.spec.ts`)
- Approve individual cases
- Dismiss individual cases
- Batch approve multiple cases
- Batch dismiss multiple cases
- Change sort options (Priority, Impact, Confidence, Last Event)
- Verify toast notifications for actions

### Settings Page (`settings.spec.ts`)
- Toggle email notifications
- Toggle Slack notifications
- Change risk threshold (High, Medium, Low)
- Save settings changes
- Send test alert
- Configure Slack webhook URL
- Verify alert preview updates

### Audit Page (`audit.spec.ts`)
- Change action type filters (Revoke, Sessions, Notify, Ticket, All)
- Change status filters (Success, Error, All)
- Search audit receipts by actor, app, or details
- Select date range for filtering
- Expand and collapse receipt details
- Copy receipt IDs to clipboard
- Export audit receipts to CSV

### Navigation (`navigation.spec.ts`)
- Navigate between all pages (Dashboard, Inventory, Review, Audit, Settings)
- Test skip-to-content accessibility link

## Running Tests

\`\`\`bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
\`\`\`

## Test Configuration

Tests are configured to:
- Run against `http://localhost:3000`
- Start the dev server automatically if not running
- Take screenshots on failure
- Generate an HTML report
- Run in Chromium browser by default

## Writing New Tests

When adding new tests:
1. Use descriptive test names that explain what is being tested
2. Add console.log statements with `[v0]` prefix for debugging
3. Wait for appropriate timeouts after interactions
4. Check for toast notifications to verify actions
5. Test both success and error scenarios where applicable

## Test Data Attributes

For more robust selectors, consider adding `data-testid` attributes to components:
- `data-testid="scope-chip"` for scope chips
- `data-testid="app-drawer"` for the app details drawer
- `data-testid="filter-risk"` for risk filter buttons
- etc.
