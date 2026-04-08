const { test, expect } = require('@playwright/test');

const {
  resetFixtures,
  setAdminNotificationFixtures,
  setInboxFixtures
} = require('./reset-fixtures');

async function login(page, identifier, password) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill(identifier);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC42-01 admin previews and sends inbox notifications to students', async ({ page }) => {
  await login(page, 'admin@example.com', 'AdminPass!234');

  await page.getByRole('link', { name: 'Send Inbox Notifications' }).click();
  await expect(page).toHaveURL(/\/admin\/notifications$/);
  await page.getByLabel('Student IDs').fill('userA');
  await page.getByLabel('Subject').fill('Admin inbox notice');
  await page.getByLabel('Message').fill('A new administrative notification is available.');

  await page.getByRole('button', { name: 'Preview recipients' }).click();
  await expect(page.getByText('Recipient preview')).toBeVisible();
  await expect(page.getByText('Recipients resolved successfully.')).toBeVisible();

  await page.getByRole('button', { name: 'Send notification' }).click();
  await expect(page.getByText('Notification send request accepted.')).toBeVisible();
  await expect(page.getByText('Latest send summary')).toBeVisible();
});

test('AT-UC42-02 admin is prompted to correct invalid recipient selections', async ({ page }) => {
  await login(page, 'admin@example.com', 'AdminPass!234');

  await page.getByRole('link', { name: 'Send Inbox Notifications' }).click();
  await page.getByLabel('Subject').fill('Invalid send');
  await page.getByLabel('Message').fill('No recipients were selected.');
  await page.getByRole('button', { name: 'Send notification' }).click();

  await expect(page.getByText('Select at least one valid student recipient.')).toBeVisible();
});

test('AT-UC42-03 partial delivery failure is summarized and retry succeeds within the retry window', async ({ page, request }) => {
  await setInboxFixtures(request, {
    deliveryFailureIdentifiers: ['outage.user@example.com']
  });
  await setAdminNotificationFixtures(request, {
    loggingFailureSubjects: []
  });

  await login(page, 'admin@example.com', 'AdminPass!234');
  await page.getByRole('link', { name: 'Send Inbox Notifications' }).click();
  await page.getByLabel('Student IDs').fill('outageUser,userA');
  await page.getByLabel('Subject').fill('Retryable notice');
  await page.getByLabel('Message').fill('This send should partially fail and then recover.');
  await page.getByRole('button', { name: 'Send notification' }).click();

  await expect(page.getByText('Failed deliveries: 1')).toBeVisible();

  await setInboxFixtures(request, {
    deliveryFailureIdentifiers: []
  });
  await page.getByRole('button', { name: 'Retry failed deliveries' }).click();

  await expect(page.getByText('Retry request accepted for failed recipients.')).toBeVisible();
});
