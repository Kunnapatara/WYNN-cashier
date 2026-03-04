import type { Request, Response } from 'express';
import { Cashier } from "../../shared/cashier";

/**
 * Level 2 Redirect Engine
 * Performs HTTP 302 redirect to resolved affiliate link
 */
export default async function handler(req: Request, res: Response) {
  const { giftId, country } = req.query;

  if (!giftId || !country) {
    return res.status(400).json({
      error: "Missing parameters",
      message: "giftId and country are required"
    });
  }

  const resolved = Cashier.resolveGift(giftId as string, country as string);

  if (!resolved) {
    return res.status(404).json({
      error: "Not Found",
      message: "No mapping found for the provided giftId and country"
    });
  }

  // Generate affiliate link (In Level 2, this is a mock URL based on the provider)
  const affiliateLink = `https://affiliate.wynn.com/redirect?provider=${resolved.provider}&giftId=${resolved.giftId}&country=${resolved.country}`;

  // Perform HTTP 302 redirect
  return res.redirect(302, affiliateLink);
}
