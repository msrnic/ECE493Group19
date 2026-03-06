# Use Case UC-38: Be able to force students to withdraw from a class

**Goal in Context**: Force a student to withdraw from a class so that any student taking a class illegally can be removed.  
**Scope**: University Student Information System (Enrollment, Fees, Grades, Notifications)  
**Level**: User Goal  
**Primary Actor**: Administrator  
**Secondary Actors**: Database  
**Trigger**: Administrator selects “Force Withdraw” for a student in a course offering within the application.

---

## Success End Condition
* The student is withdrawn from the class offering.
* The system updates the student’s schedule and enrollment records.
* An audit record of the administrative action is stored.

---

## Failed End Condition
* No changes are applied and the system state remains consistent.

---

## Preconditions
* The system is online.
* The administrator is authenticated and authorized.
* The target student and course offering exist in the system.

---

## Main Success Scenario
1. Administrator opens course enrollment administration (e.g., course offering management or student enrollment record).
2. Administrator selects the target course offering and the target student.
3. Administrator chooses **“Force Withdraw.”**
4. System displays withdrawal implications (e.g., transcript notation, fee impact) and requests confirmation (and optionally a reason).
5. Administrator confirms the forced withdrawal.
6. System updates the student’s enrollment and schedule records.
7. System logs the administrative action for audit purposes.
8. System confirms successful completion to the administrator.

---

## Extensions

* **3a**: Student is not currently enrolled in the class.
    * 3a1: System detects that the student is not enrolled.
    * 3a2: System rejects the request and informs the administrator.
    * 3a3: No changes are applied.

* **4a**: Administrator cancels the forced withdrawal.
    * 4a1: Administrator cancels the confirmation.
    * 4a2: System leaves enrollment and schedule unchanged.

* **6a**: System cannot process withdrawal (e.g., database error, timeout).
    * 6a1: System fails during the update operation.
    * 6a2: System rolls back any partial changes.
    * 6a3: System informs the administrator of the failure.
    * 6a4: Enrollment and schedule remain unchanged.

---

## Related Information
* **Priority**: High  
* **Frequency**: Occasional  
* **Open Issues**: TBD (e.g., transcript notation rules, fee recalculation policies, audit log retention policies).
