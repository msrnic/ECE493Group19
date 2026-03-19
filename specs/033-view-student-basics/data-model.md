# Data Model: View basic student information (UC-33)

## Entity: RequestContext
- **Description**: Captures actor identity, role, selected term/offering, and filters/constraints.
- **Fields**: context_id, actor_id, actor_role, term_id, offering_id, requested_action, created_at.
- **Validation**: actor_role and requested_action must be from supported enums.

## Entity: DecisionResult
- **Description**: Result of evaluating the requested operation.
- **Fields**: result_id, context_id, outcome_status, message_key, completed_at.
- **Validation**: outcome_status in {success, alternate, blocked, error}.

## Entity: AuditEntry
- **Description**: Immutable log for traceability and troubleshooting.
- **Fields**: audit_id, context_id, outcome_status, source_component, created_at.
- **Validation**: append-only semantics; no updates after insert.

## Relationships
- RequestContext 1..* DecisionResult.
- RequestContext 1..* AuditEntry.

## State Notes
- Successful path transitions from requested -> evaluated -> presented.
- Error path transitions to error-presented without mutating protected records.
