# Data Model: UC-24 Warn About Time Conflicts in Candidate Schedules

## CandidateSchedule

Description: A generated schedule option that a student selects for conflict analysis.

Fields:
- `schedule_id`: unique identifier
- `student_account_id`: foreign key to the authenticated student account
- `term_code`: academic term identifier
- `generated_at`: timestamp for the schedule snapshot
- `status`: enum (`ready`, `incomplete`, `unavailable`)

Relationships:
- One `CandidateSchedule` has many `MeetingComponent` records.
- One `CandidateSchedule` can produce zero or more `ConflictWarning` records in a `ConflictAnalysisOutcome`.

Validation rules:
- Must belong to the authenticated student requesting analysis.
- Must reference an available academic term.
- Must have at least one meeting component to analyze; a single component can still produce a conflict-free result.

## MeetingComponent

Description: A scheduled course component used in overlap analysis.

Fields:
- `component_id`: unique identifier
- `schedule_id`: foreign key to `CandidateSchedule`
- `course_code`: course identifier
- `section_code`: section identifier
- `meeting_days`: normalized meeting-day set
- `start_time`: nullable time value
- `end_time`: nullable time value
- `time_completeness`: enum (`complete`, `partial`, `tba`)
- `location_text`: optional display value

Relationships:
- Many `MeetingComponent` records belong to one `CandidateSchedule`.

Validation rules:
- `end_time` must be later than `start_time` when both are present.
- `time_completeness = complete` requires both `start_time` and `end_time`.
- `time_completeness = partial` or `tba` triggers incomplete-analysis handling.

## ConflictWarning

Description: A user-visible warning describing overlapping meeting components in a candidate schedule.

Fields:
- `warning_id`: unique identifier
- `schedule_id`: foreign key to `CandidateSchedule`
- `component_ids`: ordered list of overlapping component identifiers
- `warning_message`: rendered summary for the user
- `overlap_window`: normalized overlapping day/time description

Relationships:
- Many `ConflictWarning` records can be associated with one `CandidateSchedule`.

Validation rules:
- Must reference at least two meeting components.
- All referenced components must belong to the same candidate schedule.
- Components are included only when scheduled meeting times overlap; touching times without overlap do not create a warning.

## ConflictAnalysisOutcome

Description: The overall result returned to the controller/view for a single conflict-analysis request.

Fields:
- `schedule_id`: foreign key to `CandidateSchedule`
- `result_state`: enum (`conflicts_found`, `conflict_free`, `incomplete`, `unavailable`)
- `warning_count`: integer
- `flagged_component_ids`: list of components with partial/TBA times
- `user_message`: primary message shown to the student
- `retry_allowed`: boolean

Relationships:
- One `ConflictAnalysisOutcome` belongs to one `CandidateSchedule`.
- One `ConflictAnalysisOutcome` can include zero or more `ConflictWarning` records.

Validation rules:
- `conflict_free` requires `warning_count = 0` and no unavailable timetable dependency.
- `incomplete` requires at least one flagged component with non-complete time data.
- `unavailable` requires retry guidance and no registration-state mutation.
