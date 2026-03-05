import { z } from "zod";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

/**
 * Provider score schema for smart routing
 */
const providerScoreSchema = z.object({
  provider: z.string(),
  score: z.number(),
  commission: z.number(),
  successRate: z.number(),
  approvalWeight: z.number(),
  averageOrderValue: z.number().optional(),
  conversionRate: z.number().optional(),
  scoreBreakdown: z.object({
    baseScore: z.number(),
    epcScore: z.number().optional(),
    finalScore: z.number(),
  }).optional(),
});

/**
 * Smart routing response schema (Level 4 Phase 2)
 */
const smartRoutingResultSchema = z.object({
  giftId: z.string(),
  country: z.string(),
  primary: providerScoreSchema,
  fallback: z.array(providerScoreSchema),
});

/**
 * Legacy response schema (backward compatibility)
 */
const legacyResolveSchema = z.object({
  giftId: z.string(),
  country: z.string(),
  highestCommissionRate: z.number(),
  provider: z.string()
}).nullable();

export const api = {
  cashier: {
    resolve: {
      method: "GET" as const,
      path: "/api/cashier/resolve" as const,
      responses: {
        200: smartRoutingResultSchema.or(legacyResolveSchema),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
