# Use Case UC-28: Save and name constraint sets

**Goal in Context**: As a student, I want to save and name my constraint sets (e., “Work term”, “Winter commute”), so that I can reuse them later.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: User Profile/Preferences Service
**Trigger**: Student chooses “Save constraint set” and provides a name.

## Success End Condition
* Constraint set is saved under a user-defined name and can be reloaded later.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student configures constraints in the constraints editor.
2. Student selects “Save constraint set.”
3. Student provides a name for the set (e.g., “Work term”).
4. System validates the name and saves the constraint set to the student’s profile.
5. System confirms the saved constraint set is available for reuse.

## Extensions
* **3a**: Name is invalid or missing (e.g., empty, too long).
    * 3a1: System rejects the name and requests correction.
* **3b**: Name conflicts with an existing saved set.
    * 3b1: System asks the student to rename or confirm overwrite (per policy).
* **4a**: System cannot save the constraint set (e.g., service/database error).
    * 4a1: System reports failure and does not persist the set.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional
* **Open Issues**: Overwrite policy, naming rules, max saved sets.
