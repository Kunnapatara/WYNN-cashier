/**
 * THE CASHIER - Revenue Brain of WYNN
 *
 * Smart Routing Engine
 *
 * RULES
 * 1. Internal logic only
 * 2. No external API calls
 * 3. No redirects
 * 4. No UI modification
 * 5. No network requests
 * 6. No analytics
 */

export interface Provider {
  provider: string
  commission: number
  successRate: number
  approvalWeight: number
  averageOrderValue?: number
  conversionRate?: number
}

export interface ProviderScore {
  provider: string
  score: number
  commission: number
  successRate: number
  approvalWeight: number
  averageOrderValue?: number
  conversionRate?: number
  scoreBreakdown?: {
    baseScore: number
    epcScore?: number
    finalScore: number
  }
}

export interface SmartRoutingResult {
  giftId: string
  country: string
  primary: ProviderScore
  fallback: ProviderScore[]
}

export interface ResolvedGift {
  giftId: string
  country: string
  highestCommissionRate: number
  provider: string
}

interface ProviderDatabase {
  giftId: string
  country: string
  providers: Provider[]
}

const providerDatabase: ProviderDatabase[] = [
  {
    giftId: "GIFT_001",
    country: "US",
    providers: [
      {
        provider: "ProviderA",
        commission: 0.05,
        successRate: 0.92,
        approvalWeight: 1.0,
        averageOrderValue: 50,
        conversionRate: 0.08
      },
      {
        provider: "ProviderB",
        commission: 0.08,
        successRate: 0.88,
        approvalWeight: 0.95,
        averageOrderValue: 45,
        conversionRate: 0.07
      }
    ]
  },
  {
    giftId: "GIFT_001",
    country: "UK",
    providers: [
      {
        provider: "ProviderA",
        commission: 0.04,
        successRate: 0.9,
        approvalWeight: 1.0,
        averageOrderValue: 45,
        conversionRate: 0.075
      },
      {
        provider: "ProviderC",
        commission: 0.06,
        successRate: 0.85,
        approvalWeight: 0.9,
        averageOrderValue: 40,
        conversionRate: 0.065
      }
    ]
  },
  {
    giftId: "GIFT_002",
    country: "US",
    providers: [
      {
        provider: "ProviderD",
        commission: 0.1,
        successRate: 0.95,
        approvalWeight: 1.05,
        averageOrderValue: 100,
        conversionRate: 0.12
      },
      {
        provider: "ProviderE",
        commission: 0.12,
        successRate: 0.82,
        approvalWeight: 0.85,
        averageOrderValue: 95,
        conversionRate: 0.1
      }
    ]
  }
]

export const Cashier = {

  calculateBaseScore(provider: Provider): number {
    return provider.commission * provider.successRate * provider.approvalWeight
  },

  calculateEpcScore(provider: Provider): number | undefined {

    if (
      provider.averageOrderValue === undefined ||
      provider.conversionRate === undefined
    ) {
      return undefined
    }

    return (
      provider.commission *
      provider.averageOrderValue *
      provider.conversionRate *
      provider.successRate
    )
  },

  calculateScore(provider: Provider): ProviderScore {

    const baseScore = Cashier.calculateBaseScore(provider)
    const epcScore = Cashier.calculateEpcScore(provider)

    const finalScore = epcScore ?? baseScore

    return {
      provider: provider.provider,
      score: finalScore,
      commission: provider.commission,
      successRate: provider.successRate,
      approvalWeight: provider.approvalWeight,
      averageOrderValue: provider.averageOrderValue,
      conversionRate: provider.conversionRate,
      scoreBreakdown: {
        baseScore,
        epcScore,
        finalScore
      }
    }
  },

  getProviders(giftId: string, country: string): Provider[] | null {

    const entry = providerDatabase.find(
      (db) => db.giftId === giftId && db.country === country
    )

    return entry ? entry.providers : null
  },

  resolveGift(
    giftId: string,
    country: string
  ): SmartRoutingResult | null {

    const providers = Cashier.getProviders(giftId, country)

    if (!providers || providers.length === 0) {
      return null
    }

    const scoredProviders = providers
      .map((p) => Cashier.calculateScore(p))
      .sort((a, b) => b.score - a.score)

    return {
      giftId,
      country,
      primary: scoredProviders[0],
      fallback: scoredProviders.slice(1)
    }
  },

  resolveLegacy(
    giftId: string,
    country: string
  ): ResolvedGift | null {

    const result = Cashier.resolveGift(giftId, country)

    if (!result) return null

    return {
      giftId,
      country,
      highestCommissionRate: result.primary.commission,
      provider: result.primary.provider
    }
  }
}