# Research: Withdraw from a Class (UC-14)

## Decision 1: Confirmation and Implications
- Decision: Require implication summary (transcript + fee impact) before final
  confirm action.
- Rationale: Aligns with UC-14 main scenario and reduces accidental withdrawals.
- Alternatives considered: Direct one-click withdrawal; implication preview only
  after submission.

## Decision 2: Policy Boundary with UC-15
- Decision: Keep UC-14 focused on executing withdrawal once action is allowed;
  deadline gating evaluated by UC-15 logic.
- Rationale: Prevents duplicated policy logic and keeps use-case responsibilities
  separated.
- Alternatives considered: Duplicate deadline checks within UC-14 workflow.

## Decision 3: Concurrency and Idempotency
- Decision: Re-validate enrollment at confirmation time and use idempotency key
  to avoid duplicate withdrawal processing.
- Rationale: Protects consistency under double-submit and concurrent changes.
- Alternatives considered: First-write-wins without revalidation; no idempotency.

## Decision 4: Failure Handling
- Decision: On processing failure, preserve enrollment state and provide clear
  retry-safe feedback.
- Rationale: Required by UC-14 extension 5a and failed end condition.
- Alternatives considered: Partial updates with later reconciliation.
