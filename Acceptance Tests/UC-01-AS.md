# Acceptance Test Suite — UC-01: Change My Password

## Scope

Validate that a registered user can change their password securely, and that all exception/alternate flows behave correctly: invalid credentials/token, password policy failure, system failure, and user cancellation.

---

## Assumptions / Test Data (Design-Level)

- User A: userA@example.com  
- Current Password: OldPass!234  
- Policy-Valid New Password: NewPass!567  
- Policy-Invalid New Password: weak  
- Valid Reset Token: TOKEN_VALID  
- Invalid/Expired Reset Token: TOKEN_EXPIRED  
- Test environment supports simulation of update failure (fault injection or service stub).

---

## Test Cases

### AT-UC01-01 — Change Password (Authenticated) — Main Success

**Preconditions:**
- System online  
- User A has valid account  
- User A is authenticated  

**Steps:**
1. Navigate to Account Security Settings.  
2. Select Change Password.  
3. Enter current password OldPass!234 and new password NewPass!567.  
4. Submit.  
5. Log out.  
6. Attempt login with OldPass!234.  
7. Attempt login with NewPass!567.  

**Expected Results:**
- System confirms password change.  
- Login with old password fails.  
- Login with new password succeeds.  

---

### AT-UC01-02 — Change Password (Reset Token) — Alternate Success

**Preconditions:**
- System online  
- Valid reset token TOKEN_VALID  

**Steps:**
1. Open reset URL and provide TOKEN_VALID.  
2. Enter new password NewPass!567.  
3. Submit.  
4. Attempt login with OldPass!234.  
5. Attempt login with NewPass!567.  

**Expected Results:**
- Token accepted.  
- Password updated successfully.  
- Old password fails; new password succeeds.  

---

### AT-UC01-03 — Invalid Current Password

**Preconditions:**
- System online  
- User A authenticated  

**Steps:**
1. Open Change Password.  
2. Enter incorrect current password WrongPass!000.  
3. Enter new password NewPass!567.  
4. Submit.  

**Expected Results:**
- System rejects request.  
- Recovery options displayed.  
- Password remains unchanged.  

---

### AT-UC01-04 — Invalid or Expired Reset Token

**Preconditions:**
- System online  
- Reset token TOKEN_EXPIRED  

**Steps:**
1. Open reset URL with TOKEN_EXPIRED.  
2. Attempt to set NewPass!567.  
3. Submit.  

**Expected Results:**
- System rejects request.  
- User prompted to request new reset link.  
- Password remains unchanged.  

---

### AT-UC01-05 — New Password Fails Policy

**Preconditions:**
- System online  
- User authenticated or valid reset token  

**Steps:**
1. Initiate Change Password.  
2. Enter OldPass!234.  
3. Enter weak as new password.  
4. Submit.  
5. Enter NewPass!567.  
6. Submit.  

**Expected Results:**
- System rejects weak password and displays policy requirements.  
- No change occurs until valid password submitted.  
- Valid password update succeeds.  

---

### AT-UC01-06 — System Error During Update

**Preconditions:**
- System online  
- Valid credentials  
- Fault injection enabled to simulate update failure  

**Steps:**
1. Attempt password change (OldPass!234 → NewPass!567).  
2. Submit during simulated failure.  
3. Remove failure condition.  
4. Attempt login with OldPass!234.  
5. Attempt login with NewPass!567.  

**Expected Results:**
- System informs user to retry later.  
- Old password remains valid.  
- New password is not active.  

---

### AT-UC01-07 — User Cancels / Abandons

**Preconditions:**
- System online  
- User authenticated or valid reset token  

**Steps:**
1. Open Change Password form.  
2. Enter values but do not submit.  
3. Click Cancel or navigate away.  
4. Return to form.  
5. Attempt login with OldPass!234.  

**Expected Results:**
- No password update occurs.  
- Unsaved input is discarded.  
- Old password remains valid.  

---

## Coverage Summary

This test suite covers:
- Main success flow  
- Reset-token alternate success flow  
- Invalid credential and token errors  
- Password policy validation failure  
- System error during update  
- User cancellation/abandonment  

All documented flows in UC-01 are addressed.
