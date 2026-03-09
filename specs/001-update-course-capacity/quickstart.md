# Quickstart: Update Course Capacity

## 1. Prerequisites
- Node.js 20 LTS
- npm 10+
- SQLite 3

## 2. Project setup
```bash
npm install
mkdir -p data
sqlite3 data/app.db < src/db/migrations/001_course_capacity_override.sql
```

## 3. Run application
```bash
npm run dev
```
- Open `http://localhost:3000/admin/course-offerings/{offeringId}/capacity`.

## 4. Validate primary scenarios (UC-40)
1. Success path:
```bash
curl -X POST http://localhost:3000/admin/course-offerings/OFF-100/capacity \
  -H 'Content-Type: application/json' \
  -d '{"proposedCapacity":50,"submittedVersion":3}'
```
Expected: `outcome=success`, updated `capacity`, recalculated `remainingSeats`.

2. Below-enrollment without override:
```bash
curl -X POST http://localhost:3000/admin/course-offerings/OFF-100/capacity \
  -H 'Content-Type: application/json' \
  -d '{"proposedCapacity":30,"submittedVersion":3}'
```
Expected: `outcome=rejected`, `messageCode=OVERRIDE_REQUIRED`, no persisted capacity change.

3. Override decision:
```bash
curl -X POST http://localhost:3000/admin/course-offerings/OFF-100/capacity/overrides \
  -H 'Content-Type: application/json' \
  -d '{"requestId":"REQ-123","reason":"Department directive","decision":"approved","approvedByAccountId":"ADM-1","allowSelfApproval":true}'
```
Expected: override approval stored with `retentionUntil = approvedAt + 7 years`.

4. Stale submission rejection:
- Submit an update using an old `submittedVersion` value.
- Expected: HTTP 409 with `messageCode=STALE_SUBMISSION`; user must reload.

## 5. Test suite
```bash
npm test
```
- Unit: validation and model transaction rules.
- Integration: success/reject/failure rollback and stale submission workflows.
- Contract: conformance with `specs/001-update-course-capacity/contracts/openapi.yaml`.

## 6. Style compliance checks
- Ensure HTML/CSS follow `Style Guides/google-style-guide-html-css.md`.
- Ensure JavaScript follows `Style Guides/google-style-guide-javascript.md`.
- Include lint checks in CI before merge.
