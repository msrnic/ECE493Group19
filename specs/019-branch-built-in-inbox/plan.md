# Implementation Plan: UC-19 Receive Notifications in a Built-in Inbox

**Branch**: `[019-branch-built-in-inbox]` | **Date**: 2026-03-10 | **Spec**: [spec.md](/home/thaia/ECE493Group19/specs/019-branch-built-in-inbox/spec.md)
**Input**: Feature specification from `/specs/019-branch-built-in-inbox/spec.md`

## Summary

Implement the UC-19 built-in inbox notification flow as an MVC web feature that creates inbox notifications for relevant academic events, delivers them to eligible students, retries failed delivery for up to 24 hours, preserves notifications during restricted inbox access, and supports later viewing once access returns. The design uses HTML/CSS/JavaScript with SQLite-backed student, notification, delivery-attempt, and inbox-access data plus a UI contract for delivered, stored, and retry-related notification outcomes.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: Browser DOM APIs, Node.js-compatible JavaScript runtime, SQLite driver for JavaScript  
**Storage**: SQLite  
**Testing**: Browser-based acceptance validation, JavaScript unit tests for notification delivery logic, integration tests for SQLite-backed inbox notification flows  
**Target Platform**: Web application running in modern desktop browsers  
**Project Type**: MVC web application  
**Performance Goals**: Make at least 95% of generated inbox notifications available within 1 minute of the triggering event and support at least 500 concurrently signed-in users viewing notifications  
**Constraints**: HTML/CSS/JavaScript and SQLite only; preserve MVC boundaries; do not modify protected use case or acceptance-test artifacts; maintain Google HTML/CSS and JavaScript style-guide compliance; scope ends at inbox delivery, retry handling, storage for later viewing, and student viewing inside the built-in inbox  
**Scale/Scope**: Single university deployment supporting roughly 5,000 active students, 500 concurrent signed-in users, and daily notification traffic for course, grade, and academic standing events

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] All feature scope maps to one or more `Use Cases/UC-XX.md` files, with corresponding acceptance criteria in `Acceptance Tests/UC-XX-AS.md`.
  Evidence: Scope maps directly to [UC-19.md](/home/thaia/ECE493Group19/Use%20Cases/UC-19.md) and [UC-19-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-19-AS.md).
- [x] Technical approach uses HTML/CSS/JavaScript and SQLite only.
  Evidence: Technical context restricts implementation to HTML/CSS/JavaScript with SQLite persistence.
- [x] Design preserves Model-View-Controller boundaries and identifies where account and course data persist in SQLite.
  Evidence: Project structure and data model separate notification model, inbox views, and controller flow while relying on SQLite-backed student/account data and academic event data.
- [x] Plan does not modify `Use Cases/UC-*.md` or `Acceptance Tests/UC-*-AS.md` without explicit user authorization.
  Evidence: Plan outputs remain inside `/specs/019-branch-built-in-inbox/` plus agent-context sync.
- [x] Implementation approach includes style compliance with `Style Guides/google-style-guide-html-css.md` and `Style Guides/google-style-guide-javascript.md`.
  Evidence: Quickstart and final validation steps include review against both style guides.

Post-design re-check: PASS. Phase 1 artifacts preserve the constitution-mandated stack, MVC boundaries, protected-file handling, and style-guide enforcement.

## Project Structure

### Documentation (this feature)

```text
specs/019-branch-built-in-inbox/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── inbox-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── controllers/
│   └── inbox-notification-controller.js
├── models/
│   ├── student-model.js
│   ├── academic-event-model.js
│   ├── inbox-notification-model.js
│   ├── delivery-attempt-model.js
│   └── inbox-access-model.js
└── views/
    └── inbox/
        ├── inbox-list.html
        ├── inbox-notification.html
        └── inbox-status.html

public/
├── css/
│   └── inbox.css
└── js/
    └── inbox.js

database/
├── schema/
│   └── inbox-notifications.sql
└── seeds/
    └── uc19-fixtures.sql

tests/
├── unit/
│   ├── inbox-notification-model.test.js
│   └── inbox-notification-controller.test.js
├── integration/
│   └── inbox-notification-flow.test.js
└── acceptance/
    └── uc19-acceptance-checklist.md
```

**Structure Decision**: Use a single MVC web application layout rooted at `app/`, `public/`, `database/`, and `tests/`. This keeps built-in inbox notification rules, student-facing inbox views, and SQLite persistence aligned with the constitution while maintaining explicit model, view, and controller ownership for each file.

## Phase 0: Research

- Confirm the appropriate retry policy for failed inbox delivery attempts, including the effect of a 24-hour retry window.
- Confirm the correct handling of restricted inbox access so notifications are stored for later viewing without corrupting inbox state.
- Confirm a practical deduplication rule for exact repeated academic events for the same student.
- Confirm representative validation expectations for the 1-minute delivery target and 500 concurrent signed-in users.

## Phase 1: Design & Contracts

- Model notification events, inbox notifications, notification identity, delivery attempt records, and inbox access status.
- Define a UI contract for inbox list visibility, notification detail viewing, restricted-access status, and retry-related outcomes.
- Prepare quickstart validation steps for delivered notifications, retry after failure, restricted-access storage, style-guide review, and performance validation.

## Complexity Tracking

No constitution violations or exceptional complexity require justification for this feature.
