# Use Case UC-43: Set Up New Accounts with Preset Role and Password

**Goal in Context**: As an administrator, I want to be able to set up new accounts with a preset user role and password, so that new users can receive an account to access the system.  
**Scope**: University Student Information System (Identity & Access Management)  
**Level**: User Goal  
**Primary Actor**: Administrator  
**Secondary Actors**: Identity/Account Service, Notification Service (optional), Database  
**Trigger**: Administrator selects “Create New Account” (or equivalent) from the administration interface.

---

## Success End Condition
* A new user account is created and activated (or created in a ready-to-activate state per policy).
* The account has the preset user role assigned.
* The preset password is set (or a temporary password is set and marked for change on first login, per policy).
* The administrator receives confirmation of the new account details (and the user receives credentials if notifications are enabled).

---

## Failed End Condition
* The account is not created and no partial records remain.
* No roles or credentials are assigned.
* The system remains consistent and an error is communicated to the administrator.

---

## Preconditions
* The system is online.
* The administrator is authenticated and authorized to create accounts and assign roles.
* Required role definitions exist in the system (e.g., Student, Instructor, Admin).
* Password policy rules are available (length, complexity, temporary password rules, etc.).

---

## Main Success Scenario
1. Administrator opens the account administration area.
2. Administrator selects **Create New Account**.
3. System displays a new account form requesting required user identity fields (e.g., name, email/username, ID) and account configuration options.
4. Administrator enters the new user’s required identity details.
5. Administrator selects a preset **user role** for the account.
6. Administrator sets a preset **password** (or selects “Generate temporary password” if supported).
7. Administrator submits the account creation request.
8. System validates identity fields, role selection, and password against policy.
9. System creates the user account and assigns the selected role.
10. System stores the password securely (e.g., salted hash) and applies any security flags (e.g., “must change password on first login,” if required).
11. System displays a confirmation with the created account identifier and role assignment (and sends notification to the user if enabled).

---

## Extensions

* **4a**: Required user information is missing or invalid (e.g., invalid email/ID format).
    * 4a1: System highlights missing/invalid fields and explains what must be corrected.
    * 4a2: Administrator corrects the input and resubmits.

* **5a**: Selected role does not exist or administrator is not permitted to assign it.
    * 5a1: System rejects the role assignment and indicates the permission/validation issue.
    * 5a2: Administrator selects a permitted role and resubmits.

* **6a**: Password does not meet policy requirements.
    * 6a1: System rejects the password and displays the policy requirements.
    * 6a2: Administrator enters a compliant password (or selects generate temporary password) and resubmits.

* **8a**: Account already exists for the provided unique identifier (e.g., email/username already in use).
    * 8a1: System rejects the request and informs the administrator that the identifier is already in use.
    * 8a2: Administrator updates the identifier (or chooses to update the existing account, if that is a supported separate use case).

* **9a**: System cannot create the account due to a system error (e.g., database error, service timeout).
    * 9a1: System reports failure and does not create the account.
    * 9a2: System logs the error for troubleshooting.
    * 9a3: Administrator may retry later.

* **11a**: Notification delivery fails (if notifications are enabled).
    * 11a1: System confirms the account was created but indicates notification delivery failed.
    * 11a2: Administrator can copy/download credentials or resend notification (if supported).

---

## Related Information
* **Priority**: High  
* **Frequency**: Occasional (spikes during onboarding periods)  
* **Open Issues**: Password distribution policy (temporary vs. preset), mandatory first-login reset, role assignment governance, notification channel requirements (email vs. in-app).
