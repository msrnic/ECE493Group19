# Acceptance Test Suite — UC-19: Receive notifications in a built-in inbox

This acceptance test suite validates **UC-19: Receive notifications in a built-in inbox**. fileciteturn3file0L1-L35  
Formatting is intentionally aligned to the UC-18 use-case style (success/failure end conditions, preconditions, main scenario + extensions). fileciteturn3file1L10-L38

---

## Success End Condition
* Notification is available in the student’s built-in inbox. fileciteturn3file0L10-L12

## Failed End Condition
* No changes are applied and the system state remains consistent. fileciteturn3file0L13-L15

## Preconditions
* The system is online. fileciteturn3file0L16-L18
* The student has a valid account. fileciteturn3file0L16-L19

---

## Test data and general setup (applies to all tests)
* **Students**
  * **Student A**: valid account, inbox access enabled.
  * **Student B**: valid account, inbox access disabled/restricted (via feature flag, preference, or policy control).
* **Relevant event types** (as listed in the use case): fileciteturn3file0L20-L24
  * **E1**: Course update event affecting the student.
  * **E2**: Grade update event affecting the student.
  * **E3**: Academic standing change affecting the student.
* **Observability**
  * Ability to view the student inbox UI.
  * Ability to inspect delivery logs (for retry/logging checks in Extension 3a). fileciteturn3file0L26-L30

---

## Main Success Scenario
Use case steps: (1) relevant event occurs → (2) notification generated → (3) delivered to inbox → (4) student views it. fileciteturn3file0L20-L25

### Acceptance tests

1. **AT-19-01: Notification is generated and delivered for a relevant event (parameterized by event type)**
   * **Preconditions**
     * System online.
     * Student A has a valid account and inbox access enabled.
   * **Steps**
     1. Trigger **E1** (course update) for Student A.
     2. Observe the system generates a notification addressed to Student A.
     3. Open Student A’s built-in inbox.
     4. Verify the new notification appears in the inbox list.
     5. Open the notification and verify its content indicates **E1** (course update context).
     6. Repeat Steps 1–5 for **E2** (grade update) and **E3** (academic standing change).
   * **Expected results**
     * For each event type (**E1–E3**), a corresponding notification is generated and delivered to Student A’s built-in inbox. fileciteturn3file0L20-L24
     * Student A can open the inbox and view the delivered notification. fileciteturn3file0L23-L25

2. **AT-19-02: Inbox view shows the newly delivered notification without requiring a full logout/login**
   * **Preconditions**
     * Student A is signed in and has the inbox open (or navigates to it).
   * **Steps**
     1. Trigger any relevant event (pick one of **E1–E3**) for Student A.
     2. Refresh the inbox view (or navigate away and back) using the standard UI interaction.
     3. Open the newly arrived notification.
   * **Expected results**
     * The delivered notification becomes visible via normal inbox usage and can be opened. fileciteturn3file0L23-L25

---

## Extensions

### **3a**: Delivery fails. fileciteturn3file0L26-L29
#### 3a1: System retries delivery and logs the failure. fileciteturn3file0L27-L29

1. **AT-19-03: Delivery failure triggers retry attempts and failure is logged**
   * **Preconditions**
     * Student A has inbox access enabled.
     * Ability to simulate notification delivery failure (e.g., Notification Service unavailable, inbox storage API returns error).
   * **Steps**
     1. Configure the delivery path to fail for Student A (simulate Notification Service failure).
     2. Trigger a relevant event (**E1**, **E2**, or **E3**) for Student A.
     3. Verify the system attempts to deliver the notification and detects failure.
     4. Verify retry behavior occurs (at least one retry attempt).
     5. Inspect logs/telemetry for a recorded failure entry tied to the notification delivery attempt.
     6. Restore the delivery path to healthy.
   * **Expected results**
     * The system retries delivery after failure and logs the failure. fileciteturn3file0L27-L29
     * The system state remains consistent (no corrupted/partial inbox state visible to the user). fileciteturn3file0L13-L15

2. **AT-19-04: After recovery, a retried notification is eventually available in the inbox**
   * **Preconditions**
     * Continuation of AT-19-03 (or an equivalent setup) with at least one failed delivery attempt and retries enabled.
   * **Steps**
     1. After restoring the delivery path, wait for the next retry cycle (or manually trigger retry, if supported in test environment).
     2. Open Student A’s built-in inbox.
   * **Expected results**
     * The notification becomes available in the inbox after successful retry (meeting the success end condition). fileciteturn3file0L10-L12

---

### **4a**: Student has disabled or restricted inbox access. fileciteturn3file0L29-L31
#### 4a1: System stores notification for later viewing and shows status when possible. fileciteturn3file0L29-L31

1. **AT-19-05: Restricted inbox access causes notification to be stored for later viewing**
   * **Preconditions**
     * Student B has a valid account.
     * Student B’s inbox access is disabled/restricted.
   * **Steps**
     1. Trigger a relevant event (**E1**, **E2**, or **E3**) for Student B.
     2. Verify the system generates a notification addressed to Student B.
     3. Attempt to open Student B’s inbox (or navigate to the inbox page).
     4. Inspect system state (admin/test harness) to confirm the notification is stored for Student B.
   * **Expected results**
     * The system stores the notification for later viewing for Student B. fileciteturn3file0L29-L31
     * If the UI can present any feedback, it shows an appropriate status/indicator when possible (e.g., “inbox disabled” / “restricted access”). fileciteturn3file0L29-L31

2. **AT-19-06: When access is re-enabled, stored notifications become viewable**
   * **Preconditions**
     * Student B has at least one stored notification created while inbox access was restricted (from AT-19-05).
   * **Steps**
     1. Re-enable Student B’s inbox access (remove restriction).
     2. Student B opens the built-in inbox.
     3. Open the stored notification.
   * **Expected results**
     * Previously stored notifications are available and viewable once inbox access is enabled again (meeting the success end condition). fileciteturn3file0L10-L12

---

## Coverage checklist (traceability to UC-19)
* Main Success Scenario steps 1–4 covered by: **AT-19-01**, **AT-19-02**. fileciteturn3file0L20-L25
* Extension **3a / 3a1** covered by: **AT-19-03**, **AT-19-04**. fileciteturn3file0L26-L29
* Extension **4a / 4a1** covered by: **AT-19-05**, **AT-19-06**. fileciteturn3file0L29-L31
