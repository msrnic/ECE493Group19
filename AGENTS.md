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
Auto-generated from all feature plans. Last updated: 2026-03-13

## Active Technologies

- HTML5, CSS3, JavaScript (ES2022, Node.js 20 LTS runtime) + Express.js (controller routing), SQLite driver (009-view-financial-dashboard)

## Project Structure

```text
src/
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

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
