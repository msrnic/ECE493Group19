# Feature Specification: UC-28 Save and Name Constraint Sets

**Feature Branch**: `[028-save-constraint-sets]`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "UC-28 with corresponding acceptance tests in Acceptance Test folder and create a new branch. the naming convention of the branch is xxx-branch-feature and xxx is number from UC-XX"

## Clarifications

### Session 2026-03-11

- Q: What naming rule should define a valid saved-set name? → A: Allow letters, numbers, spaces, hyphens, apostrophes, and parentheses after trimming, with a maximum length of 50 characters.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save a Named Constraint Set (Priority: P1)

As a student, I want to save my current constraint set under a name so I can reuse it later without recreating the same preferences.

**Source Artifacts**: [UC-28.md](/home/thaia/ECE493Group19/Use%20Cases/UC-28.md), [UC-28-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-28-AS.md), `AT-UC28-01`

**Why this priority**: Saving a reusable named set is the core value of UC-28 and is the minimum useful outcome for students who manage multiple scheduling scenarios.

**Independent Test**: Can be fully tested by configuring constraints for one term, providing a valid new name, saving, and confirming the named set is listed, reloads correctly, and can be selected to repopulate the constraint editor for the same term.

**Acceptance Scenarios**:

1. **Given** an authenticated student has configured constraints for an available term, **When** the student provides a valid new name and saves the constraint set, **Then** the system stores the full current constraint set under that name for that student and term.
2. **Given** a student has saved a named constraint set successfully, **When** the student reloads the saved-set list for the same term, **Then** the saved set appears under the chosen name and can be selected later to repopulate the constraint editor for that same student and term.

---

### User Story 2 - Handle Invalid or Duplicate Names (Priority: P2)

As a student, I want clear feedback when a saved-set name is invalid or already in use so I can correct the name or intentionally replace an older set.

**Source Artifacts**: [UC-28.md](/home/thaia/ECE493Group19/Use%20Cases/UC-28.md), [UC-28-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-28-AS.md), `AT-UC28-02`, `AT-UC28-03`

**Why this priority**: Named sets are only trustworthy if the system prevents ambiguous or unusable names and makes duplicate-name handling explicit.

**Independent Test**: Can be fully tested by attempting to save with an empty or invalid name, then with a duplicate name, and confirming the system blocks invalid saves while requiring rename or explicit overwrite for duplicates.

**Acceptance Scenarios**:

1. **Given** a student enters a blank name, a name made only of whitespace, a name longer than the allowed limit, or a name containing characters outside the allowed naming rule, **When** the student saves, **Then** the system rejects the save, explains the naming problem, and keeps the current unsaved constraint configuration and entered name visible for correction in that session.
2. **Given** a student enters a name that matches an existing saved set for the same student and term, **When** the student saves, **Then** the system requires the student to either provide a different name or explicitly confirm overwrite before replacing the existing set.
3. **Given** a student confirms overwrite for a duplicate name, **When** the save completes successfully, **Then** the system replaces the previously stored set for that name with the full current constraint set and keeps only one saved set under that name for that student and term.

---

### User Story 3 - Manage Existing Named Sets Reliably (Priority: P3)

As a student, I want to rename or delete saved constraint sets and recover cleanly from save failures so that my saved options stay organized and trustworthy.

**Source Artifacts**: [UC-28.md](/home/thaia/ECE493Group19/Use%20Cases/UC-28.md), [UC-28-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-28-AS.md), `AT-UC28-04`, `AT-UC28-05`, `AT-UC28-06`

**Why this priority**: Renaming, deletion, and failure recovery are important management behaviors, but they depend on the core save flow already existing.

**Independent Test**: Can be fully tested by renaming an existing saved set, deleting another saved set, simulating a save failure, and confirming stored sets remain consistent after each action.

**Acceptance Scenarios**:

1. **Given** a student has an existing saved constraint set, **When** the student renames it to a different valid non-conflicting name, **Then** the system updates the saved-set name, preserves the stored constraints, and no longer shows the old name after reload.
2. **Given** a student has an existing saved constraint set, **When** the student confirms deletion, **Then** the system removes that saved set from storage and it does not reappear after reload.
3. **Given** a student attempts to save, rename, or overwrite a constraint set and the operation fails, **When** the failure is reported, **Then** the system leaves previously saved sets unchanged and keeps the system state consistent.
4. **Given** a student attempts to rename a saved set to a name with the same normalized value it already has, **When** the student confirms the rename, **Then** the system must treat the request as keeping the same saved set identity and must not create a duplicate or require overwrite of itself.

### Edge Cases

- What happens when a student tries to save a named set before any constraints have been configured for the selected term? The system should explain that only an existing configured constraint set can be saved and should not create an empty saved set.
- What happens when a student reuses a name that differs only by letter case or leading and trailing spaces? The system should treat the normalized names as the same name for duplicate checking.
- What happens when a student enters symbols outside the allowed naming rule? The system should reject the name, identify the invalid characters, and keep the unsaved constraint set available for correction.
- What happens when a student renames a saved set to a name already used by another saved set for the same term? The system should require a different name or explicit overwrite confirmation and should not silently merge the two sets.
- What happens when a student renames a saved set to the same normalized name it already uses? The system should treat the action as retaining the same saved set rather than as a duplicate conflict with itself.
- What happens when the selected term changes? The system should load only the saved sets for that student and term and must not mix saved sets across terms.
- What happens when a student opens the same saved-set list in multiple sessions and one session changes or deletes a set first? The system should prevent the older session from silently overwriting or restoring stale saved-set data.
- What happens when a save, overwrite, rename, or delete action fails after confirmation? The system should roll back the attempted change completely so the saved-set list and stored constraint data remain exactly as they were before the action began.
- How does this story remain compliant with its mapped `UC-28` and `UC-28-AS` artifacts when requirements evolve? Future revisions must continue to support saving, validating, overwriting by policy, renaming, deleting, and failure-safe handling of named constraint sets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated student to save the currently configured constraint set for a selected registration term under a user-provided name, where the saved set contains the full term-scoped constraint configuration currently shown in the editor at the moment of save.
- **FR-002**: The system MUST store named constraint sets separately for each student and registration term.
- **FR-003**: The system MUST require a saved-set name to be non-empty after trimming leading and trailing whitespace, no longer than 50 characters, and limited to letters, numbers, spaces, hyphens, apostrophes, and parentheses.
- **FR-004**: The system MUST reject a save request when the provided name is missing, blank after trimming, exceeds the allowed length, or contains characters outside the allowed naming rule, and MUST explain how the student can correct the name.
- **FR-005**: The system MUST detect duplicate saved-set names using normalized comparison for the same student and term, where normalization trims leading and trailing whitespace and ignores letter case.
- **FR-006**: When a duplicate name is detected, the system MUST require the student to either provide a different name or explicitly confirm overwrite before replacing the previously saved set for that name.
- **FR-007**: When overwrite is confirmed and the save succeeds, the system MUST replace the previously stored set for that name with the full current constraint set and MUST NOT retain two saved sets with the same normalized name for the same student and term.
- **FR-008**: The system MUST make each successfully saved named constraint set available for later listing and reuse by the same student in the same term, where reuse means selecting the saved set to repopulate the constraint editor with that saved set's stored constraints.
- **FR-009**: The system MUST allow a student to rename an existing saved constraint set to a valid non-conflicting name without changing the stored constraints in that set, and a rename to the same normalized name already owned by that saved set MUST be treated as the same saved set rather than as a duplicate conflict.
- **FR-010**: The system MUST allow a student to delete an existing saved constraint set only after an explicit delete confirmation.
- **FR-011**: If a save, overwrite, rename, or delete operation fails, the system MUST report the failure, roll back the attempted change completely, and leave all previously saved sets unchanged.
- **FR-012**: The system MUST prevent saving a named set when no current constraint configuration exists for the selected term and MUST explain why the save cannot proceed.
- **FR-013**: The system MUST limit viewing and managing named constraint sets to the authenticated student's own saved sets for the selected term and MUST prevent a stale session from silently overwriting, renaming, deleting, or restoring newer saved-set changes.
- **FR-014**: Every user story in this specification MUST remain traceable to [UC-28.md](/home/thaia/ECE493Group19/Use%20Cases/UC-28.md) and [UC-28-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-28-AS.md).

### Non-Functional Requirements

- **NFR-001**: In normal operating conditions, the system MUST confirm a successful save, overwrite, rename, or delete operation, or report the failure, within 5 seconds after the student submits the action.
- **NFR-002**: The system MUST present naming errors, duplicate-name prompts, delete confirmations, and failure messages in plain language that identifies the affected saved set and the next step available to the student.
- **NFR-003**: The system MUST provide keyboard-accessible access to save, overwrite, rename, delete, confirm, and cancel actions for named constraint sets.
- **NFR-004**: The system MUST ensure only the authenticated student can view or modify that student's named constraint sets for the selected term.
- **NFR-005**: In normal operating conditions, at least 95% of save, overwrite, rename, delete, and failure responses for named constraint sets complete with a visible result within 5 seconds.

### Assumptions

- The student is already authenticated before opening the constraints editor or saved-set list.
- The student is working within one selected registration term at a time.
- A current constraint configuration exists before the student attempts to save a new named set unless the system is exercising the FR-012 error path.
- Reusing a saved set means it remains available to be selected later from the student's saved-set list for the same term.
- The maximum number of saved sets per student and term is intentionally out of scope for UC-28 and may be defined by a later use case.

### Dependencies

- The feature depends on existing constraint-editing functionality for the selected term.
- The feature depends on student profile or preference storage being able to persist named constraint sets by student and term.
- The feature depends on the system being able to reload saved-set lists consistently after save, overwrite, rename, delete, and failed mutating actions.

### Key Entities *(include if feature involves data)*

- **Named Constraint Set**: A saved collection of constraints for one student and one term, identified by a student-defined name and containing the full constraint configuration shown in the editor at the moment of save.
- **Saved Set Name**: The user-visible label attached to a saved constraint set, subject to normalization, allowed-character rules, uniqueness rules, and length limits.
- **Saved Set List**: The term-scoped collection of named constraint sets available to one student for later reuse or management.
- **Saved Set Operation Result**: The outcome of save, overwrite, rename, delete, or failure handling, including whether stored data changed, whether rollback was required, and whether refresh is required because the session is stale.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of valid UC-28 save scenarios result in the named constraint set being available in the saved-set list after reload for the same student and term.
- **SC-002**: In acceptance testing, 100% of invalid-name scenarios are rejected with a visible explanation and no unintended saved-set creation.
- **SC-003**: In acceptance testing, 100% of duplicate-name scenarios require rename or explicit overwrite confirmation before stored data changes.
- **SC-004**: In acceptance testing, 100% of rename and delete scenarios update the saved-set list correctly and preserve storage consistency after reload.
- **SC-005**: In normal operating conditions, at least 95% of save, overwrite, rename, delete, and reported failure actions produce a visible result within 5 seconds.
