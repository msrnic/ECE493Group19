# Use Case UC-30: Re-generate schedules when a class becomes full

**Goal in Context**: As a student, I want the system to re-generate schedules when a class becomes full, so that I can quickly select a different viable option.
**Scope**: University Student Information System (Registration & Schedule Builder)
**Level**: User Goal
**Primary Actor**: Student
**Secondary Actors**: Enrollment Service, Schedule Generator Service
**Trigger**: A chosen schedule becomes invalid due to a class filling; student requests re-generation.

## Success End Condition
* System produces updated schedule options that remain viable given current section capacities.

## Failed End Condition
* No changes are applied (or any partial work is rolled back) and the system state remains consistent.

## Preconditions
* Student is authenticated.
* Registration/scheduling term is available.
* Course catalog data is available for the selected term.

## Main Success Scenario
1. Student selects a schedule option (or is viewing saved options).
2. System detects a section in the option is now full (or enrollment fails due to capacity).
3. Student chooses “Re-generate schedules” (or accepts the prompt).
4. System re-runs schedule generation excluding full/invalid sections (or deprioritizing them).
5. System displays new viable schedule options.

## Extensions
* **2a**: No alternative schedules exist after re-generation.
    * 2a1: System informs the student and suggests changing courses/constraints or joining a waitlist.
* **4a**: Real-time capacity data is unavailable.
    * 4a1: System warns that viability cannot be guaranteed and suggests retrying later.
* **5a**: System error occurs during re-generation.
    * 5a1: System reports failure and leaves prior results unchanged.

## Related Information
* **Priority**: Medium
* **Frequency**: Occasional to Frequent during peak registration
* **Open Issues**: Trigger definition (what counts as full), automatic vs. manual re-generation.
