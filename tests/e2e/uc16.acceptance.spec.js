const { test, expect } = require('@playwright/test');

const { resetFixtures, setDeadlineFixtures, setEnrollmentFixtures } = require('./reset-fixtures');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function login(page, identifier) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill(identifier);
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC16-01 remove class before deadline applies drop', async ({ page }) => {
  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByRole('link', { name: 'Remove' }).click();

  await expect(page.getByRole('heading', { name: 'Confirm Class Removal' })).toBeVisible();
  await expect(page.getByText('Classification: Drop')).toBeVisible();
  await expect(page.getByText('Drop policy applies.')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm removal' }).click();
  await expect(page.getByText('ECE320 Embedded Systems was removed successfully.')).toBeVisible();
  await expect(page.getByText('Classification: Drop')).toBeVisible();
});

test('AT-UC16-02 remove class after deadline applies withdrawal', async ({ page, request }) => {
  await setDeadlineFixtures(request, {
    deadlineAtByTerm: {
      '2026FALL': '2026-03-01T00:00:00.000Z'
    }
  });

  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByRole('link', { name: 'Remove' }).click();

  await expect(page.getByText('Classification: Withdrawal')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm removal' }).click();
  await expect(page.getByText('Classification: Withdrawal')).toBeVisible();
});

test('AT-UC16-03 policy lookup failure blocks class removal', async ({ page, request }) => {
  await setDeadlineFixtures(request, {
    failureIdentifiers: ['conflict.student@example.com']
  });

  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByRole('link', { name: 'Remove' }).click();

  await expect(page.getByText('We cannot confirm add/drop deadline information right now. Please retry later.')).toBeVisible();
  await expect(page.getByText('ECE320 Embedded Systems (O_CONFLICT)')).toBeVisible();
});

test('AT-UC16-04 update failure after selection leaves schedule unchanged', async ({ page, request }) => {
  await setEnrollmentFixtures(request, {
    removalFailureIdentifiers: ['conflict.student@example.com']
  });

  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByRole('link', { name: 'Remove' }).click();
  await expect(page.getByText('Classification: Drop')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm removal' }).click();
  await expect(page.getByText('The selected class removal could not be completed. Please refresh your schedule and retry.')).toBeVisible();
  await expect(page.getByText('ECE320 Embedded Systems')).toBeVisible();
});
