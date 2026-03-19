# Feature Specification: UC-29 Auto-pick Compatible Components

**Feature Branch**: `[029-compatible-components]`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "UC-29 with corresponding acceptance tests in Acceptance Test folder and create a new branch. the naming convention of the branch is xxx-branch-feature and xxx is number from UC-XX"

## Clarifications

### Session 2026-03-11

- Q: What policy should govern shared cross-listed components and missing linkage rules? → A: Block generation whenever compatibility cannot be verified, and when one shared component satisfies both cross-listed listings, show that shared component once per returned schedule option.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Only Compatible Component Combinations (Priority: P1)

As a student, I want generated schedules to include only compatible lecture, lab, and tutorial combinations so I do not accidentally choose an invalid section pairing.

**Source Artifacts**: [UC-29.md](/home/thaia/ECE493Group19/Use%20Cases/UC-29.md), [UC-29-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-29-AS.md), `AT-UC29-01`

**Why this priority**: Compatibility-aware generation is the core value of UC-29 and the minimum useful outcome for courses that require multiple component types.

**Independent Test**: Can be fully tested by selecting a course with lecture, lab, and tutorial requirements, generating schedules, and confirming every returned option contains only valid linked component pairings.

**Acceptance Scenarios**:

1. **Given** an authenticated student selects a course with required lecture, lab, or tutorial components for an available term, **When** the student generates schedules, **Then** every returned schedule option includes only compatible component combinations for that course.
2. **Given** a student selects multiple courses with required component pairings, **When** schedules are generated, **Then** no returned schedule includes an incompatible lecture, lab, or tutorial combination for any selected course.

---

### User Story 2 - Explain When Compatibility Cannot Be Satisfied (Priority: P2)

As a student, I want clear feedback when no compatible component combination can be built or when compatibility rules are missing so I know how to adjust my selections.

**Source Artifacts**: [UC-29.md](/home/thaia/ECE493Group19/Use%20Cases/UC-29.md), [UC-29-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-29-AS.md), `AT-UC29-02`, `AT-UC29-03`

**Why this priority**: Students need a clear reason when generation cannot proceed safely; otherwise schedule generation becomes untrustworthy.

**Independent Test**: Can be fully tested by selecting a course with no valid component pairings and by simulating missing linkage rules, then confirming the system blocks unsafe results and explains what the student should change.

**Acceptance Scenarios**:

1. **Given** a selected course has no compatible lecture, lab, and tutorial combination for the current term, **When** the student generates schedules, **Then** the system reports that no compatible combination exists and prompts the student to modify the selected course or sections.
2. **Given** linkage rules needed to determine compatibility are missing or inconsistent for a selected course, **When** the student generates schedules, **Then** the system blocks schedule generation for that request and explains that compatibility could not be verified.

---

### User Story 3 - Handle Shared Components and Failures Consistently (Priority: P3)

As a student, I want cross-listed shared components and generator failures handled consistently so that returned schedules stay understandable and reliable.

**Source Artifacts**: [UC-29.md](/home/thaia/ECE493Group19/Use%20Cases/UC-29.md), [UC-29-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-29-AS.md), `AT-UC29-04`, `AT-UC29-05`

**Why this priority**: Shared-component handling and failure recovery matter for trust and correctness, but they depend on the main compatibility rules already being defined.

**Independent Test**: Can be fully tested by generating schedules for a cross-listed or shared-component course scenario and by simulating a generation failure, then confirming shared components are not duplicated and failures return no inconsistent schedules.

**Acceptance Scenarios**:

1. **Given** a selected course or cross-listed pair shares one or more compatible components, **When** schedules are generated, **Then** the system represents the shared compatible component once per schedule option, treats it as satisfying both linked listings when applicable, and does not duplicate it.
2. **Given** a system error occurs during compatibility-aware schedule generation, **When** the failure is reported, **Then** the system returns no inconsistent or partially paired schedule results and leaves the system state consistent.

### Edge Cases

- What happens when a course requires only some component types, such as a lecture and lab but no tutorial? The system should enforce compatibility only for the component types actually required by that course.
- What happens when multiple compatible combinations exist for the same course? The system should allow schedule generation to consider all valid compatible combinations rather than arbitrarily restricting the course to one pairing.
- What happens when multiple selected courses each have several valid compatible combinations? The system should evaluate compatible combinations across all selected courses together and return only schedule options that satisfy every selected course in the request.
- What happens when no compatible component combination exists for one selected course but other selected courses are valid? The system should explain which course blocks generation and should not present schedules that ignore the incompatible course requirement.
- What happens when linkage rules are missing or contradictory for only part of a cross-listed or shared-component offering? The system should block generation for that request rather than return schedules whose compatibility cannot be verified.
- What happens when a shared component satisfies requirements for two cross-listed listings? The system should represent the shared component once in each returned schedule option, count it as satisfying both linked listings for that option, and apply the shared linkage rule consistently.
- How does this story remain compliant with its mapped `UC-29` and `UC-29-AS` artifacts when requirements evolve? Future revisions must continue to support compatible component selection, no-compatible-combination handling, missing-rule handling, shared-component handling, and failure-safe generation behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST retrieve the component offerings and the authoritative compatibility linkage rules for each selected course in the selected registration term before generating schedules.
- **FR-002**: The system MUST generate schedule options using only component combinations that satisfy all required compatibility rules for each selected course.
- **FR-003**: The system MUST enforce compatibility only for the component types that are required by the selected course offering in the selected term.
- **FR-004**: The system MUST exclude incompatible lecture, lab, and tutorial pairings from all returned schedule options.
- **FR-005**: When multiple compatible component combinations exist for a selected course, the system MUST allow schedule generation to consider each valid combination.
- **FR-006**: When no compatible component combination exists for a selected course, the system MUST report which selected course cannot be satisfied and MUST prompt the student to modify the selected course or sections before retrying generation.
- **FR-007**: When compatibility linkage rules are missing or inconsistent for any selected course, the system MUST block schedule generation for that request and MUST explain that compatibility could not be verified.
- **FR-008**: When cross-listed courses or shared components satisfy compatibility requirements, the system MUST represent the shared compatible component once per schedule option, MUST treat that single shared component as satisfying both linked listings when applicable, and MUST NOT duplicate it within the same returned schedule.
- **FR-009**: If a system error occurs during compatibility-aware schedule generation, the system MUST report the failure, MUST return no inconsistent or partially paired schedule results, and MUST NOT expose partially evaluated combinations or present previously generated schedules as the result of the failed request.
- **FR-010**: The system MUST apply compatibility checks separately for each student request and selected term and MUST NOT mix component-linkage results across terms.
- **FR-011**: The system MUST present each returned schedule option with the lecture, lab, tutorial, and shared-component section identifiers used for each selected course so the chosen compatible component pairings are clear to the student.
- **FR-012**: Every user story in this specification MUST remain traceable to [UC-29.md](/home/thaia/ECE493Group19/Use%20Cases/UC-29.md) and [UC-29-AS.md](/home/thaia/ECE493Group19/Acceptance%20Tests/UC-29-AS.md).

### Non-Functional Requirements

- **NFR-001**: In normal operating conditions, the system MUST either return compatibility-checked schedule options or report why generation was blocked within 5 seconds after the student requests schedule generation.
- **NFR-002**: The system MUST explain no-compatible-combination, missing-rule, shared-component, and generation-failure outcomes in plain language that identifies the affected course and the next action available to the student.
- **NFR-003**: The system MUST ensure only the authenticated student's selected course request is used when generating compatibility-checked schedules for that term.
- **NFR-004**: In normal operating conditions, at least 95% of compatibility-aware generation requests complete with either valid schedule results or a blocking explanation within 5 seconds.

### Assumptions

- The student is already authenticated before generating schedules.
- The selected registration term and course catalog data are available when schedules are generated.
- Compatibility linkage rules are provided by existing catalog or timetable data rather than entered manually by the student.
- For each selected term offering, the institution-designated linkage metadata source is treated as authoritative when compatibility rules are retrieved.
- Returning no schedules is the correct safe behavior when compatibility cannot be verified or generation fails.

### Dependencies

- The feature depends on course catalog and timetable data exposing component offerings for the selected term.
- The feature depends on linkage rules being available in the institution-designated catalog or timetable source whenever compatibility can be verified.
- The feature depends on the schedule generator being able to consume compatibility-filtered section combinations before returning schedule options.

### Key Entities *(include if feature involves data)*

- **Component Offering**: A lecture, lab, tutorial, or other required instructional component offered for a selected course in a selected term.
- **Compatibility Linkage Rule**: A rule that defines which component offerings may be paired together for a course or cross-listed/shared-component scenario.
- **Compatible Component Combination**: A set of required component offerings for one course that satisfies all applicable linkage rules.
- **Shared Compatible Component**: One component offering that validly satisfies compatibility requirements for more than one linked or cross-listed listing within the same returned schedule option.
- **Compatibility Generation Result**: The outcome of schedule generation after applying compatibility rules, including either valid schedule options or a blocking/failure explanation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of valid UC-29 generation scenarios return schedules that contain only compatible component combinations for every selected course.
- **SC-002**: In acceptance testing, 100% of no-compatible-combination scenarios identify the blocking course and return no incompatible schedule options.
- **SC-003**: In acceptance testing, 100% of missing or inconsistent linkage-rule scenarios block generation with a visible explanation.
- **SC-004**: In acceptance testing, 100% of cross-listed or shared-component scenarios avoid duplicating a shared compatible component within the same returned schedule option.
- **SC-005**: In normal operating conditions, at least 95% of compatibility-aware generation requests complete with either valid results or a visible blocking explanation within 5 seconds.
