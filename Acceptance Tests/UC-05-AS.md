# Acceptance Test Suite — UC-05: Edit My Personal Details

## Scope

Validate that a registered user can edit and save personal details correctly, and that all documented alternate/exception flows behave correctly: invalid data validation, save failure due to system error, and user cancellation/abandonment.

---

## Assumptions / Test Data (Design-Level)

- **Registered User A**: active account; authenticated; authorized to edit their own personal details.
- Personal details fields include (at minimum): name, birthday, country of origin (and any other fields supported by the UI).
- Validation rules exist (examples):
  - Required fields must not be blank.
  - Birthday must be a valid date (and possibly within a reasonable range).
  - Country of origin must be selected from a valid set (if applicable).
- Environment supports simulating a save failure (e.g., DB error/timeout).
- Ability to compare “before” vs “after” values (e.g., by re-opening the personal details view).

---

## Test Cases

### AT-UC05-01 — Edit Personal Details with Valid Data (Main Success)

**Preconditions:**
- System is online.
- Registered User A has a valid account and is authenticated.
- Registered User A is authorized to edit personal details.

**Steps:**
1. Log in as Registered User A.
2. Navigate to **Personal Details**.
3. Record the current values of editable fields (baseline).
4. Edit one or more allowed fields with valid values.
5. Submit/save changes.
6. Observe confirmation message.
7. Re-open **Personal Details** (or refresh) to verify persisted values.

**Expected Results:**
- System validates inputs successfully.
- Updates are saved.
- System confirms completion.
- Re-opened view shows updated values.
- No unintended fields are modified.

---

### AT-UC05-02 — Invalid Data Submitted → Validation Error → Corrected and Saved (Extension 3a)

**Preconditions:**
- System is online.
- Registered User A authenticated and authorized.

**Steps:**
1. Navigate to **Personal Details**.
2. Enter invalid data in at least one field (e.g., blank required field, invalid date format).
3. Submit/save changes.
4. Observe validation feedback (highlighted fields/messages).
5. Correct the invalid data to valid values.
6. Submit/save again.
7. Re-open **Personal Details** to verify persisted values.

**Expected Results:**
- First submit is rejected; system highlights errors and requests correction.
- No changes are saved while invalid data is present.
- After correction, submission succeeds and updates persist.
- System confirms updated personal details.

---

### AT-UC05-03 — Save Fails Due to System Error (Extension 4a)

**Preconditions:**
- System is online.
- Registered User A authenticated and authorized.
- Fault injection is enabled to simulate save failure (e.g., DB write error/timeout).

**Steps:**
1. Enable fault condition that causes save operation to fail.
2. Navigate to **Personal Details**.
3. Enter valid edits.
4. Submit/save changes.
5. Observe error messaging.
6. Disable fault condition.
7. Re-open **Personal Details** and compare values to baseline.

**Expected Results:**
- System reports that saving failed and prompts user to retry.
- Stored personal details remain unchanged (no partial update).
- System state remains consistent.
- After fault removal, user can retry successfully (optional follow-up step).

---

### AT-UC05-04 — User Cancels / Abandons Edit (Extension 6a)

**Preconditions:**
- System is online.
- Registered User A authenticated and authorized.

**Steps:**
1. Navigate to **Personal Details**.
2. Begin editing fields (enter changes) but do not submit/save.
3. Cancel the edit action (or navigate away/back) before submitting.
4. Return to **Personal Details**.
5. Compare values to baseline.

**Expected Results:**
- System discards unsaved changes.
- No updates are persisted.
- Personal details remain unchanged when user returns.
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-05 flow:
- **Main success flow:** valid edits are validated and saved.
- **Extension 3a:** invalid data → validation errors → user corrects → save succeeds.
- **Extension 4a:** system error during save → no changes applied, user informed.
- **Extension 6a:** user cancels/abandons edit → unsaved changes discarded.

All documented flows in UC-05 are addressed.
