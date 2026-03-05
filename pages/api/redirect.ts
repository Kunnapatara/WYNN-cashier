import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Cashier } from "../../shared/cashier";
import { optimizeRoute } from "../../shared/optimizer";
import { logRedirect } from "../../shared/logger";
import { trackClick } from "../../shared/tracker";

/**
 * Level 4 Phase 1 Optimization & Tracking Engine
 * Performs HTTP 302 redirect to optimized affiliate link with click tracking
 */
export default async function handler(req: Request, res: Response) {
  let { giftId, country } = req.query;

  // STEP 3: Add Country Auto-Fallback
  if (!country) {
    console.log("COUNTRY DEFAULTED TO US");
    country = "US";
  }

  if (!giftId) {
    return res.status(400).json({
      error: "Missing parameters",
      message: "giftId is required"
    });
  }

  // STEP 2: Call Optimization Logic
  console.log("OPTIMIZER START", { giftId, country });
  const optimized = optimizeRoute(giftId as string, country as string);
  console.log("OPTIMIZER RESULT", optimized);

  if (!optimized) {
    return res.status(404).json({
      error: "Not Found",
      message: "No mapping or optimization found for the provided giftId and country"
    });
  }

  // Generate clickId for tracking
  const clickId = uuidv4();

  // STEP 4: Internal Logging
  logRedirect({
    timestamp: new Date().toISOString(),
    giftId: optimized.giftId,
    country: optimized.country,
    selectedProvider: optimized.selectedProvider,
    commissionWeight: optimized.commissionWeight,
    isFallback: optimized.isFallback
  });

  // Track the click internally
  trackClick({
    clickId,
    giftId: optimized.giftId,
    provider: optimized.selectedProvider,
    country: optimized.country,
    timestamp: new Date().toISOString()
  });

  console.log("CLICK TRACKED", { clickId });

  // Generate affiliate link with clickId
  const affiliateLink = `https://affiliate.wynn.com/redirect?provider=${optimized.selectedProvider}&giftId=${optimized.giftId}&country=${optimized.country}&clickId=${clickId}`;

  // Perform HTTP 302 redirect
  console.log("REDIRECT STATUS: 302");
  return res.redirect(302, affiliateLink);
}
