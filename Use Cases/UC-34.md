# Use Case UC-34: Enter final grades for students,

**Goal in Context**: enter final grades for students,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Professor
**Secondary Actors**: Academic Records Service
**Trigger**: Professor selects 'Enter final grades for students,' in the application.

## Success End Condition
* Final grades are recorded for the course offering.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The professor has a valid account.
* The professor is assigned to the course offering.

## Main Success Scenario
1. Professor opens the course offering’s grade entry page.
2. System displays the roster of enrolled students.
3. Professor enters final grades for students.
4. System validates grade formats and saves as 'draft' or 'submitted' per configuration.
5. System confirms that grades were recorded.

## Extensions
* **3a**: Professor enters an invalid grade value.
    * 3a1: System highlights the error and prevents submission for that entry.
* **4a**: Save fails.
    * 4a1: System does not apply changes and informs professor.

## Related Information
* **Priority**: High
* **Frequency**: Weekly
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
