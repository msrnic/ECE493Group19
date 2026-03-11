# Inbox UI Contract: UC-19

## Inbox Entry Point

- Shows the built-in inbox for the signed-in student only.
- Shows delivered inbox notifications in the inbox list.
- Prevents access to another student's inbox notifications.

## Delivered Notification Result

- Shows a notification item for the triggering academic event.
- Lets the student open the notification detail from the inbox list.
- Keeps newly delivered notifications visible through normal inbox use.

## Retry and Failure Status

- Does not show a corrupted or partial notification state to the student when delivery fails.
- Supports a status representation for delivery attempts when status can be presented.

## Restricted Access Result

- Shows restricted-access status when the student cannot currently use the built-in inbox and status can be presented.
- Makes stored notifications viewable after access is re-enabled.

## Accessibility Notes

- Inbox list navigation, notification opening, and status messaging must be keyboard reachable and available to assistive technologies.
