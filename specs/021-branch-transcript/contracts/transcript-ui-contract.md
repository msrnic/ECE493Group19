# UI Contract: UC-21 View My Transcript

## Overview

This contract defines the user-visible transcript states required for UC-21. It is intended to guide controller-to-view mapping, acceptance validation, and test design.

## Shared Expectations

- Transcript viewing is read-only in all states.
- Only the requesting authorized student's data may be displayed.
- Keyboard-only navigation and text-announced headings and state messages must be supported.
- The primary entry point is the dashboard action labeled `View my transcript`.

## State: Full

**Trigger**

- Authorized student requests transcript and all requested transcript data is available.

**Required UI Elements**

- Page title identifying the transcript view.
- Transcript entries grouped by academic term.
- For each available entry: academic term, course identifier, course title, credits, and final grade or equivalent result when available.

**Forbidden UI Elements**

- Missing-data warning.
- Unavailable-state message.
- Denied-access message.

## State: Partial

**Trigger**

- Authorized student requests transcript and some transcript entries or fields are unavailable while other transcript data remains displayable.

**Required UI Elements**

- All full-state elements for available entries.
- Page-level missing-data indicator.
- Identification of the affected term or transcript entry when known.

**Forbidden UI Elements**

- Empty-transcript message presented as if no transcript exists.
- Denied-access message.

## State: Empty

**Trigger**

- Authorized student requests transcript and no transcript entries exist for that student.

**Required UI Elements**

- Dedicated no-transcript-yet message.
- No transcript rows or placeholder academic entries.

**Forbidden UI Elements**

- Partial-data indicator.
- Unavailable-state message.
- Denied-access message.

## State: Unavailable

**Trigger**

- Authorized student requests transcript and the transcript source cannot provide any transcript data for the request.

**Required UI Elements**

- Distinct unavailable-state message.
- Guidance that the student can retry later through the same transcript entry point.

**Forbidden UI Elements**

- Empty-transcript message.
- Partial-data indicator.
- Transcript rows rendered as if data were available.

## State: Denied

**Trigger**

- Authenticated requester is not authorized to view the requested transcript.

**Required UI Elements**

- Denied-access message with no transcript details.
- No transcript entries or identifying academic details.

**Required System Behavior**

- Create an authorization failure record containing requesting identity, attempted target identity when known, timestamp, and denial reason.

**Forbidden UI Elements**

- Any transcript content for the requested student.

## Acceptance Mapping

- `AT-UC21-01` -> Full state
- `AT-UC21-02` -> Partial state
- `AT-UC21-03` -> Denied state
- Spec edge cases -> Empty and unavailable states
