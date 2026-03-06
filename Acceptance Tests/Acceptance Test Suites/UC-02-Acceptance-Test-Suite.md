# Acceptance Test Suite — UC-02: Be Able to Login

## Scope

Validate that a registered user can log in successfully and that all documented exception flows behave correctly: invalid credentials, account lock/disable, and authentication service outage.

---

## Assumptions / Test Data (Design-Level)

- User A: userA@example.com  
- Valid Password: CorrectPass!234  
- Invalid Password: WrongPass!000  
- Account states available for testing:
  - Active account (normal)
  - Temporarily locked account (due to repeated failures)
  - Disabled account (admin-disabled)
- Authentication Service dependency can be simulated as unavailable.
- Account lock threshold is configurable (e.g., N failed attempts).

---

## Test Cases

### AT-UC02-01 — Successful Login (Valid Credentials) — Main Success

**Preconditions:**
- System is online.
- User A account is active.
- User A is not currently logged in.

**Steps:**
1. Navigate to the login page.
2. Enter username/email: userA@example.com.
3. Enter password: CorrectPass!234.
4. Submit login.
5. Observe landing page after login.

**Expected Results:**
- System validates credentials via Authentication Service.
- Session is created.
- User is routed to the main dashboard.
- User can access permitted account functions.

---

### AT-UC02-02 — Invalid Credentials → Error then Success on Retry (Extension 3a)

**Preconditions:**
- System is online.
- User A account is active.
- User A is not logged in.

**Steps:**
1. Navigate to login page.
2. Enter userA@example.com with password WrongPass!000.
3. Submit login.
4. Observe error message.
5. Enter userA@example.com with password CorrectPass!234.
6. Submit login again.

**Expected Results:**
- First attempt: system displays invalid-credentials error; no session created.
- Second attempt: system authenticates successfully and loads dashboard.
- No unintended account changes occur due to the failed attempt.

---

### AT-UC02-03 — Repeated Invalid Credentials → Temporary Account Lock (Extension 3a → lock behavior)

**Preconditions:**
- System is online.
- User A account is active at the start.
- User A is not logged in.
- Lockout threshold N is known/configured in the environment.

**Steps:**
1. Navigate to login page.
2. Repeat N times:
   - Enter userA@example.com with password WrongPass!000.
   - Submit login and observe error.
3. Attempt login again with correct password CorrectPass!234 during the lock period.

**Expected Results:**
- System displays invalid-credentials error for each of the first N attempts.
- After threshold is reached, account becomes temporarily locked.
- During lock period, login is blocked even with correct credentials.
- No session is created while locked.
- Lock status is communicated to the user (or user is given a safe next step).

---

### AT-UC02-04 — Account Locked or Disabled (Extension 3b)

**Preconditions (Locked variant):**
- System is online.
- User A account is in locked state (pre-set or triggered).
- User A is not logged in.

**Steps (Locked variant):**
1. Navigate to login page.
2. Enter valid credentials (CorrectPass!234).
3. Submit login.

**Expected Results (Locked variant):**
- System indicates the account is locked.
- System provides next steps (e.g., wait, reset password, contact support—per policy).
- No session is created.

**Preconditions (Disabled variant):**
- System is online.
- User A account is disabled by administrator.
- User A is not logged in.

**Steps (Disabled variant):**
1. Navigate to login page.
2. Enter valid credentials (CorrectPass!234).
3. Submit login.

**Expected Results (Disabled variant):**
- System indicates the account is disabled.
- System provides next steps (e.g., contact support/admin).
- No session is created.

---

### AT-UC02-05 — Authentication Service Unavailable (Extension 3c)

**Preconditions:**
- System is online.
- User A account is active.
- User A is not logged in.
- Authentication Service is simulated as unavailable.

**Steps:**
1. Navigate to login page.
2. Enter userA@example.com with password CorrectPass!234.
3. Submit login.

**Expected Results:**
- System cannot validate credentials due to dependency outage.
- System shows a service-unavailable message.
- No session is created.
- Failure is logged for troubleshooting/audit purposes.

---

## Coverage Summary

This test suite covers, at minimum:
- Main success flow (valid login → dashboard).
- Extension 3a (invalid credentials → error; retry allowed).
- Extension 3a lock behavior (temporary lock after repeated failures).
- Extension 3b (locked/disabled account handling).
- Extension 3c (Authentication Service outage).

All documented flows in UC-02 are addressed.
