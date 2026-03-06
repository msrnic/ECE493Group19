# Acceptance Test Suite — UC-04: View My Personal Details

## Scope

Validate that a registered user can view their personal details (e.g., name, birthday, country of origin) and that the system correctly handles all documented degraded/exception flows: unavailable/incomplete data.

---

## Assumptions / Test Data (Design-Level)

- **Registered User A (Authorized)**: active account; has permission to view their own personal details.
- Personal details fields include at minimum:
  - Name
  - Birthday
  - Country of origin
- Environment supports simulating:
  - Missing/partial data (e.g., null/missing birthday)
  - Data retrieval failure for a subset of fields (service error)
  - Authorization failure (403/denied access) with logging

---

## Test Cases

### AT-UC04-01 — View Personal Details (Main Success)

**Flow covered:** Main Success Scenario (Steps 1–3)

**Preconditions:**
- System is online.
- Registered User A has a valid account.
- Registered User A is authenticated.
- Registered User A is authorized to view their own personal details.

**Steps:**
1. Log in as Registered User A.
2. Navigate from the dashboard to **Personal Details**.
3. Observe the displayed personal details.

**Expected Results:**
- System retrieves personal details from storage/services.
- System displays personal details with appropriate formatting.
- Data displayed includes the expected fields (e.g., name, birthday, country of origin) when present.
- No changes are applied to stored data (read-only operation).
- System state remains consistent.

---

### AT-UC04-02 — Personal Details Unavailable or Incomplete (Extension 2a)

**Flow covered:** Extension 2a (data unavailable or incomplete)

**Preconditions:**
- System is online.
- Registered User A has a valid account and is authenticated.
- Personal details data is incomplete or partially unavailable (e.g., birthday missing OR a service returns partial record).

**Steps:**
1. Configure test state so that one or more personal detail fields are missing/unavailable (e.g., set birthday to null or simulate partial retrieval failure).
2. Log in as Registered User A.
3. Navigate to **Personal Details** from the dashboard.
4. Observe the displayed details and any indicators for missing information.

**Expected Results:**
- System displays the available personal details.
- System clearly indicates which items are missing/unavailable (e.g., “Birthday not on file”).
- No application crash or unhandled error is shown.
- No changes are applied to stored data.
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-04 flow:
- **Main success flow:** personal details are retrieved and displayed.
- **Extension 2a:** requested data is unavailable/incomplete → system displays what is available and indicates missing items.

All documented flows in UC-04 are addressed.
