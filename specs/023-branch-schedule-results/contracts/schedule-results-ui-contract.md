# UI Contract: UC-23 Request Multiple Schedule Results

## Overview

This contract defines the user-visible schedule-results outcomes required for UC-23. It guides controller-to-view mapping, acceptance validation, and task decomposition.

## Shared Expectations

- Multi-result schedule generation is planning-only and never changes registration state.
- The student enters a requested result count from 1 to 10 before selecting `Generate Schedules`.
- Ranked results use one deterministic ordering policy for unchanged inputs and source data.
- All outcomes must be keyboard accessible and expose state messages in text.

## Outcome: Ranked Success

**Trigger**

- Valid request count, authenticated student, available scheduling data, and enough feasible schedules to satisfy the request.

**Required UI Elements**

- Ranked schedule options from position 1 through the returned count.
- Visible result count summary.
- Clear planning-only message.

**Forbidden UI Elements**

- Timeout warning text.
- Invalid-input or data-unavailable blocking messages.

## Outcome: Capped Success

**Trigger**

- Student requests more than 10 results and generation succeeds using the capped count of 10.

**Required UI Elements**

- Message explaining the request was capped at 10.
- Up to 10 ranked schedule options.
- Visible returned count summary.

**Forbidden UI Elements**

- Message implying the system ignored the student input silently.

## Outcome: Reduced Success

**Trigger**

- Student requests a valid count, but fewer feasible schedules exist than requested.

**Required UI Elements**

- Message explaining fewer schedules were available than requested.
- All feasible ranked schedule options found.

**Forbidden UI Elements**

- Message implying generation failed when feasible schedules are still shown.

## Outcome: Partial Timeout

**Trigger**

- Generation reaches a compute or time limit after at least one ranked schedule has been found.

**Required UI Elements**

- Ranked schedule options found before timeout.
- Warning that the result set is incomplete.
- Retry guidance encouraging narrower choices or a smaller request.

**Forbidden UI Elements**

- Presentation of the incomplete set as a complete ranked result.

## Outcome: Timeout Failure

**Trigger**

- Generation reaches a compute or time limit before any ranked schedule is found.

**Required UI Elements**

- Error message explaining no complete results are available.
- Retry guidance encouraging narrower choices or a smaller request.

**Forbidden UI Elements**

- Empty results shown as if they were a valid ranked set.

## Outcome: Invalid Input

**Trigger**

- Requested result count is blank, zero, negative, or non-numeric.

**Required UI Elements**

- Validation message stating that a positive integer from 1 to 10 is required.
- Opportunity to correct the request count before generation is retried.

**Forbidden UI Elements**

- Any generation attempt before the input is corrected.

## Outcome: Blocked Preconditions

**Trigger**

- Student is unauthenticated, scheduling term is unavailable, or required catalog data cannot be loaded.

**Required UI Elements**

- Authentication guidance for logged-out students, or availability guidance for unavailable data.
- No generation result list.

**Forbidden UI Elements**

- Any message suggesting schedule generation was attempted successfully.

## Acceptance Mapping

- `AT-UC23-01` -> Ranked success
- `AT-UC23-02` -> Capped success
- `AT-UC23-03`, `AT-UC23-04`, `AT-UC23-05` -> Invalid input
- `AT-UC23-06` -> Reduced success
- `AT-UC23-07` -> Partial timeout
- `AT-UC23-08` -> Timeout failure
- `AT-UC23-09`, `AT-UC23-10` -> Blocked preconditions
