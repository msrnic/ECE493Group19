# UI Contract: UC-16 Class Removal Workflow

## Purpose

Define the user-visible contract for removing a class under UC-16 so implementation and testing can verify the same workflow outcomes.

## Entry Conditions

- Student is authenticated.
- Student selects an enrolled class to remove.
- The system can access the relevant term and policy data unless a failure path is being tested.

## Inputs

| Input | Source | Rules |
|--------|--------|-------|
| `student_id` | Authenticated session | Must identify the acting student |
| `offering_id` | Removal form selection | Must refer to an active enrollment |
| `confirmation` | Removal confirmation action | Must be explicitly submitted before mutation |

## Decision Contract

| Condition | System Decision | User-Facing Result |
|--------|--------|-------|
| Request time is before `drop_deadline_at` | `drop` | Confirm class was dropped and show drop-related fee outcome |
| Request time is exactly `drop_deadline_at` | `withdrawal` | Confirm class was withdrawn and show withdrawal outcome |
| Request time is after `drop_deadline_at` | `withdrawal` | Confirm class was withdrawn and show withdrawal outcome |
| Policy lookup fails | `blocked` | Show error instructing student to seek administrative assistance or retry later |
| Persistence update fails after decision | `blocked` final result | Show failure message and leave schedule and fees unchanged |

## View Outputs

### Removal Form View

- Shows enrolled class details.
- Shows any relevant deadline context before confirmation.
- Requires an explicit confirmation action.

### Removal Result View

- Shows whether the action was processed as drop or withdrawal.
- Confirms the class is no longer on the student's schedule when successful.
- Displays the fee outcome summary tied to the applied policy.

### Removal Error View

- Explains why the removal could not be completed.
- States that no schedule or fee changes were applied.
- Directs the student to retry later or contact administrative staff when policy data is unavailable.

## Acceptance Mapping

- `AT-UC16-01`: before deadline -> drop applied
- `AT-UC16-02`: at or after deadline -> withdrawal applied
- `AT-UC16-03`: policy lookup failure -> blocked with guidance
- `AT-UC16-04`: update failure -> no partial changes
