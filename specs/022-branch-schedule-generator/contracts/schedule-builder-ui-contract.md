# UI Contract: UC-22 Generate Possible Class Schedules

## Overview

This contract defines the user-visible schedule-builder outcomes required for UC-22. It guides controller-to-view mapping, acceptance validation, and task decomposition.

## Shared Expectations

- Schedule generation is planning-only and never changes registration state.
- The primary action is `Generate Schedules`.
- All outcomes must be keyboard accessible and expose state messages in text.
- Feasible schedule options may appear in any consistent order; ranked ordering is out of scope.

## Outcome: Feasible Schedules

**Trigger**

- Valid term, selected courses, and supported constraints allow one or more feasible schedule options.

**Required UI Elements**

- One or more schedule options.
- For each option: included sections, scheduled days, and times.
- Clear indication that the results are planning-only.

**Forbidden UI Elements**

- Retrieval-failure error messaging.
- No-feasible-schedule guidance presented as if a system fault occurred.

## Outcome: Partial Continuation

**Trigger**

- One or more selected courses have no available sections, but other selected courses remain schedulable.

**Required UI Elements**

- Identification of unschedulable courses.
- Explicit continuation affordance for remaining schedulable courses.
- Generated schedule options for remaining courses when feasible.

**Forbidden UI Elements**

- Silent omission of unschedulable courses.

## Outcome: No Feasible Schedule

**Trigger**

- All required course and timetable data is available, but no schedule satisfies the selected courses and constraints.

**Required UI Elements**

- Clear no-feasible-schedule message.
- Actionable guidance to relax constraints or change selected courses/sections.

**Forbidden UI Elements**

- Presentation of invalid schedule candidates as feasible.
- Retrieval-failure messaging.

## Outcome: Retrieval Failure

**Trigger**

- Catalog or timetable data cannot be retrieved during schedule generation.

**Required UI Elements**

- Clear error message stating schedule generation could not complete.
- No completed schedule results shown.

**Forbidden UI Elements**

- Partial retrieval output presented as completed schedules.

## Outcome: Invalid Input

**Trigger**

- Term selection or course selection is incomplete, empty, or invalid for generation.

**Required UI Elements**

- Clear correction message identifying what must be fixed before generation.

**Forbidden UI Elements**

- Attempting generation without first addressing the invalid input.

## Acceptance Mapping

- `AT-UC22-01` -> Feasible schedules
- `AT-UC22-02` -> Partial continuation
- `AT-UC22-03` -> No feasible schedule
- `AT-UC22-04` -> Retrieval failure
- Spec edge cases -> Invalid input and all-selected-unschedulable handling
