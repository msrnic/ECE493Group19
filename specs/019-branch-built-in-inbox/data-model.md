# Data Model: UC-19 Receive Notifications in a Built-in Inbox

## Student

- Fields: student id, account status, authentication state
- Relationships: owns inbox notifications and has one inbox access status

## Academic Event

- Fields: event id, event category, affected student id, event timestamp, source status
- Relationships: can trigger one inbox notification for a student unless deduplicated

## Notification Identity

- Fields: student id, upstream event id, deduplication key
- Relationships: constrains whether a new inbox notification should be created for an event

## Inbox Notification

- Fields: notification id, student id, event id, notification status, created time, available time when delivered
- Relationships: references one student and one academic event; can have many delivery attempt records

## Delivery Attempt Record

- Fields: attempt id, notification id, attempt time, attempt outcome, retry eligibility, failure reason when applicable
- Relationships: references one inbox notification

## Inbox Access Status

- Fields: student id, access state, restriction reason when applicable, status-display eligibility
- Relationships: constrains whether an inbox notification is delivered immediately or stored for later viewing

## State Transitions

- Generated -> Delivered
- Generated -> Delivery Failed
- Delivery Failed -> Retrying
- Retrying -> Delivered
- Generated -> Stored for Later Viewing
- Stored for Later Viewing -> Delivered
