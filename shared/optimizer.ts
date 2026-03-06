import { Cashier, type ResolvedGift } from "./cashier";

export type ProviderConfig = {
  provider: string;
  commissionWeight: number;
  priority: number;
  countries: string[];
};

const providers: ProviderConfig[] = [
  {
    provider: "Provider_Alpha",
    commissionWeight: 0.15,
    priority: 1,
    countries: ["US", "UK", "CA"],
  },
  {
    provider: "Provider_Beta",
    commissionWeight: 0.12,
    priority: 2,
    countries: ["US", "DE"],
  },
  {
    provider: "Provider_Gamma",
    commissionWeight: 0.10,
    priority: 3,
    countries: ["UK", "FR"],
  },
  {
    provider: "Provider_Delta",
    commissionWeight: 0.08,
    priority: 4,
    countries: ["US", "UK", "CA", "DE", "FR"],
  },
];

export interface OptimizationResult {
  giftId: string;
  country: string;
  selectedProvider: string;
  commissionWeight: number;
  isFallback: boolean;
}

export function optimizeRoute(
  giftId: string,
  country: string = "US"
): OptimizationResult | null {

  // STEP 1 — Filter providers by country
  const eligibleProviders = providers.filter((p) =>
    p.countries.includes(country)
  );

  if (eligibleProviders.length > 0) {

    // STEP 2 — Sort providers
    const sortedProviders = [...eligibleProviders].sort((a, b) => {

      if (b.commissionWeight !== a.commissionWeight) {
        return b.commissionWeight - a.commissionWeight;
      }

      return a.priority - b.priority;

    });

    const bestProvider = sortedProviders[0];

    return {
      giftId,
      country,
      selectedProvider: bestProvider.provider,
      commissionWeight: bestProvider.commissionWeight,
      isFallback: false,
    };
  }

  // STEP 3 — Fallback to THE CASHIER legacy resolver
  const legacyResolved: ResolvedGift | null =
    Cashier.resolveLegacy(giftId, country);

  if (legacyResolved) {
    return {
      giftId: legacyResolved.giftId,
      country: legacyResolved.country,
      selectedProvider: legacyResolved.provider,
      commissionWeight: legacyResolved.highestCommissionRate,
      isFallback: true,
    };
  }

  return null;
}