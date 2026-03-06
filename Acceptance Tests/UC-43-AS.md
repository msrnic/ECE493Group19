# Acceptance Test Suite — UC-43: Set Up New Accounts with Preset Role and Password

## Scope

Validate that an **Administrator** can create new user accounts with a preset role and password, and that all documented alternate/exception flows behave correctly:
- Main success (account created + role assigned + password set + confirmation/notification)
- Extension **4a** (missing/invalid identity details)
- Extension **5a** (invalid/disallowed role selection)
- Extension **6a** (password fails policy)
- Extension **8a** (duplicate unique identifier)
- Extension **9a** (system error during creation)
- Extension **11a** (notification delivery failure after account creation)

This suite is a **design** (non-executable) and focuses on covering every documented flow in the updated UC-43 use case and scenario set.

---

## Assumptions / Test Data (Design-Level)

- **Administrator AdminA**: authenticated; authorized to create accounts and assign roles.
- **Valid roles**: Student, Instructor, Admin (or equivalent), and AdminA is permitted to assign at least one role.
- **New User U_NEW**: identity details that do not already exist in the system (unique email/username/ID).
- **Existing User U_EXISTING**: identity details that already exist (duplicate email/username/ID).
- **Password policy** includes minimum length and complexity rules.
- **Passwords**:
  - **P_VALID**: meets policy.
  - **P_INVALID**: violates policy (e.g., too short / missing required character classes).
- System provides:
  - A way to verify account creation (admin user list/search).
  - A way to verify role assignment (user profile/role view).
  - A way to verify that a “must change password on first login” flag is set if required by policy.
  - A way to verify notification delivery status (delivery log/status banner).
- Environment supports fault injection for:
  - **Account creation failure** (DB/service error/timeout).
  - **Notification delivery failure** (email/in-app notification service failure).

---

## Test Cases

### AT-UC43-01 — Create Account Successfully with Preset Role and Password (Main Success)

**Flow covered:** Main success scenario fileciteturn24file0 fileciteturn24file1

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- U_NEW has unique identifiers (email/username/ID not in use).
- Selected role is valid and permitted.
- P_VALID is available.

**Steps:**
1. Log in as AdminA.
2. Open the **Account Administration** area.
3. Select **Create New Account**.
4. Enter U_NEW identity details (name, email/username, ID as required).
5. Select a preset role (e.g., Student).
6. Enter preset password **P_VALID** (or select “Generate temporary password” if supported by the UI).
7. Submit the request.
8. Verify the system displays a success confirmation with the created account identifier and role.
9. Verify U_NEW appears in the account list/search.
10. Verify U_NEW has the selected role assigned.
11. If policy requires, verify the account has a “must change password on first login” flag set.
12. If notifications are enabled, verify a notification was sent (or delivery status indicates success).

**Expected Results:**
- Account is created (active or ready-to-activate per policy).
- Selected role is assigned.
- Password is set per policy and stored securely (implementation detail not directly verified beyond behavior).
- Confirmation is displayed to AdminA.
- Notification is sent if enabled.

---

### AT-UC43-02 — Missing/Invalid User Information → Correct and Create (Extension 4a)

**Flow covered:** Extension 4a fileciteturn24file0 fileciteturn24file1

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.

**Steps:**
1. Log in as AdminA and open **Create New Account**.
2. Enter invalid identity details (e.g., invalid email format) or omit a required field (e.g., missing ID).
3. Select a valid permitted role and enter **P_VALID**.
4. Submit.
5. Verify the system highlights missing/invalid fields and prevents creation.
6. Correct the identity details to valid values for U_NEW.
7. Resubmit.
8. Verify the account is created successfully and appears in the account list/search.

**Expected Results:**
- No account is created until identity data is valid.
- After correction, account is created and role/password are set.

---

### AT-UC43-03 — Role Invalid or Not Permitted → Correct and Create (Extension 5a)

**Flow covered:** Extension 5a fileciteturn24file0 fileciteturn24file1

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized to create accounts.
- AdminA is not permitted to assign at least one restricted role (or use a non-existent role in test environment).

**Steps:**
1. Log in as AdminA and open **Create New Account**.
2. Enter valid U_NEW identity details.
3. Select a role that is invalid or not permitted (restricted role).
4. Enter **P_VALID** and submit.
5. Verify the system rejects the role assignment and prevents account creation.
6. Select a permitted valid role.
7. Resubmit.
8. Verify account creation succeeds and the permitted role is assigned.

**Expected Results:**
- System blocks creation when role selection is invalid/disallowed.
- After correction, account is created with a permitted role.

---

### AT-UC43-04 — Password Fails Policy → Correct and Create (Extension 6a)

**Flow covered:** Extension 6a fileciteturn24file0 fileciteturn24file1

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- U_NEW identity details are valid and unique.

**Steps:**
1. Log in as AdminA and open **Create New Account**.
2. Enter valid U_NEW identity details.
3. Select a valid permitted role.
4. Enter **P_INVALID** (violates password policy) and submit.
5. Verify the system rejects the password and displays policy requirements.
6. Enter **P_VALID** (or select “Generate temporary password” if supported).
7. Resubmit.
8. Verify account creation succeeds.

**Expected Results:**
- No account is created until the password complies with policy.
- After correction, account is created and password is set per policy.

---

### AT-UC43-05 — Duplicate Identifier Detected (Extension 8a)

**Flow covered:** Extension 8a fileciteturn24file0 fileciteturn24file1

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- U_EXISTING already exists with the same unique identifier (email/username/ID) that will be used in the test.

**Steps:**
1. Log in as AdminA and open **Create New Account**.
2. Enter identity details using the duplicate identifier from U_EXISTING.
3. Select a valid permitted role and enter **P_VALID**.
4. Submit.
5. Verify the system rejects the request due to duplicate identifier.
6. Update the identifier to a unique value (U_NEW) and resubmit.
7. Verify account creation succeeds.

**Expected Results:**
- System prevents creation of a duplicate account.
- After providing a unique identifier, account creation succeeds.

---

### AT-UC43-06 — System Error During Account Creation (Extension 9a)

**Flow covered:** Extension 9a fileciteturn24file0 fileciteturn24file1

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Fault injection enabled to cause account creation failure (DB/service error/timeout).
- U_NEW identity details are valid and unique.
- Role is valid and permitted.
- P_VALID is available.

**Steps:**
1. Enable the fault condition that causes account creation to fail.
2. Log in as AdminA and open **Create New Account**.
3. Enter valid U_NEW identity details, select a permitted role, and enter **P_VALID**.
4. Submit.
5. Observe error messaging.
6. Disable the fault condition.
7. Verify U_NEW account was **not** created (no account appears in the list/search).
8. (Optional) Retry creation after fault removal and verify success.

**Expected Results:**
- System reports failure to AdminA.
- No partial account/role/credential state remains.
- System state remains consistent.
- Optional retry succeeds after fault removal.

---

### AT-UC43-07 — Notification Delivery Fails After Account Creation (Extension 11a)

**Flow covered:** Extension 11a fileciteturn24file0 fileciteturn24file1

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Notifications are enabled.
- Fault injection enabled to cause notification delivery failure.
- U_NEW identity details are valid and unique.
- Role is valid and permitted.
- P_VALID is available.

**Steps:**
1. Enable fault condition to force notification delivery to fail.
2. Log in as AdminA and create an account for U_NEW using valid identity details, role, and **P_VALID**.
3. Verify the system confirms the account was created.
4. Verify the system indicates notification delivery failed (banner/status/log).
5. Verify the account exists and role is assigned.
6. Disable the fault condition.
7. If supported, attempt to **resend** the notification (or copy/download credentials as an alternative).
8. Verify resend succeeds (if implemented) and delivery status updates accordingly.

**Expected Results:**
- Account creation succeeds even if notification delivery fails.
- System clearly indicates notification failure.
- Administrator has a supported alternative to provide credentials (copy/download/resend).
- System state remains consistent.

---

## Coverage Summary

This acceptance test suite covers every documented UC-43 flow in the updated use case fileciteturn24file0 and scenario set fileciteturn24file1:
- **Main success:** account created with preset role and password, confirmation/notification.
- **Extension 4a:** missing/invalid user info → blocked until corrected.
- **Extension 5a:** invalid/disallowed role → blocked until corrected.
- **Extension 6a:** password policy failure → blocked until corrected.
- **Extension 8a:** duplicate identifier → blocked until unique.
- **Extension 9a:** system error during creation → rollback/no partial state.
- **Extension 11a:** notification failure after creation → account persists, failure indicated.

All documented flows are addressed.
