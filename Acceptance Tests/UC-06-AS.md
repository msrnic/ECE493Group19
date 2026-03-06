# Acceptance Test Suite — UC-06: View My Contact Information

## Scope

Validate that a registered user can view their contact information from the dashboard, and that the system correctly handles the documented degraded flow when the requested data is unavailable or incomplete.

---

## Assumptions / Test Data (Design-Level)

- **Registered User A**: active account; authenticated; authorized to view their own contact information.
- Contact information includes (at minimum):
  - Basic contact info (e.g., email, phone, address)
  - Emergency contact info (e.g., name, relationship, phone)
- The environment supports simulating:
  - Missing fields (e.g., emergency contact not on file)
  - Partial retrieval (e.g., one contact sub-section fails to load)
  - Data retrieval errors/timeouts for the contact information service/query
- This use case is **read-only**: viewing contact info should not modify stored data.

---

## Test Cases

### AT-UC06-01 — View Contact Information (Main Success)

**Flow covered:** Main success scenario (retrieve and display contact information)

**Preconditions:**
- System is online.
- Registered User A has a valid account and is authenticated.

**Steps:**
1. Log in as Registered User A.
2. From the dashboard, navigate to **Contact Information**.
3. Observe the displayed contact information.

**Expected Results:**
- System retrieves contact information from storage/services.
- System displays the contact information with appropriate formatting and access controls.
- All available contact sections/fields are visible (e.g., basic and emergency contact information, if present).
- No changes are applied to stored data (read-only operation).
- System state remains consistent.

---

### AT-UC06-02 — Contact Information Unavailable or Incomplete (Extension 2a)

**Flow covered:** Extension 2a (requested data is unavailable or incomplete)

**Preconditions:**
- System is online.
- Registered User A has a valid account and is authenticated.
- Contact information is unavailable/incomplete (e.g., emergency contact missing OR a subset of fields cannot be retrieved).

**Steps:**
1. Configure test state so that at least one contact data element is missing or cannot be retrieved (e.g., emergency contact not on file, or simulate partial data retrieval failure).
2. Log in as Registered User A.
3. From the dashboard, navigate to **Contact Information**.
4. Observe what is displayed and any indicators/messages for missing/unavailable data.

**Expected Results:**
- System displays the available contact information.
- System clearly indicates missing/unavailable items (e.g., “Emergency contact not on file” or “Some contact details could not be loaded”).
- The page does not crash or show unhandled errors.
- No changes are applied to stored data.
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-06 flow:
- **Main success flow:** contact information is retrieved and displayed.
- **Extension 2a:** data unavailable/incomplete → system displays available data and indicates missing items.

All documented flows in UC-06 are addressed.
