# Use Case UC-35: Update the final grade before the submission deadline,

**Goal in Context**: update the final grade before the submission deadline,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Professor
**Secondary Actors**: Database
**Trigger**: Professor selects 'Update the final grade before the submission deadline,' in the application.

## Success End Condition
* Final grades are updated (when before the deadline) and reflected in records.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The professor has a valid account.
* The professor is assigned to the course offering.

## Main Success Scenario
1. Professor opens previously entered final grades for a course offering.
2. System checks that the grade submission deadline has not passed.
3. Professor updates one or more final grades.
4. System validates changes and saves updated grades.
5. System confirms the updates.

## Extensions
* **2a**: Submission deadline has passed.
    * 2a1: System prevents edits and informs professor of next steps (e.g., grade change request).
* **4a**: Save fails.
    * 4a1: System leaves original grades unchanged and informs professor.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
