# Tests Results for Command "npm run test"

> ece493group19-uc02-login@1.0.0 test
> npm run test:coverage && npm run test:acceptance


> ece493group19-uc02-login@1.0.0 test:coverage
> node --test --experimental-test-coverage --test-coverage-include=src/**/*.js --test-coverage-exclude=src/views/*.js --test-coverage-branches=100 --test-coverage-functions=100 --test-coverage-lines=100 tests/unit/*.test.js tests/integration/*.test.js tests/contract/*.test.js

✔ dashboard contract never exposes restricted module keys for each supported role profile (6201.609343ms)
✔ GET /dashboard returns an auth redirect payload for unauthenticated JSON requests (1201.098958ms)
✔ GET /dashboard returns a success payload matching the contract for a student actor (1257.928762ms)
✔ GET /dashboard returns empty_access when the actor has no assigned dashboard modules (1137.868ms)
✔ GET /dashboard returns role_data_error when role retrieval fails for the authenticated actor (1198.054736ms)
✔ POST /dashboard/retry returns auth_error for unauthenticated JSON requests (1275.069406ms)
✔ POST /dashboard/retry returns a 400 contract payload for invalid retry requests (1227.500323ms)
✔ POST /dashboard/retry returns a partial payload when only some unavailable sections recover (1215.344874ms)
✔ POST /dashboard/retry returns success when all requested sections recover (1248.601398ms)
✔ POST /dashboard/retry returns failure when every section remains unavailable (1240.859308ms)
✔ admin can open the target form and change another user password without target verification fields (1513.440677ms)
✔ admin endpoints reject unauthorized access and missing targets (1270.223431ms)
✔ password change enforces cooldown messaging after repeated verification failures (1605.660418ms)
✔ system failure rollback preserves the existing password (1389.389491ms)
✔ reset-token password change succeeds and consumes the token (1514.816899ms)
✔ reset-token flow rejects expired tokens and supports JSON responses (1117.378025ms)
✔ self-service password change succeeds, preserves the current session, invalidates other sessions, and updates login credentials (1726.544858ms)
✔ self-service password change persists after creating a new app against the same database (1470.258976ms)
✔ self-service password change supports JSON responses and cancellation without persisting changes (1348.748155ms)
✔ self-service password change rejects a new password that matches the current password (1377.630499ms)
✔ contact-information route redirects unauthenticated users and renders seeded values for authenticated users (1368.582528ms)
✔ contact-information route rejects invalid input and persists corrected values (1209.162682ms)
✔ contact-information route rolls back simulated save failures without partial writes (1227.118549ms)
✔ contact-information route saves the latest version and reports stale-edit conflicts (1228.853962ms)
✔ dashboard renders role-scoped navigation for student, professor, admin, and multi-role actors (4956.05717ms)
✔ dashboard renders a role-data error state with retry guidance when role resolution fails (1191.331649ms)
✔ GET /dashboard redirects unauthenticated users to the login page with returnTo (1228.618769ms)
✔ GET /dashboard renders authenticated account data, available navigation, and student dashboard sections (1254.607976ms)
✔ POST /logout revokes the current session and redirects future dashboard requests to the login page with returnTo (1208.800472ms)
✔ dashboard shows a minimal shell without unauthorized modules when a student has no active assignments (1356.314796ms)
✔ dashboard re-evaluates role changes and removes modules that are no longer authorized (1218.577591ms)
✔ dashboard keeps restricted modules hidden even during partial professor loads (1205.501763ms)
✔ admin dashboards never expose student or professor-only modules (1202.016294ms)
✔ dashboard load telemetry records p95 timings under the SC-001 threshold for initial loads and retries (1355.626407ms)
✔ student dashboard displays personal and contact information with both update actions (1207.312841ms)
✔ professor and admin dashboards both expose profile summaries while admin security actions remain intact (2430.218013ms)
✔ dashboard displays available profile data and labels missing items as Not provided (1206.962957ms)
✔ dashboard renders a partial view and selective retry restores recovered sections (1336.533023ms)
✔ dashboard renders a failure state when every section is unavailable (1208.967629ms)
✔ dashboard retry rejects section IDs that are not currently unavailable (1258.452914ms)
✔ expired dashboard sessions redirect to login with returnTo and can return to the dashboard after re-authentication (1344.440894ms)
✔ expired sessions receive an auth_error payload when retrying unavailable dashboard sections (1233.44476ms)
✔ POST /login returns 403 for disabled accounts and does not create a session (1193.12981ms)
✔ POST /login returns 400 when required fields are missing (1175.168189ms)
✔ POST /login returns 401 for invalid credentials and allows retry success (1340.68955ms)
✔ POST /login returns 401 for unknown accounts without creating a session (1154.930802ms)
✔ POST /login returns 423 for pre-locked accounts with valid credentials (1147.840451ms)
✔ repeated invalid credentials trigger a temporary lock and later recover after expiry (1613.267662ms)
✔ valid logins satisfy the SC-001 benchmark threshold (2694.484301ms)
✔ POST /login returns 503 when the authentication service is unavailable (1216.841338ms)
✔ GET / renders a title page with navigation to the login page (1180.631579ms)
✔ GET /login renders demo reset guidance for unauthenticated users and redirects authenticated users (1186.49645ms)
✔ POST /login succeeds, creates a session cookie, and records audit rows (921.730651ms)
✔ personal-information route redirects unauthenticated users and renders seeded values for authenticated users (1248.722018ms)
✔ personal-information route rejects invalid input and persists valid updates (1141.476648ms)
✔ personal-information route reports simulated save failures without changing stored data (922.109438ms)
✔ createApp throws without a database and exposes dashboard services by default (286.77151ms)
✔ migration entrypoints apply schema and seed fixtures from the command line (1288.835342ms)
✔ auth controller redirects authenticated users to the requested return path and forwards session save failures (1.152313ms)
✔ auth controller invalidates the current session and clears the cookie on logout (0.657071ms)
✔ auth controller forwards logout destroy failures to next (0.487578ms)
✔ dashboard controller handles missing accounts and role-data-error rendering branches (1.400686ms)
✔ session middleware supports both default and explicit secrets (0.219077ms)
✔ auth audit service records both failure and success outcomes (1.620965ms)
✔ requireAuth sanitizes invalid returnTo values and covers JSON, redirect, and next branches (2.984629ms)
✔ auth controller sanitizes unsafe returnTo values for rendering, validation, and successful redirects (2.004845ms)
✔ course and login-attempt models expose retrieval helpers for seeded data and recorded attempts (1161.478976ms)
✔ dashboard load model defaults missing durations to zero and supports implicit percentile lookups (1056.081889ms)
✔ auth controller uses the session returnTo value when request inputs omit it (0.392787ms)
✔ auth controller falls back to an empty user-agent header when none is provided (0.330228ms)
✔ auth controller preserves session returnTo on the login page when no account is authenticated yet (0.369022ms)
✔ auth service handles omitted unavailableIdentifiers configuration (56.867925ms)
✔ connection helpers reuse cached connections and respect DB_PATH defaults (3.783399ms)
✔ account, attempt, session, and audit helpers cover null and optional-field branches (1203.587683ms)
✔ cooldown service tracks escalation, active blocks, and clears state (1.701077ms)
✔ module authorization helpers deduplicate overlapping role mappings and report enabled access correctly (1148.996582ms)
✔ dashboard controller renders mixed section states, admin actions, and escaped content (11.268551ms)
✔ dashboard controller renders no-course and no-teaching fallback content for non-admin actors (0.801365ms)
✔ dashboard controller returns a failure payload when modules exist but no sections are enabled (1.083251ms)
✔ dashboard controller retry updates requested sections and treats untouched sections as available by default (0.858944ms)
✔ dashboard controller returns empty_access when roles exist but none of their modules are enabled (0.289711ms)
✔ dashboard controller short-circuits empty_access for missing roles and returns JSON auth redirects for missing accounts (1.280121ms)
✔ dashboard controller tolerates null dashboard test identifiers without changing the response payload (0.381666ms)
✔ dashboard controller includes teaching assistant assignments in workload content (0.437593ms)
✔ dashboard controller defaults omitted dashboardTestState to a healthy dashboard state (0.67795ms)
✔ dashboard controller applies professor presentation overrides for string role identifiers (0.891677ms)
✔ dashboard controller handles accounts without a primary role when no active roles are returned (0.390192ms)
✔ dashboard controller ignores blank role entries when deriving presentation overrides (0.353292ms)
✔ dashboard controller preserves admin security labeling when string roles include professor and admin (0.665305ms)
✔ dashboard controller returns role_data_error when the username matches a configured failure identifier (0.253622ms)
✔ dashboard controller returns an auth redirect payload for POST requests when the account is missing (0.232022ms)
✔ dashboard controller falls back to raw role objects without role labels when deriving presentation keys (0.33621ms)
✔ dashboard controller treats omitted active role lists as an empty-access minimal dashboard (0.502606ms)
✔ dashboard controller renders profile summaries, update buttons, and missing indicators when profile data is available (5.17128ms)
✔ dashboard controller treats null profile-model reads as missing values while keeping update actions visible (0.847653ms)
✔ dashboard helper utilities cover validation, response messaging, and percentile branches (2.254555ms)
✔ lockout service resets stale failure windows and computes the next count (1.364436ms)
✔ lockout service detects active locks, expired locks, and false-path evaluations (0.288078ms)
✔ lockout service supports default time evaluation paths (0.201644ms)
✔ dashboard models provide account, role, module, section, state, and telemetry operations (1134.675457ms)
✔ renderHtml escapes plain text and preserves html/json placeholders (0.90437ms)
✔ password change service covers self-service error paths and success (524.59616ms)
✔ password change service covers reset-token flows including missing target account (221.069299ms)
✔ password change service covers admin authorization, policy, success, failure, and cancellation (431.326455ms)
✔ password change service preserves explicit request ids and covers non-self admin success (345.661973ms)
✔ password change service treats an omitted current password as a verification failure (197.113537ms)
✔ password change service defaults simulated failure identifiers when the option is omitted (0.337923ms)
✔ password controller covers JSON cooldown responses and HTML policy rendering branches (2.870171ms)
✔ password controller covers HTML self-service, admin rendering branches, and error forwarding (2.732931ms)
✔ password controller covers page render guards and JSON cancellation (0.764194ms)
✔ password controller accepts JSON via Accept header and handles admin policy fallback without a target record (0.563392ms)
✔ password controller covers success pages, form defaults, and plain html retry branches (1.180476ms)
✔ password controller covers non-admin actors and missing accept headers (0.324738ms)
✔ password controller covers missing admin password submissions (0.357299ms)
✔ password controller covers html cancellation, html cooldown recovery, and reset json/policy fallbacks (0.721663ms)
✔ createApp exposes the e2e reset route for both success and error paths (1750.7775ms)
✔ password feature models cover list and null-return helper branches (623.374053ms)
✔ password feature models cover preserved-session invalidation and explicit attempt metadata (524.212118ms)
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
✔ password policy validates compliant passwords and describes failures (3.135678ms)
✔ profile controller redirects to login when the session account cannot be found (1.388061ms)
✔ profile controller renders admin personal pages, validation errors, and save failures (3.348677ms)
✔ profile controller renders contact fallback state, validation errors, conflict notices, and save failures (2.736547ms)
✔ profile controller succeeds when profile test state is omitted (0.986226ms)
✔ personal details model reads, saves, detects conflicts, and rolls back failures (990.244221ms)
✔ contact info model reads, saves, detects conflicts, and rolls back partial writes (795.242216ms)
✔ profile validator helper functions normalize text, versions, and birthday formatting (2.182382ms)
✔ personal-information validation rejects missing, malformed, future, and overlong inputs (0.585885ms)
✔ contact-information validation enforces required, format, digit-count, and length rules (0.59919ms)
✔ applySchema backfills missing columns for pre-feature databases (291.639946ms)
✔ applySchema recreates the accounts table when the professor role is missing from the legacy check constraint (580.091383ms)
✔ applySchema repairs child tables that still reference accounts_legacy so fixture seeding succeeds (1067.318218ms)
✔ applySchema is idempotent for databases that already match the current schema (162.959576ms)
✔ applySchema exposes getTableSql for missing-table checks used by migrations (0.943475ms)
✔ applySchema getTableSql returns an empty string when sqlite metadata rows have null SQL (0.261638ms)
ℹ tests 134
ℹ suites 0
ℹ pass 134
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11624.294484
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
ℹ   profile-controller.js             | 100.00 |   100.00 |  100.00 | 
ℹ   validators                        |        |          |         | 
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
ℹ   notification-model.js             | 100.00 |   100.00 |  100.00 | 
ℹ   password-change-attempt-model.js  | 100.00 |   100.00 |  100.00 | 
ℹ   personal-details-model.js         | 100.00 |   100.00 |  100.00 | 
ℹ   reset-token-model.js              | 100.00 |   100.00 |  100.00 | 
ℹ   role-model.js                     | 100.00 |   100.00 |  100.00 | 
ℹ   session-model.js                  | 100.00 |   100.00 |  100.00 | 
ℹ   verification-cooldown-model.js    | 100.00 |   100.00 |  100.00 | 
ℹ  routes                             |        |          |         | 
ℹ   auth-routes.js                    | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-routes.js               | 100.00 |   100.00 |  100.00 | 
ℹ   profile-routes.js                 | 100.00 |   100.00 |  100.00 | 
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


Running 27 tests using 1 worker

  ✓   1 tests/e2e/uc01.acceptance.spec.js:10:1 › AT-UC01-01 logged-in users can navigate from the dashboard and change their password successfully (1.7s)
  ✓   2 tests/e2e/uc01.acceptance.spec.js:46:1 › AT-UC01-02 reset-token recovery accepts a valid token and rejects an expired token (772ms)
  ✓   3 tests/e2e/uc01.acceptance.spec.js:60:1 › AT-UC01-03 policy failures and cooldown feedback are shown without changing the password (1.4s)
  ✓   4 tests/e2e/uc01.acceptance.spec.js:82:1 › AT-UC01-04 admins can change another users password without target verification fields (1.1s)
  ✓   5 tests/e2e/uc01.acceptance.spec.js:107:1 › AT-UC01-05 cancelling the flow discards unsaved inputs and makes no password changes (1.0s)
  ✓   6 tests/e2e/uc02.acceptance.spec.js:9:1 › AT-UC02-01 successful login routes to the dashboard and logout returns to login (794ms)
  ✓   7 tests/e2e/uc02.acceptance.spec.js:26:1 › AT-UC02-02 invalid credentials show an error and retry succeeds (794ms)
  ✓   8 tests/e2e/uc02.acceptance.spec.js:40:1 › AT-UC02-03 repeated failures lock the account temporarily (1.4s)
  ✓   9 tests/e2e/uc02.acceptance.spec.js:57:1 › AT-UC02-04 locked and disabled accounts are denied with guidance (721ms)
  ✓  10 tests/e2e/uc02.acceptance.spec.js:71:1 › AT-UC02-05 authentication service outage denies login and shows guidance (596ms)
  ✓  11 tests/e2e/uc03.acceptance.spec.js:33:1 › AT-UC03-01 dashboard loads after login and permitted feature navigation works (750ms)
  ✓  12 tests/e2e/uc03.acceptance.spec.js:70:1 › AT-UC03-02 partial dashboard states are shown and retry restores the full dashboard (877ms)
  ✓  13 tests/e2e/uc03.acceptance.spec.js:96:1 › AT-UC03-03 professor dashboard shows inbox, personal profile, and current courses only (733ms)
  ✓  14 tests/e2e/uc03.acceptance.spec.js:121:1 › AT-UC03-04 admin dashboard shows inbox, personal profile, admin operations, and security center in order (718ms)
  ✓  15 tests/e2e/uc05.acceptance.spec.js:24:1 › AT-UC05-01 edit personal details with valid data (841ms)
  ✓  16 tests/e2e/uc05.acceptance.spec.js:46:1 › AT-UC05-02 invalid personal details are rejected until corrected (916ms)
  ✓  17 tests/e2e/uc05.acceptance.spec.js:63:1 › AT-UC05-03 save failures leave stored personal details unchanged (848ms)
  ✓  18 tests/e2e/uc05.acceptance.spec.js:86:1 › AT-UC05-04 cancelling an edit discards unsaved personal-detail changes (878ms)
  ✓  19 tests/e2e/uc06.acceptance.spec.js:18:1 › AT-UC06-01 dashboard personal profile shows the user contact information (723ms)
  ✓  20 tests/e2e/uc06.acceptance.spec.js:36:1 › AT-UC06-02 dashboard personal profile keeps available data visible and marks incomplete items (674ms)
  ✓  21 tests/e2e/uc07.acceptance.spec.js:24:1 › AT-UC07-01 edit contact information with valid data (872ms)
  ✓  22 tests/e2e/uc07.acceptance.spec.js:49:1 › AT-UC07-02 invalid contact formats are rejected until corrected (918ms)
  ✓  23 tests/e2e/uc07.acceptance.spec.js:70:1 › AT-UC07-03 save failures leave stored contact details unchanged (862ms)
  ✓  24 tests/e2e/uc07.acceptance.spec.js:95:1 › AT-UC07-04 cancelling an edit discards unsaved contact-information changes (857ms)
  ✓  25 tests/e2e/uc09.acceptance.spec.js:18:1 › AT-UC09-01 student financial dashboard loads after login with only permitted features (716ms)
  ✓  26 tests/e2e/uc09.acceptance.spec.js:37:1 › AT-UC09-02 students with no assigned modules see a minimal dashboard and admin-contact guidance (665ms)
  ✓  27 tests/e2e/uc09.acceptance.spec.js:47:1 › AT-UC09-03 financial dashboard faults show a partial view and recover after retry (804ms)

  27 passed (26.4s)
# Tests Results for Command "npm run lint"

> ece493group19-uc02-login@1.0.0 lint
> node scripts/lint.js

Lint checks passed for 98 files.
# Tests Results for Command "c8 src/node.js"
-----------------------------------|---------|----------|---------|---------|-----------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s     
-----------------------------------|---------|----------|---------|---------|-----------------------
All files                          |    8.16 |      100 |       0 |    8.16 |                       
 src                               |   24.81 |      100 |       0 |   24.81 |                       
  app.js                           |   24.81 |      100 |       0 |   24.81 | 32-131                
 src/controllers                   |    9.64 |      100 |       0 |    9.64 |                       
  auth-controller.js               |       5 |      100 |       0 |       5 | 7-158                 
  dashboard-controller.js          |   14.26 |      100 |       0 |   14.26 | ...02,104-106,108-685 
  dashboard-response.js            |   16.94 |      100 |       0 |   16.94 | ...,20-36,38-44,46-52 
  home-controller.js               |   42.85 |      100 |       0 |   42.85 | 5-12                  
  password-controller.js           |    2.02 |      100 |       0 |    2.02 | 5-295                 
  profile-controller.js            |     6.4 |      100 |       0 |     6.4 | ...37-39,41-43,45-326 
 src/controllers/validators        |    10.5 |      100 |       0 |    10.5 |                       
  dashboard-validator.js           |    4.54 |      100 |       0 |    4.54 | 1-42                  
  profile-validator.js             |   11.55 |      100 |       0 |   11.55 | ...50,152-159,161-237 
 src/middleware                    |   14.08 |      100 |       0 |   14.08 |                       
  require-auth.js                  |    10.9 |      100 |       0 |    10.9 | 3-7,9-15,17-53        
  session-middleware.js            |      25 |      100 |       0 |      25 | 3-14                  
 src/models                        |    3.76 |      100 |       0 |    3.76 |                       
  account-model.js                 |    1.58 |      100 |       0 |    1.58 | 1-124                 
  contact-info-model.js            |    2.23 |      100 |       0 |    2.23 | 1-16,18-132           
  course-model.js                  |   11.76 |      100 |       0 |   11.76 | 1-15                  
  dashboard-load-model.js          |    3.61 |      100 |       0 |    3.61 | 1-16,18-81            
  dashboard-section-model.js       |     7.4 |      100 |       0 |     7.4 | 1-25                  
  dashboard-section-state-model.js |    3.12 |      100 |       0 |    3.12 | 1-62                  
  login-attempt-model.js           |     3.7 |      100 |       0 |     3.7 | 1-52                  
  module-model.js                  |    6.25 |      100 |       0 |    6.25 | 1-30                  
  notification-model.js            |       4 |      100 |       0 |       4 | 1-48                  
  password-change-attempt-model.js |     3.5 |      100 |       0 |     3.5 | 1-55                  
  personal-details-model.js        |    2.72 |      100 |       0 |    2.72 | 1-15,17-108           
  reset-token-model.js             |   16.12 |      100 |       0 |   16.12 | 3-5,7-29              
  role-model.js                    |   10.52 |      100 |       0 |   10.52 | 1-17                  
  session-model.js                 |     2.1 |      100 |       0 |     2.1 | 1-93                  
  verification-cooldown-model.js   |    3.57 |      100 |       0 |    3.57 | 1-54                  
 src/routes                        |   22.54 |      100 |       0 |   22.54 |                       
  auth-routes.js                   |    22.5 |      100 |       0 |    22.5 | 8-38                  
  dashboard-routes.js              |      35 |      100 |       0 |      35 | 6-18                  
  profile-routes.js                |   16.66 |      100 |       0 |   16.66 | 6-40                  
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
