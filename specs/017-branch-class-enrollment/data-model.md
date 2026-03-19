# Data Model: UC-17 Enroll in Found Classes

## Student

- Fields: student id, authentication state, term access state, registration hold state
- Relationships: owns schedule entries and enrollment requests

## Class Offering

- Fields: class offering id, course identifier, schedule details, seat availability, prerequisite rules
- Relationships: can have many enrollment requests and schedule conflicts with student schedules

## Enrollment Request

- Fields: request id, student id, class offering id, submission time, outcome
- Relationships: references one student and one class offering

## Eligibility Check Result

- Fields: prerequisite result, hold result, schedule-conflict result, capacity result, final decision
- Relationships: produced from one student and one class offering

## Fee Assessment Change

- Fields: fee summary, fee delta, no-change indicator
- Relationships: attached to a successful enrollment outcome

## State Transitions

- Requested -> Blocked
- Requested -> Enrolled
- Requested -> Failed
