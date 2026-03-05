/**
 * THE CASHIER - Revenue Brain of WYNN
 * 
 * Level 4 Phase 2: Smart Routing EPC-based Provider Selection Engine
 * 
 * Rules:
 * 1. THE CASHIER is isolated.
 * 2. THE CASHIER contains only internal logic.
 * 3. THE CASHIER does NOT connect to any external API.
 * 4. THE CASHIER does NOT redirect users.
 * 5. THE CASHIER does NOT fetch from internet.
 * 6. THE CASHIER does NOT auto-detect country.
 * 7. THE CASHIER does NOT perform analytics.
 * 8. THE CASHIER does NOT modify UI.
 * 9. THE CASHIER does NOT depend on any new libraries.
 */

/**
 * Enhanced Provider model with EPC scoring metrics
 */
export interface Provider {
  provider: string;
  commission: number;
  successRate: number;
  approvalWeight: number;
  averageOrderValue?: number;
  conversionRate?: number;
}

/**
 * Legacy interface for backward compatibility
 */
export interface GiftCommission {
  provider: string;
  commissionRate: number;
}

export interface GiftMapping {
  giftId: string;
  country: string;
  commissions: GiftCommission[];
}

/**
 * Legacy interface for backward compatibility
 */
export interface ResolvedGift {
  giftId: string;
  country: string;
  highestCommissionRate: number;
  provider: string;
}

/**
 * New response format with smart routing results
 */
export interface SmartRoutingResult {
  giftId: string;
  country: string;
  primary: ProviderScore;
  fallback: ProviderScore[];
}

/**
 * Provider with calculated score
 */
export interface ProviderScore {
  provider: string;
  score: number;
  commission: number;
  successRate: number;
  approvalWeight: number;
  averageOrderValue?: number;
  conversionRate?: number;
  scoreBreakdown?: {
    baseScore: number;
    epcScore?: number;
    finalScore: number;
  };
}

/**
 * Enhanced provider database with EPC metrics
 */
interface ProviderDatabase {
  giftId: string;
  country: string;
  providers: Provider[];
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
        conversionRate: 0.08,
      },
      {
        provider: "ProviderB",
        commission: 0.08,
        successRate: 0.88,
        approvalWeight: 0.95,
        averageOrderValue: 45,
        conversionRate: 0.07,
      },
    ],
  },
  {
    giftId: "GIFT_001",
    country: "UK",
    providers: [
      {
        provider: "ProviderA",
        commission: 0.04,
        successRate: 0.90,
        approvalWeight: 1.0,
        averageOrderValue: 45,
        conversionRate: 0.075,
      },
      {
        provider: "ProviderC",
        commission: 0.06,
        successRate: 0.85,
        approvalWeight: 0.9,
        averageOrderValue: 40,
        conversionRate: 0.065,
      },
    ],
  },
  {
    giftId: "GIFT_002",
    country: "US",
    providers: [
      {
        provider: "ProviderD",
        commission: 0.10,
        successRate: 0.95,
        approvalWeight: 1.05,
        averageOrderValue: 100,
        conversionRate: 0.12,
      },
      {
        provider: "ProviderE",
        commission: 0.12,
        successRate: 0.82,
        approvalWeight: 0.85,
        averageOrderValue: 95,
        conversionRate: 0.10,
      },
    ],
  },
];

export const Cashier = {
  /**
   * Calculate base score for a provider.
   * baseScore = commission * successRate * approvalWeight
   * @internal
   */
  private calculateBaseScore(provider: Provider): number {
    return provider.commission * provider.successRate * provider.approvalWeight;
  },

  /**
   * Calculate EPC score for a provider when advanced metrics are available.
   * epc = commission * averageOrderValue * conversionRate * successRate
   * @internal
   */
  private calculateEpcScore(provider: Provider): number | undefined {
    if (!provider.averageOrderValue || !provider.conversionRate) {
      return undefined;
    }
    return (
      provider.commission *
      provider.averageOrderValue *
      provider.conversionRate *
      provider.successRate
    );
  },

  /**
   * Calculate the final score for a provider.
   * Uses EPC score if available, otherwise falls back to base score.
   * @internal
   */
  private calculateScore(provider: Provider): ProviderScore {
    const baseScore = this.calculateBaseScore(provider);
    const epcScore = this.calculateEpcScore(provider);
    const finalScore = epcScore ?? baseScore;

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
        finalScore,
      },
    };
  },

  /**
   * Retrieve providers for a gift + country combination.
   * @internal
   */
  private getProviders(giftId: string, country: string): Provider[] | null {
    const entry = providerDatabase.find(
      (db) => db.giftId === giftId && db.country === country
    );
    return entry?.providers ?? null;
  },

  /**
   * Smart routing using EPC-based provider selection.
   * Returns primary provider and fallback list, all scored and sorted.
   * Deterministic, side-effect free.
   */
  resolveGift(giftId: string, country: string): SmartRoutingResult | ResolvedGift | null {
    // Retrieve providers for this gift + country
    const providers = this.getProviders(giftId, country);

    if (!providers || providers.length === 0) {
      return null;
    }

    // Calculate scores for all providers (non-mutating)
    const scoredProviders = providers
      .map((p) => this.calculateScore(p))
      .sort((a, b) => b.score - a.score);

    // Return smart routing result with primary and fallback
    const [primary, ...fallback] = scoredProviders;

    return {
      giftId,
      country,
      primary,
      fallback,
    };
  },

  /**
   * Legacy interface for backward compatibility.
   * Returns ResolvedGift format for existing API consumers.
   * Uses the primary provider from smart routing.
   */
  resolveLegacy(giftId: string, country: string): ResolvedGift | null {
    const result = this.resolveGift(giftId, country);

    if (!result || "provider" in result) {
      // Already in legacy format or null
      return result as ResolvedGift | null;
    }

    // Convert smart routing result to legacy format
    return {
      giftId,
      country,
      highestCommissionRate: result.primary.commission,
      provider: result.primary.provider,
    };
  },
};
