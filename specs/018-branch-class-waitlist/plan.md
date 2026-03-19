# Implementation Plan: UC-18 Join Class Waitlists

**Branch**: `[018-branch-class-waitlist]` | **Date**: 2026-03-10 | **Spec**: [spec.md](/home/thaia/ECE493Group19/specs/018-branch-class-waitlist/spec.md)
**Input**: Feature specification from `/specs/018-branch-class-waitlist/spec.md`

## Summary

Implement the UC-18 waitlist-join flow as an MVC web feature that lets students join waitlists for full, waitlist-enabled sections, blocks ineligible or duplicate requests with clear guidance, preserves registration state when waitlist recording fails, and persists audit records for successful, blocked, and failed waitlist attempts. The design uses HTML/CSS/JavaScript with SQLite-backed student, section, enrollment, waitlist, waitlist-audit, and registration-term data plus a UI contract for waitlist success, blocked, and failure results.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript  
**Storage**: SQLite  
**Testing**: Browser-based acceptance validation, JavaScript unit tests for waitlist eligibility logic, integration tests for SQLite-backed waitlist flows  
**Target Platform**: Web application running in modern desktop browsers  
**Project Type**: MVC web application  
**Performance Goals**: Return a waitlist success or blocked result within 1 second for at least 95% of waitlist attempts under up to 20 concurrent requests  
**Constraints**: HTML/CSS/JavaScript and SQLite only; preserve MVC boundaries; do not modify protected use case or acceptance-test artifacts; maintain Google HTML/CSS and JavaScript style-guide compliance; scope ends at creating or rejecting the waitlist join request  
**Scale/Scope**: Single university deployment supporting roughly 5,000 active students, 500 concurrent signed-in users, and up to 20 concurrent waitlist attempts during peak registration periods

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
  Evidence: Scope maps directly to [UC-18.md](/home/thaia/ECE493Group19/Use%20Cases/UC-18.md) and [UC-18-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-18-AS.md).
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
  Evidence: Technical context and research restrict implementation to HTML/CSS/JavaScript with SQLite persistence.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
  Evidence: Project structure, data model, and contract separate model, view, and controller responsibilities and store student, section, enrollment, waitlist, and audit data in SQLite.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
  Evidence: Plan outputs remain inside `/specs/018-branch-class-waitlist/` plus agent-context sync.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.
  Evidence: Quickstart and final validation tasks will require review against both style guides.

Post-design re-check: PASS. Phase 1 artifacts preserve the constitution-mandated stack, MVC boundaries, protected-file handling, and style-guide enforcement.

## Project Structure

### Documentation (this feature)

```text
specs/018-branch-class-waitlist/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── waitlist-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── controllers/
│   └── waitlist-controller.js
├── models/
│   ├── student-model.js
│   ├── class-section-model.js
│   ├── enrollment-model.js
│   ├── waitlist-model.js
│   ├── registration-term-model.js
│   └── waitlist-eligibility-model.js
└── views/
    └── waitlist/
        ├── waitlist-form.html
        ├── waitlist-result.html
        └── waitlist-error.html

public/
├── css/
│   └── waitlist.css
└── js/
    └── waitlist.js

database/
├── schema/
│   └── waitlist.sql
└── seeds/
    └── uc18-fixtures.sql

tests/
├── unit/
│   ├── waitlist-eligibility-model.test.js
│   └── waitlist-controller.test.js
├── integration/
│   └── waitlist-flow.test.js
└── acceptance/
    └── uc18-acceptance-checklist.md
```

**Structure Decision**: Use a single MVC web application layout rooted at `app/`, `public/`, `database/`, and `tests/`. This keeps waitlist rules, student-facing views, SQLite persistence, and waitlist audit records aligned with the constitution while maintaining explicit model, view, and controller ownership for each file.

## Phase 0: Research

- Confirm how to model waitlist-enabled versus not-waitlist-eligible sections using existing section availability data.
- Confirm duplicate-status handling when a student is already enrolled or already waitlisted for the same section.
- Confirm failure-handling expectations when waitlist recording or waitlist-position assignment cannot complete atomically.
- Confirm representative validation approach for the 1-second response target under up to 20 concurrent waitlist attempts.

## Phase 1: Design & Contracts

- Model student, class section, waitlist request, waitlist entry, waitlist audit record, registration-term access, and waitlist eligibility result.
- Define a UI contract for waitlist join initiation, success confirmation, blocked outcomes, and failure outcomes.
- Prepare quickstart validation steps for success, waitlist-unavailable blocking, duplicate/ineligible blocking, and rollback behavior.

## Complexity Tracking

No constitution violations or exceptional complexity require justification for this feature.
