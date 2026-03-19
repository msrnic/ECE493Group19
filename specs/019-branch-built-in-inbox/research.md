# Research: UC-19 Receive Notifications in a Built-in Inbox

## Decision: Retry failed inbox delivery attempts for up to 24 hours

Rationale: The clarified specification sets a bounded retry window. A 24-hour limit reduces the chance of lost notifications from transient failures while avoiding indefinite retry loops and unbounded operational cost.

Alternatives considered: Retrying only once was rejected because brief outages could still lose important notifications. Retrying indefinitely was rejected because it complicates operations and makes failure completion hard to reason about.

## Decision: Store notifications for later viewing when inbox access is restricted

Rationale: UC-19 and its acceptance tests require that notifications remain available later even when inbox access is currently restricted. Storing the notification preserves important academic communication without discarding the event.

Alternatives considered: Dropping notifications during restricted access was rejected because it would lose important information. Showing notifications immediately despite restricted access was rejected because it conflicts with the access restriction itself.

## Decision: Deduplicate exact repeated upstream events per student

Rationale: The clarified specification requires exact repeated events for the same student to result in a single inbox notification. This prevents inbox clutter and avoids duplicate notification viewing for the same underlying event.

Alternatives considered: Always creating a new notification for every repeated event was rejected because retries or duplicate upstream sends could flood the inbox. Deduplicating loosely similar events was rejected because distinct academic events must still remain visible as separate notifications.

## Decision: Validate delivery timeliness and concurrent inbox viewing with representative scenario-based tests

Rationale: The specification defines measurable delivery and concurrency expectations. Scenario-based validation with representative event generation and active signed-in inbox views provides evidence without expanding scope into production-scale benchmarking.

Alternatives considered: Ignoring performance validation was rejected because the specification includes measurable targets. Full production-load simulation was rejected because it is disproportionate to the scope of this feature plan.
