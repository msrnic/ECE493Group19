# Data Model: UC-20 View Course History

## Student Account

- **Purpose**: Represents the authenticated student identity and authorization context used to determine whether course history may be viewed.
- **Fields**:
  - `studentId`: unique student identifier
  - `accountStatus`: current account state relevant to sign-in and access checks
  - `displayName`: student-facing name for page context
  - `authorizationScope`: identifies which course-history records the student may access
- **Relationships**:
  - One student account can have many course-history records.
  - One student account can produce many authorization failure records as requester or attempted target context.
- **Validation rules**:
  - `studentId` must be present and unique.
  - `authorizationScope` must allow only self-service course-history access for this feature.

## Course History Record

- **Purpose**: Represents a single past course enrollment with its final outcome.
- **Fields**:
  - `recordId`: unique course-history record identifier
  - `studentId`: owning student account identifier
  - `academicPeriod`: term or other academic period label
  - `courseCode`: catalog identifier shown to the student
  - `courseTitle`: course name shown to the student
  - `finalOutcome`: final enrollment outcome such as completed, failed, or withdrawn
  - `creditValue`: course credit value when available
  - `gradeLabel`: final grade or equivalent outcome label when available
  - `recordAvailability`: indicates whether the record is complete or partially unavailable
- **Relationships**:
  - Many course-history records belong to one student account.
- **Validation rules**:
  - `studentId`, `academicPeriod`, `courseCode`, and `finalOutcome` must be present for displayable records.
  - `recordAvailability` must distinguish complete records from records with missing supporting details.

## Course History View State

- **Purpose**: Represents the state the UI must show for a course-history request.
- **States**:
  - `complete`: all relevant records available
  - `partial`: some records available and some unavailable
  - `empty`: no course-history records exist
  - `denied`: requester is not authorized
- **State transitions**:
  - Request starts in a pending retrieval state outside persisted domain modeling.
  - Authorized retrieval resolves to `complete`, `partial`, or `empty`.
  - Failed authorization resolves to `denied`.
- **Validation rules**:
  - `empty` and `partial` must never be used interchangeably.
  - `denied` must not expose course-history record content.

## Authorization Failure Record

- **Purpose**: Represents an auditable record of a denied course-history access attempt.
- **Fields**:
  - `failureId`: unique authorization failure identifier
  - `requestingStudentId`: identity that initiated the denied request
  - `targetStudentId`: identity whose course history was requested, when known
  - `requestedAt`: timestamp of the denied request
  - `failureReason`: normalized denial reason
  - `viewName`: requested course-history entry point or route
- **Relationships**:
  - Many authorization failure records can reference one requesting student account.
- **Validation rules**:
  - `requestingStudentId`, `requestedAt`, and `failureReason` must be present.
  - A denial record must be written whenever view state resolves to `denied`.
