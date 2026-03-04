import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { Cashier } from "@shared/cashier";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.cashier.resolve.path, async (req, res) => {
    try {
      const giftId = req.query.giftId as string;
      const country = req.query.country as string;

      if (!giftId || !country) {
        return res.status(400).json({
          message: "giftId and country are required",
          field: "query"
        });
      }

      const result = Cashier.resolveGift(giftId, country);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
