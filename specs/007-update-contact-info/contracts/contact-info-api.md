# Contract — Contact Information MVC Interface

## Scope

Defines the web interface contract used by the contact-information view/controller/model flow for UC-07.

## MVC Ownership

- Model: `contactInfoModel` reads/writes SQLite (`accounts`, `contact_profiles`, `emergency_contacts`, `courses` boundary retained).
- Controller: `contactController` enforces authz, validation, transaction handling, and response mapping.
- View: `contact-info.html` + `contact-info.js` + `contact-info.css` render fields, inline errors, confirmations, and conflict notices.

## Endpoints

### 1) Get current contact info

- Method: `GET`
- Path: `/contact-info`
- Auth: required; user can only access own record
- Response `200`:

```json
{
  "accountId": 123,
  "basic": {
    "email": "student@example.edu",
    "phone": "+1-780-555-1234",
    "address": {
      "line1": "123 Campus Dr",
      "line2": "Apt 2",
      "city": "Edmonton",
      "region": "AB",
      "postalCode": "T5J0N3",
      "country": "CA"
    }
  },
  "emergency": {
    "fullName": "Alex Doe",
    "relationship": "Parent",
    "phone": "+1-780-555-9999",
    "email": "alex@example.com",
    "address": {
      "line1": "55 Main St",
      "line2": "",
      "city": "Edmonton",
      "region": "AB",
      "postalCode": "T5K1V7",
      "country": "CA"
    }
  },
  "version": 8,
  "updatedAt": "2026-03-07T18:10:00Z"
}
```

### 2) Submit updated contact info

- Method: `POST`
- Path: `/contact-info`
- Auth: required; user can only update own record
- Request body:

```json
{
  "basic": {
    "email": "student.new@example.edu",
    "phone": "+1-780-555-2222",
    "address": {
      "line1": "200 New Ave",
      "line2": "",
      "city": "Edmonton",
      "region": "AB",
      "postalCode": "T5A0A1",
      "country": "CA"
    }
  },
  "emergency": {
    "fullName": "Jamie Doe",
    "relationship": "Sibling",
    "phone": "+1-780-555-3333",
    "email": "jamie@example.com",
    "address": {
      "line1": "8 River Rd",
      "line2": "",
      "city": "Edmonton",
      "region": "AB",
      "postalCode": "T5B1B2",
      "country": "CA"
    }
  },
  "submittedVersion": 8
}
```

- Response `200` (success, no detected overlap):

```json
{
  "status": "saved",
  "message": "Contact information updated.",
  "conflictNotice": null,
  "newVersion": 9
}
```

- Response `200` (success with last-write-wins notice):

```json
{
  "status": "saved",
  "message": "Contact information updated.",
  "conflictNotice": "Another update occurred while you were editing. Your submitted changes were saved as the latest version.",
  "newVersion": 10
}
```

- Response `400` (validation errors, save blocked):

```json
{
  "status": "validation_error",
  "message": "Please correct highlighted fields.",
  "fieldErrors": {
    "basic.email": "Enter a valid email address.",
    "emergency.phone": "Enter a valid phone number."
  }
}
```

- Response `500` (save failure, no persisted change):

```json
{
  "status": "save_failed",
  "message": "We could not save your contact information. Please retry later."
}
```

## Behavioral Contract Rules

- Entire submission is rejected if any field is invalid.
- Controller normalizes by trimming whitespace before validation and save.
- Save operation must be atomic across basic + emergency sections.
- On save failure, DB state remains unchanged.
- Cancel/navigation away before POST causes no persistence change.
- All view-facing HTML/CSS/JS must follow project style guides.
