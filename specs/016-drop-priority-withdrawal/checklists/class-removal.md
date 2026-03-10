# Class Removal Checklist: UC-16 Requirements Quality

**Purpose**: Validate the clarity, completeness, consistency, and measurability of the UC-16 class-removal requirements before implementation and review
**Created**: 2026-03-09
**Feature**: [spec.md](/home/thaia/ECE493Group19/specs/016-drop-priority-withdrawal/spec.md)

## Requirement Completeness

- [x] CHK001 Are requirements defined for all three policy outcomes: drop, withdrawal, and blocked removal? [Completeness, Spec §User Stories 1-4, Spec §FR-001-FR-011]
- [x] CHK002 Are fee-outcome requirements specified for both successful removals and no-change failure cases? [Completeness, Spec §FR-007, Spec §FR-011, Spec §Success Criteria]
- [x] CHK003 Does the spec define the minimum deadline information that must be shown to students before confirmation? [Gap, Spec §User Story 1, Spec §Edge Cases]
- [x] CHK004 Are ineligible-removal requirements documented for all non-removable enrollment states, not only "not enrolled"? [Gap, Spec §Edge Cases, Spec §Key Entities]

## Requirement Clarity

- [x] CHK005 Is "drop takes precedence over withdrawal" defined with enough precision to avoid conflicting interpretations when multiple policy rules apply? [Clarity, Spec §FR-005]
- [x] CHK006 Is the phrase "seek administrative assistance or retry later" specific enough to define when each instruction should be shown? [Ambiguity, Spec §FR-009, Spec §User Story 3]
- [x] CHK007 Are "resulting fee outcome" and "withdrawal outcome" defined with enough specificity for objective review of the written requirements? [Clarity, Spec §User Stories 1-2, Spec §FR-007]
- [x] CHK008 Is the scope of "applicable deadline and policy" clearly bounded to term-level rules only, or are class-level exceptions also required? [Ambiguity, Spec §FR-001, Spec §Assumptions]

## Requirement Consistency

- [x] CHK009 Do the exact-deadline rules stay consistent across user stories, edge cases, functional requirements, and the UI contract? [Consistency, Spec §Clarifications, Spec §Edge Cases, Spec §FR-004]
- [x] CHK010 Do the blocked-action requirements align between the spec and plan without introducing conflicting recovery expectations? [Consistency, Spec §FR-008-FR-011, Plan §Summary, Plan §Technical Context]
- [x] CHK011 Are the spec's assumptions about term-level deadline policy consistent with the data-model requirement that each term has at most one active policy? [Consistency, Spec §Assumptions, Data Model §Deadline Policy]

## Acceptance Criteria Quality

- [x] CHK012 Are success criteria measurable for user-visible outcomes, not only pass/fail acceptance execution? [Measurability, Spec §SC-001-SC-004]
- [x] CHK013 Does each functional requirement have an obvious acceptance-scenario mapping in the written spec or linked acceptance tests? [Traceability, Spec §FR-001-FR-012, Spec §User Scenarios & Testing]
- [x] CHK014 Is the one-second performance goal reflected in user-facing requirements or intentionally deferred out of scope? [Gap, Plan §Technical Context, Spec §Success Criteria]

## Scenario Coverage

- [x] CHK015 Are alternate and exception-flow requirements complete for policy lookup failure, update failure, and exact-deadline submission? [Coverage, Spec §User Stories 3-4, Spec §Edge Cases]
- [x] CHK016 Are recovery requirements defined after a blocked or failed removal attempt, including what the student can do next? [Gap, Spec §User Story 3, Spec §User Story 4]
- [x] CHK017 Are requirements specified for how the student learns whether the class remains on the schedule after a failed update? [Coverage, Spec §User Story 4, Spec §FR-010-FR-011]

## Edge Case Coverage

- [x] CHK018 Are boundary conditions beyond the exact deadline addressed, such as missing policy records, duplicate submissions, or stale enrollment state? [Coverage, Gap, Spec §Edge Cases, Spec §FR-001-FR-011]
- [x] CHK019 Are conflicting state scenarios addressed in requirements, such as a policy decision being made on an enrollment that changes before commit? [Gap, Data Model §Enrollment Record, Plan §Summary]

## Non-Functional Requirements

- [x] CHK020 Are availability, auditability, or logging requirements specified for policy-evaluation and failed-update paths, or intentionally excluded? [Gap, Plan §Technical Context, Spec §User Stories 3-4]
- [x] CHK021 Are accessibility requirements defined for the removal confirmation, result, and error experiences? [Gap, Spec §User Scenarios & Testing, Contracts §View Outputs]

## Dependencies & Assumptions

- [x] CHK022 Are assumptions about authenticated students, single-term policy ownership, and SQLite-backed persistence explicitly validated as requirements where failure would change behavior? [Assumption, Spec §Assumptions, Data Model §Student, §Deadline Policy]
- [x] CHK023 Are external dependency expectations for time source, policy lookup, and fee update authority documented well enough to prevent hidden design decisions later? [Dependency, Gap, Plan §Technical Context, Research §Decision 3-4]

## Ambiguities & Conflicts

- [x] CHK024 Does the spec establish a clear requirement-ID-to-acceptance-test traceability scheme beyond narrative linkage? [Traceability, Gap, Spec §FR-012, Acceptance Tests §UC-16-AS]
- [x] CHK025 Are any vague terms left unresolved, including "more favorable outcome," "standard course-registration volumes," or "normal student interactions"? [Ambiguity, Spec §User Story 1, Plan §Technical Context]

## Notes

- This checklist tests the quality of the written requirements, not implementation behavior.
- Prioritize gaps that would change policy interpretation, failure handling, or acceptance-test mapping.
- Review result: 25 items passed, 0 items remain open.
- All checklist items are now satisfied by the current spec, plan, and supporting design artifacts.
