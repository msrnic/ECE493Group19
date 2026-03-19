# ECE493Group19 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-07

## Active Technologies

- JavaScript (Node.js 20 LTS for server; ES2022 browser JavaScript for client) + Express 4.x (controller routing), `sqlite3` (SQLite driver), `bcrypt` (password hashing), `express-session` (session management), `csurf` (form CSRF protection) (001-change-password)
- HTML5, CSS3, JavaScript (ES2022, Node.js 20 LTS runtime for server-side JS) + Express 4 (HTTP routing/controller layer), `express-session` (session management), `better-sqlite3` (SQLite access), bcrypt (password hash verification) (002-user-login)
- JavaScript (Node.js 20 LTS server, ES2022 browser JavaScript) + Express 4 (routing/controllers), better-sqlite3 (SQLite access), express-session (session handling), EJS or HTML template partials for server-rendered views (003-role-based-dashboard)
- HTML5, CSS3, JavaScript (ES2022) on Node.js 20 LTS + Express.js (routing/controllers), `better-sqlite3` (SQLite access), server-rendered templates + browser JavaScript for page behavior (004-display-dashboard-data)
- JavaScript (Node.js 20 LTS for server, ES2022 in browser) + Express 4 (controller/routing), better-sqlite3 (SQLite access), express-session (authenticated session), EJS or server-rendered HTML templates (005-update-personal-details)
- JavaScript (Node.js 20 LTS for server, modern browser JavaScript for client) + Express 4 (controller routing), EJS (server-rendered views), `better-sqlite3` (SQLite access), `express-session` (session auth context) (006-dashboard-data-view)
- JavaScript (ES2022), HTML5, CSS3 + Node.js runtime, Express.js web framework, `sqlite3` driver, server-side templating (EJS or equivalent) (007-update-contact-info)
- HTML5, CSS3, JavaScript (ES2022) + Node.js runtime for tooling, Express.js web server, `sqlite3` driver, server-side template rendering (EJS) (008-dashboard-data-display)
- SQLite for account information, course information, timetable records, generated schedule records, and conflict-analysis inputs/results metadata (024-branch-conflict-warnings)
- SQLite for account information, course information, selected schedule options, section enrollment records, and enrollment-eligibility inputs (025-branch-enroll-all)
- SQLite for account information, course information, and term-scoped student scheduling constraints (026-branch-scheduling-constraints)
- SQLite for account information, course information, saved scheduling constraints, and term-scoped constraint priority settings (027-branch-constraint-priorities)
- SQLite for account information, course information, scheduling constraints, and named constraint-set records (028-save-constraint-sets)
- SQLite for account information, course information, section offerings, compatibility linkage metadata, and generated schedule records (029-compatible-components)
- HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript (019-branch-built-in-inbox)
Auto-generated from all feature plans. Last updated: 2026-03-13
- SQLite (feature-specific tables plus audit rows as needed) (030-regenerate-full-schedule)
- HTML5, CSS3, JavaScript (ES2021) + Existing MVC web app modules, SQLite data access layer (036-grade-submission-summary)
- JavaScript (Node.js 20 LTS for server, ES2022 browser JavaScript for client) + Express.js (controller routing), EJS (server-rendered HTML views), better-sqlite3 (SQLite access), express-session (admin session auth), Playwright + Node test runner (acceptance/integration) (037-force-enroll-override)
- JavaScript (Node.js 20 LTS backend, ES2022 browser JavaScript frontend) + Express 4 (routing/controllers), `sqlite3` (SQLite access), vanilla HTML/CSS/JavaScript views (038-force-withdrawal)
- HTML5, CSS3, JavaScript (ES2023) on Node.js 20 LTS + Express 4 (HTTP + routing), `better-sqlite3` (SQLite access), `express-validator` (request validation) (039-manage-course-offerings)
- JavaScript (Node.js 20 LTS for server/controllers/models, ES2022 browser JavaScript for views) + Express 4 (routing/controllers), better-sqlite3 (SQLite access), EJS (server-rendered HTML views), express-validator (input validation), dotenv (config) (040-update-course-capacity)
- JavaScript (Node.js 20 LTS for server, ES2022 in browser) + Express 4 (HTTP + controllers), EJS (HTML views), `sqlite3` driver, `express-validator` for request validation (041-class-enrollment)

## Project Structure

```text
src/
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (Node.js 20 LTS for server; ES2022 browser JavaScript for client): Follow standard conventions

## Recent Changes

- 001-change-password: Added JavaScript (Node.js 20 LTS for server; ES2022 browser JavaScript for client) + Express 4.x (controller routing), `sqlite3` (SQLite driver), `bcrypt` (password hashing), `express-session` (session management), `csurf` (form CSRF protection)
HTML5, CSS3, JavaScript (ES2022, Node.js 20 LTS runtime for server-side JS): Follow standard conventions
- 002-user-login: Added HTML5, CSS3, JavaScript (ES2022, Node.js 20 LTS runtime for server-side JS) + Express 4 (HTTP routing/controller layer), `express-session` (session management), `better-sqlite3` (SQLite access), bcrypt (password hash verification)
- 003-role-based-dashboard: Added JavaScript (Node.js 20 LTS server, ES2022 browser JavaScript) + Express 4 (routing/controllers), better-sqlite3 (SQLite access), express-session (session handling), EJS or HTML template partials for server-rendered views
- 004-display-dashboard-data: Added HTML5, CSS3, JavaScript (ES2022) on Node.js 20 LTS + Express.js (routing/controllers), `better-sqlite3` (SQLite access), server-rendered templates + browser JavaScript for page behavior
- 005-update-personal-details: Added JavaScript (Node.js 20 LTS for server, ES2022 in browser) + Express 4 (controller/routing), better-sqlite3 (SQLite access), express-session (authenticated session), EJS or server-rendered HTML templates
- 006-dashboard-data-view: Added JavaScript (Node.js 20 LTS for server, modern browser JavaScript for client) + Express 4 (controller routing), EJS (server-rendered views), `better-sqlite3` (SQLite access), `express-session` (session auth context)
- 007-update-contact-info: Added JavaScript (ES2022), HTML5, CSS3 + Node.js runtime, Express.js web framework, `sqlite3` driver, server-side templating (EJS or equivalent)
- 008-dashboard-data-display: Added HTML5, CSS3, JavaScript (ES2022) + Node.js runtime for tooling, Express.js web server, `sqlite3` driver, server-side template rendering (EJS)
HTML5, CSS3, JavaScript (ES2022, Node.js 20 LTS runtime): Follow standard conventions
- 009-view-financial-dashboard: Added HTML5, CSS3, JavaScript (ES2022, Node.js 20 LTS runtime) + Express.js (controller routing), SQLite driver
- 010-transaction-history: Added HTML5, CSS3, JavaScript (ES6+) + Browser Web APIs, Node.js tooling for lint/test execution
- 011-store-banking-information: Added HTML5, CSS3, JavaScript (ES2020+) + Existing project MVC modules, SQLite driver used by projec
- 016-drop-priority-withdrawal: Added HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript
- 018-branch-class-waitlist: Added HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript
- 017-branch-class-enrollment: Added HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript
- 020-branch-course-history: Added HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript
- 019-branch-built-in-inbox: Added HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript
- 029-compatible-components: Added HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript
- 028-save-constraint-sets: Added HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript
- 027-branch-constraint-priorities: Added HTML5, CSS3, JavaScript (ES2023) + Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript
- 036-grade-submission-summary: Added HTML5, CSS3, JavaScript (ES2021) + Existing MVC web app modules, SQLite data access layer
- 035-update-grades-deadline: Added HTML5, CSS3, JavaScript (ES2021) + Existing MVC web app modules, SQLite data access layer
- 034-enter-final-grades: Added HTML5, CSS3, JavaScript (ES2021) + Existing MVC web app modules, SQLite data access layer
- 037-force-enroll-override: Added JavaScript (Node.js 20 LTS for server, ES2022 browser JavaScript for client) + Express.js (controller routing), EJS (server-rendered HTML views), better-sqlite3 (SQLite access), express-session (admin session auth), Playwright + Node test runner (acceptance/integration)
- 038-force-withdrawal: Added JavaScript (Node.js 20 LTS backend, ES2022 browser JavaScript frontend) + Express 4 (routing/controllers), `sqlite3` (SQLite access), vanilla HTML/CSS/JavaScript views
- 039-manage-course-offerings: Added HTML5, CSS3, JavaScript (ES2023) on Node.js 20 LTS + Express 4 (HTTP + routing), `better-sqlite3` (SQLite access), `express-validator` (request validation)
- 040-update-course-capacity: Added JavaScript (Node.js 20 LTS for server/controllers/models, ES2022 browser JavaScript for views) + Express 4 (routing/controllers), better-sqlite3 (SQLite access), EJS (server-rendered HTML views), express-validator (input validation), dotenv (config)
- 041-class-enrollment: Added JavaScript (Node.js 20 LTS for server, ES2022 in browser) + Express 4 (HTTP + controllers), EJS (HTML views), `sqlite3` driver, `express-validator` for request validation

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
