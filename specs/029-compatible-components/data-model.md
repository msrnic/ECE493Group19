# Data Model: UC-29 Auto-pick Compatible Components

## Component Offering

Purpose: Represents one offered instructional component, such as a lecture, lab, tutorial, or other required part of a course in one term.

Fields:
- `offeringId`: Unique identifier for the component offering
- `courseId`: Identifier of the course owning the component
- `termId`: Identifier of the registration term
- `componentType`: Lecture, lab, tutorial, or other required component type
- `sectionCode`: Human-readable section identifier
- `sharedGroupId`: Identifier used when a component is shared across linked or cross-listed listings

Validation rules:
- `componentType` must match a component type required by the course offering.
- `termId` must match the selected registration term.
- `sharedGroupId` is present only when the component is shared across linked listings.

Relationships:
- Belongs to one course offering in one term.
- Can participate in zero or more compatibility linkage rules.

## Compatibility Linkage Rule

Purpose: Defines which component offerings may be paired together for one course or linked cross-listed scenario.

Fields:
- `ruleId`: Unique identifier for the rule
- `termId`: Identifier of the registration term
- `courseId`: Identifier of the course or linked listing group
- `requiredComponentTypes`: The component types the rule governs
- `allowedOfferingLinks`: The compatible offering pairings or groups permitted by the rule
- `sharedComponentPolicy`: Indicates whether a shared component may satisfy both linked listings once
- `ruleStatus`: Available, missing, or inconsistent

Validation rules:
- `ruleStatus` must be `available` before the rule may be used for generation.
- `allowedOfferingLinks` must cover the governed required component types when `ruleStatus` is `available`.
- `sharedComponentPolicy` must align with linked-listing scenarios only.

Relationships:
- Applies to one course offering or one linked cross-listed scenario in one term.
- Constrains one or more component offerings.

## Compatible Component Combination

Purpose: Represents one valid set of required component offerings for one selected course after compatibility rules are applied.

Fields:
- `courseId`: Identifier of the selected course
- `termId`: Identifier of the registration term
- `selectedOfferings`: The component offerings used in the combination
- `satisfiedRules`: The compatibility linkage rules satisfied by the combination
- `usesSharedComponent`: Indicates whether one shared component satisfies more than one linked listing

Validation rules:
- Must include all required component types for the course offering.
- Must satisfy all applicable available linkage rules.
- Must not duplicate a shared component within the same combination when that component satisfies both linked listings.

## Compatibility Generation Result

Purpose: Represents the outcome of applying compatibility filtering during schedule generation.

Fields:
- `status`: Succeeded, blocked, or failed
- `validCombinations`: The compatible component combinations available for downstream schedule generation
- `blockingCourseIds`: Selected courses that prevented compatible generation
- `message`: Plain-language explanation shown to the student
- `failureReason`: No-compatible-combination, missing-rule, inconsistent-rule, or system-error

Validation rules:
- `validCombinations` is populated only when `status` is `succeeded`.
- `blockingCourseIds` is populated when `status` is `blocked`.
- `failureReason` is populated when `status` is `blocked` or `failed`.
