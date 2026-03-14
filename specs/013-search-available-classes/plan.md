# Implementation Plan: Search for Available Classes (UC-13)

**Branch**: `013-search-available-classes` | **Date**: 2026-03-14 | **Spec**:
[/Users/ahsanmansoor/ECE493Group19/specs/013-search-available-classes/spec.md](/Users/ahsanmansoor/ECE493Group19/specs/013-search-available-classes/spec.md)
**Input**: Feature specification from
`/specs/013-search-available-classes/spec.md`

## Summary

Implement UC-13 to let students search for available classes, refine search by
term/subject/course number, and view reliable availability details. The solution
adds MVC-aligned search model/controller/view paths, deterministic result
ordering, freshness handling for seat availability, and safe failure handling
for catalog service outages.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2021)  
**Primary Dependencies**: Node.js runtime, SQLite driver, Course Catalog Service
client wrapper  
**Storage**: SQLite cache/snapshot tables for class offering metadata and
availability timestamps  
**Testing**: Manual acceptance execution from `Acceptance Tests/UC-13-AS.md`,
unit tests for query/ordering logic, integration tests for catalog error paths  
**Target Platform**: Browser-based student portal + server runtime on Linux/macOS  
**Project Type**: Web application (MVC)  
**Performance Goals**: Results returned for healthy queries in <=2 seconds for
normal class-search loads; student can locate a target class in under 90 seconds  
**Constraints**: Must keep state read-only for searches; no protected file
edits; maintain availability freshness timestamp and stale labeling rules  
**Scale/Scope**: Current registration search use case for student portal, one
feature increment mapped to UC-13 and UC-13-AS

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

## Project Structure

### Documentation (this feature)

```text
specs/013-search-available-classes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── controllers/
│   └── class-search-controller.js
├── models/
│   ├── class-offering-model.js
│   └── catalog-snapshot-model.js
├── services/
│   └── class-search-service.js
├── routes/
│   └── class-search-routes.js
└── views/
    └── class-search/
        ├── index.html
        └── class-detail.html

public/
├── css/
│   └── class-search.css
└── js/
    └── class-search.js

tests/
├── integration/
│   └── class-search.integration.test.js
└── unit/
    ├── class-search-service.test.js
    └── class-search-controller.test.js
```

**Structure Decision**: Single MVC web application structure under `src/` with
SQLite-backed class availability snapshot data and controller-mediated Course
Catalog Service interactions.

## Complexity Tracking

No constitution violations identified; complexity exceptions are not required.
