# UI Contract: UC-25 Enroll All

## Route

- `POST /enroll-all/:scheduleOptionId`

Purpose: Submit batch enrollment for one selected schedule option owned by the authenticated student and render the final enrollment outcome.

## Controller Inputs

- Authenticated student session
- `scheduleOptionId` path parameter
- Active enrollment-period context
- Enrollment-policy context indicating whether atomic enrollment policy is enabled

## View States

### `success`

Required view data:
- Selected schedule option summary
- Per-section results showing all sections enrolled
- Final summary message confirming successful batch enrollment

### `partial_success`

Required view data:
- Selected schedule option summary
- Per-section results showing enrolled and failed sections
- Explicit reason for each rejected or blocked section
- Message that partial success occurred under the default partial-success policy

### `atomic_cancelled`

Required view data:
- Selected schedule option summary
- Failing section and reason
- Message that the full batch was cancelled because atomic enrollment policy was enabled
- Confirmation that student enrollment state is unchanged

### `failure`

Required view data:
- Selected schedule option summary when safe to display
- Message that the batch failed because of a system error or unrecoverable consistency condition
- Confirmation that a consistent final state was preserved or restored

## Controller Responsibilities

- Verify the selected schedule option belongs to the authenticated student.
- Load selected sections, eligibility inputs, and policy mode from SQLite-backed models.
- Invoke the batch-enrollment service once per Enroll All request.
- Select exactly one final view state.
- Pass only display-ready section outcomes and summary data to the view.

## Model Responsibilities

- Persist account, course, selected schedule option, and enrollment data in SQLite.
- Provide eligibility, capacity, and linked-section inputs needed by the service.

## View Responsibilities

- Render summary, per-section outcome, and policy-specific messaging.
- Keep enrollment state explanations explicit and user-readable.
- Follow the HTML/CSS and JavaScript style guides required by the constitution.

## Acceptance Traceability

- `AT-UC25-01` -> `success`
- `AT-UC25-02` -> `partial_success`
- `AT-UC25-03` -> `partial_success`
- `AT-UC25-04` -> `partial_success`
- `AT-UC25-05` -> `failure`
- `AT-UC25-06` -> `atomic_cancelled`
