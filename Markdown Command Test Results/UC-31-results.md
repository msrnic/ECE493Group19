# Tests Results for Command "npm run test"

> ece493group19-uc02-login@1.0.0 test
> npm run test:coverage && npm run test:acceptance


> ece493group19-uc02-login@1.0.0 test:coverage
> node --test --experimental-test-coverage --test-coverage-include=src/**/*.js --test-coverage-exclude=src/views/*.js --test-coverage-branches=100 --test-coverage-functions=100 --test-coverage-lines=100 tests/unit/*.test.js tests/integration/*.test.js tests/contract/*.test.js

✔ GET /api/admin/accounts/form-metadata returns assignable roles and password policy for admins (9005.017291ms)
✔ GET /api/admin/accounts/form-metadata returns a forbidden error payload for non-admin users (9074.769786ms)
✔ POST /api/admin/accounts returns the documented success payload for valid input (9593.755606ms)
✔ POST /api/admin/accounts returns validation errors and preserved non-sensitive values without echoing the password (9358.716927ms)
Account creation failed {
  actorAccountId: 3,
  email: 'contract.failure@example.com',
  error: 'Simulated account creation failure.'
}
✔ POST /api/admin/accounts returns conflict and server-error payloads for duplicate and failed account-creation requests (9494.755154ms)
✔ dashboard contract never exposes restricted module keys for each supported role profile (45602.7925ms)
✔ GET /dashboard returns an auth redirect payload for unauthenticated JSON requests (8832.131955ms)
✔ GET /dashboard returns a success payload matching the contract for a student actor (9169.889332ms)
✔ GET /dashboard returns empty_access when the actor has no assigned dashboard modules (9088.088147ms)
✔ GET /dashboard returns role_data_error when role retrieval fails for the authenticated actor (9354.96425ms)
✔ POST /dashboard/retry returns auth_error for unauthenticated JSON requests (8685.128854ms)
✔ POST /dashboard/retry returns a 400 contract payload for invalid retry requests (9159.432326ms)
✔ POST /dashboard/retry returns a partial payload when only some unavailable sections recover (9231.813865ms)
✔ POST /dashboard/retry returns success when all requested sections recover (9512.246913ms)
✔ POST /dashboard/retry returns failure when every section remains unavailable (9213.430941ms)
✔ admin account creation renders the dashboard entry, persists the account, records notification delivery, and requires a password change at first login (10181.080459ms)
✔ admin account creation preserves non-sensitive values across validation failures and succeeds after correction (9634.272925ms)
✔ admin account creation blocks disallowed roles and duplicate normalized emails until corrected (9723.421112ms)
Account creation failed {
  actorAccountId: 3,
  email: 'rollback.user@example.com',
  error: 'Simulated account creation failure.'
}
✔ admin account creation rolls back simulated failures and preserves successful accounts when notification delivery fails (10330.129632ms)
✔ admin can open the target form and change another user password without target verification fields (9742.56746ms)
✔ admin endpoints reject unauthorized access and missing targets (9394.350977ms)
✔ password change enforces cooldown messaging after repeated verification failures (9741.049648ms)
✔ system failure rollback preserves the existing password (9713.624057ms)
✔ reset-token password change succeeds and consumes the token (9603.082637ms)
✔ reset-token flow rejects expired tokens and supports JSON responses (9103.4884ms)
✔ self-service password change succeeds, preserves the current session, invalidates other sessions, and updates login credentials (10219.852563ms)
✔ self-service password change persists after creating a new app against the same database (9957.475378ms)
✔ self-service password change supports JSON responses and cancellation without persisting changes (9541.311803ms)
✔ self-service password change rejects a new password that matches the current password (9778.099109ms)
✔ contact-information route redirects unauthenticated users and renders seeded values for authenticated users (9054.296574ms)
✔ contact-information route rejects invalid input and persists corrected values (9139.865912ms)
✔ contact-information route rolls back simulated save failures without partial writes (9026.801105ms)
✔ contact-information route saves the latest version and reports stale-edit conflicts (9402.538761ms)
✔ dashboard renders role-scoped navigation for student, professor, admin, and multi-role actors (36852.824645ms)
✔ dashboard renders a role-data error state with retry guidance when role resolution fails (9062.342789ms)
✔ GET /dashboard redirects unauthenticated users to the login page with returnTo (8922.72918ms)
✔ GET /dashboard renders authenticated account data, available navigation, and student dashboard sections (9386.71934ms)
✔ POST /logout revokes the current session and redirects future dashboard requests to the login page with returnTo (9023.86357ms)
✔ dashboard shows a minimal shell without unauthorized modules when a student has no active assignments (9177.011652ms)
✔ dashboard re-evaluates role changes and removes modules that are no longer authorized (9414.831865ms)
✔ dashboard keeps restricted modules hidden even during partial professor loads (9150.253028ms)
✔ admin dashboards never expose student or professor-only modules (9140.017506ms)
✔ dashboard load telemetry records p95 timings under the SC-001 threshold for initial loads and retries (9805.643696ms)
✔ student dashboard displays personal and contact information with both update actions (9548.549397ms)
✔ professor and admin dashboards both expose profile summaries while admin security actions remain intact (18147.966769ms)
✔ dashboard displays available profile data and labels missing items as Not provided (9394.609672ms)
✔ dashboard renders a partial view and selective retry restores recovered sections (9435.038106ms)
✔ dashboard renders a failure state when every section is unavailable (9165.72056ms)
✔ dashboard retry rejects section IDs that are not currently unavailable (9033.253393ms)
✔ expired dashboard sessions redirect to login with returnTo and can return to the dashboard after re-authentication (9426.067494ms)
✔ expired sessions receive an auth_error payload when retrying unavailable dashboard sections (9171.137393ms)
✔ POST /login returns 403 for disabled accounts and does not create a session (9055.769612ms)
✔ POST /login returns 400 when required fields are missing (8916.465307ms)
✔ POST /login returns 401 for invalid credentials and allows retry success (9119.351576ms)
✔ POST /login returns 401 for unknown accounts without creating a session (9125.99053ms)
✔ POST /login returns 423 for pre-locked accounts with valid credentials (8959.623441ms)
✔ repeated invalid credentials trigger a temporary lock and later recover after expiry (10254.262324ms)
✔ valid logins satisfy the SC-001 benchmark threshold (13060.72779ms)
✔ POST /login returns 503 when the authentication service is unavailable (9003.113155ms)
✔ GET / renders a title page with navigation to the login page (8940.713952ms)
✔ GET /login renders demo reset guidance for unauthenticated users and redirects authenticated users (9058.135851ms)
✔ POST /login succeeds, creates a session cookie, and records audit rows (9224.057078ms)
✔ personal-information route redirects unauthenticated users and renders seeded values for authenticated users (9025.35271ms)
✔ personal-information route rejects invalid input and persists valid updates (9216.453723ms)
✔ personal-information route reports simulated save failures without changing stored data (9146.565361ms)
✔ student dashboard links to the Schedule Builder and professor access is forbidden (9402.748148ms)
✔ schedule builder persists constraints and named presets across reloads (9233.465088ms)
✔ schedule builder generates ranked results and reflects live full and removed course updates (8888.736006ms)
✔ account creation service returns metadata, success, and failure outcomes for admin creation flows (1331.758516ms)
✔ admin-account controller covers page rendering, metadata JSON, validation, success, duplicate, and failure branches (13.43436ms)
✔ admin-account controller covers forbidden post branches, html error pages, json error payloads, and thrown errors (10.083116ms)
✔ admin-account controller covers accept-header fallback, missing request helpers, and disabled password-policy messaging (1.924842ms)
✔ account-creation service covers unauthorized creation, simulate-failure flags, duplicate username errors, and metadata defaults (890.778127ms)
Account creation failed {
  actorAccountId: 1,
  email: 'unrelated.constraint@example.com',
  error: 'UNIQUE constraint failed: role_assignments.account_id, role_assignments.role_id'
}
Account creation failed {
  actorAccountId: 1,
  email: 'empty.error@example.com',
  error: undefined
}
✔ account-creation service covers missing actors and default create-state handling (1299.260337ms)
✔ notification service defaults to enabled delivery and tolerates a missing audit model (1.670098ms)
✔ password policy getPolicy returns a copy of the configured policy (0.508488ms)
✔ user-account model defaults the username to the email when none is supplied (9016.686706ms)
✔ admin-account models cover assignable roles, account creation, rollback, notification attempts, and must-change reset (9114.008277ms)
✔ admin-account validator accepts valid input and reports missing and invalid values (4.917537ms)
✔ createApp throws without a database and exposes dashboard services by default (2301.037097ms)
✔ migration entrypoints apply schema and seed fixtures from the command line (9250.332593ms)
✔ auth controller redirects authenticated users to the requested return path and forwards session save failures (4.118547ms)
✔ auth controller invalidates the current session and clears the cookie on logout (1.127055ms)
✔ auth controller forwards logout destroy failures to next (1.328638ms)
✔ dashboard controller handles missing accounts and role-data-error rendering branches (3.155213ms)
✔ session middleware supports both default and explicit secrets (0.64157ms)
✔ auth audit service records both failure and success outcomes (3.009907ms)
✔ requireAuth sanitizes invalid returnTo values and covers JSON, redirect, and next branches (4.575436ms)
✔ auth controller sanitizes unsafe returnTo values for rendering, validation, and successful redirects (2.807873ms)
✔ course and login-attempt models expose retrieval helpers for seeded data and recorded attempts (9004.796992ms)
✔ dashboard load model defaults missing durations to zero and supports implicit percentile lookups (9049.90397ms)
✔ auth controller uses the session returnTo value when request inputs omit it (0.931342ms)
✔ auth controller falls back to an empty user-agent header when none is provided (0.994342ms)
✔ auth controller preserves session returnTo on the login page when no account is authenticated yet (0.810903ms)
✔ auth service handles omitted unavailableIdentifiers configuration (111.235199ms)
✔ connection helpers reuse cached connections and respect DB_PATH defaults (8.763763ms)
✔ account, attempt, session, and audit helpers cover null and optional-field branches (9140.318221ms)
✔ cooldown service tracks escalation, active blocks, and clears state (3.832892ms)
✔ module authorization helpers deduplicate overlapping role mappings and report enabled access correctly (9101.954944ms)
✔ dashboard controller renders mixed section states, admin actions, and escaped content (24.733851ms)
✔ dashboard controller renders no-course and no-teaching fallback content for non-admin actors (1.774747ms)
✔ dashboard controller returns a failure payload when modules exist but no sections are enabled (2.481772ms)
✔ dashboard controller retry updates requested sections and treats untouched sections as available by default (1.495336ms)
✔ dashboard controller returns empty_access when roles exist but none of their modules are enabled (0.570135ms)
✔ dashboard controller short-circuits empty_access for missing roles and returns JSON auth redirects for missing accounts (2.804206ms)
✔ dashboard controller tolerates null dashboard test identifiers without changing the response payload (0.964224ms)
✔ dashboard controller includes teaching assistant assignments in workload content (1.15083ms)
✔ dashboard controller defaults omitted dashboardTestState to a healthy dashboard state (1.859193ms)
✔ dashboard controller applies professor presentation overrides for string role identifiers (1.719552ms)
✔ dashboard controller handles accounts without a primary role when no active roles are returned (0.776568ms)
✔ dashboard controller ignores blank role entries when deriving presentation overrides (0.695263ms)
✔ dashboard controller preserves admin security labeling when string roles include professor and admin (1.178052ms)
✔ dashboard controller returns role_data_error when the username matches a configured failure identifier (0.510301ms)
✔ dashboard controller returns an auth redirect payload for POST requests when the account is missing (0.46222ms)
✔ dashboard controller falls back to raw role objects without role labels when deriving presentation keys (0.945148ms)
✔ dashboard controller treats omitted active role lists as an empty-access minimal dashboard (1.27203ms)
✔ dashboard controller renders profile summaries, update buttons, and missing indicators when profile data is available (11.377274ms)
✔ dashboard controller treats null profile-model reads as missing values while keeping update actions visible (1.422396ms)
✔ dashboard helper utilities cover validation, response messaging, and percentile branches (5.692301ms)
✔ lockout service resets stale failure windows and computes the next count (3.40596ms)
✔ lockout service detects active locks, expired locks, and false-path evaluations (0.502636ms)
✔ lockout service supports default time evaluation paths (0.581807ms)
✔ dashboard models provide account, role, module, section, state, and telemetry operations (9162.03156ms)
✔ renderHtml escapes plain text and preserves html/json placeholders (1.410103ms)
✔ notification service covers sent, failed, skipped, and password-changed branches (5.814911ms)
✔ password change service covers self-service error paths and success (1104.465928ms)
✔ password change service covers reset-token flows including missing target account (439.071543ms)
✔ password change service covers admin authorization, policy, success, failure, and cancellation (864.640211ms)
✔ password change service preserves explicit request ids and covers non-self admin success (767.462134ms)
✔ password change service treats an omitted current password as a verification failure (431.932262ms)
✔ password change service defaults simulated failure identifiers when the option is omitted (0.896165ms)
✔ password controller covers JSON cooldown responses and HTML policy rendering branches (6.192963ms)
✔ password controller covers HTML self-service, admin rendering branches, and error forwarding (6.041114ms)
✔ password controller covers page render guards and JSON cancellation (1.286839ms)
✔ password controller accepts JSON via Accept header and handles admin policy fallback without a target record (0.996897ms)
✔ password controller covers success pages, form defaults, and plain html retry branches (4.452132ms)
✔ password controller covers non-admin actors and missing accept headers (0.66229ms)
✔ password controller covers missing admin password submissions (0.617364ms)
✔ password controller covers html cancellation, html cooldown recovery, and reset json/policy fallbacks (1.580937ms)
✔ createApp exposes the e2e reset route for both success and error paths (17226.275772ms)
✔ password feature models cover list and null-return helper branches (7548.603268ms)
✔ password feature models cover preserved-session invalidation and explicit attempt metadata (6757.26803ms)
Error: reset failed
    at Object.resetFixtures (/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/password-feature-coverage.test.js:48:13)
    at /home/m_srnic/ece493/group_project/ECE493Group19/src/routes/auth-routes.js:29:24
    at Layer.handle [as handle_request] (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/layer.js:95:5)
    at next (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/route.js:149:13)
    at Route.dispatch (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/route.js:119:3)
    at Layer.handle [as handle_request] (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/layer.js:95:5)
    at /home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/index.js:346:12)
    at next (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/index.js:280:10)
    at Function.handle (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/index.js:175:3)
✔ password policy validates compliant passwords and describes failures (5.123438ms)
✔ profile controller redirects to login when the session account cannot be found (3.934396ms)
✔ profile controller renders admin personal pages, validation errors, and save failures (6.221739ms)
✔ profile controller renders contact fallback state, validation errors, conflict notices, and save failures (5.67609ms)
✔ profile controller succeeds when profile test state is omitted (1.4453ms)
✔ personal details model reads, saves, detects conflicts, and rolls back failures (9090.081194ms)
✔ contact info model reads, saves, detects conflicts, and rolls back partial writes (8484.246949ms)
✔ profile validator helper functions normalize text, versions, and birthday formatting (5.161621ms)
✔ personal-information validation rejects missing, malformed, future, and overlong inputs (1.177381ms)
✔ contact-information validation enforces required, format, digit-count, and length rules (1.112838ms)
✔ schedule builder controller redirects missing accounts and blocks non-students (2.594197ms)
✔ schedule builder controller renders the page with form and generated result content (4.953385ms)
✔ schedule builder controller renders field errors, shared components, multi-result navigation, and missing-account POST redirects (1.701577ms)
✔ schedule builder controller renders empty-state and preset-overwrite variants (0.937093ms)
✔ schedule builder controller private render helpers cover schedule and day-selection variants (1.118849ms)
✔ schedule builder controller getPage also forbids non-student access (0.295903ms)
✔ schedule builder model lists seeded terms and course bundles, including courses without groups (8952.977286ms)
✔ schedule builder model saves and clears active constraints transactionally (8130.858649ms)
✔ schedule builder model saves, overwrites, renames, deletes, and logs preset and generation data (7491.732152ms)
✔ schedule builder model normalizes zero-version rows and null term generation events (6556.98396ms)
✔ schedule builder private helpers normalize inputs and validate constraints (8.23044ms)
✔ schedule builder service handles access, constraint persistence, and preset management flows (9391.988957ms)
✔ schedule builder service generates ranked, blocked, timeout, removed, and best-effort results (8773.354742ms)
✔ schedule builder service can be constructed with explicit dependencies (7245.208839ms)
✔ schedule builder service postAction returns access status for missing and non-student accounts (5854.864849ms)
✔ schedule builder service handles null role lists and missing term catalogs in explicit dependencies (1.009821ms)
✔ applySchema backfills missing columns for pre-feature databases (2569.458025ms)
✔ applySchema recreates the accounts table when the professor role is missing from the legacy check constraint (5830.33043ms)
✔ applySchema repairs child tables that still reference accounts_legacy so fixture seeding succeeds (11334.724318ms)
✔ applySchema is idempotent for databases that already match the current schema (1875.14617ms)
✔ applySchema exposes getTableSql for missing-table checks used by migrations (1.559116ms)
✔ applySchema getTableSql returns an empty string when sqlite metadata rows have null SQL (0.658694ms)
✔ seedLoginFixtures honors explicit timestamps and seeds schedule builder fixture data (8547.458731ms)
✔ seedScheduleBuilderFixtures refreshes schedule-builder data without resetting accounts (10958.949015ms)
ℹ tests 176
ℹ suites 0
ℹ pass 176
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 102283.041776
ℹ start of coverage report
ℹ ------------------------------------------------------------------------------------
ℹ file                                | line % | branch % | funcs % | uncovered lines
ℹ ------------------------------------------------------------------------------------
ℹ src                                 |        |          |         | 
ℹ  app.js                             | 100.00 |   100.00 |  100.00 | 
ℹ  controllers                        |        |          |         | 
ℹ   admin-account-controller.js       | 100.00 |   100.00 |  100.00 | 
ℹ   auth-controller.js                | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-controller.js           | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-response.js             | 100.00 |   100.00 |  100.00 | 
ℹ   home-controller.js                | 100.00 |   100.00 |  100.00 | 
ℹ   password-controller.js            | 100.00 |   100.00 |  100.00 | 
ℹ   profile-controller.js             | 100.00 |   100.00 |  100.00 | 
ℹ   schedule-builder-controller.js    | 100.00 |   100.00 |  100.00 | 
ℹ   validators                        |        |          |         | 
ℹ    admin-account-validator.js       | 100.00 |   100.00 |  100.00 | 
ℹ    dashboard-validator.js           | 100.00 |   100.00 |  100.00 | 
ℹ    profile-validator.js             | 100.00 |   100.00 |  100.00 | 
ℹ  db                                 |        |          |         | 
ℹ   connection.js                     | 100.00 |   100.00 |  100.00 | 
ℹ   migrations                        |        |          |         | 
ℹ    apply-schema.js                  | 100.00 |   100.00 |  100.00 | 
ℹ    seed-login-fixtures.js           | 100.00 |   100.00 |  100.00 | 
ℹ  middleware                         |        |          |         | 
ℹ   require-auth.js                   | 100.00 |   100.00 |  100.00 | 
ℹ   session-middleware.js             | 100.00 |   100.00 |  100.00 | 
ℹ  models                             |        |          |         | 
ℹ   account-model.js                  | 100.00 |   100.00 |  100.00 | 
ℹ   contact-info-model.js             | 100.00 |   100.00 |  100.00 | 
ℹ   course-model.js                   | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-load-model.js           | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-section-model.js        | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-section-state-model.js  | 100.00 |   100.00 |  100.00 | 
ℹ   login-attempt-model.js            | 100.00 |   100.00 |  100.00 | 
ℹ   module-model.js                   | 100.00 |   100.00 |  100.00 | 
ℹ   notification-attempt-model.js     | 100.00 |   100.00 |  100.00 | 
ℹ   notification-model.js             | 100.00 |   100.00 |  100.00 | 
ℹ   password-change-attempt-model.js  | 100.00 |   100.00 |  100.00 | 
ℹ   personal-details-model.js         | 100.00 |   100.00 |  100.00 | 
ℹ   reset-token-model.js              | 100.00 |   100.00 |  100.00 | 
ℹ   role-model.js                     | 100.00 |   100.00 |  100.00 | 
ℹ   schedule-builder-model.js         | 100.00 |   100.00 |  100.00 | 
ℹ   session-model.js                  | 100.00 |   100.00 |  100.00 | 
ℹ   user-account-model.js             | 100.00 |   100.00 |  100.00 | 
ℹ   verification-cooldown-model.js    | 100.00 |   100.00 |  100.00 | 
ℹ  routes                             |        |          |         | 
ℹ   admin-account-routes.js           | 100.00 |   100.00 |  100.00 | 
ℹ   auth-routes.js                    | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-routes.js               | 100.00 |   100.00 |  100.00 | 
ℹ   profile-routes.js                 | 100.00 |   100.00 |  100.00 | 
ℹ   schedule-builder-routes.js        | 100.00 |   100.00 |  100.00 | 
ℹ  services                           |        |          |         | 
ℹ   account-creation-service.js       | 100.00 |   100.00 |  100.00 | 
ℹ   auth-audit-service.js             | 100.00 |   100.00 |  100.00 | 
ℹ   auth-service.js                   | 100.00 |   100.00 |  100.00 | 
ℹ   cooldown-service.js               | 100.00 |   100.00 |  100.00 | 
ℹ   lockout-service.js                | 100.00 |   100.00 |  100.00 | 
ℹ   login-outcomes.js                 | 100.00 |   100.00 |  100.00 | 
ℹ   notification-service.js           | 100.00 |   100.00 |  100.00 | 
ℹ   password-change-service.js        | 100.00 |   100.00 |  100.00 | 
ℹ   password-policy-service.js        | 100.00 |   100.00 |  100.00 | 
ℹ   schedule-builder-service.js       | 100.00 |   100.00 |  100.00 | 
ℹ   session-security-service.js       | 100.00 |   100.00 |  100.00 | 
ℹ ------------------------------------------------------------------------------------
ℹ all files                           | 100.00 |   100.00 |  100.00 | 
ℹ ------------------------------------------------------------------------------------
ℹ end of coverage report

> ece493group19-uc02-login@1.0.0 test:acceptance
> node scripts/run-playwright.js


Running 38 tests using 1 worker

  ✓   1 tests/e2e/uc01.acceptance.spec.js:10:1 › AT-UC01-01 logged-in users can navigate from the dashboard and change their password successfully (5.8s)
  ✓   2 tests/e2e/uc01.acceptance.spec.js:46:1 › AT-UC01-02 reset-token recovery accepts a valid token and rejects an expired token (4.3s)
  ✓   3 tests/e2e/uc01.acceptance.spec.js:60:1 › AT-UC01-03 policy failures and cooldown feedback are shown without changing the password (5.6s)
  ✓   4 tests/e2e/uc01.acceptance.spec.js:82:1 › AT-UC01-04 admins can change another users password without target verification fields (5.0s)
  ✓   5 tests/e2e/uc01.acceptance.spec.js:107:1 › AT-UC01-05 cancelling the flow discards unsaved inputs and makes no password changes (4.9s)
  ✓   6 tests/e2e/uc02.acceptance.spec.js:9:1 › AT-UC02-01 successful login routes to the dashboard and logout returns to login (4.2s)
  ✓   7 tests/e2e/uc02.acceptance.spec.js:26:1 › AT-UC02-02 invalid credentials show an error and retry succeeds (4.2s)
  ✓   8 tests/e2e/uc02.acceptance.spec.js:40:1 › AT-UC02-03 repeated failures lock the account temporarily (5.5s)
  ✓   9 tests/e2e/uc02.acceptance.spec.js:57:1 › AT-UC02-04 locked and disabled accounts are denied with guidance (3.9s)
  ✓  10 tests/e2e/uc02.acceptance.spec.js:71:1 › AT-UC02-05 authentication service outage denies login and shows guidance (3.7s)
  ✓  11 tests/e2e/uc03.acceptance.spec.js:33:1 › AT-UC03-01 dashboard loads after login and permitted feature navigation works (4.0s)
  ✓  12 tests/e2e/uc03.acceptance.spec.js:70:1 › AT-UC03-02 partial dashboard states are shown and retry restores the full dashboard (4.1s)
  ✓  13 tests/e2e/uc03.acceptance.spec.js:96:1 › AT-UC03-03 professor dashboard shows inbox, personal profile, and current courses only (4.1s)
  ✓  14 tests/e2e/uc03.acceptance.spec.js:121:1 › AT-UC03-04 admin dashboard shows inbox, personal profile, admin operations, and security center in order (4.0s)
  ✓  15 tests/e2e/uc05.acceptance.spec.js:24:1 › AT-UC05-01 edit personal details with valid data (4.2s)
  ✓  16 tests/e2e/uc05.acceptance.spec.js:46:1 › AT-UC05-02 invalid personal details are rejected until corrected (4.2s)
  ✓  17 tests/e2e/uc05.acceptance.spec.js:63:1 › AT-UC05-03 save failures leave stored personal details unchanged (4.2s)
  ✓  18 tests/e2e/uc05.acceptance.spec.js:86:1 › AT-UC05-04 cancelling an edit discards unsaved personal-detail changes (4.5s)
  ✓  19 tests/e2e/uc06.acceptance.spec.js:18:1 › AT-UC06-01 dashboard personal profile shows the user contact information (4.0s)
  ✓  20 tests/e2e/uc06.acceptance.spec.js:36:1 › AT-UC06-02 dashboard personal profile keeps available data visible and marks incomplete items (4.0s)
  ✓  21 tests/e2e/uc07.acceptance.spec.js:24:1 › AT-UC07-01 edit contact information with valid data (4.4s)
  ✓  22 tests/e2e/uc07.acceptance.spec.js:49:1 › AT-UC07-02 invalid contact formats are rejected until corrected (4.5s)
  ✓  23 tests/e2e/uc07.acceptance.spec.js:70:1 › AT-UC07-03 save failures leave stored contact details unchanged (4.2s)
  ✓  24 tests/e2e/uc07.acceptance.spec.js:95:1 › AT-UC07-04 cancelling an edit discards unsaved contact-information changes (4.2s)
  ✓  25 tests/e2e/uc09.acceptance.spec.js:18:1 › AT-UC09-01 student financial dashboard loads after login with only permitted features (4.1s)
  ✓  26 tests/e2e/uc09.acceptance.spec.js:37:1 › AT-UC09-02 students with no assigned modules see a minimal dashboard and admin-contact guidance (4.0s)
  ✓  27 tests/e2e/uc09.acceptance.spec.js:47:1 › AT-UC09-03 financial dashboard faults show a partial view and recover after retry (4.3s)
  ✓  28 tests/e2e/uc22-31.acceptance.spec.js:18:1 › AT-UC22-UC24-UC23 student opens the Schedule Builder, sees pre-generation conflict warnings, and cycles multiple results (4.6s)
  ✓  29 tests/e2e/uc22-31.acceptance.spec.js:40:1 › AT-UC26-UC27-UC28 student saves prioritized constraints as a preset and reloads them later (5.0s)
  ✓  30 tests/e2e/uc22-31.acceptance.spec.js:66:1 › AT-UC29 compatible shared components render once and missing compatibility blocks generation (4.8s)
  ✓  31 tests/e2e/uc22-31.acceptance.spec.js:90:1 › AT-UC30-UC31 live full and removed-course updates show regenerated best-effort results (4.6s)
  ✓  32 tests/e2e/uc43.acceptance.spec.js:49:1 › AT-UC43-01 create account successfully with preset role and password (5.3s)
  ✓  33 tests/e2e/uc43.acceptance.spec.js:66:1 › AT-UC43-02 invalid user information is rejected until corrected (4.7s)
  ✓  34 tests/e2e/uc43.acceptance.spec.js:86:1 › AT-UC43-03 role becomes invalid or disallowed and succeeds after correction (5.1s)
  ✓  35 tests/e2e/uc43.acceptance.spec.js:111:1 › AT-UC43-04 password policy failures are shown until corrected (4.8s)
  ✓  36 tests/e2e/uc43.acceptance.spec.js:131:1 › AT-UC43-05 duplicate identifiers are rejected until a unique email is provided (4.7s)
[2m[WebServer] [22mAccount creation failed {
[2m[WebServer] [22m  actorAccountId: [33m304[39m,
[2m[WebServer] [22m  email: [32m'acceptance.failure@example.com'[39m,
[2m[WebServer] [22m  error: [32m'Simulated account creation failure.'[39m
[2m[WebServer] [22m}
  ✓  37 tests/e2e/uc43.acceptance.spec.js:149:1 › AT-UC43-06 system failures do not create the account and a later retry can succeed (5.2s)
  ✓  38 tests/e2e/uc43.acceptance.spec.js:171:1 › AT-UC43-07 notification failures are reported without rolling back the created account (5.5s)

  38 passed (3.0m)
# Tests Results for Command "npm run lint"

> ece493group19-uc02-login@1.0.0 lint
> node scripts/lint.js

Lint checks passed for 127 files.
# Tests Results for Command "c8 src/node.js"
-----------------------------------|---------|----------|---------|---------|-----------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s     
-----------------------------------|---------|----------|---------|---------|-----------------------
All files                          |    6.59 |      100 |       0 |    6.59 |                       
 src                               |   21.39 |      100 |       0 |   21.39 |                       
  app.js                           |   21.39 |      100 |       0 |   21.39 | 39-185                
 src/controllers                   |    8.77 |      100 |       0 |    8.77 |                       
  admin-account-controller.js      |    5.22 |      100 |       0 |    5.22 | ...28-36,38-50,52-247 
  auth-controller.js               |    4.87 |      100 |       0 |    4.87 | 7-162                 
  dashboard-controller.js          |   14.18 |      100 |       0 |   14.18 | ...02,104-106,108-689 
  dashboard-response.js            |   16.94 |      100 |       0 |   16.94 | ...,20-36,38-44,46-52 
  home-controller.js               |   42.85 |      100 |       0 |   42.85 | 5-12                  
  password-controller.js           |    2.02 |      100 |       0 |    2.02 | 5-295                 
  profile-controller.js            |     6.4 |      100 |       0 |     6.4 | ...37-39,41-43,45-326 
  schedule-builder-controller.js   |    7.77 |      100 |       0 |    7.77 | ...22,324-337,339-372 
 src/controllers/validators        |   10.14 |      100 |       0 |   10.14 |                       
  admin-account-validator.js       |    8.33 |      100 |       0 |    8.33 | 3-5,7-58              
  dashboard-validator.js           |    4.54 |      100 |       0 |    4.54 | 1-42                  
  profile-validator.js             |   11.55 |      100 |       0 |   11.55 | ...50,152-159,161-237 
 src/middleware                    |   14.08 |      100 |       0 |   14.08 |                       
  require-auth.js                  |    10.9 |      100 |       0 |    10.9 | 3-7,9-15,17-53        
  session-middleware.js            |      25 |      100 |       0 |      25 | 3-14                  
 src/models                        |     2.9 |      100 |       0 |     2.9 |                       
  account-model.js                 |    1.57 |      100 |       0 |    1.57 | 1-125                 
  contact-info-model.js            |    2.23 |      100 |       0 |    2.23 | 1-16,18-132           
  course-model.js                  |   11.76 |      100 |       0 |   11.76 | 1-15                  
  dashboard-load-model.js          |    3.61 |      100 |       0 |    3.61 | 1-16,18-81            
  dashboard-section-model.js       |     7.4 |      100 |       0 |     7.4 | 1-25                  
  dashboard-section-state-model.js |    3.12 |      100 |       0 |    3.12 | 1-62                  
  login-attempt-model.js           |     3.7 |      100 |       0 |     3.7 | 1-52                  
  module-model.js                  |    6.25 |      100 |       0 |    6.25 | 1-30                  
  notification-attempt-model.js    |    4.65 |      100 |       0 |    4.65 | 1-41                  
  notification-model.js            |       4 |      100 |       0 |       4 | 1-48                  
  password-change-attempt-model.js |     3.5 |      100 |       0 |     3.5 | 1-55                  
  personal-details-model.js        |    2.72 |      100 |       0 |    2.72 | 1-15,17-108           
  reset-token-model.js             |   16.12 |      100 |       0 |   16.12 | 3-5,7-29              
  role-model.js                    |       5 |      100 |       0 |       5 | 1-38                  
  schedule-builder-model.js        |    1.12 |      100 |       0 |    1.12 | ...27-42,44-95,97-443 
  session-model.js                 |     2.1 |      100 |       0 |     2.1 | 1-93                  
  user-account-model.js            |    2.38 |      100 |       0 |    2.38 | 1-82                  
  verification-cooldown-model.js   |    3.57 |      100 |       0 |    3.57 | 1-54                  
 src/routes                        |   25.69 |      100 |       0 |   25.69 |                       
  admin-account-routes.js          |   31.81 |      100 |       0 |   31.81 | 6-20                  
  auth-routes.js                   |    22.5 |      100 |       0 |    22.5 | 8-38                  
  dashboard-routes.js              |      35 |      100 |       0 |      35 | 6-18                  
  profile-routes.js                |   16.66 |      100 |       0 |   16.66 | 6-40                  
  schedule-builder-routes.js       |      35 |      100 |       0 |      35 | 6-18                  
 src/services                      |     3.8 |      100 |       0 |     3.8 |                       
  account-creation-service.js      |    4.13 |      100 |       0 |    4.13 | 3-5,7-13,15-143       
  auth-audit-service.js            |   15.38 |      100 |       0 |   15.38 | 3-24                  
  auth-service.js                  |     6.4 |      100 |       0 |     6.4 | 7-123                 
  cooldown-service.js              |    2.89 |      100 |       0 |    2.89 | 1-67                  
  lockout-service.js               |    3.27 |      100 |       0 |    3.27 | 1-59                  
  login-outcomes.js                |     100 |      100 |     100 |     100 |                       
  notification-service.js          |    2.27 |      100 |       0 |    2.27 | 1-86                  
  password-change-service.js       |    1.02 |      100 |       0 |    1.02 | 3-387                 
  password-policy-service.js       |    2.56 |      100 |       0 |    2.56 | 1-76                  
  schedule-builder-service.js      |    3.76 |      100 |       0 |    3.76 | ...9,361-377,379-1356 
  session-security-service.js      |    8.69 |      100 |       0 |    8.69 | 1-21                  
 src/views                         |   19.23 |      100 |       0 |   19.23 |                       
  render.js                        |   19.23 |      100 |       0 |   19.23 | 3-10,12-24            
-----------------------------------|---------|----------|---------|---------|-----------------------
