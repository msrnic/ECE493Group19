# Data Model: Time Limit for Dropping from a Class (UC-15)

## Entity: DropDeadlineRule
- Fields: ruleId, termCode, cutoffTimestamp, timezoneId, status, updatedAt
- Relationships: belongs to one TermCalendar
- Validation:
  - cutoffTimestamp required
  - timezoneId required

## Entity: DeadlineEvaluationResult
- Fields: evaluationId, studentId, termCode, evaluatedAt, decision,
  rationaleCode, cutoffTimestampUsed
- Relationships: references one DropDeadlineRule
- Validation:
  - decision in {ALLOWED, BLOCKED, ERROR}
  - cutoffTimestampUsed must match referenced rule

## Entity: TermCalendar
- Fields: termCode, termName, startDate, endDate
- Relationships: has one or more DropDeadlineRule entries
- Validation:
  - termCode unique

## Entity: DropAttemptAudit
- Fields: auditId, studentId, offeringId, attemptedAt, decision,
  evaluationId, messageKey
- Relationships: references one DeadlineEvaluationResult
- Validation:
  - decision in {ALLOWED, BLOCKED, ERROR}
