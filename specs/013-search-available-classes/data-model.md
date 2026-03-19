# Data Model: Search for Available Classes (UC-13)

## Entity: ClassOffering
- Fields: offeringId, termCode, subjectCode, courseNumber, sectionNumber,
  courseTitle, instructorName, meetingPattern, seatsAvailable,
  availabilityStatus, lastUpdatedAt
- Relationships: belongs to one Course; belongs to one Term
- Validation:
  - termCode required
  - subjectCode required
  - courseNumber required
  - seatsAvailable must be >= 0

## Entity: SearchQuery
- Fields: queryText, termCode, subjectCode, courseNumber, requestedAt
- Relationships: initiated by one StudentAccount
- Validation:
  - at least one of queryText, subjectCode, or courseNumber must be present

## Entity: SearchResultSet
- Fields: resultSetId, totalCount, generatedAt, staleDataFlag
- Relationships: includes zero or more ClassOffering records
- Validation:
  - staleDataFlag true when generatedAt data exceeds freshness threshold

## Entity: CatalogSyncSnapshot
- Fields: snapshotId, sourceSystem, capturedAt, freshnessSeconds
- Relationships: references many ClassOffering availability updates
- Validation:
  - freshnessSeconds must be <= 60 to mark data as current
