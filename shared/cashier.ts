/**
 * THE CASHIER - Revenue Brain of WYNN
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

export interface GiftCommission {
  provider: string;
  commissionRate: number;
}

export interface GiftMapping {
  giftId: string;
  country: string;
  commissions: GiftCommission[];
}

export interface ResolvedGift {
  giftId: string;
  country: string;
  highestCommissionRate: number;
  provider: string;
}

// Static gift mapping table
const giftTable: GiftMapping[] = [
  {
    giftId: "GIFT_001",
    country: "US",
    commissions: [
      { provider: "ProviderA", commissionRate: 0.05 },
      { provider: "ProviderB", commissionRate: 0.08 },
    ],
  },
  {
    giftId: "GIFT_001",
    country: "UK",
    commissions: [
      { provider: "ProviderA", commissionRate: 0.04 },
      { provider: "ProviderC", commissionRate: 0.06 },
    ],
  },
  {
    giftId: "GIFT_002",
    country: "US",
    commissions: [
      { provider: "ProviderD", commissionRate: 0.10 },
      { provider: "ProviderE", commissionRate: 0.12 },
    ],
  }
];

export const Cashier = {
  /**
   * Resolve a gift by giftId + country.
   * Selects and returns the highest commission entry.
   * Returns structured data only.
   */
  resolveGift(giftId: string, country: string): ResolvedGift | null {
    const mapping = giftTable.find(
      (entry) => entry.giftId === giftId && entry.country === country
    );

    if (!mapping || mapping.commissions.length === 0) {
      return null;
    }

    // Select highest commission entry
    const highest = mapping.commissions.reduce((prev, current) => {
      return (prev.commissionRate > current.commissionRate) ? prev : current;
    });

    return {
      giftId,
      country,
      highestCommissionRate: highest.commissionRate,
      provider: highest.provider,
    };
  }
};
