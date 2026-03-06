# UC-13 Acceptance Test Suite — Search for Available Classes

## Scope
Validate that a **Student** can search for available classes and view results, and that the documented error flow is handled correctly.

**Flows covered (from UC-13 + scenarios):**
- Main Success: student searches and finds matching classes
- Extension 2a: system error during search

---

## Assumptions / Test Data (Design-Level)
- **Student S1**: authenticated.
- **Catalog** includes at least one class that matches a known query (**Q_MATCH**) and at least one query with no matches (**Q_NOMATCH**) (optional).
- **Course Catalog Service** can be fault-injected to fail (timeout/500).

---

## Test Cases

### AT-UC13-01 — Search Returns Matching Classes (Main Success)
**Preconditions:** System online; S1 authenticated; catalog service healthy.

**Steps:**
1. Log in as S1.
2. Select **Search for available classes** from dashboard.
3. Enter **Q_MATCH** (e.g., subject+course number) and submit.
4. Verify results list is displayed.
5. Verify at least one expected class appears and can be opened/viewed.

**Expected Results:**
- Results are displayed for the query.
- No changes are applied (read-only).

---

### AT-UC13-02 — System Error During Search (Extension 2a)
**Preconditions:** System online; S1 authenticated; fault injection enabled to fail catalog queries.

**Steps:**
1. Enable fault: catalog service error/timeout.
2. Open **Search for available classes**.
3. Enter any query and submit.
4. Verify error message indicates search cannot be completed now.
5. Verify no stale/incorrect results are presented as current results (unless explicitly labeled).
6. Disable fault and optionally retry to confirm recovery.

**Expected Results:**
- Failure is reported clearly.
- System state remains consistent.

---

## Coverage Summary
Covers Main Success + Extension 2a (all documented flows).
