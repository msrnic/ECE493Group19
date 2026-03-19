# Implementation Plan: Update Personal Details

**Branch**: `005-update-personal-details` | **Date**: 2026-03-07 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/005-update-personal-details/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/005-update-personal-details/spec.md)
**Input**: Feature specification from `/specs/005-update-personal-details/spec.md`

## Summary

Implement UC-05 personal-details editing in an MVC web application using HTML/CSS/JavaScript with SQLite persistence. The feature provides authenticated users read/update access to their own editable profile fields, strict validation with field-level errors, confirmation for unsaved navigation, atomic save failure handling, and last-write-wins behavior for near-concurrent updates.

## Technical Context

**Language/Version**: JavaScript (Node.js 20 LTS for server, ES2022 in browser)  
**Primary Dependencies**: Express 4 (controller/routing), better-sqlite3 (SQLite access), express-session (authenticated session), EJS or server-rendered HTML templates  
**Storage**: SQLite 3 database (`backend/data/app.db`)  
**Testing**: Node test runner + supertest for HTTP/controller tests; browser flow checks for form validation and unsaved-change prompt  
**Target Platform**: Linux-hosted web app, modern desktop/mobile browsers  
**Project Type**: Web application (frontend + backend MVC)  
**Performance Goals**: p95 read/update response <= 3s (aligns with SC-002)  
**Constraints**: HTML/CSS/JS only, SQLite only, MVC separation, no credential-edit scope, no edits to protected UC/AS files without explicit approval  
**Scale/Scope**: Single feature for authenticated users editing their own personal details; supports concurrent submissions with last-write-wins

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.  
  `UC-05` mapped to `UC-05-AS`; feature spec mirrors the same main flow and extensions.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.  
  Stack fixed to browser HTML/CSS/JS + Node.js JavaScript + SQLite.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.  
  MVC boundary defined below; SQLite tables include `accounts` and `courses` as required data boundaries.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.  
  No protected-file edits planned.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.  
  Include style checks during implementation tasks and review.

### Post-Phase 1 Re-Check

- [x] Pass. `research.md`, `data-model.md`, `contracts/personal-details-api.yaml`, and `quickstart.md` maintain stack/MVC/traceability constraints and keep protected files untouched.

## Project Structure

### Documentation (this feature)

```text
specs/005-update-personal-details/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── personal-details-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── account-model.js
│   │   ├── course-model.js
│   │   └── personal-details-model.js
│   ├── controllers/
│   │   └── personal-details-controller.js
│   ├── views/
│   │   └── personal-details.html
│   ├── routes/
│   │   └── personal-details-routes.js
│   └── app.js
├── data/
│   └── app.db
└── tests/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── css/
│   │   └── personal-details.css
│   └── js/
│       └── personal-details.js
└── tests/
```

**Structure Decision**: Use web-application structure with explicit MVC backend modules and static frontend assets; this keeps controller/model logic server-side and client behavior limited to view interaction and validation UX.

## Complexity Tracking

No constitution violations requiring justification.
