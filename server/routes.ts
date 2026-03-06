import type { Express, Request, Response } from "express";
import { Server } from "http";
import { Cashier } from "../shared/cashier";

export async function registerRoutes(server: Server, app: Express) {

  app.get("/api/resolve", (req: Request, res: Response) => {

    try {

      const giftId = req.query.giftId as string | undefined;
      const country = (req.query.country as string | undefined) ?? "US";

      if (!giftId) {
        return res.status(400).json({
          error: "giftId parameter is required"
        });
      }

      const result = Cashier.resolveGift(giftId, country);

      if (!result) {
        return res.status(404).json({
          error: "No provider found"
        });
      }

      const provider = result.primary.provider;

      const providerLinks: Record<string, string> = {
        ProviderA: "https://example.com/a",
        ProviderB: "https://example.com/b",
        ProviderC: "https://example.com/c",
        ProviderD: "https://example.com/d",
        ProviderE: "https://example.com/e"
      };

      const url = providerLinks[provider];

      if (!url) {
        return res.status(404).json({
          error: "Provider link not found"
        });
      }

      return res.redirect(302, url);

    } catch (err) {

      console.error("Resolve API error:", err);

      return res.status(500).json({
        error: "Redirect engine error"
      });

    }

  });

}