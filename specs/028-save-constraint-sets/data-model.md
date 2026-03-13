# Data Model: UC-28 Save and Name Constraint Sets

## Named Constraint Set

Purpose: Represents one saved snapshot of the student's current constraint configuration for one registration term.

Fields:
- `setId`: Unique identifier for the saved set
- `studentId`: Identifier of the owning student
- `termId`: Identifier of the registration term
- `displayName`: Student-visible saved-set name
- `normalizedName`: Trimmed, case-insensitive comparison key derived from `displayName`
- `constraintSnapshot`: Full saved constraint configuration captured at save time
- `createdAt`: Timestamp of initial save
- `updatedAt`: Timestamp of latest successful save or overwrite
- `versionToken`: Concurrency marker used to detect stale-session updates

Validation rules:
- `displayName` must be non-empty after trimming.
- `displayName` must be 50 characters or fewer after trimming.
- `displayName` may contain only letters, numbers, spaces, hyphens, apostrophes, and parentheses.
- `normalizedName` must be unique within the combination of `studentId` and `termId`.
- `constraintSnapshot` must not be empty.

Relationships:
- Belongs to one student account.
- Belongs to one registration term.
- Contains one saved snapshot of the student's current constraint configuration.

Lifecycle:
- `draft input` -> `saved`
- `saved` -> `overwritten`
- `saved` -> `renamed`
- `saved` -> `deleted`
- Any attempted transition may end in `failed` with the prior saved state preserved.

## Saved Set Operation Result

Purpose: Represents the outcome of a save, overwrite, rename, delete, or validation attempt.

Fields:
- `operationType`: Save, overwrite, rename, delete, or validation
- `status`: Succeeded, rejected, failed, or refresh-required
- `affectedSetId`: Identifier of the targeted saved set when applicable
- `message`: Plain-language result shown to the student
- `fieldIssues`: Collection of naming or state conflicts that must be corrected
- `requiresConfirmation`: Indicates whether overwrite confirmation is required
- `requiresRefresh`: Indicates whether the session is stale and must reload data

Validation rules:
- `requiresConfirmation` is true only for duplicate-name overwrite prompts.
- `requiresRefresh` is true only when stale-session protection blocks an update.
- `fieldIssues` must identify the specific naming or state problem when `status` is `rejected`.

## Saved Set List

Purpose: Represents the collection of named constraint sets available to one student for one term.

Fields:
- `studentId`: Identifier of the owning student
- `termId`: Identifier of the selected term
- `savedSets`: Ordered collection of `Named Constraint Set` summaries
- `lastRefreshedAt`: Timestamp of the latest successful load

Validation rules:
- Includes only saved sets owned by the authenticated student.
- Includes only saved sets for the selected term.
- Excludes deleted sets from subsequent loads.
