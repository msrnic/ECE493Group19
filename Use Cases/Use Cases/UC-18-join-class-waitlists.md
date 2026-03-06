# Use Case UC-18: Join class waitlists

**Goal in Context**: As a student, I want to be able to join class waitlists for full classes, so that I can enroll directly in the event of an opening in the class.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Enrollment Service, Waitlist Service, Notification Service
**Trigger**: Student attempts to enroll in a class section that is full and selects “Join Waitlist”.

## Success End Condition
* Student is added to the waitlist for the class section (with a waitlist position if applicable).
* System records the waitlist entry and any required preferences (if applicable).

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Student has access to the registration term.
* Target class section exists and is waitlist-eligible.

## Main Success Scenario
1. Student searches for and selects the desired course section.
2. System displays current seat availability and indicates the section is full.
3. Student selects “Join Waitlist.”
4. System validates eligibility (e.g., term rules, holds, duplicate waitlist/enrollment).
5. System adds the student to the waitlist and assigns a position (if applicable).
6. System confirms the waitlist enrollment and displays the student’s status/position.

## Extensions
* **3a**: Section is not waitlist-eligible (e.g., waitlist disabled).
    * 3a1: System informs the student the section cannot be waitlisted and offers alternatives (other sections/courses).
* **4a**: Student is already enrolled or already waitlisted for the same course/section.
    * 4a1: System prevents duplication and informs the student of the existing status.
* **4b**: Student is ineligible to waitlist (e.g., registration hold, term closed).
    * 4b1: System rejects the request and displays the reason and next steps.
* **5a**: System cannot record the waitlist entry (e.g., service/database error).
    * 5a1: System reports failure and no waitlist entry is created.

## Related Information
* **Priority**: High
* **Frequency**: Occasional to Frequent during registration periods
* **Open Issues**: Waitlist rules (auto-enroll vs. offer/accept), maximum waitlists per student, notifications timing.
