# Research: UC-28 Save and Name Constraint Sets

## Decision: Normalize names by trimming outer whitespace and comparing case-insensitively within the same student and term

Rationale: This prevents visually duplicate saved sets such as `Work Term`, ` work term `, and `WORK TERM` while preserving the exact user-facing name last accepted for display.

Alternatives considered:
- Compare names exactly as entered: rejected because it would allow confusing duplicates that differ only by case or outer spacing.
- Normalize all internal whitespace: rejected because it changes more of the student-entered name than the specification requires.

## Decision: Allow letters, numbers, spaces, hyphens, apostrophes, and parentheses, with a 50-character maximum after trimming

Rationale: This supports common human-friendly schedule labels such as `Work Term`, `Winter Commute`, and `Lab-heavy (Tue/Thu)` while keeping validation rules testable and predictable.

Alternatives considered:
- Allow any printable character: rejected because it expands ambiguity and complicates validation messaging.
- Restrict to alphanumeric characters only: rejected because it blocks normal readable labels students are likely to use.

## Decision: Duplicate-name saves require explicit overwrite confirmation and replace the full stored set for that normalized name

Rationale: Explicit overwrite is the safest default because it prevents accidental data loss while still keeping the saved-set list unique and manageable.

Alternatives considered:
- Auto-overwrite on duplicate name: rejected because it risks unintentional replacement without clear consent.
- Always reject duplicates without overwrite: rejected because it adds friction and conflicts with the UC extension that allows overwrite per policy.

## Decision: Save, rename, overwrite, and delete failures leave previously saved sets unchanged

Rationale: Failure-safe persistence preserves trust in the saved-set list and aligns with the UC failed end condition requiring a consistent system state.

Alternatives considered:
- Allow partial updates when one step succeeds: rejected because it would create inconsistent saved-set state and unclear recovery behavior.
- Remove failed draft state entirely: rejected because the spec only requires preserving stored data, not discarding the student's visible input session.

## Decision: Stale-session protection should block silent overwrite or restore of newer saved-set data

Rationale: Concurrent sessions can otherwise reintroduce deleted or renamed sets without the student realizing another session changed the saved-set list first.

Alternatives considered:
- Last write wins: rejected because it silently discards newer saved-set management actions.
- Lock the entire saved-set list for one session: rejected because it adds unnecessary operational friction for this feature scope.
