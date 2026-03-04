# System Memory

## THE CASHIER - Revenue Brain of WYNN
**Module Location:** `src/lib/cashier.ts` (or equivalent client/server lib paths)

**Rules:**
1. THE CASHIER is isolated.
2. THE CASHIER contains only internal logic.
3. THE CASHIER does NOT connect to any external API.
4. THE CASHIER does NOT redirect users.
5. THE CASHIER does NOT fetch from internet.
6. THE CASHIER does NOT auto-detect country.
7. THE CASHIER does NOT perform analytics.
8. THE CASHIER does NOT modify UI.
9. THE CASHIER does NOT depend on any new libraries.

**Responsibilities:**
- Maintain static gift mapping table.
- Resolve gift by giftId + country.
- Select highest commission entry.
- Return structured data only.

**State:** DRY MODE. No network operations allowed.

**Future Upgrades (Locked until explicitly instructed):**
- redirect capability
- tracking
- optimization
- geo detection
