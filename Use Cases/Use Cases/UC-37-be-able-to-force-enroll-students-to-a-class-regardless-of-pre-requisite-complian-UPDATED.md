# Use Case UC-37: Be able to force enroll students to a class regardless of pre-requisite compliance,

**Goal in Context**: be able to force enroll students to a class regardless of pre-requisite compliance,.
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)
**Level**: User Goal
**Primary Actor**: Administrator
**Secondary Actors**: Course Catalog Service, Prerequisite/Rules Engine
**Trigger**: Administrator selects 'Be able to force enroll students to a class regardless of pre-requisite compliance,' in the application.

## Success End Condition
* Student is enrolled with an audit record of the administrative override.

## Failed End Condition
* No changes are applied and the system state remains consistent.

## Preconditions
* The system is online.
* The administrator is authenticated and authorized.

## Main Success Scenario
1. Administrator opens a course offering management page.
2. Administrator selects a student and chooses 'Force Enroll'.
3. System bypasses prerequisite checks but still checks hard constraints (e.g., identity, term validity).
4. System enrolls the student and updates schedule/capacity records.
5. System logs the override and confirms the forced enrollment.

## Extensions
* **2a**: Student or offering does not exist.
    * 2a1: System rejects the request.

* **3a**: Hard constraint fails during force enrollment.
    * 3a1: System detects a failed hard constraint (e.g., invalid identity, invalid term, inactive record).
    * 3a2: System rejects the request and provides an appropriate reason.

* **4a**: Enrollment fails due to system error.
    * 4a1: System leaves records unchanged and reports failure.

## Related Information
* **Priority**: High
* **Frequency**: Occasional
* **Open Issues**: TBD (e.g., specific policies, deadlines, and integration details).
