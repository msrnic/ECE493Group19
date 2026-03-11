# Data Model: UC-18 Join Class Waitlists

## Student

- Fields: student id, authentication state, registration hold state, active-term access state
- Relationships: owns enrollment records and waitlist entries

## Class Section

- Fields: section id, course identifier, seat status, waitlist-enabled flag, registration-term context
- Relationships: can have many waitlist entries and enrollment records

## Waitlist Request

- Fields: request id, student id, section id, request time, final outcome
- Relationships: references one student and one class section

## Waitlist Entry

- Fields: waitlist entry id, student id, section id, waitlist status, assigned position when applicable
- Relationships: references one student and one class section

## Waitlist Eligibility Result

- Fields: waitlist-enabled result, term-access result, hold result, duplicate-status result, final decision
- Relationships: produced from one student and one class section

## Registration Term Access

- Fields: term identifier, student id, access state, closure reason when blocked
- Relationships: constrains whether a waitlist request can proceed

## State Transitions

- Requested -> Waitlisted
- Requested -> Blocked
- Requested -> Failed
