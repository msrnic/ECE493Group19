# Quickstart: UC-21 View My Transcript

## Purpose

Validate the UC-21 transcript feature against the specification, acceptance suite, constitution constraints, and cross-cutting quality expectations.

## Prerequisites

- An authenticated student account with transcript access.
- Test data for full, partial, empty, unavailable, and denied transcript scenarios.
- Access to audit or security review output for denied-access verification.

## Validation Scenarios

### 1. Authorized Full Transcript View

1. Sign in as an authorized student with a complete transcript.
2. Select `View my transcript` from the dashboard.
3. Confirm the transcript is displayed grouped by academic term.
4. Confirm only the signed-in student's transcript entries are shown.
5. Confirm the transcript remains read-only.

### 2. Partial Transcript View

1. Sign in as an authorized student with simulated partial transcript data.
2. Open `View my transcript`.
3. Confirm available transcript entries are shown.
4. Confirm a page-level missing-data indicator is displayed.
5. Confirm the affected term or transcript entry is identified when known.

### 3. Empty Transcript View

1. Sign in as an authorized student with no transcript entries.
2. Open `View my transcript`.
3. Confirm a dedicated no-transcript-yet message is shown.
4. Confirm no transcript rows or placeholder entries are rendered.

### 4. Unavailable Transcript View

1. Sign in as an authorized student while transcript retrieval is fully unavailable.
2. Open `View my transcript`.
3. Confirm a distinct unavailable-state message is shown.
4. Confirm the result is not presented as either empty or partial transcript data.

### 5. Unauthorized Transcript Access

1. Sign in as an authenticated but unauthorized actor.
2. Attempt to access `View my transcript` or a direct transcript route.
3. Confirm transcript data is not displayed.
4. Confirm the denied-access message is shown.
5. Confirm an authorization failure record is created with requesting identity, attempted target identity when known, timestamp, and denial reason.

## Quality Checks

### Accessibility

- Verify all transcript states support keyboard-only navigation.
- Verify headings, missing-data indicators, and state messages are available in text for assistive technologies.

### Privacy

- Verify no transcript state exposes another student's transcript details.
- Verify denied and unavailable states reveal no transcript content.

### Performance

- Measure dashboard-to-transcript navigation for authorized users; confirm at least 95% complete within 30 seconds.
- Measure time to first state-appropriate content for transcript loads; confirm at least 95% complete within 2 seconds.

### Style Compliance

- Review modified HTML and CSS against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-html-css.md`.
- Review modified JavaScript against `/home/thaia/ECE493Group19/Style Guides/google-style-guide-javascript.md`.
