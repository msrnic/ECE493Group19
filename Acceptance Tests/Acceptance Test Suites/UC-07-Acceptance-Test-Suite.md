# Acceptance Test Suite — UC-07: Edit My Contact Information

## Scope

Validate that a registered user can edit and save contact information correctly (basic and emergency), and that all documented alternate/exception flows behave correctly: invalid contact formats, save failure due to system error, and user cancellation/abandonment.

---

## Assumptions / Test Data (Design-Level)

- **Registered User A**: active account; authenticated; authorized to edit their own contact information.
- Contact information includes (at minimum):
  - Basic contact info (e.g., email, phone, address)
  - Emergency contact info (e.g., name, relationship, phone)
- Validation rules exist (examples):
  - Email must be valid format.
  - Phone numbers must meet formatting rules (e.g., digits/length/country code as applicable).
  - Address fields meet minimum requirements (if applicable).
- Environment supports simulating a save failure (e.g., DB error/timeout).
- Ability to compare “before” vs “after” values (e.g., by re-opening the contact information view).

---

## Test Cases

### AT-UC07-01 — Edit Contact Information with Valid Data (Main Success)

**Preconditions:**
- System is online.
- Registered User A has a valid account and is authenticated.
- Registered User A is authorized to edit contact information.

**Steps:**
1. Log in as Registered User A.
2. Navigate to **Contact Information**.
3. Record the current values of editable fields (baseline).
4. Edit one or more allowed fields with valid values (including at least one basic and one emergency contact field, if present).
5. Submit/save changes.
6. Observe confirmation message.
7. Re-open **Contact Information** (or refresh) to verify persisted values.

**Expected Results:**
- System validates formats successfully (email/phone/address).
- Updates are saved.
- System confirms completion.
- Re-opened view shows updated values.
- No unintended fields are modified.

---

### AT-UC07-02 — Invalid Contact Formats → Validation Error → Corrected and Saved (Extension 3a)

**Preconditions:**
- System is online.
- Registered User A authenticated and authorized.

**Steps:**
1. Navigate to **Contact Information**.
2. Enter invalid data in at least one field (e.g., malformed email, invalid phone).
3. Submit/save changes.
4. Observe validation feedback (highlighted fields/messages).
5. Correct the invalid data to valid values.
6. Submit/save again.
7. Re-open **Contact Information** to verify persisted values.

**Expected Results:**
- First submit is rejected; system highlights fields requiring correction.
- No changes are saved while invalid data is present.
- After correction, submission succeeds and updates persist.
- System confirms updated contact information.

---

### AT-UC07-03 — Save Fails Due to System Error (Extension 4a)

**Preconditions:**
- System is online.
- Registered User A authenticated and authorized.
- Fault injection is enabled to simulate save failure (e.g., DB write error/timeout).

**Steps:**
1. Enable fault condition that causes save operation to fail.
2. Navigate to **Contact Information**.
3. Enter valid edits.
4. Submit/save changes.
5. Observe error messaging.
6. Disable fault condition.
7. Re-open **Contact Information** and compare values to baseline.

**Expected Results:**
- System reports that saving failed and prompts user to retry.
- Stored contact information remains unchanged (no partial update).
- System state remains consistent.
- After fault removal, user can retry successfully (optional follow-up).

---

### AT-UC07-04 — User Cancels / Abandons Edit (Extension 5a)

**Preconditions:**
- System is online.
- Registered User A authenticated and authorized.

**Steps:**
1. Navigate to **Contact Information**.
2. Begin editing fields (enter changes) but do not submit/save.
3. Cancel the edit action (or navigate away/back) before submitting.
4. Return to **Contact Information**.
5. Compare values to baseline.

**Expected Results:**
- System discards unsaved changes.
- No updates are persisted.
- Contact information remains unchanged when user returns.
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-07 flow:
- **Main success flow:** valid edits are validated and saved.
- **Extension 3a:** invalid formats → validation errors → user corrects → save succeeds.
- **Extension 4a:** system error during save → no changes applied, user informed.
- **Extension 5a:** user cancels/abandons edit → unsaved changes discarded.

All documented flows in UC-07 are addressed.
