
# Tests Results for Command "npm run test"

> ece493group19-uc02-login@1.0.0 test
> npm run test:coverage && npm run test:acceptance


> ece493group19-uc02-login@1.0.0 test:coverage
> node --test --experimental-test-coverage --test-coverage-include=src/**/*.js --test-coverage-exclude=src/views/*.js --test-coverage-branches=100 --test-coverage-functions=100 --test-coverage-lines=100 tests/unit/*.test.js tests/integration/*.test.js

✔ GET /dashboard redirects unauthenticated users to /login (225.534456ms)
✔ GET /dashboard renders authenticated account data and permitted functions (264.867547ms)
✔ POST /login returns 403 for disabled accounts and does not create a session (255.119957ms)
✔ POST /login returns 400 when required fields are missing (242.731134ms)
✔ POST /login returns 401 for invalid credentials and allows retry success (309.511116ms)
✔ POST /login returns 401 for unknown accounts without creating a session (179.433693ms)
✔ POST /login returns 423 for pre-locked accounts with valid credentials (266.634735ms)
✔ repeated invalid credentials trigger a temporary lock and later recover after expiry (661.612579ms)
✔ valid logins satisfy the SC-001 benchmark threshold (1434.831192ms)
✔ POST /login returns 503 when the authentication service is unavailable (255.422558ms)
✔ GET /login renders for unauthenticated users and redirects authenticated users (321.960193ms)
✔ POST /login succeeds, creates a session cookie, and records audit rows (202.907879ms)
✔ createApp throws without a database and uses default now/session settings when provided a db (77.468364ms)
✔ migration entrypoints apply schema and seed fixtures from the command line (305.058538ms)
✔ auth controller forwards session save failures to next (0.970416ms)
✔ dashboard controller renders fallback text when there are no courses or session metadata (1.407929ms)
✔ session middleware supports both default and explicit secrets (0.333575ms)
✔ auth audit service records both failure and success outcomes (2.079697ms)
✔ auth service handles omitted unavailableIdentifiers configuration (56.594737ms)
✔ connection helpers reuse cached connections and respect DB_PATH defaults (12.865679ms)
✔ account, attempt, session, and audit helpers cover null and optional-field branches (181.491469ms)
✔ lockout service resets stale failure windows and computes the next count (1.530823ms)
✔ lockout service detects active locks, expired locks, and false-path evaluations (0.330629ms)
✔ lockout service supports default time evaluation paths (0.240688ms)
✔ models provide account, course, attempt, and session operations (205.938248ms)
✔ renderHtml escapes values and leaves html fragments for course lists (0.578906ms)
ℹ tests 26
ℹ suites 0
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1838.519285
ℹ start of coverage report
ℹ ---------------------------------------------------------------------------
ℹ file                       | line % | branch % | funcs % | uncovered lines
ℹ ---------------------------------------------------------------------------
ℹ src                        |        |          |         | 
ℹ  app.js                    | 100.00 |   100.00 |  100.00 | 
ℹ  controllers               |        |          |         | 
ℹ   auth-controller.js       | 100.00 |   100.00 |  100.00 | 
ℹ   dashboard-controller.js  | 100.00 |   100.00 |  100.00 | 
ℹ  db                        |        |          |         | 
ℹ   connection.js            | 100.00 |   100.00 |  100.00 | 
ℹ   migrations               |        |          |         | 
ℹ    apply-schema.js         | 100.00 |   100.00 |  100.00 | 
ℹ    seed-login-fixtures.js  | 100.00 |   100.00 |  100.00 | 
ℹ  middleware                |        |          |         | 
ℹ   require-auth.js          | 100.00 |   100.00 |  100.00 | 
ℹ   session-middleware.js    | 100.00 |   100.00 |  100.00 | 
ℹ  models                    |        |          |         | 
ℹ   account-model.js         | 100.00 |   100.00 |  100.00 | 
ℹ   course-model.js          | 100.00 |   100.00 |  100.00 | 
ℹ   login-attempt-model.js   | 100.00 |   100.00 |  100.00 | 
ℹ   session-model.js         | 100.00 |   100.00 |  100.00 | 
ℹ  routes                    |        |          |         | 
ℹ   auth-routes.js           | 100.00 |   100.00 |  100.00 | 
ℹ  services                  |        |          |         | 
ℹ   auth-audit-service.js    | 100.00 |   100.00 |  100.00 | 
ℹ   auth-service.js          | 100.00 |   100.00 |  100.00 | 
ℹ   lockout-service.js       | 100.00 |   100.00 |  100.00 | 
ℹ   login-outcomes.js        | 100.00 |   100.00 |  100.00 | 
ℹ ---------------------------------------------------------------------------
ℹ all files                  | 100.00 |   100.00 |  100.00 | 
ℹ ---------------------------------------------------------------------------
ℹ end of coverage report

> ece493group19-uc02-login@1.0.0 test:acceptance
> node scripts/run-playwright.js


Running 5 tests using 1 worker

  ✓  1 tests/e2e/uc02.acceptance.spec.js:3:1 › AT-UC02-01 successful login routes to the dashboard (288ms)
  ✓  2 tests/e2e/uc02.acceptance.spec.js:13:1 › AT-UC02-02 invalid credentials show an error and retry succeeds (354ms)
  ✓  3 tests/e2e/uc02.acceptance.spec.js:27:1 › AT-UC02-03 repeated failures lock the account temporarily (929ms)
  ✓  4 tests/e2e/uc02.acceptance.spec.js:44:1 › AT-UC02-04 locked and disabled accounts are denied with guidance (273ms)
  ✓  5 tests/e2e/uc02.acceptance.spec.js:58:1 › AT-UC02-05 authentication service outage denies login and shows guidance (142ms)

  5 passed (3.5s)
# Tests Results for Command "npm run lint"

> ece493group19-uc02-login@1.0.0 lint
> node scripts/lint.js

Lint checks passed for 38 files.
# Tests Results for Command "c8 src/node.js"
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   11.04 |      100 |       0 |   11.04 |                   
 src                      |   24.19 |      100 |       0 |   24.19 |                   
  app.js                  |   24.19 |      100 |       0 |   24.19 | 14-60             
 src/controllers          |    9.21 |      100 |       0 |    9.21 |                   
  auth-controller.js      |    6.36 |      100 |       0 |    6.36 | 6-108             
  dashboard-controller.js |   19.35 |      100 |       0 |   19.35 | 5-29              
 src/middleware           |   22.22 |      100 |       0 |   22.22 |                   
  require-auth.js         |   18.18 |      100 |       0 |   18.18 | 1-9               
  session-middleware.js   |      25 |      100 |       0 |      25 | 3-14              
 src/models               |    4.08 |      100 |       0 |    4.08 |                   
  account-model.js        |    2.35 |      100 |       0 |    2.35 | 1-83              
  course-model.js         |   11.76 |      100 |       0 |   11.76 | 1-15              
  login-attempt-model.js  |     3.7 |      100 |       0 |     3.7 | 1-52              
  session-model.js        |       5 |      100 |       0 |       5 | 1-38              
 src/routes               |      40 |      100 |       0 |      40 |                   
  auth-routes.js          |      40 |      100 |       0 |      40 | 7-18              
 src/services             |    9.58 |      100 |       0 |    9.58 |                   
  auth-audit-service.js   |   15.38 |      100 |       0 |   15.38 | 3-24              
  auth-service.js         |     6.4 |      100 |       0 |     6.4 | 7-123             
  lockout-service.js      |    3.27 |      100 |       0 |    3.27 | 1-59              
  login-outcomes.js       |     100 |      100 |     100 |     100 |                   
 src/views                |   21.73 |      100 |       0 |   21.73 |                   
  render.js               |   21.73 |      100 |       0 |   21.73 | 3-10,12-21        
--------------------------|---------|----------|---------|---------|-------------------
