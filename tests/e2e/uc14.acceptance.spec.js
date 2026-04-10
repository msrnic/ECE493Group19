const { test, expect } = require('@playwright/test');

const { resetFixtures, setEnrollmentFixtures } = require('./reset-fixtures');

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

test('AT-UC14-01 student can withdraw from an enrolled class', async ({ page }) => {
  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByRole('link', { name: 'Withdraw' }).click();

  await expect(page.getByRole('heading', { name: 'Confirm Withdrawal' })).toBeVisible();
  await expect(page.getByText('A W notation will appear on your transcript for this class.')).toBeVisible();
  await expect(page.getByText('$410.00')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm withdrawal' }).click();

  await expect(page.getByText('ECE320 Embedded Systems was withdrawn successfully.')).toBeVisible();
  await expect(page.getByText('ECE320 Embedded Systems (O_CONFLICT)')).toHaveCount(0);
});

test('AT-UC14-02 student can cancel withdrawal and keep the class on the schedule', async ({ page }) => {
  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByRole('link', { name: 'Withdraw' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByText('Withdrawal was canceled. Your schedule was not changed.')).toBeVisible();
  await expect(page.getByText('ECE320 Embedded Systems (O_CONFLICT)')).toBeVisible();
});

test('AT-UC14-03 withdrawal failure shows an error and leaves the class enrolled', async ({ page, request }) => {
  await setEnrollmentFixtures(request, {
    withdrawalFailureIdentifiers: ['conflict.student@example.com']
  });

  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByRole('link', { name: 'Withdraw' }).click();
  await page.getByRole('button', { name: 'Confirm withdrawal' }).click();

  await expect(page.getByText('Withdrawal could not be completed right now. Please retry.')).toBeVisible();
  await expect(page.getByText('ECE320 Embedded Systems')).toBeVisible();
});
