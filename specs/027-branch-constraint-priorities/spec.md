# Feature Specification: UC-27 Set Constraint Priorities

**Feature Branch**: `[027-branch-constraint-priorities]`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "UC-27 with corresponding acceptance tests in Acceptance Test folder and create a new branch. the naming convention of the branch is xxx-branch-feature and xxx is number from UC-XX"

## Clarifications

### Session 2026-03-11

- Q: What priority model and tie-breaking rule should UC-27 use? → A: Use a numeric 1-to-5 scale where 1 is highest priority, allow equal priorities, and break ties by the constraint order shown to the student in the editor.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Priority Settings for Constraints (Priority: P1)

As a student, I want to assign priorities to my existing scheduling constraints so the schedule generator knows which constraints matter most when ranking results.

**Source Artifacts**: [UC-27.md](/home/thaia/ECE493Group19/Use%20Cases/UC-27.md), [UC-27-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-27-AS.md), `AT-UC27-01`

**Why this priority**: Saving priority settings is the core value of UC-27 and is the minimum useful outcome for tradeoff-aware schedule ranking.

**Independent Test**: Can be fully tested by opening the constraints editor for a term, assigning valid priorities to existing constraints, saving them, and confirming the latest saved priority set reloads correctly for the same term.

**Acceptance Scenarios**:

1. **Given** an authenticated student has existing scheduling constraints for an available term, **When** the student assigns valid priorities on the 1-to-5 scale to all eligible constraints and saves, **Then** the system stores the full submitted priority set for that student and term and uses it during later schedule ranking.
2. **Given** a student has previously saved priority settings for a term, **When** the student updates those priorities and saves again, **Then** the system replaces the prior priority settings for that term with the full revised set and uses the revised values during later schedule ranking.

---

### User Story 2 - Reject Invalid Priority Assignments (Priority: P2)

As a student, I want clear feedback when my priority assignments are invalid so I can correct them before they affect schedule ranking.

**Source Artifacts**: [UC-27.md](/home/thaia/ECE493Group19/Use%20Cases/UC-27.md), [UC-27-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-27-AS.md), `AT-UC27-02`

**Why this priority**: Priority settings only help if they are valid and understandable, so invalid assignments must be blocked and explained clearly.

**Independent Test**: Can be fully tested by entering out-of-range or otherwise invalid priority values, saving, and confirming the system rejects the change and preserves the prior saved priorities.

**Acceptance Scenarios**:

1. **Given** a student assigns a priority value outside the allowed 1-to-5 range, **When** the student saves the priority settings, **Then** the system rejects the change, identifies the invalid assignment, and requests correction.
2. **Given** a student leaves one or more selected constraints without a numeric priority value, **When** the student saves the priority settings, **Then** the system rejects the change, explains which assignments are incomplete, and leaves the previously saved priorities unchanged.
3. **Given** the submitted priority set contains both a missing value and an out-of-range value, **When** the student saves, **Then** the system identifies every invalid assignment in the same response and does not partially save the set.

---

### User Story 3 - Handle Ties and Save Failures Consistently (Priority: P3)

As a student, I want equal-priority ties and save failures handled consistently so I can trust how schedules are ranked and know my previous settings are safe.

**Source Artifacts**: [UC-27.md](/home/thaia/ECE493Group19/Use%20Cases/UC-27.md), [UC-27-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-27-AS.md), `AT-UC27-03`, `AT-UC27-04`

**Why this priority**: Tie-handling and save-failure recovery matter for trust and predictability, but they depend on the primary priority-assignment flow already being defined.

**Independent Test**: Can be fully tested by assigning equal priorities where allowed, saving and reloading to confirm the captured tie-breaking rule remains stable, and simulating a save failure to confirm prior saved priorities remain unchanged.

**Acceptance Scenarios**:

1. **Given** equal priority values are allowed, **When** a student assigns the same priority to two or more constraints and saves, **Then** the system accepts the saved priorities and applies the displayed constraint order as the documented tie-breaking rule consistently during schedule ranking.
2. **Given** a student submits valid priority settings, **When** the save operation fails, **Then** the system reports the failure, leaves the previously saved priorities unchanged, and allows the student to keep editing or retry.
3. **Given** a student opens a term with an existing saved priority set and the eligible constraint list has changed, **When** the student edits and re-saves priorities, **Then** the system requires the student to review any affected assignments before a replacement save succeeds.

### Edge Cases

- What happens when a student tries to set priorities before any constraints exist for the selected term? The system should explain that priorities can only be assigned to existing constraints and should not create empty priority records.
- What happens when a student assigns priorities to only some constraints in the selected term? The system should reject the save and identify which eligible constraints still need assigned priorities.
- What happens when equal-priority values are allowed? The system should apply the ascending displayed order of constraints shown in the editor at save time as the documented tie-breaking rule consistently for repeated schedule-generation requests with the same inputs.
- What happens when the selected term changes? The system should load only the saved priority settings for that student and term and must not mix priority settings across terms.
- What happens when a previously prioritized constraint is deleted or becomes unavailable? The system should preserve the remaining valid priority settings, identify the affected priority record, and require the student to review the saved set before relying on updated ranking results.
- What happens when the same student edits the same term's priority set in multiple sessions? The system should prevent an older session from silently overwriting a newer saved priority set and should require the student to refresh before replacing stale data.
- How does this story remain compliant with its mapped `UC-27` and `UC-27-AS` artifacts when requirements evolve? Future revisions must continue to support saving valid priorities, rejecting invalid assignments, handling tie-breaking consistently, and preserving prior saved priorities when save operations fail.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated student to open priority settings for all existing saved scheduling constraints in an available registration term that remain eligible for schedule ranking.
- **FR-002**: The system MUST allow a student to assign and save numeric priorities from 1 to 5 for every eligible constraint in the selected term, where 1 represents the highest priority.
- **FR-003**: The system MUST store saved priority settings separately for each student and registration term.
- **FR-004**: The system MUST replace the previously saved priority settings for the selected term with the full submitted priority set when a valid save succeeds and MUST NOT partially save only some updated priority assignments from a submission.
- **FR-005**: The system MUST validate submitted priority values before saving and reject any value that is outside the 1-to-5 range, missing for an eligible constraint, tied to a constraint outside the selected term, or tied to a constraint that is no longer eligible for ranking.
- **FR-006**: When a save is rejected, the system MUST identify the invalid priority assignments, explain the reason for rejection, and leave the previously saved priorities unchanged.
- **FR-007**: The system MUST apply saved priorities during schedule generation and ranking for the same student and selected term.
- **FR-008**: The system MUST allow equal priority values and MUST break ties by using the ascending order in which the affected constraints are shown to the student in the editor at the time the priority set is saved, applying that rule consistently for repeated ranking requests with the same inputs.
- **FR-009**: The system MUST preserve the previously saved priority settings when a save operation fails and MUST allow the student to keep editing or retry without losing the submitted values from that session.
- **FR-010**: The system MUST require priority settings to reference existing constraints for the selected term and MUST NOT create standalone priority records without a corresponding saved constraint.
- **FR-011**: The system MUST load and edit priority settings separately for each registration term and MUST NOT mix priority settings across terms.
- **FR-012**: If a prioritized constraint is deleted or becomes unavailable, the system MUST identify the affected saved priority and require the student to review the saved priority set before relying on updated ranking results.
- **FR-013**: The system MUST limit viewing and editing of priority settings to the authenticated student's own constraints for the selected term and MUST prevent a stale editing session from silently overwriting a newer saved priority set.
- **FR-014**: Every user story in this specification MUST remain traceable to [UC-27.md](/home/thaia/ECE493Group19/Use%20Cases/UC-27.md) and [UC-27-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-27-AS.md).

### Non-Functional Requirements

- **NFR-001**: In normal operating conditions, the system MUST confirm a successful priority save or report a save failure within 5 seconds after the student submits priority settings.
- **NFR-002**: The system MUST present invalid-priority messages, tie-policy explanations, and save confirmations in plain language that identifies the affected constraint, the reason, and the corrective action or next step.
- **NFR-003**: The system MUST provide keyboard-accessible access to edit, save, review, retry, and stale-data review actions for priority settings and related warnings or failures.
- **NFR-004**: The system MUST ensure only the authenticated student can view or modify that student's saved priority settings and linked ranked constraints for the selected term.
- **NFR-005**: The same 5-second response target applies to successful saves, invalid-value rejections, and reported save failures under normal operating conditions.

### Assumptions

- The student is already authenticated before opening the constraints editor.
- The student already has at least one saved scheduling constraint before attempting to assign priorities.
- The selected registration term and its course data are available when the student edits priority settings.
- Schedule ranking uses the latest saved priority set for the selected student and term as defined by FR-007 rather than by a separate undocumented rule.

### Dependencies

- The feature depends on existing saved scheduling constraints for the selected student and term.
- The feature depends on schedule generation and ranking being able to read the latest saved priority settings for the selected term.
- The feature depends on term-specific constraint data remaining available so saved priorities can still reference valid constraints.

### Key Entities *(include if feature involves data)*

- **Constraint Priority Setting**: A saved numeric priority from 1 to 5 associated with one existing scheduling constraint for one student and one term.
- **Priority Set**: The full saved collection of priority settings for all ranked constraints in one student's selected term.
- **Priority Validation Result**: The outcome of checking submitted priority assignments for allowed range, completeness, eligible-constraint membership, and review-required conditions before a save can proceed.
- **Tie-Breaking Rule**: The documented ranking rule that uses the ascending displayed constraint order captured at save time when two or more constraints share the same priority value.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of valid UC-27 save scenarios result in saved priorities being used during later schedule ranking for the same student and term.
- **SC-002**: In acceptance testing, 100% of invalid priority submissions are rejected with a visible explanation and no unintended change to previously saved priorities.
- **SC-003**: In acceptance testing, 100% of equal-priority scenarios apply the captured displayed constraint order as the tie-breaking rule consistently for repeated ranking runs with the same inputs.
- **SC-004**: In acceptance testing, 100% of save-failure scenarios preserve the previously saved priority settings.
- **SC-005**: In normal operating conditions, at least 95% of priority save attempts, invalid-value rejections, and reported save failures complete with a visible result within 5 seconds.
