# Quickstart: UC-22 Generate Possible Class Schedules

## Purpose

Validate the UC-22 schedule-builder feature against the specification, acceptance suite, constitution constraints, and cross-cutting quality expectations.

## Prerequisites

- An authenticated student account.
- Test data for a feasible course set, a partially unschedulable course set, an infeasible course-and-constraint combination, and catalog/timetable retrieval failure.
- An available planning term.

## Validation Scenarios

### 1. Feasible Schedule Generation

1. Sign in as a student and open the schedule builder.
2. Select an available planning term.
3. Choose a feasible course set.
4. Optionally apply supported constraints that still allow feasibility.
5. Select `Generate Schedules`.
6. Confirm one or more schedule options are displayed with section, day, and time details.
7. Confirm no enrollment changes are applied.

### 2. Continue After Unschedulable Courses

1. Select a course set containing at least one course with no available sections and at least one remaining schedulable course.
2. Select `Generate Schedules`.
3. Confirm the unschedulable course or courses are identified.
4. Choose to continue with the remaining courses.
5. Confirm schedule options are displayed for remaining schedulable courses when feasible.

### 3. No Feasible Schedule Outcome

1. Select courses and constraints that yield no feasible schedule.
2. Select `Generate Schedules`.
3. Confirm no schedule options are shown as valid results.
4. Confirm the student receives actionable guidance to adjust constraints, sections, or selected courses.

### 4. Catalog/Timetable Retrieval Failure

1. Enable a retrieval failure for catalog or timetable data.
2. Open the schedule builder, select a term, and choose any course set.
3. Select `Generate Schedules`.
4. Confirm an error is shown and no schedules are displayed as completed results.
5. Disable the fault and confirm the flow can be retried normally.

### 5. Invalid Input Correction

1. Open the schedule builder without a valid term or with an empty or duplicate-invalid course selection.
2. Attempt to generate schedules.
3. Confirm the system identifies what must be corrected before generation proceeds.

## Quality Checks

### Accessibility

- Verify the schedule builder and all outcome states support keyboard-only navigation.
- Verify outcome messages are available in text for assistive technologies.

### Privacy

- Verify the builder shows only the requesting student’s selected courses, constraints, and generated results.

### Performance

- Measure feasible schedule-generation requests and confirm at least 95% present the first user-visible result within 10 seconds under normal operating conditions.

### Style Compliance

- Review modified HTML and CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md`.
- Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md`.
