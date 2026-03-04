import type { Request, Response } from 'express';
import { Cashier } from "../../shared/cashier";
import { optimizeRoute } from "../../shared/optimizer";
import { logRedirect } from "../../shared/logger";

/**
 * Level 3 Optimization Engine
 * Performs HTTP 302 redirect to optimized affiliate link
 */
export default async function handler(req: Request, res: Response) {
  let { giftId, country } = req.query;

  // STEP 3: Add Country Auto-Fallback
  if (!country) {
    country = "US";
  }

  if (!giftId) {
    return res.status(400).json({
      error: "Missing parameters",
      message: "giftId is required"
    });
  }

  // STEP 2: Call Optimization Logic
  const optimized = optimizeRoute(giftId as string, country as string);

  if (!optimized) {
    return res.status(404).json({
      error: "Not Found",
      message: "No mapping or optimization found for the provided giftId and country"
    });
  }

  // STEP 4: Internal Logging
  logRedirect({
    timestamp: new Date().toISOString(),
    giftId: optimized.giftId,
    country: optimized.country,
    selectedProvider: optimized.selectedProvider,
    commissionWeight: optimized.commissionWeight,
    isFallback: optimized.isFallback
  });

  // Generate affiliate link
  const affiliateLink = `https://affiliate.wynn.com/redirect?provider=${optimized.selectedProvider}&giftId=${optimized.giftId}&country=${optimized.country}`;

  // Perform HTTP 302 redirect
  return res.redirect(302, affiliateLink);
}
