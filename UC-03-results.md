# Tests Results for Command "npm run test"

> ece493group19-uc02-login@1.0.0 test
> npm run test:coverage && npm run test:acceptance


> ece493group19-uc02-login@1.0.0 test:coverage
> node --test --experimental-test-coverage --test-coverage-include=src/**/*.js --test-coverage-exclude=src/views/*.js --test-coverage-branches=100 --test-coverage-functions=100 --test-coverage-lines=100 tests/unit/*.test.js tests/integration/*.test.js tests/contract/*.test.js

✔ dashboard contract never exposes restricted module keys for each supported role profile (11080.17356ms)
✔ GET /dashboard returns an auth redirect payload for unauthenticated JSON requests (2293.868857ms)
✔ GET /dashboard returns a success payload matching the contract for a student actor (2183.795122ms)
✔ GET /dashboard returns empty_access when the actor has no assigned dashboard modules (2163.024222ms)
✔ GET /dashboard returns role_data_error when role retrieval fails for the authenticated actor (2159.283721ms)
✔ POST /dashboard/retry returns auth_error for unauthenticated JSON requests (2236.940203ms)
✔ POST /dashboard/retry returns a 400 contract payload for invalid retry requests (2083.749295ms)
✔ POST /dashboard/retry returns a partial payload when only some unavailable sections recover (2171.762979ms)
✔ POST /dashboard/retry returns success when all requested sections recover (2286.689682ms)
✔ POST /dashboard/retry returns failure when every section remains unavailable (2137.748738ms)
✔ admin can open the target form and change another user password without target verification fields (2864.5191ms)
✔ admin endpoints reject unauthorized access and missing targets (2452.816523ms)
✔ password change enforces cooldown messaging after repeated verification failures (2805.063068ms)
✔ system failure rollback preserves the existing password (2700.210402ms)
✔ reset-token password change succeeds and consumes the token (2751.511417ms)
✔ reset-token flow rejects expired tokens and supports JSON responses (2089.09874ms)
✔ self-service password change succeeds, preserves the current session, invalidates other sessions, and updates login credentials (3180.877694ms)
✔ self-service password change persists after creating a new app against the same database (2889.546255ms)
✔ self-service password change supports JSON responses and cancellation without persisting changes (2558.776129ms)
✔ self-service password change rejects a new password that matches the current password (2376.93878ms)
✔ dashboard renders role-scoped navigation for student, professor, admin, and multi-role actors (8987.233474ms)
✔ dashboard renders a role-data error state with retry guidance when role resolution fails (2099.830983ms)
✔ GET /dashboard redirects unauthenticated users to the login page with returnTo (2210.150363ms)
✔ GET /dashboard renders authenticated account data, available navigation, and student dashboard sections (2072.611303ms)
✔ POST /logout revokes the current session and redirects future dashboard requests to the login page with returnTo (2008.681823ms)
✔ dashboard shows a minimal shell without unauthorized modules when a student has no active assignments (2408.795815ms)
✔ dashboard re-evaluates role changes and removes modules that are no longer authorized (2186.324587ms)
✔ dashboard keeps restricted modules hidden even during partial professor loads (2121.676864ms)
✔ admin dashboards never expose student or professor-only modules (2221.418712ms)
✔ dashboard load telemetry records p95 timings under the SC-001 threshold for initial loads and retries (2745.063926ms)
✔ dashboard renders a partial view and selective retry restores recovered sections (2282.703737ms)
✔ dashboard renders a failure state when every section is unavailable (2210.210402ms)
✔ dashboard retry rejects section IDs that are not currently unavailable (2145.457625ms)
✔ expired dashboard sessions redirect to login with returnTo and can return to the dashboard after re-authentication (2444.928696ms)
✔ expired sessions receive an auth_error payload when retrying unavailable dashboard sections (2201.539511ms)
✔ POST /login returns 403 for disabled accounts and does not create a session (2058.568747ms)
✔ POST /login returns 400 when required fields are missing (2086.675542ms)
✔ POST /login returns 401 for invalid credentials and allows retry success (2230.921462ms)
✔ POST /login returns 401 for unknown accounts without creating a session (1975.923713ms)
✔ POST /login returns 423 for pre-locked accounts with valid credentials (2067.340654ms)
✔ repeated invalid credentials trigger a temporary lock and later recover after expiry (2897.459146ms)
✔ valid logins satisfy the SC-001 benchmark threshold (5126.374362ms)
✔ POST /login returns 503 when the authentication service is unavailable (2066.050641ms)
✔ GET / renders a title page with navigation to the login page (2023.481125ms)
✔ GET /login renders demo reset guidance for unauthenticated users and redirects authenticated users (2004.320785ms)
✔ POST /login succeeds, creates a session cookie, and records audit rows (1647.405212ms)
✔ createApp throws without a database and exposes dashboard services by default (582.250936ms)
✔ migration entrypoints apply schema and seed fixtures from the command line (2116.566496ms)
✔ auth controller redirects authenticated users to the requested return path and forwards session save failures (3.716926ms)
✔ auth controller invalidates the current session and clears the cookie on logout (1.316895ms)
✔ auth controller forwards logout destroy failures to next (1.421218ms)
✔ dashboard controller handles missing accounts and role-data-error rendering branches (3.277716ms)
✔ session middleware supports both default and explicit secrets (0.615952ms)
✔ auth audit service records both failure and success outcomes (3.733804ms)
✔ requireAuth sanitizes invalid returnTo values and covers JSON, redirect, and next branches (4.83315ms)
✔ auth controller sanitizes unsafe returnTo values for rendering, validation, and successful redirects (3.029894ms)
✔ course and login-attempt models expose retrieval helpers for seeded data and recorded attempts (1909.379557ms)
✔ dashboard load model defaults missing durations to zero and supports implicit percentile lookups (1721.462352ms)
✔ auth controller uses the session returnTo value when request inputs omit it (1.096006ms)
✔ auth controller falls back to an empty user-agent header when none is provided (0.826283ms)
✔ auth controller preserves session returnTo on the login page when no account is authenticated yet (1.029239ms)
✔ auth service handles omitted unavailableIdentifiers configuration (126.219171ms)
✔ connection helpers reuse cached connections and respect DB_PATH defaults (10.235104ms)
✔ account, attempt, session, and audit helpers cover null and optional-field branches (1857.732288ms)
✔ cooldown service tracks escalation, active blocks, and clears state (5.312378ms)
✔ module authorization helpers deduplicate overlapping role mappings and report enabled access correctly (1861.69111ms)
✔ dashboard controller renders mixed section states, admin actions, and escaped content (32.289182ms)
✔ dashboard controller renders no-course and no-teaching fallback content for non-admin actors (2.11802ms)
✔ dashboard controller returns a failure payload when modules exist but no sections are enabled (2.667165ms)
✔ dashboard controller retry updates requested sections and treats untouched sections as available by default (1.438617ms)
✔ dashboard controller returns empty_access when roles exist but none of their modules are enabled (1.154682ms)
✔ dashboard controller short-circuits empty_access for missing roles and returns JSON auth redirects for missing accounts (1.105563ms)
✔ dashboard controller tolerates null dashboard test identifiers without changing the response payload (1.236112ms)
✔ dashboard controller includes teaching assistant assignments in workload content (1.276539ms)
✔ dashboard controller defaults omitted dashboardTestState to a healthy dashboard state (1.56619ms)
✔ dashboard controller applies professor presentation overrides for string role identifiers (2.047255ms)
✔ dashboard controller handles accounts without a primary role when no active roles are returned (0.831462ms)
✔ dashboard controller ignores blank role entries when deriving presentation overrides (0.959426ms)
✔ dashboard controller preserves admin security labeling when string roles include professor and admin (1.446022ms)
✔ dashboard controller returns role_data_error when the username matches a configured failure identifier (0.57815ms)
✔ dashboard controller returns an auth redirect payload for POST requests when the account is missing (0.488439ms)
✔ dashboard controller falls back to raw role objects without role labels when deriving presentation keys (1.192849ms)
✔ dashboard controller treats omitted active role lists as an empty-access minimal dashboard (1.170247ms)
✔ dashboard helper utilities cover validation, response messaging, and percentile branches (6.80375ms)
✔ lockout service resets stale failure windows and computes the next count (4.818463ms)
✔ lockout service detects active locks, expired locks, and false-path evaluations (0.743474ms)
✔ lockout service supports default time evaluation paths (0.598188ms)
✔ dashboard models provide account, role, module, section, state, and telemetry operations (1889.772879ms)
✔ renderHtml escapes plain text and preserves html/json placeholders (1.183653ms)
✔ password change service covers self-service error paths and success (1217.126803ms)
✔ password change service covers reset-token flows including missing target account (451.557463ms)
✔ password change service covers admin authorization, policy, success, failure, and cancellation (896.211062ms)
✔ password change service preserves explicit request ids and covers non-self admin success (784.623822ms)
✔ password change service treats an omitted current password as a verification failure (474.164875ms)
✔ password change service defaults simulated failure identifiers when the option is omitted (0.822405ms)
✔ password controller covers JSON cooldown responses and HTML policy rendering branches (7.897157ms)
✔ password controller covers HTML self-service, admin rendering branches, and error forwarding (9.610505ms)
✔ password controller covers page render guards and JSON cancellation (1.916506ms)
✔ password controller accepts JSON via Accept header and handles admin policy fallback without a target record (1.307988ms)
✔ password controller covers success pages, form defaults, and plain html retry branches (4.362741ms)
✔ password controller covers non-admin actors and missing accept headers (0.938185ms)
✔ password controller covers missing admin password submissions (0.694641ms)
✔ password controller covers html cancellation, html cooldown recovery, and reset json/policy fallbacks (2.255506ms)
✔ createApp exposes the e2e reset route for both success and error paths (3105.441599ms)
✔ password feature models cover list and null-return helper branches (1247.273505ms)
✔ password feature models cover preserved-session invalidation and explicit attempt metadata (1172.630329ms)
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
✔ password policy validates compliant passwords and describes failures (5.628319ms)
✔ applySchema backfills missing columns for pre-feature databases (510.461543ms)
✔ applySchema recreates the accounts table when the professor role is missing from the legacy check constraint (1231.503869ms)
✔ applySchema repairs child tables that still reference accounts_legacy so fixture seeding succeeds (2047.620178ms)
✔ applySchema is idempotent for databases that already match the current schema (282.137185ms)
✔ applySchema exposes getTableSql for missing-table checks used by migrations (1.979126ms)
✔ applySchema getTableSql returns an empty string when sqlite metadata rows have null SQL (0.511093ms)
ℹ tests 113
ℹ suites 0
ℹ pass 113
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 19433.332817
ℹ start of coverage report
ℹ ------------------------------------------------------------------------------------
ℹ file                                | line % | branch % | funcs % | uncovered lines
ℹ ------------------------------------------------------------------------------------
ℹ src                                 |        |          |         | 
ℹ  app.js                             | 100.00 |   100.00 |  100.00 | 
ℹ  controllers                        |        |          |         | 
ℹ   auth-controller.js                | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-controller.js           | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-response.js             | 100.00 |   100.00 |  100.00 | 
ℹ   home-controller.js                | 100.00 |   100.00 |  100.00 | 
ℹ   password-controller.js            | 100.00 |   100.00 |  100.00 | 
ℹ   validators                        |        |          |         | 
ℹ    dashboard-validator.js           | 100.00 |   100.00 |  100.00 | 
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
ℹ   course-model.js                   | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-load-model.js           | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-section-model.js        | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-section-state-model.js  | 100.00 |   100.00 |  100.00 | 
ℹ   login-attempt-model.js            | 100.00 |   100.00 |  100.00 | 
ℹ   module-model.js                   | 100.00 |   100.00 |  100.00 | 
ℹ   notification-model.js             | 100.00 |   100.00 |  100.00 | 
ℹ   password-change-attempt-model.js  | 100.00 |   100.00 |  100.00 | 
ℹ   reset-token-model.js              | 100.00 |   100.00 |  100.00 | 
ℹ   role-model.js                     | 100.00 |   100.00 |  100.00 | 
ℹ   session-model.js                  | 100.00 |   100.00 |  100.00 | 
ℹ   verification-cooldown-model.js    | 100.00 |   100.00 |  100.00 | 
ℹ  routes                             |        |          |         | 
ℹ   auth-routes.js                    | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-routes.js               | 100.00 |   100.00 |  100.00 | 
ℹ  services                           |        |          |         | 
ℹ   auth-audit-service.js             | 100.00 |   100.00 |  100.00 | 
ℹ   auth-service.js                   | 100.00 |   100.00 |  100.00 | 
ℹ   cooldown-service.js               | 100.00 |   100.00 |  100.00 | 
ℹ   lockout-service.js                | 100.00 |   100.00 |  100.00 | 
ℹ   login-outcomes.js                 | 100.00 |   100.00 |  100.00 | 
ℹ   notification-service.js           | 100.00 |   100.00 |  100.00 | 
ℹ   password-change-service.js        | 100.00 |   100.00 |  100.00 | 
ℹ   password-policy-service.js        | 100.00 |   100.00 |  100.00 | 
ℹ   session-security-service.js       | 100.00 |   100.00 |  100.00 | 
ℹ ------------------------------------------------------------------------------------
ℹ all files                           | 100.00 |   100.00 |  100.00 | 
ℹ ------------------------------------------------------------------------------------
ℹ end of coverage report

> ece493group19-uc02-login@1.0.0 test:acceptance
> node scripts/run-playwright.js


Running 17 tests using 1 worker

  ✓   1 tests/e2e/uc01.acceptance.spec.js:10:1 › AT-UC01-01 logged-in users can navigate from the dashboard and change their password successfully (3.4s)
  ✓   2 tests/e2e/uc01.acceptance.spec.js:46:1 › AT-UC01-02 reset-token recovery accepts a valid token and rejects an expired token (1.7s)
  ✓   3 tests/e2e/uc01.acceptance.spec.js:60:1 › AT-UC01-03 policy failures and cooldown feedback are shown without changing the password (3.0s)
  ✓   4 tests/e2e/uc01.acceptance.spec.js:82:1 › AT-UC01-04 admins can change another users password without target verification fields (2.3s)
  ✓   5 tests/e2e/uc01.acceptance.spec.js:107:1 › AT-UC01-05 cancelling the flow discards unsaved inputs and makes no password changes (2.2s)
  ✓   6 tests/e2e/uc02.acceptance.spec.js:9:1 › AT-UC02-01 successful login routes to the dashboard and logout returns to login (1.7s)
  ✓   7 tests/e2e/uc02.acceptance.spec.js:26:1 › AT-UC02-02 invalid credentials show an error and retry succeeds (1.8s)
  ✓   8 tests/e2e/uc02.acceptance.spec.js:40:1 › AT-UC02-03 repeated failures lock the account temporarily (3.0s)
  ✓   9 tests/e2e/uc02.acceptance.spec.js:57:1 › AT-UC02-04 locked and disabled accounts are denied with guidance (1.5s)
  ✓  10 tests/e2e/uc02.acceptance.spec.js:71:1 › AT-UC02-05 authentication service outage denies login and shows guidance (1.2s)
  ✓  11 tests/e2e/uc03.acceptance.spec.js:33:1 › AT-UC03-01 dashboard loads after login and permitted feature navigation works (1.6s)
  ✓  12 tests/e2e/uc03.acceptance.spec.js:70:1 › AT-UC03-02 partial dashboard states are shown and retry restores the full dashboard (1.5s)
  ✓  13 tests/e2e/uc03.acceptance.spec.js:96:1 › AT-UC03-03 professor dashboard shows inbox, personal profile, and current courses only (1.7s)
  ✓  14 tests/e2e/uc03.acceptance.spec.js:121:1 › AT-UC03-04 admin dashboard shows inbox, personal profile, admin operations, and security center in order (1.5s)
  ✓  15 tests/e2e/uc09.acceptance.spec.js:18:1 › AT-UC09-01 student financial dashboard loads after login with only permitted features (1.6s)
  ✓  16 tests/e2e/uc09.acceptance.spec.js:37:1 › AT-UC09-02 students with no assigned modules see a minimal dashboard and admin-contact guidance (1.5s)
  ✓  17 tests/e2e/uc09.acceptance.spec.js:47:1 › AT-UC09-03 financial dashboard faults show a partial view and recover after retry (1.6s)

  17 passed (37.9s)
# Tests Results for Command "npm run lint"

> ece493group19-uc02-login@1.0.0 lint
> node scripts/lint.js

Lint checks passed for 83 files.
# Tests Results for Command "c8 src/node.js"
-----------------------------------|---------|----------|---------|---------|-----------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s     
-----------------------------------|---------|----------|---------|---------|-----------------------
All files                          |    8.46 |      100 |       0 |    8.46 |                       
 src                               |   24.39 |      100 |       0 |   24.39 |                       
  app.js                           |   24.39 |      100 |       0 |   24.39 | 29-121                
 src/controllers                   |   10.92 |      100 |       0 |   10.92 |                       
  auth-controller.js               |       5 |      100 |       0 |       5 | 7-158                 
  dashboard-controller.js          |   15.32 |      100 |       0 |   15.32 | ...01,103-105,107-631 
  dashboard-response.js            |   16.94 |      100 |       0 |   16.94 | ...,20-36,38-44,46-52 
  home-controller.js               |   42.85 |      100 |       0 |   42.85 | 5-12                  
  password-controller.js           |    2.02 |      100 |       0 |    2.02 | 5-295                 
 src/controllers/validators        |    4.54 |      100 |       0 |    4.54 |                       
  dashboard-validator.js           |    4.54 |      100 |       0 |    4.54 | 1-42                  
 src/middleware                    |   14.08 |      100 |       0 |   14.08 |                       
  require-auth.js                  |    10.9 |      100 |       0 |    10.9 | 3-7,9-15,17-53        
  session-middleware.js            |      25 |      100 |       0 |      25 | 3-14                  
 src/models                        |    4.21 |      100 |       0 |    4.21 |                       
  account-model.js                 |    1.58 |      100 |       0 |    1.58 | 1-124                 
  course-model.js                  |   11.76 |      100 |       0 |   11.76 | 1-15                  
  dashboard-load-model.js          |    3.61 |      100 |       0 |    3.61 | 1-16,18-81            
  dashboard-section-model.js       |     7.4 |      100 |       0 |     7.4 | 1-25                  
  dashboard-section-state-model.js |    3.12 |      100 |       0 |    3.12 | 1-62                  
  login-attempt-model.js           |     3.7 |      100 |       0 |     3.7 | 1-52                  
  module-model.js                  |    6.25 |      100 |       0 |    6.25 | 1-30                  
  notification-model.js            |       4 |      100 |       0 |       4 | 1-48                  
  password-change-attempt-model.js |     3.5 |      100 |       0 |     3.5 | 1-55                  
  reset-token-model.js             |   16.12 |      100 |       0 |   16.12 | 3-5,7-29              
  role-model.js                    |   10.52 |      100 |       0 |   10.52 | 1-17                  
  session-model.js                 |     2.1 |      100 |       0 |     2.1 | 1-93                  
  verification-cooldown-model.js   |    3.57 |      100 |       0 |    3.57 | 1-54                  
 src/routes                        |   26.66 |      100 |       0 |   26.66 |                       
  auth-routes.js                   |    22.5 |      100 |       0 |    22.5 | 8-38                  
  dashboard-routes.js              |      35 |      100 |       0 |      35 | 6-18                  
 src/services                      |    4.16 |      100 |       0 |    4.16 |                       
  auth-audit-service.js            |   15.38 |      100 |       0 |   15.38 | 3-24                  
  auth-service.js                  |     6.4 |      100 |       0 |     6.4 | 7-123                 
  cooldown-service.js              |    2.89 |      100 |       0 |    2.89 | 1-67                  
  lockout-service.js               |    3.27 |      100 |       0 |    3.27 | 1-59                  
  login-outcomes.js                |     100 |      100 |     100 |     100 |                       
  notification-service.js          |    8.33 |      100 |       0 |    8.33 | 1-22                  
  password-change-service.js       |    1.02 |      100 |       0 |    1.02 | 3-387                 
  password-policy-service.js       |    2.94 |      100 |       0 |    2.94 | 1-66                  
  session-security-service.js      |    8.69 |      100 |       0 |    8.69 | 1-21                  
 src/views                         |   19.23 |      100 |       0 |   19.23 |                       
  render.js                        |   19.23 |      100 |       0 |   19.23 | 3-10,12-24            
-----------------------------------|---------|----------|---------|---------|-----------------------
