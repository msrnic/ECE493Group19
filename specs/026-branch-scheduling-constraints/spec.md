# Feature Specification: UC-26 Create Custom Scheduling Constraints

**Feature Branch**: `[026-branch-scheduling-constraints]`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "UC-26 with corresponding acceptance tests in Acceptance Test folder and create a new branch. the naming convention of the branch is xxx-branch-feature and xxx is number from UC-XX"

## Clarifications

### Session 2026-03-11

- Q: What should happen when submitted scheduling constraints conflict with each other? → A: Warn and allow save after explicit confirmation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Scheduling Constraints (Priority: P1)

As a student, I want to create and save my schedule constraints so generated schedules avoid times and teaching options I cannot accept.

**Source Artifacts**: [UC-26.md](/home/thaia/ECE493Group19/Use%20Cases/UC-26.md), [UC-26-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-26-AS.md), `AT-UC26-01`

**Why this priority**: Saving valid constraints is the core value of UC-26 and is the minimum usable outcome for schedule customization.

**Independent Test**: Can be fully tested by opening the constraints editor, adding valid time and preference constraints, saving them, and confirming those saved constraints are available to the schedule generator.

**Acceptance Scenarios**:

1. **Given** an authenticated student has opened the schedule builder for an available term, **When** the student adds valid constraints such as blocked times, earliest class start time, or preferred professor and saves them, **Then** the system stores the full submitted constraint set for that student and term and the next schedule-generation request for that same student and term uses the saved set.
2. **Given** a student has existing saved constraints for a term, **When** the student updates one or more constraints and saves, **Then** the system replaces the previously saved set for that same term with the full revised set and the next schedule-generation request for that term uses the revised set.

---

### User Story 2 - Correct Invalid or Conflicting Constraints (Priority: P2)

As a student, I want immediate feedback on invalid or conflicting constraints so I can fix them before relying on generated schedules.

**Source Artifacts**: [UC-26.md](/home/thaia/ECE493Group19/Use%20Cases/UC-26.md), [UC-26-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-26-AS.md), `AT-UC26-02`, `AT-UC26-03`

**Why this priority**: Constraint quality directly affects schedule usefulness, so students need clear correction guidance before generation occurs.

**Independent Test**: Can be fully tested by entering a malformed time range and a pair of logically conflicting constraints, then confirming the system blocks invalid saves, warns about conflicts, and lets the student revise the entries.

**Acceptance Scenarios**:

1. **Given** a student enters a malformed or incomplete constraint definition, **When** the student tries to save, **Then** the system rejects the save, identifies the invalid entry, and explains what must be corrected.
2. **Given** a student defines two or more individually valid constraints that cannot all be satisfied together, **When** the student tries to save, **Then** the system warns the student about the conflict, explains which constraints are in tension, and allows the student either to revise the set or explicitly confirm saving it as entered.
3. **Given** a student opens a term that already has a previously confirmed conflicting constraint set, **When** the student edits and re-saves that set, **Then** the system re-validates the full submitted set and again requires explicit confirmation before saving any still-conflicting version.

---

### User Story 3 - Remove Constraints and Recover from Save Failure (Priority: P3)

As a student, I want to remove outdated constraints and avoid partial saves when an error occurs so my saved rules stay trustworthy.

**Source Artifacts**: [UC-26.md](/home/thaia/ECE493Group19/Use%20Cases/UC-26.md), [UC-26-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-26-AS.md), `AT-UC26-04`, `AT-UC26-05`

**Why this priority**: Deletion and failure handling matter for confidence and maintenance, but they depend on the core create and validate flows already being defined.

**Independent Test**: Can be fully tested by deleting an existing constraint and by simulating a save failure, then confirming the deleted constraint is removed and failed saves do not leave behind partial changes.

**Acceptance Scenarios**:

1. **Given** a student has at least one saved constraint, **When** the student deletes an existing constraint and confirms the action if prompted, **Then** the system removes that constraint from the saved set and later schedule generation no longer applies it.
2. **Given** a student attempts to save a valid set of constraints, **When** the save operation fails, **Then** the system reports the failure and preserves the previously saved constraint state without partial updates.
3. **Given** a save attempt fails, **When** the student remains in the editor, **Then** the system keeps the unsaved edits visible, identifies that the last saved set is still active, and allows the student to retry saving or continue editing.

### Edge Cases

- What happens when a student defines adjacent blocked-time ranges? The system should treat them as compatible and save them without a conflict warning.
- What happens when a student defines overlapping blocked-time ranges? The system should treat the overlap as one blocked period in the saved result rather than reject the set.
- What happens when a student sets an earliest class time that excludes all available classes for a chosen course set? The system should warn that the constraints may prevent viable schedule generation while still allowing the student to keep the preference.
- What happens when a professor preference names an instructor who is not teaching the selected courses this term? The system should save the preference only if it is valid for the selected term; otherwise it should explain why the preference cannot be applied.
- What happens when a student deletes the last remaining constraint? The system should allow an empty constraint set and treat future schedule generation as unconstrained by custom rules.
- What happens when a student switches to a different registration term? The system should load only the saved constraint set for the newly selected term and must not mix constraints across terms.
- What happens when course or instructor data becomes unavailable or stale after a constraint set was previously saved? The system should preserve the last saved set, identify any entries that can no longer be validated for the current term, and require the student to revise those entries before a new save can complete.
- What happens when the same student edits the same term's constraint set in multiple sessions? The system should prevent an older session from silently overwriting a newer saved set and should require the student to refresh before replacing stale data.
- How does this story remain compliant with its mapped `UC-26` and `UC-26-AS` artifacts when requirements evolve? Future revisions must continue to support creating, validating, warning on, deleting, and safely saving student-defined schedule constraints.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated student to open a schedule constraints editor for an available registration term.
- **FR-002**: The system MUST allow a student to create, edit, and save only these custom scheduling constraint types for the selected term: blocked time ranges, earliest class start preference, latest class end preference, no-class day preferences, and professor preferences.
- **FR-003**: The system MUST treat all other custom constraint categories as out of scope for this feature unless explicitly added by a future requirement revision.
- **FR-004**: The system MUST validate each submitted constraint entry before saving and reject any definition that is incomplete, malformed, tied to a different registration term, references unavailable term data, or uses an unsupported constraint type.
- **FR-005**: When a save is rejected, the system MUST identify the specific constraint entries that need correction, explain whether the issue is malformed input or term-context invalidity, and preserve the student's unsaved edits for revision.
- **FR-006**: When the submitted constraint set contains individually valid entries that cannot all be satisfied together, the system MUST classify the result as a warning rather than an invalid save, identify the conflicting entries, and allow the student either to revise the set or explicitly confirm saving it.
- **FR-007**: Saving from the editor MUST replace the full saved constraint set for that student and selected term with the full submitted set; the system MUST NOT partially persist only some edited entries from a save attempt.
- **FR-008**: The system MUST store the saved constraint set so that the next schedule-generation request for the same student and term uses that latest saved set.
- **FR-009**: The system MUST allow a student to delete any existing saved constraint from the selected term's saved set and ensure deleted constraints are no longer applied to future schedule generation.
- **FR-010**: If the student deletes the final remaining constraint, the system MUST preserve an empty but valid constraint set for that student and term.
- **FR-011**: If the system cannot save a submitted constraint set, it MUST report the failure, leave the previously saved constraint set unchanged, keep the student's unsaved edits visible, and allow the student to retry or continue editing.
- **FR-012**: The system MUST load and edit constraints separately for each registration term and MUST NOT mix or apply constraints across terms.
- **FR-013**: If previously saved constraints can no longer be validated because required course or instructor data is stale, incomplete, or unavailable for the selected term, the system MUST preserve the last saved set, identify the affected entries, and require revision before a replacement save completes.
- **FR-014**: The system MUST prevent a stale editing session from silently overwriting a newer saved constraint set for the same student and term.
- **FR-015**: The system MUST limit changes made by this feature to the authenticated student's own constraint set for the selected term.
- **FR-016**: Every user story in this specification MUST remain traceable to [UC-26.md](/home/thaia/ECE493Group19/Use%20Cases/UC-26.md) and [UC-26-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-26-AS.md).

### Non-Functional Requirements

- **NFR-001**: In normal operating conditions, the system MUST confirm a successful save or report a save failure within 5 seconds after the student submits constraints.
- **NFR-002**: The system MUST present validation errors, conflict warnings, and save confirmations in plain language that identifies the affected constraint, the reason, and the corrective action or next step.
- **NFR-003**: The system MUST provide keyboard-accessible access to save, warning confirmation, delete confirmation, and retry actions.
- **NFR-004**: The system MUST ensure only the authenticated student can view or modify that student's saved scheduling constraints and any stored professor preferences for the selected term.
- **NFR-005**: The same 5-second response target applies to successful saves, warning-producing validations, and reported save failures under normal operating conditions.

### Assumptions

- The student is already authenticated before accessing the schedule builder.
- The selected registration term and its course data are available when the student opens the constraints editor.
- Schedule generation consumes the latest saved constraint set for the selected student and term as defined by FR-008 rather than by a separate undocumented rule.

### Dependencies

- The feature depends on an available registration term and corresponding course catalog data.
- The feature depends on a schedule generation flow that can read the latest saved student constraint set for the selected term after it is stored.
- The feature depends on term-specific instructor and scheduling data being available so preferences can be validated.

### Key Entities *(include if feature involves data)*

- **Scheduling Constraint Entry**: One student-defined blocked time, time preference, day preference, or professor preference within a term-specific saved set.
- **Constraint Set**: The full saved collection of scheduling constraint entries for one student and one term.
- **Constraint Validation Result**: The outcome of checking submitted constraints for format errors, unsupported values, and internal conflicts.
- **Constraint Save Outcome**: The final result of a save attempt, including success, validation rejection, warning state, or save failure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of valid UC-26 save scenarios result in the latest full saved constraint set being used on the next schedule-generation request for the same student and term.
- **SC-002**: In acceptance testing, 100% of malformed or term-invalid submissions are rejected with a visible correction message that identifies the affected constraint entry, and no partial replacement of the previously saved set occurs.
- **SC-003**: In acceptance testing, 100% of conflicting-constraint scenarios present a warning that identifies the conflicting entries before the student finalizes the saved set.
- **SC-004**: In acceptance testing, 100% of delete scenarios remove the targeted constraint entry from the saved set, and deleting the final remaining entry leaves an empty valid set for that term.
- **SC-005**: In normal operating conditions, at least 95% of save attempts, warning-producing validations, and reported save failures complete with a visible result within 5 seconds.
