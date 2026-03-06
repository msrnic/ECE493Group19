# UC-35 Acceptance Test Suite — Update Final Grade Before Deadline

## Coverage Map
- Main Success Scenario
- Extension 2a: Deadline passed
- Extension 4a: Save failure
- Export grade summary (report generation + access control)

## AT-UC35-01 — Update grade before deadline
Preconditions: Authenticated professor; deadline not passed
Steps:
1. Open submitted grades.
2. Modify one or more grades.
3. Save changes.
Expected Results:
- Changes validated and saved.
- Confirmation displayed.

## AT-UC35-02 — Deadline passed
Steps:
1. Simulate deadline exceeded.
2. Attempt to edit grades.
Expected Results:
- System prevents edits.
- Informational message provided.
- No changes saved.

## AT-UC35-03 — Save failure
Steps:
1. Simulate database error.
2. Attempt to save update.
Expected Results:
- System reports failure.
- Original grades remain unchanged.

## AT-UC35-04 — Export grade summary
Preconditions: Authenticated professor; authorized to access the course offering; grades exist for the offering; system online
Steps:
1. Log in as professor.
2. Navigate to the course offering’s submitted grades / grade summary page.
3. Select “Export grade summary” (or equivalent export action).
4. Confirm the export request.
5. Verify a report file is generated and download begins (or a download link is provided).
6. Open the exported report and verify it contains the expected grade summary data (e.g., correct offering identifier/term, student identifiers, and final grades reflecting the current saved state).
7. Attempt the same export action with an unauthorized user (e.g., professor not assigned to the offering or a non-professor role).
Expected Results:
- System generates an export file successfully (e.g., PDF/CSV) and provides a valid download.
- Exported report contents are accurate and match the current saved grade data for the offering (no missing/extra students, correct final grades).
- If the user is not authorized to access the offering, export is denied and no file is generated or downloadable.
