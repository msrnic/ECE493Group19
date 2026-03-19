# Data Model: Withdraw from a Class (UC-14)

## Entity: EnrollmentRecord
- Fields: enrollmentId, studentId, offeringId, status, enrolledAt, withdrawnAt,
  withdrawalReasonCode
- Relationships: belongs to one StudentAccount and one ClassOffering
- Validation:
  - status in {ENROLLED, WITHDRAWN}
  - withdrawnAt required when status is WITHDRAWN

## Entity: WithdrawalRequest
- Fields: requestId, studentId, offeringId, implicationSnapshotId,
  idempotencyKey, requestedAt
- Relationships: references one EnrollmentRecord and one
  WithdrawalImplicationSummary
- Validation:
  - idempotencyKey required and unique per student/offering operation

## Entity: WithdrawalImplicationSummary
- Fields: implicationSnapshotId, transcriptNotationText, feeImpactText,
  generatedAt
- Relationships: linked to one WithdrawalRequest
- Validation:
  - transcriptNotationText required
  - feeImpactText required

## Entity: ScheduleViewModel
- Fields: studentId, enrolledOfferings, updatedAt
- Relationships: aggregates EnrollmentRecord entries for one student
- Validation:
  - must exclude offerings with status WITHDRAWN from enrolled view
