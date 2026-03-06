# Acceptance Test Suite — UC-42: Send Notifications to Students’ Inboxes

## Scope

Validate that an **Administrator** can send notifications to students’ in-app inboxes, and that the system correctly handles all documented alternate/exception flows:
- Main success (send + log delivery)
- Extension **2a** (invalid/empty recipient selection)
- Extension **4a** (partial delivery failure with reporting and retry)

This suite is a **design** (non-executable) and focuses on covering every documented flow in the UC-42 use case and scenario set.

---

## Assumptions / Test Data (Design-Level)

- **Administrator AdminA**: authenticated; authorized to send notifications.
- **Students**:
  - **S1, S2, S3**: valid student accounts with accessible in-app inboxes.
  - **Group G_INVALID**: invalid/non-existent group/roster identifier for negative testing.
- **Message M1**: valid message content within any size/format constraints (e.g., subject + body).
- Environment supports:
  - Viewing student inbox contents to confirm message receipt.
  - Viewing an admin-facing delivery log/status list per recipient (or equivalent confirmation).
  - Simulating partial delivery failure for one or more recipients (e.g., inbox service failure for S3).
  - Retrying delivery to failed recipients (if supported by UI/API).

---

## Test Cases

### AT-UC42-01 — Send Notification to Selected Students (Main Success)

**Flow covered:** Main success scenario

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- At least one valid recipient is selectable (S1, S2).
- Notification service is functioning normally.

**Steps:**
1. Log in as AdminA.
2. Open the **Notifications** tool.
3. Select recipients **S1** and **S2** (or select a valid roster/group containing them).
4. Compose message **M1**.
5. Select **Send**.
6. Verify the system confirms send completion.
7. Verify **S1** and **S2** each have **M1** in their in-app inbox.
8. Verify the delivery status/log indicates successful delivery for S1 and S2.

**Expected Results:**
- System validates permissions and message constraints.
- Message is delivered to each selected student inbox.
- Delivery is logged per recipient.
- System confirms successful completion to AdminA.

---

### AT-UC42-02 — Recipient Selection Invalid/Empty → Correct and Send (Extension 2a)

**Flow covered:** Extension 2a

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.

**Steps (Empty Selection):**
1. Log in as AdminA.
2. Open the **Notifications** tool.
3. Leave recipients empty.
4. Compose message **M1** (if required) and select **Send**.

**Expected Results (Empty Selection):**
- System detects recipient selection is empty.
- System blocks sending and prompts AdminA to correct the recipient list.
- No messages are delivered and no delivery log entries are created.

**Steps (Invalid Selection):**
5. Select an invalid target (e.g., **G_INVALID** roster/group) and select **Send**.

**Expected Results (Invalid Selection):**
- System detects the target selection is invalid/not found.
- System blocks sending and prompts AdminA to correct the recipient list.
- No messages are delivered and no delivery log entries are created.

**Steps (Correction and Success):**
6. Update recipients to a valid set (e.g., **S1** and **S2**).
7. Select **Send**.
8. Verify message delivery and logging as in AT-UC42-01.

**Expected Results (After Correction):**
- No message is sent until recipients are valid.
- After correction, message is delivered and logged successfully.

---

### AT-UC42-03 — Partial Delivery Failure + Retry Failed Recipients (Extension 4a)

**Flow covered:** Extension 4a

**Preconditions:**
- System is online.
- AdminA is authenticated and authorized.
- Valid recipients selected: **S1, S2, S3**.
- Fault injection enabled so delivery to **S3** fails (but S1/S2 succeed).

**Steps:**
1. Enable fault condition so S3 delivery will fail.
2. Log in as AdminA.
3. Open the **Notifications** tool.
4. Select recipients **S1, S2, S3**.
5. Compose message **M1** and select **Send**.
6. Verify the system reports **partial success** and identifies failed recipients.
7. Verify **S1** and **S2** received **M1** in their inboxes.
8. Verify **S3** did not receive **M1**.
9. Verify delivery log shows per-recipient outcomes (S1/S2 success, S3 failure).
10. Disable the fault condition.
11. Use **Retry** (or equivalent) to re-send to failed recipients only (S3).
12. Verify retry outcome, inbox contents, and delivery log updates for S3.

**Expected Results:**
- System completes delivery for reachable recipients and logs outcomes per recipient.
- System reports partial success and provides a retry option for failures.
- Retry sends only to failed recipients, without duplicating messages for successful recipients.
- Delivery log reflects both the initial failure and subsequent success (or final status).

---

## Coverage Summary

This acceptance test suite covers every documented UC-42 flow:
- **Main success:** send + deliver to inbox + log delivery.
- **Extension 2a:** invalid/empty recipient selection → blocked until corrected.
- **Extension 4a:** partial delivery failure → partial success reported + retry supported.

All documented flows are addressed.
