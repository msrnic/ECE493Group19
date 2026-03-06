# UC-33 Acceptance Test Suite — View Basic Student Information

## Coverage Map
- Main Success Scenario
- Extension 2a: Data unavailable or incomplete
- Extension 2b: Unauthorized access

## AT-UC33-01 — View student information
Preconditions: Authenticated professor; system online
Steps:
1. Log in as assigned professor.
2. Navigate to student information page.
3. Select student.
Expected Results:
- System retrieves and displays name, student ID, and program.
- Information formatted with appropriate access controls.

## AT-UC33-02 — Data unavailable or incomplete
Steps:
1. Simulate partial student record.
2. Request information.
Expected Results:
- System displays available information.
- Missing fields clearly indicated.

## AT-UC33-03 — Unauthorized access
Steps:
1. Attempt to access student outside authorized course offering.
Expected Results:
- System denies access.
- Authorization failure logged.
- No state changes occur.
