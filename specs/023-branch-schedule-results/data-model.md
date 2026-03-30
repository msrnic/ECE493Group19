# Data Model: UC-23 Request Multiple Schedule Results

## Student Account

**Description**: The authenticated student identity requesting ranked schedule results.

**Fields**

- `studentId`: Unique institutional identifier for the student.
- `accountId`: Unique application account identifier bound to the student.
- `displayName`: Student-facing name shown in planning context.
- `isAuthenticated`: Whether the current session is authenticated.

**Relationships**

- One student account can create many schedule result requests.

**Validation Rules**

- `studentId` and `accountId` are required and unique.
- Ranked schedule generation is permitted only for authenticated sessions.

## Planning Term

**Description**: The academic term for which ranked schedule results are requested.

**Fields**

- `termId`: Unique identifier for the scheduling term.
- `termLabel`: Human-readable term name.
- `isAvailableForScheduling`: Whether the term is available for schedule generation.

**Relationships**

- One planning term can be referenced by many schedule result requests and ranked schedule options.

**Validation Rules**

- `termId` and `termLabel` are required.
- Ranked schedule generation requires `isAvailableForScheduling` to be true.

## Schedule Result Request

**Description**: The student’s request for ranked schedule alternatives.

**Fields**

- `requestId`: Unique identifier for one multi-result scheduling request.
- `studentId`: Owning student identifier.
- `termId`: Selected scheduling term.
- `selectedCourseIds`: Set of chosen course identifiers.
- `requestedResultCount`: Requested number of ranked schedule options.
- `effectiveResultCount`: The validated count used for generation after capping.

**Relationships**

- One schedule result request belongs to one student account and one planning term.
- One schedule result request can produce zero or more ranked schedule options.
- One schedule result request produces one generation-limit outcome.

**Validation Rules**

- `studentId`, `termId`, and at least one selected course are required.
- `selectedCourseIds` must be unique within one request.
- `requestedResultCount` must be an integer from 1 to 10.
- `effectiveResultCount` must equal `requestedResultCount` unless the request is capped at 10.

## Ranked Schedule Option

**Description**: One feasible schedule alternative returned in the ordered result set.

**Fields**

- `scheduleOptionId`: Unique identifier for one ranked option.
- `requestId`: Owning schedule result request.
- `rankPosition`: Order of the option in the returned result set.
- `includedSections`: The sections included in the option.
- `meetingBlocks`: Days and times for all included sections.
- `isPartialSet`: Whether the option belongs to a partial timeout result set.

**Relationships**

- Many ranked schedule options can belong to one schedule result request.

**Validation Rules**

- `rankPosition` must be unique within one request result set.
- A ranked option must contain no overlapping meeting blocks.
- A ranked option must reference only sections available in the chosen term.
- Returned options must be distinct within a request result set.

## Generation Limit Outcome

**Description**: The user-visible result metadata describing count capping, reduced counts, timeout behavior, or blocked generation.

**Fields**

- `outcomeId`: Unique identifier for the request outcome.
- `requestId`: Owning schedule result request.
- `resultState`: One of `ranked-success`, `capped-success`, `reduced-success`, `partial-timeout`, `timeout-failure`, `invalid-input`, `blocked-auth`, or `blocked-data-unavailable`.
- `requestedResultCount`: Original student-entered count.
- `returnedResultCount`: Number of ranked schedule options returned.
- `guidanceMessage`: Recovery or explanatory message shown to the student.

**State Transitions**

- Request start -> `invalid-input` when the requested result count is not an integer from 1 to 10.
- Request start -> `blocked-auth` when the student is not authenticated.
- Request start -> `blocked-data-unavailable` when the term or required catalog data is unavailable.
- Request start -> `ranked-success` when feasible schedules meet the requested count.
- Request start -> `capped-success` when the request exceeds 10 but generation succeeds after capping.
- Request start -> `reduced-success` when fewer feasible schedules exist than requested.
- Request start -> `partial-timeout` when timeout occurs after at least one ranked result is found.
- Request start -> `timeout-failure` when timeout occurs before any ranked result is found.

**Validation Rules**

- `returnedResultCount` must be 0 for `invalid-input`, `blocked-auth`, `blocked-data-unavailable`, and `timeout-failure`.
- `guidanceMessage` is required for all non-plain-success states.
- `returnedResultCount` must not exceed `effectiveResultCount`.
