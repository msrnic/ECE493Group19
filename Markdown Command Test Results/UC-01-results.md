# Tests Results for Command "npm run test"

> ece493group19-uc02-login@1.0.0 test
> npm run test:coverage && npm run test:acceptance


> ece493group19-uc02-login@1.0.0 test:coverage
> node --test --experimental-test-coverage --test-coverage-include=src/**/*.js --test-coverage-exclude=src/views/*.js --test-coverage-branches=100 --test-coverage-functions=100 --test-coverage-lines=100 tests/unit/*.test.js tests/integration/*.test.js

✔ admin can open the target form and change another user password without target verification fields (775.381475ms)
✔ admin endpoints reject unauthorized access and missing targets (528.887856ms)
✔ password change enforces cooldown messaging after repeated verification failures (786.958629ms)
✔ system failure rollback preserves the existing password (636.655223ms)
✔ reset-token password change succeeds and consumes the token (704.072946ms)
✔ reset-token flow rejects expired tokens and supports JSON responses (374.004656ms)
✔ self-service password change succeeds, preserves the current session, invalidates other sessions, and updates login credentials (919.687279ms)
✔ self-service password change persists after creating a new app against the same database (710.601108ms)
✔ self-service password change supports JSON responses and cancellation without persisting changes (426.79161ms)
✔ self-service password change rejects a new password that matches the current password (397.39582ms)
✔ GET /dashboard redirects unauthenticated users to /login (445.920888ms)
✔ GET /dashboard renders authenticated account data, security actions, and logout control (503.359978ms)
✔ POST /logout revokes the current session and redirects future dashboard requests to /login (436.953056ms)
✔ POST /login returns 403 for disabled accounts and does not create a session (477.328829ms)
✔ POST /login returns 400 when required fields are missing (450.071526ms)
✔ POST /login returns 401 for invalid credentials and allows retry success (551.902187ms)
✔ POST /login returns 401 for unknown accounts without creating a session (442.634612ms)
✔ POST /login returns 423 for pre-locked accounts with valid credentials (455.726864ms)
✔ repeated invalid credentials trigger a temporary lock and later recover after expiry (922.423812ms)
✔ valid logins satisfy the SC-001 benchmark threshold (1922.431378ms)
✔ POST /login returns 503 when the authentication service is unavailable (465.67148ms)
✔ GET / renders a title page with navigation to the login page (414.635428ms)
✔ GET /login renders demo reset guidance for unauthenticated users and redirects authenticated users (396.648939ms)
✔ POST /login succeeds, creates a session cookie, and records audit rows (279.259211ms)
✔ createApp throws without a database and uses default now/session settings when provided a db (137.025156ms)
✔ migration entrypoints apply schema and seed fixtures from the command line (492.366288ms)
✔ auth controller forwards session save failures to next (1.429ms)
✔ auth controller invalidates the current session and clears the cookie on logout (1.35532ms)
✔ auth controller forwards logout destroy failures to next (0.769254ms)
✔ dashboard controller renders fallback text when there are no courses or session metadata (0.616474ms)
✔ session middleware supports both default and explicit secrets (0.250036ms)
✔ auth audit service records both failure and success outcomes (1.593674ms)
✔ auth service handles omitted unavailableIdentifiers configuration (54.167932ms)
✔ connection helpers reuse cached connections and respect DB_PATH defaults (4.498186ms)
✔ account, attempt, session, and audit helpers cover null and optional-field branches (378.176301ms)
✔ cooldown service tracks escalation, active blocks, and clears state (1.734291ms)
✔ lockout service resets stale failure windows and computes the next count (1.450991ms)
✔ lockout service detects active locks, expired locks, and false-path evaluations (0.227112ms)
✔ lockout service supports default time evaluation paths (0.342131ms)
✔ models provide account, course, attempt, and session operations (344.008818ms)
✔ renderHtml escapes values and leaves html fragments for course lists (0.416553ms)
✔ password change service covers self-service error paths and success (545.915589ms)
✔ password change service covers reset-token flows including missing target account (200.256016ms)
✔ password change service covers admin authorization, policy, success, failure, and cancellation (393.970015ms)
✔ password change service preserves explicit request ids and covers non-self admin success (339.014463ms)
✔ password change service treats an omitted current password as a verification failure (191.959587ms)
✔ password change service defaults simulated failure identifiers when the option is omitted (0.374983ms)
✔ password controller covers JSON cooldown responses and HTML policy rendering branches (3.805478ms)
✔ password controller covers HTML self-service, admin rendering branches, and error forwarding (3.328024ms)
✔ password controller covers page render guards and JSON cancellation (1.015994ms)
✔ password controller accepts JSON via Accept header and handles admin policy fallback without a target record (0.556569ms)
✔ password controller covers success pages, form defaults, and plain html retry branches (2.726804ms)
✔ password controller covers non-admin actors and missing accept headers (0.37797ms)
✔ password controller covers missing admin password submissions (0.361638ms)
✔ password controller covers html cancellation, html cooldown recovery, and reset json/policy fallbacks (0.758143ms)
✔ dashboard controller renders admin reset links and escaped course content (1.463415ms)
✔ dashboard controller falls back to a default non-admin account when no dashboard record exists (0.361368ms)
✔ requireAuth redirects invalid sessions both with and without a destroy function (0.316261ms)
✔ createApp exposes the e2e reset route for both success and error paths (490.426155ms)
✔ password feature models cover list and null-return helper branches (219.110717ms)
✔ password feature models cover preserved-session invalidation and explicit attempt metadata (211.804888ms)
Error: reset failed
    at Object.resetFixtures (/home/m_srnic/ece493/group_project/ECE493Group19/tests/unit/password-feature-coverage.test.js:181:13)
    at /home/m_srnic/ece493/group_project/ECE493Group19/src/routes/auth-routes.js:32:24
    at Layer.handle [as handle_request] (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/layer.js:95:5)
    at next (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/route.js:149:13)
    at Route.dispatch (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/route.js:119:3)
    at Layer.handle [as handle_request] (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/layer.js:95:5)
    at /home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/index.js:346:12)
    at next (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/index.js:280:10)
    at Function.handle (/home/m_srnic/ece493/group_project/ECE493Group19/node_modules/express/lib/router/index.js:175:3)
✔ password policy validates compliant passwords and describes failures (2.731408ms)
✔ applySchema backfills missing columns for pre-feature databases (96.773876ms)
ℹ tests 63
ℹ suites 0
ℹ pass 63
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3300.405004
ℹ start of coverage report
ℹ ------------------------------------------------------------------------------------
ℹ file                                | line % | branch % | funcs % | uncovered lines
ℹ ------------------------------------------------------------------------------------
ℹ src                                 |        |          |         | 
ℹ  app.js                             | 100.00 |   100.00 |  100.00 | 
ℹ  controllers                        |        |          |         | 
ℹ   auth-controller.js                | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-controller.js           | 100.00 |   100.00 |  100.00 | 
ℹ   home-controller.js                | 100.00 |   100.00 |  100.00 | 
ℹ   password-controller.js            | 100.00 |   100.00 |  100.00 | 
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
ℹ   login-attempt-model.js            | 100.00 |   100.00 |  100.00 | 
ℹ   notification-model.js             | 100.00 |   100.00 |  100.00 | 
ℹ   password-change-attempt-model.js  | 100.00 |   100.00 |  100.00 | 
ℹ   reset-token-model.js              | 100.00 |   100.00 |  100.00 | 
ℹ   session-model.js                  | 100.00 |   100.00 |  100.00 | 
ℹ   verification-cooldown-model.js    | 100.00 |   100.00 |  100.00 | 
ℹ  routes                             |        |          |         | 
ℹ   auth-routes.js                    | 100.00 |   100.00 |  100.00 | 
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


Running 10 tests using 1 worker

  ✓   1 tests/e2e/uc01.acceptance.spec.js:10:1 › AT-UC01-01 logged-in users can navigate from the dashboard and change their password successfully (1.3s)
  ✓   2 tests/e2e/uc01.acceptance.spec.js:46:1 › AT-UC01-02 reset-token recovery accepts a valid token and rejects an expired token (504ms)
  ✓   3 tests/e2e/uc01.acceptance.spec.js:60:1 › AT-UC01-03 policy failures and cooldown feedback are shown without changing the password (1.2s)
  ✓   4 tests/e2e/uc01.acceptance.spec.js:82:1 › AT-UC01-04 admins can change another users password without target verification fields (802ms)
  ✓   5 tests/e2e/uc01.acceptance.spec.js:107:1 › AT-UC01-05 cancelling the flow discards unsaved inputs and makes no password changes (736ms)
  ✓   6 tests/e2e/uc02.acceptance.spec.js:9:1 › AT-UC02-01 successful login routes to the dashboard and logout returns to login (524ms)
  ✓   7 tests/e2e/uc02.acceptance.spec.js:26:1 › AT-UC02-02 invalid credentials show an error and retry succeeds (518ms)
  ✓   8 tests/e2e/uc02.acceptance.spec.js:40:1 › AT-UC02-03 repeated failures lock the account temporarily (1.1s)
  ✓   9 tests/e2e/uc02.acceptance.spec.js:57:1 › AT-UC02-04 locked and disabled accounts are denied with guidance (442ms)
  ✓  10 tests/e2e/uc02.acceptance.spec.js:71:1 › AT-UC02-05 authentication service outage denies login and shows guidance (322ms)

  10 passed (9.2s)
# Tests Results for Command "npm run lint"

> ece493group19-uc02-login@1.0.0 lint
> node scripts/lint.js

Lint checks passed for 61 files.
# Tests Results for Command "c8 src/node.js"
-----------------------------------|---------|----------|---------|---------|-------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------------------|---------|----------|---------|---------|-------------------
All files                          |    6.14 |      100 |       0 |    6.14 |                   
 src                               |   23.07 |      100 |       0 |   23.07 |                   
  app.js                           |   23.07 |      100 |       0 |   23.07 | 23-102            
 src/controllers                   |    4.99 |      100 |       0 |    4.99 |                   
  auth-controller.js               |    5.14 |      100 |       0 |    5.14 | 6-134             
  dashboard-controller.js          |   11.11 |      100 |       0 |   11.11 | 5-52              
  home-controller.js               |   42.85 |      100 |       0 |   42.85 | 5-12              
  password-controller.js           |    2.02 |      100 |       0 |    2.02 | 5-295             
 src/middleware                    |   13.63 |      100 |       0 |   13.63 |                   
  require-auth.js                  |    7.14 |      100 |       0 |    7.14 | 1-26              
  session-middleware.js            |      25 |      100 |       0 |      25 | 3-14              
 src/models                        |    3.99 |      100 |       0 |    3.99 |                   
  account-model.js                 |    1.72 |      100 |       0 |    1.72 | 1-114             
  course-model.js                  |   11.76 |      100 |       0 |   11.76 | 1-15              
  login-attempt-model.js           |     3.7 |      100 |       0 |     3.7 | 1-52              
  notification-model.js            |       4 |      100 |       0 |       4 | 1-48              
  password-change-attempt-model.js |     3.5 |      100 |       0 |     3.5 | 1-55              
  reset-token-model.js             |   16.12 |      100 |       0 |   16.12 | 3-5,7-29          
  session-model.js                 |     2.1 |      100 |       0 |     2.1 | 1-93              
  verification-cooldown-model.js   |    3.57 |      100 |       0 |    3.57 | 1-54              
 src/routes                        |   23.25 |      100 |       0 |   23.25 |                   
  auth-routes.js                   |   23.25 |      100 |       0 |   23.25 | 9-41              
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
 src/views                         |   20.83 |      100 |       0 |   20.83 |                   
  render.js                        |   20.83 |      100 |       0 |   20.83 | 3-10,12-22        
-----------------------------------|---------|----------|---------|---------|-------------------
