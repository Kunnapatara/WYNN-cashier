# Cashier Smart Routing - Level 4 Phase 2 Upgrade

## Overview

The Cashier system has been upgraded from static commission-based resolution to an intelligent **Smart Routing EPC-based Provider Selection Engine**. This transformation enables intelligent revenue optimization by considering multiple performance factors beyond simple commission rates.

## Key Features

### 1. Enhanced Provider Model

Providers now include comprehensive performance metrics:

```typescript
interface Provider {
  provider: string;
  commission: number;                // Commission percentage (0-1)
  successRate: number;                // Success rate (0-1)
  approvalWeight: number;             // Approval multiplier (default 1)
  averageOrderValue?: number;         // AOV for high-value calculations
  conversionRate?: number;            // Conversion rate (0-1)
}
```

### 2. Intelligent Scoring System

#### Base Score Calculation
```
baseScore = commission × successRate × approvalWeight
```

#### EPC Score Calculation (when advanced metrics available)
```
epcScore = commission × averageOrderValue × conversionRate × successRate
```

The system automatically uses the higher-scoring method:
- If `averageOrderValue` and `conversionRate` are provided → Use **EPC Score**
- Otherwise → Use **Base Score**

### 3. Smart Routing Response

The `Cashier.resolveGift()` method now returns comprehensive routing results:

```typescript
interface SmartRoutingResult {
  giftId: string;
  country: string;
  primary: ProviderScore;           // Best-scored provider
  fallback: ProviderScore[];        // Remaining providers, sorted
}

interface ProviderScore {
  provider: string;
  score: number;                    // Calculated score
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
```

## Implementation Details

### Deterministic & Side-Effect Free

- ✓ No mutations of original provider arrays
- ✓ Same input always produces identical results
- ✓ Pure functional scoring methods
- ✓ No external dependencies or I/O

### Backward Compatibility

A legacy interface method is provided for existing consumers:

```typescript
// New smart routing (recommended)
const result = Cashier.resolveGift(giftId, country);
// Returns: SmartRoutingResult { primary: {...}, fallback: [...] }

// Legacy format (backward compatible)
const legacyResult = Cashier.resolveLegacy(giftId, country);
// Returns: ResolvedGift { provider: "...", highestCommissionRate: 0.XX }
```

### Express Route Integration

The existing Express route `GET /api/cashier/resolve` automatically benefits from the upgrade:

```typescript
app.get(api.cashier.resolve.path, async (req, res) => {
  const result = Cashier.resolveGift(giftId, country);
  res.status(200).json(result);  // Now returns smart routing result
});
```

**No route changes required** - it works seamlessly with the new response format.

## Scoring Examples

### Example 1: High Commission, Lower Success Rate vs. Lower Commission, Higher Success Rate

**Provider A:**
- Commission: 8% | Success Rate: 88% | Approval Weight: 0.95
- Base Score: 0.08 × 0.88 × 0.95 = **0.00672**

**Provider B:**
- Commission: 5% | Success Rate: 92% | Approval Weight: 1.0
- Base Score: 0.05 × 0.92 × 1.0 = **0.046**

**Winner:** Provider B (better reliability, optimal balance)

### Example 2: EPC Scoring with High-Value Items

**Provider D:**
- Commission: 10% | AOV: $100 | Conversion: 12% | Success: 95%
- Base Score: 0.10 × 0.95 × 1.05 = **0.00995**
- EPC Score: 0.10 × 100 × 0.12 × 0.95 = **1.14**
- **Final Score: 1.14** (uses EPC)

**Provider E:**
- Commission: 12% | AOV: $95 | Conversion: 10% | Success: 82%
- Base Score: 0.12 × 0.82 × 0.85 = **0.00835**
- EPC Score: 0.12 × 95 × 0.10 × 0.82 = **0.09348**
- **Final Score: 0.09348** (uses EPC)

**Winner:** Provider D (significantly higher EPC score for high-value items)

## Architecture

### Core Components

1. **Provider Database** - Static configuration with provider metrics
2. **Scoring Engine** - Calculates base and EPC scores
3. **Routing Logic** - Selects primary and fallback providers
4. **Type System** - Full TypeScript support with clear interfaces

### Method Access

All scoring methods are private (`private`) to maintain encapsulation:
- `calculateBaseScore()` - Internal scoring
- `calculateEpcScore()` - Internal EPC calculation
- `calculateScore()` - Unified scoring with breakdown
- `getProviders()` - Internal data retrieval

Public methods:
- `resolveGift()` - Smart routing with full results
- `resolveLegacy()` - Legacy format wrapper

## Testing

Run the test suite to verify the implementation:

```bash
npx ts-node shared/cashier.test.ts
```

The test suite validates:
- ✓ Smart routing for multiple gift/country combinations
- ✓ Primary provider selection
- ✓ Fallback provider sorting
- ✓ Score calculation accuracy
- ✓ EPC vs. base scoring logic
- ✓ Deterministic behavior
- ✓ Legacy interface compatibility
- ✓ Null handling for non-existent gifts

## Migration Guide

### For Existing Consumers

If you're using the old API:

```typescript
// Old way (still works via resolveLegacy)
const result = Cashier.resolveLegacy(giftId, country);
console.log(result.provider);           // Provider name
console.log(result.highestCommissionRate);  // Commission
```

### Recommended Way (New)

```typescript
// New way (recommended)
const result = Cashier.resolveGift(giftId, country);
if (result) {
  console.log(result.primary.provider);    // Best provider
  console.log(result.primary.score);       // Final score
  console.log(result.fallback);            // Alternatives
}
```

## Configuration

Provider data is stored in the provider database within `shared/cashier.ts`:

```typescript
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
      // ... more providers
    ],
  },
  // ... more gift/country combos
];
```

To add new providers or adjust metrics:
1. Update the `providerDatabase` array
2. No other changes required (pure data configuration)
3. System automatically recalculates scores

## Performance Characteristics

- **Time Complexity:** O(n log n) - linear scoring + sort
- **Space Complexity:** O(n) - creates score objects for each provider
- **Execution:** Synchronous, deterministic
- **No external I/O:** Pure in-memory computation

## Compliance

✓ Follows all THE CASHIER rules:
1. Isolated revenue logic
2. No external API calls
3. No user redirection
4. No internet access
5. No auto-detection
6. No analytics collection
7. No UI modification
8. No new dependencies
9. Side-effect free

## Future Enhancements

Potential improvements while maintaining core principles:
- A/B testing support with statistical confidence
- Dynamic scoring adjustments based on time-of-day
- Geo-regional performance weighting
- Seasonal provider performance optimization
- Multi-objective optimization (revenue vs. approval rate)

## Support

For issues or questions:
1. Check test suite: `shared/cashier.test.ts`
2. Review type definitions: `shared/cashier.ts`
3. Validate routes: `server/routes.ts`
4. Check API schema: `shared/routes.ts`
