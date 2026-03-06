# Use Case UC-39: Add/delete course offerings

**Goal in Context**: add/delete course offerings.  
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)  
**Level**: User Goal  
**Primary Actor**: Administrator  
**Secondary Actors**: Database  
**Trigger**: Administrator selects 'Add/delete course offerings' in the application.

---

## Success End Condition
* Course offerings are updated and reflected in the catalog.

---

## Failed End Condition
* No changes are applied and the system state remains consistent.

---

## Preconditions
* The system is online.
* The administrator is authenticated and authorized.

---

## Main Success Scenario
1. Administrator opens course offerings administration.
2. Administrator chooses to add a new offering or delete an existing offering.
3. System validates offering details and constraints (term, instructor, capacity, schedule).
4. System saves the change and updates the catalog.
5. System logs the change and confirms completion.

---

## Extensions

* **2a**: Administrator attempts to delete an offering with active enrollments.  
    * 2a1: System checks enrollment status and detects active enrollments.  
    * 2a2: System blocks deletion or requires a special workflow per policy.  
    * 2a3: No changes are applied.

* **3a**: Invalid offering data (when adding or editing details).  
    * 3a1: System validates input and detects invalid or missing data.  
    * 3a2: System highlights errors and requests correction.  
    * 3a3: Administrator corrects data and resubmits.  
    * 3a4: System validates successfully and proceeds with the main success flow.

* **4a**: System error occurs during add/delete operation.  
    * 4a1: System validates input successfully.  
    * 4a2: System encounters a database/service error while saving or deleting.  
    * 4a3: System rolls back any partial changes.  
    * 4a4: System reports failure to the administrator.  
    * 4a5: No offering is partially created or deleted.

* **5a**: Administrator cancels add/delete action.  
    * 5a1: Administrator selects cancel before submitting a new offering.  
    * 5a2: System discards entered data and returns to the previous view.  
    * 5a3: OR Administrator cancels deletion at confirmation prompt.  
    * 5a4: System aborts deletion and leaves the offering unchanged.  

---

## Related Information
* **Priority**: Medium  
* **Frequency**: Occasional  
* **Open Issues**: TBD (e.g., specific policies, deadlines, integration details, rollback behavior).
