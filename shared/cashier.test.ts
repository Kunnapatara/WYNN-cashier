/**
 * Test suite for Cashier Smart Routing EPC-based Provider Selection
 * Level 4 Phase 2 Verification
 */

import { Cashier, SmartRoutingResult, ResolvedGift, type ProviderScore } from "./cashier";

function testSmartRouting() {
  console.log("\n═══════════════════════════════════════════════");
  console.log("CASHIER SMART ROUTING TEST SUITE");
  console.log("═══════════════════════════════════════════════\n");

  // Test 1: Resolve GIFT_001 in US
  console.log("TEST 1: Resolve GIFT_001 in US");
  console.log("─────────────────────────────────");
  const result1 = Cashier.resolveGift("GIFT_001", "US");
  console.log("Result:", JSON.stringify(result1, null, 2));
  
  if (result1 && "primary" in result1) {
    const sr1 = result1 as SmartRoutingResult;
    console.log(`✓ Primary Provider: ${sr1.primary.provider}`);
    console.log(`  Score: ${sr1.primary.score.toFixed(6)}`);
    console.log(`  Commission: ${sr1.primary.commission}`);
    console.log(`  Success Rate: ${sr1.primary.successRate}`);
    console.log(`  Score Breakdown:`, sr1.primary.scoreBreakdown);
    console.log(`✓ Fallback Providers: ${sr1.fallback.length}`);
    sr1.fallback.forEach((fb, idx) => {
      console.log(`  [${idx}] ${fb.provider}: ${fb.score.toFixed(6)}`);
    });
  } else {
    console.log("✗ Failed: Expected SmartRoutingResult");
  }

  // Test 2: Resolve GIFT_001 in UK
  console.log("\nTEST 2: Resolve GIFT_001 in UK");
  console.log("─────────────────────────────────");
  const result2 = Cashier.resolveGift("GIFT_001", "UK");
  if (result2 && "primary" in result2) {
    const sr2 = result2 as SmartRoutingResult;
    console.log(`✓ Primary Provider: ${sr2.primary.provider}`);
    console.log(`  Score: ${sr2.primary.score.toFixed(6)}`);
    console.log(`✓ Fallback Providers: ${sr2.fallback.length}`);
  } else {
    console.log("✗ Failed: Expected SmartRoutingResult");
  }

  // Test 3: Resolve GIFT_002 in US (higher value items)
  console.log("\nTEST 3: Resolve GIFT_002 in US (High AOV)");
  console.log("─────────────────────────────────");
  const result3 = Cashier.resolveGift("GIFT_002", "US");
  if (result3 && "primary" in result3) {
    const sr3 = result3 as SmartRoutingResult;
    console.log(`✓ Primary Provider: ${sr3.primary.provider}`);
    console.log(`  Score: ${sr3.primary.score.toFixed(6)}`);
    console.log(`  AOV: ${sr3.primary.averageOrderValue}`);
    console.log(`  Conversion Rate: ${sr3.primary.conversionRate}`);
    console.log(`✓ Fallback Providers: ${sr3.fallback.length}`);
  } else {
    console.log("✗ Failed: Expected SmartRoutingResult");
  }

  // Test 4: Non-existent gift
  console.log("\nTEST 4: Non-existent gift");
  console.log("─────────────────────────────────");
  const result4 = Cashier.resolveGift("NONEXISTENT", "US");
  console.log(`Result: ${result4 === null ? "null ✓" : "✗ Expected null"}`);

  // Test 5: Test legacy compatibility
  console.log("\nTEST 5: Legacy Interface (resolveLegacy)");
  console.log("─────────────────────────────────");
  const legacyResult = Cashier.resolveLegacy("GIFT_001", "US");
  if (legacyResult && "provider" in legacyResult && "highestCommissionRate" in legacyResult) {
    const lr = legacyResult as ResolvedGift;
    console.log(`✓ Legacy Format`);
    console.log(`  Provider: ${lr.provider}`);
    console.log(`  Commission Rate: ${lr.highestCommissionRate}`);
  } else {
    console.log("✗ Failed: Expected legacy format");
  }

  // Test 6: EPC Scoring vs Base Scoring
  console.log("\nTEST 6: EPC Scoring Analysis");
  console.log("─────────────────────────────────");
  const result6 = Cashier.resolveGift("GIFT_002", "US");
  if (result6 && "primary" in result6) {
    const sr6 = result6 as SmartRoutingResult;
    console.log("Primary Provider EPC Analysis:");
    console.log(`  Provider: ${sr6.primary.provider}`);
    console.log(`  Commission: ${sr6.primary.commission}`);
    console.log(`  AOV: ${sr6.primary.averageOrderValue}`);
    console.log(`  Conversion Rate: ${sr6.primary.conversionRate}`);
    console.log(`  Success Rate: ${sr6.primary.successRate}`);
    if (sr6.primary.scoreBreakdown) {
      console.log(`  Base Score: ${sr6.primary.scoreBreakdown.baseScore.toFixed(6)}`);
      console.log(`  EPC Score: ${sr6.primary.scoreBreakdown.epcScore?.toFixed(6) ?? "N/A"}`);
      console.log(`  Final Score: ${sr6.primary.scoreBreakdown.finalScore.toFixed(6)}`);
    }
  }

  // Test 7: Deterministic sorting
  console.log("\nTEST 7: Deterministic Sorting");
  console.log("─────────────────────────────────");
  const result7a = Cashier.resolveGift("GIFT_001", "US");
  const result7b = Cashier.resolveGift("GIFT_001", "US");
  if (
    result7a && result7b &&
    "primary" in result7a && "primary" in result7b &&
    result7a.primary.provider === result7b.primary.provider
  ) {
    console.log(`✓ Deterministic: Same result on multiple calls`);
    console.log(`  Provider: ${(result7a as SmartRoutingResult).primary.provider}`);
  } else {
    console.log("✗ Non-deterministic behavior detected");
  }

  console.log("\n═══════════════════════════════════════════════");
  console.log("TEST SUITE COMPLETE");
  console.log("═══════════════════════════════════════════════\n");
}

// Run tests if this file is executed directly
if (require.main === module) {
  testSmartRouting();
}

export { testSmartRouting };
