# Data Model: UC-21 View My Transcript

## Student Account

**Description**: The authenticated student identity used to authorize transcript viewing requests.

**Fields**

- `studentId`: Unique institutional identifier for the student.
- `accountId`: Unique application account identifier bound to the student.
- `displayName`: Student-facing account name for session context.
- `isAuthenticated`: Whether the current session is authenticated.
- `hasTranscriptAccess`: Whether the account may access self-service transcript viewing.

**Relationships**

- One student account owns zero or more transcript entries.
- One student account can generate zero or more authorization failure records.

**Validation Rules**

- `studentId` and `accountId` are required and unique.
- Transcript access is valid only when `isAuthenticated` is true and `hasTranscriptAccess` is true.

## Transcript Entry

**Description**: A transcript record for one student representing a completed or otherwise finalized academic result.

**Fields**

- `entryId`: Unique transcript entry identifier.
- `studentId`: Owning student identifier.
- `academicTerm`: Canonical term label shown in the transcript grouping.
- `courseIdentifier`: Institutional course code or identifier.
- `courseTitle`: Human-readable course title.
- `credits`: Credit value for the entry when available.
- `finalResult`: Final grade or equivalent result when available.
- `availabilityStatus`: Indicates whether the entry is fully available or partially unavailable.

**Relationships**

- Many transcript entries belong to one student account.
- Transcript entries are grouped into one transcript view by `academicTerm`.

**Validation Rules**

- `entryId`, `studentId`, `academicTerm`, and `courseIdentifier` are required for any available transcript entry.
- `credits` and `finalResult` may be absent only when the entry is marked as partially unavailable.

## Transcript View

**Description**: The student-facing transcript response assembled for one request.

**Fields**

- `viewState`: One of `full`, `partial`, `empty`, `unavailable`, or `denied`.
- `studentId`: Requesting student identity when authorized.
- `termGroups`: Ordered collection of transcript entries grouped by academic term.
- `missingDataMessage`: Page-level indicator used only for `partial` state.
- `unavailableMessage`: Distinct message used only for `unavailable` state.
- `deniedMessage`: Distinct message used only for `denied` state.

**State Transitions**

- Request start -> `full` when all requested transcript data is available.
- Request start -> `partial` when some transcript data is available and some is missing or unavailable.
- Request start -> `empty` when the authorized student has no transcript entries.
- Request start -> `unavailable` when transcript data cannot be retrieved from the source.
- Request start -> `denied` when the requester is not authorized.

**Validation Rules**

- `termGroups` must be empty for `empty`, `unavailable`, and `denied`.
- `missingDataMessage` is required for `partial`.
- `unavailableMessage` is required for `unavailable`.
- `deniedMessage` is required for `denied`.

## Authorization Failure Record

**Description**: Audit record created when transcript access is denied.

**Fields**

- `failureId`: Unique audit record identifier.
- `requestingIdentity`: The authenticated requester.
- `attemptedTargetIdentity`: The transcript owner being requested when known.
- `timestamp`: Time the denial occurred.
- `denialReason`: Human-reviewable explanation of the authorization failure.

**Relationships**

- Many authorization failure records can belong to one student account or requesting identity.

**Validation Rules**

- `requestingIdentity`, `timestamp`, and `denialReason` are required.
- `attemptedTargetIdentity` is optional but must be recorded when the request targeted a specific student.
