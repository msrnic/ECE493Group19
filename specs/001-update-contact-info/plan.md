# Implementation Plan: Contact Information Update

**Branch**: `001-update-contact-info` | **Date**: 2026-03-07 | **Spec**: [/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-update-contact-info/spec.md](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-update-contact-info/spec.md)
**Input**: Feature specification from `/specs/001-update-contact-info/spec.md`

## Summary

Implement UC-07 contact editing in a web MVC flow where authenticated users update their own basic and emergency contact data. The implementation uses HTML/CSS/JavaScript for UI and controller logic, SQLite-backed models for persistence, all-or-nothing update transactions, field-level validation feedback, and explicit last-write-wins conflict notices.

## Technical Context

**Language/Version**: JavaScript (ES2022), HTML5, CSS3  
**Primary Dependencies**: Node.js runtime, Express.js web framework, `sqlite3` driver, server-rendered HTML template views (`app/views/contact-info.html`)  
**Storage**: SQLite (persistent tables for accounts, courses, and contact information)  
**Testing**: Manual acceptance verification against `Acceptance Tests/UC-07-AS.md` + JavaScript unit/integration tests (Node test runner/Jest)  
**Target Platform**: Linux-hosted web application, modern desktop/mobile browsers  
**Project Type**: Web application (server-rendered MVC)  
**Performance Goals**: Contact read in <= 500ms p95 and successful save in <= 800ms p95 under normal load  
**Constraints**: Must use HTML/CSS/JavaScript + SQLite only, preserve MVC boundaries, reject partial saves on validation/persistence failure, enforce own-account-only updates  
**Scale/Scope**: Single feature for authenticated self-service updates; scoped to one contact page and related model/controller paths

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with
      corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
- [x] Design preserves Model-View-Controller boundaries and identifies where
      account and course data persist in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or
      `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
- [x] Implementation approach includes style compliance with
      `Style Guides/google-style-guide-html-css.md` and
      `Style Guides/google-style-guide-javascript.md`.

Pre-Phase-0 evidence:
- Scope traceability target: `Use Cases/UC-07.md` and `Acceptance Tests/UC-07-AS.md`.
- Stack constraint enforced in this plan and in generated contracts/quickstart.
- Protected artifacts remain unchanged in this planning work.

## Project Structure

### Documentation (this feature)

```text
specs/001-update-contact-info/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── contact-info-api.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── controllers/
│   └── contactController.js
├── models/
│   ├── accountModel.js
│   ├── courseModel.js
│   └── contactInfoModel.js
├── views/
│   └── contact-info.html
├── public/
│   ├── css/
│   │   └── contact-info.css
│   └── js/
│       └── contact-info.js
├── routes/
│   └── contactRoutes.js
└── db/
    ├── schema.sql
    └── migrations/

tests/
├── unit/
│   ├── models/
│   └── controllers/
└── integration/
    └── contact-info-flow.test.js
```

**Structure Decision**: Use a single web-application MVC structure under `app/` with explicit model, view, and controller ownership. SQLite schema/migrations live under `app/db/`, including persistent `accounts` and `courses` tables plus contact-related tables required by this feature.

## Phase 0: Outline & Research

Research tasks derived from technical context:
1. Confirm robust email/phone/address validation strategy for server-side enforcement and field-level feedback.
2. Confirm SQLite transaction pattern to guarantee all-or-nothing updates across basic + emergency contact fields.
3. Confirm last-write-wins conflict handling approach that still provides user notification after save.
4. Confirm MVC placement for validation and normalization logic to keep view/controller/model responsibilities clean.

Phase 0 output:
- [`research.md`](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-update-contact-info/research.md)

## Phase 1: Design & Contracts

Planned design artifacts:
1. Data model with entities/fields/relationships for account, course, contact profile, emergency contact, and update audit metadata.
2. Interface contracts for contact-info read/update endpoints and validation/error responses.
3. Quickstart for local implementation/testing workflow aligned to UC-07 acceptance scenarios.
4. Agent context refresh via `.specify/scripts/bash/update-agent-context.sh codex`.

Performance verification approach:
- Measure p95 latency for `GET /contact-info` and `POST /contact-info` using seeded local data and integration timing instrumentation.
- Record measured evidence and pass/fail against goals (`<= 500ms` read, `<= 800ms` save) in `specs/001-update-contact-info/quickstart.md`.

Phase 1 output:
- [`data-model.md`](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-update-contact-info/data-model.md)
- [`contracts/contact-info-api.md`](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-update-contact-info/contracts/contact-info-api.md)
- [`quickstart.md`](/home/m_srnic/ece493/group_project/ECE493Group19/specs/001-update-contact-info/quickstart.md)

## Post-Design Constitution Check

- [x] Scope remains mapped to `UC-07` + `UC-07-AS` and generated artifacts preserve traceability.
- [x] Design and contracts stay within HTML/CSS/JavaScript + SQLite constraints.
- [x] MVC responsibilities are explicit: models (`app/models`), views (`app/views` + `app/public`), controllers/routes (`app/controllers`, `app/routes`).
- [x] Persistent SQLite coverage explicitly includes `accounts` and `courses` boundaries plus contact tables.
- [x] Style-guide conformance is included in quickstart verification steps for HTML/CSS and JavaScript.

## Complexity Tracking

No constitution violations requiring exceptions.
