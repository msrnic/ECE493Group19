# Data Model: UC-22 Generate Possible Class Schedules

## Student Account

**Description**: The authenticated student identity requesting schedule generation.

**Fields**

- `studentId`: Unique institutional identifier for the student.
- `accountId`: Unique application account identifier bound to the student.
- `displayName`: Student-facing name shown in planning context.
- `isAuthenticated`: Whether the current session is authenticated.

**Relationships**

- One student account can create many schedule-generation requests.

**Validation Rules**

- `studentId` and `accountId` are required and unique.
- Schedule generation is permitted only for authenticated student sessions.

## Planning Term

**Description**: The academic term for which schedules are being generated.

**Fields**

- `termId`: Unique identifier for the planning term.
- `termLabel`: Human-readable term name.
- `isAvailableForPlanning`: Whether the term is open for schedule building.

**Relationships**

- One planning term can be referenced by many course selections and schedule options.

**Validation Rules**

- `termId` and `termLabel` are required.
- Schedule generation requires `isAvailableForPlanning` to be true.

## Course Selection

**Description**: The student’s selected course set for schedule generation.

**Fields**

- `selectionId`: Unique identifier for one schedule-generation request.
- `studentId`: Owning student identifier.
- `termId`: Selected planning term.
- `selectedCourseIds`: Set of course identifiers chosen by the student.
- `selectedConstraints`: Set of scheduling constraints applied to the request.

**Relationships**

- One course selection belongs to one student account and one planning term.
- One course selection can produce zero or more schedule options.
- One course selection can produce zero or more unschedulable-course notices.

**Validation Rules**

- `studentId`, `termId`, and at least one course identifier are required before generation.
- `selectedCourseIds` must be unique within one request.

## Scheduling Constraint

**Description**: A student-specified planning preference or limit applied to schedule generation.

**Fields**

- `constraintId`: Unique identifier for a supported constraint.
- `constraintType`: Category of constraint, such as time preference or day exclusion.
- `constraintValue`: User-selected value for that constraint.

**Relationships**

- Many constraints can be attached to one course selection.

**Validation Rules**

- `constraintType` is required.
- `constraintValue` must match the supported options for the selected term and builder.

## Schedule Option

**Description**: One feasible schedule candidate generated from selected courses and constraints.

**Fields**

- `scheduleOptionId`: Unique identifier for one generated option.
- `selectionId`: Owning course-selection request.
- `includedSections`: The selected sections included in the option.
- `meetingBlocks`: Days and times for all included sections.
- `generationState`: Indicates whether the option belongs to a feasible result set.

**Relationships**

- Many schedule options can belong to one course selection.

**Validation Rules**

- A feasible option must contain no overlapping meeting blocks among included sections.
- A feasible option must satisfy all supported selected constraints.
- `includedSections` must only reference sections available in the chosen term.

## Unschedulable Course Notice

**Description**: A user-visible notice that one or more selected courses cannot be scheduled because no sections are available.

**Fields**

- `noticeId`: Unique identifier for the notice.
- `selectionId`: Owning course-selection request.
- `unschedulableCourseIds`: Set of selected courses with no available sections.
- `continuationAllowed`: Whether generation may proceed with remaining courses.

**Relationships**

- One course selection can produce one or more notices about unschedulable courses.

**Validation Rules**

- `unschedulableCourseIds` must not be empty when the notice exists.
- `continuationAllowed` must be true only when at least one remaining selected course is schedulable.

## Schedule Generation Result

**Description**: The user-visible outcome of one schedule-generation request.

**Fields**

- `resultState`: One of `feasible`, `partial-continuation`, `no-feasible-schedule`, `retrieval-failure`, or `invalid-input`.
- `selectionId`: Owning course-selection request.
- `scheduleOptionIds`: Generated schedule options when feasible.
- `guidanceMessage`: Recovery or correction guidance shown to the student.
- `errorMessage`: Error detail shown only for retrieval failure.

**State Transitions**

- Request start -> `invalid-input` when course selection or term data is incomplete or invalid.
- Request start -> `retrieval-failure` when catalog or timetable data cannot be retrieved.
- Request start -> `partial-continuation` when some selected courses are unschedulable but generation can continue.
- Request start -> `no-feasible-schedule` when all required data is available but no schedule satisfies the selected courses and constraints.
- Request start -> `feasible` when one or more valid schedule options are produced.

**Validation Rules**

- `scheduleOptionIds` must be empty for `invalid-input`, `retrieval-failure`, and `no-feasible-schedule`.
- `guidanceMessage` is required for `partial-continuation`, `no-feasible-schedule`, and `invalid-input`.
- `errorMessage` is required for `retrieval-failure`.
