# Quickstart: View summary of submitted grades (UC-36)

## Preconditions
- Confirm environment is running and authentication is available.
- Use `Use Cases/UC-36.md` and `Acceptance Tests/UC-36-AS.md` as traceability anchors.

## Validation Steps
1. Execute primary flow and confirm expected success outcome.
2. Execute alternate/extension flow and confirm actionable response.
3. Inject a dependency failure and verify state remains unchanged.
4. Verify no protected artifact edits were introduced.

## Expected Results
- Main scenario succeeds.
- Extension scenarios produce defined behavior.
- Error scenarios preserve consistency and provide guidance.
