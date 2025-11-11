import { describe, it, expect } from "vitest"
import { computeOverview } from "./overview-math"

describe("computeOverview", () => {
  it("handles normal data", () => {
    const result = computeOverview({
      totalApps: 100,
      unsanctioned: 25,
      highRisk: 10,
      usersInvolved: 50,
      remediated: 15,
      prev: {
        usersInvolved: 45,
        remediated: 12,
      },
    })

    expect(result.cards).toHaveLength(4)
    expect(result.cards[0].key).toBe("unsanctioned")
    expect(result.cards[0].value).toBe(25)
    expect(result.cards[0].percent).toBe(25) // 25/100
    expect(result.cards[0].label).toBe("25%")

    expect(result.cards[1].key).toBe("highRisk")
    expect(result.cards[1].value).toBe(10)
    expect(result.cards[1].percent).toBe(10) // 10/100

    expect(result.cards[2].key).toBe("usersInvolved")
    expect(result.cards[2].value).toBe(50)
    expect(result.cards[2].percent).toBe(11) // (50-45)/45 * 100 = 11.1% rounded

    expect(result.cards[3].key).toBe("remediated")
    expect(result.cards[3].value).toBe(15)
    expect(result.cards[3].percent).toBe(25) // (15-12)/12 * 100 = 25%
  })

  it("handles zero denominators", () => {
    const result = computeOverview({
      totalApps: 0,
      unsanctioned: 0,
      highRisk: 0,
      usersInvolved: 10,
      remediated: 5,
      prev: {
        usersInvolved: 0,
        remediated: 0,
      },
    })

    expect(result.cards[0].percent).toBeNull()
    expect(result.cards[0].label).toBe("—")
    expect(result.cards[1].percent).toBeNull()
    expect(result.cards[1].label).toBe("—")
    expect(result.cards[2].percent).toBe(100) // 10 users from 0
    expect(result.cards[3].percent).toBe(100) // 5 remediated from 0
  })

  it("handles missing prev data", () => {
    const result = computeOverview({
      totalApps: 50,
      unsanctioned: 10,
      highRisk: 5,
      usersInvolved: 20,
      remediated: 8,
      // No prev data
    })

    expect(result.cards[2].percent).toBe(100) // users from 0
    expect(result.cards[2].label).toBe("100%")
    expect(result.cards[3].percent).toBe(100) // remediated from 0
  })
})
