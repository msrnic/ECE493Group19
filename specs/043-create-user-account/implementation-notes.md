# UC-43 Implementation Notes

## Scope Alignment

This implementation follows the 2026-03-26 user request for UC-43: an administrator can create a new account from the Admin dashboard by entering an email address, selecting a role, and providing a preset password. Draft feature artifacts that still mention full name, institutional ID, username alternatives, or generated-password mode were not implemented in this delivery and are treated as superseded design notes rather than shipped behavior.

Delivered surface area:

- Admin dashboard entry point: `Create New User` in the `Admin Operations` section.
- Server-rendered flow: `GET /admin/users/new` and `POST /admin/users`.
- JSON endpoints: `GET /api/admin/accounts/form-metadata` and `POST /api/admin/accounts`.

## FR Traceability

| Requirement | Status | Implementation and automated evidence |
| --- | --- | --- |
| FR-001 | Implemented | Admin dashboard links into the create-user flow in `src/controllers/dashboard-controller.js`; covered by `tests/integration/admin-account.integration.test.js` and `tests/e2e/uc43.acceptance.spec.js` AT-UC43-01. |
| FR-002 | Adapted to requested scope | The shipped form collects a single email identifier only in `src/views/create-user-account.html`; email validation is covered by `src/controllers/validators/admin-account-validator.js`, `tests/unit/admin-account-validator.test.js`, and AT-UC43-02. |
| FR-003 | Implemented | Assignable roles come from active assignable role records in `src/models/role-model.js`; verified by `tests/contract/admin-account.contract.test.js` and `tests/integration/admin-account.integration.test.js`. |
| FR-004 | Adapted to requested scope | UC-43 was delivered as preset-password only. Generated-password mode remains out of scope for this release by explicit user direction. |
| FR-005 | Adapted to requested scope | Required-field and format validation is enforced for the shipped email field in `src/controllers/validators/admin-account-validator.js`; covered by `tests/unit/admin-account-validator.test.js`, `tests/unit/admin-account-controller.test.js`, and AT-UC43-02. |
| FR-006 | Implemented | Role existence and assignability are revalidated at submit time in `src/services/account-creation-service.js`; covered by `tests/integration/admin-account.integration.test.js` and AT-UC43-03. |
| FR-007 | Implemented | Password policy enforcement and guidance are provided by `src/services/password-policy-service.js` and the create-user controller; covered by `tests/unit/account-creation-service.test.js`, `tests/unit/admin-account-extra-coverage.test.js`, and AT-UC43-04. |
| FR-008 | Implemented | Duplicate detection trims and lowercases the submitted email before lookup and write in `src/services/account-creation-service.js`; covered by `tests/contract/admin-account.contract.test.js`, `tests/integration/admin-account.integration.test.js`, and AT-UC43-05. |
| FR-009 | Implemented | Account creation and role assignment run in a single SQLite transaction in `src/models/user-account-model.js`; rollback behavior is covered by `tests/integration/admin-account.integration.test.js` and AT-UC43-06. |
| FR-010 | Implemented | Passwords are hashed with `bcrypt.hash(..., 12)` in `src/services/account-creation-service.js`; plaintext passwords are never persisted; covered by `tests/unit/account-creation-service.test.js` and integration tests. |
| FR-011 | Implemented | Success responses and confirmation pages include the created identifier and assigned role in `src/controllers/admin-account-controller.js`; covered by `tests/contract/admin-account.contract.test.js` and AT-UC43-01. |
| FR-012 | Implemented | Internal failures return `500`, create no account, and emit an operational log entry from `src/services/account-creation-service.js`; covered by `tests/unit/admin-account-extra-coverage.test.js`, `tests/integration/admin-account.integration.test.js`, and AT-UC43-06. |
| FR-013 | Implemented | Validation failures preserve non-sensitive values only (`email`, `roleId`) in `src/controllers/admin-account-controller.js`; covered by `tests/contract/admin-account.contract.test.js`, `tests/integration/admin-account.integration.test.js`, and AT-UC43-02/03/04/05. |
| FR-014 | Implemented | Notification delivery is attempted after account commit; failures do not roll back the account and are recorded in `src/services/notification-service.js` and `src/models/notification-attempt-model.js`; covered by `tests/unit/notification-service.test.js`, `tests/integration/admin-account.integration.test.js`, and AT-UC43-07. |
| FR-015 | Implemented | Traceability is archived in this file plus `specs/043-create-user-account/checklists/quality-gate.md`, with executed acceptance, integration, contract, and unit coverage. |
| FR-016 | Implemented | Notification failure handling shows a warning only. No resend, credential copy, or download actions are exposed in this feature. Covered by `src/controllers/admin-account-controller.js` and AT-UC43-07. |
| FR-017 | Implemented | New accounts are created as `active` with `must_change_password = 1`, and first login is redirected to password change in `src/models/user-account-model.js` and `src/controllers/auth-controller.js`; covered by `tests/integration/admin-account.integration.test.js` and AT-UC43-01. |

## Use Case and Acceptance Mapping

| UC-43 flow | Acceptance coverage | Additional automated coverage | Result |
| --- | --- | --- | --- |
| Main success scenario | AT-UC43-01 | `tests/contract/admin-account.contract.test.js`, `tests/integration/admin-account.integration.test.js` | Pass |
| Extension 4a: invalid identity details | AT-UC43-02 | `tests/unit/admin-account-validator.test.js`, `tests/unit/admin-account-controller.test.js` | Pass |
| Extension 5a: invalid or disallowed role | AT-UC43-03 | `tests/unit/account-creation-service.test.js`, `tests/integration/admin-account.integration.test.js` | Pass |
| Extension 6a: password fails policy | AT-UC43-04 | `tests/unit/admin-account-extra-coverage.test.js`, `tests/unit/account-creation-service.test.js` | Pass |
| Extension 8a: duplicate identifier | AT-UC43-05 | `tests/contract/admin-account.contract.test.js`, `tests/integration/admin-account.integration.test.js` | Pass |
| Extension 9a: system error during creation | AT-UC43-06 | `tests/unit/admin-account-extra-coverage.test.js`, `tests/integration/admin-account.integration.test.js` | Pass |
| Extension 11a: notification delivery failure | AT-UC43-07 | `tests/unit/notification-service.test.js`, `tests/integration/admin-account.integration.test.js` | Pass |

Note: UC-43 extension 11a.2 is treated as optional and not implemented in this release. The project clarification for this feature and the 2026-03-26 user request both narrowed the scope to warning-only behavior after a notification failure.

## Verification

- `npm run test:coverage` passed with `100.00%` line, function, and branch coverage for all files.
- `npm run test:acceptance` passed with `34` Playwright acceptance tests.
- `npm run lint` passed.
