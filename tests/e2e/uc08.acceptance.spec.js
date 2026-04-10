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

test('AT-UC08-01 registered user can view enrollment capacity and remaining seats for current courses', async ({ page }) => {
  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();

  await expect(page.getByRole('heading', { name: 'Current Schedule' })).toBeVisible();
  await expect(page.getByText('ECE320 Embedded Systems (O_CONFLICT)')).toBeVisible();
  await expect(page.getByText('Capacity: 20')).toBeVisible();
  await expect(page.getByText('Remaining seats: 6')).toBeVisible();
});

test('AT-UC08-02 missing capacity or seat data is clearly indicated without breaking the page', async ({ page, request }) => {
  await setEnrollmentFixtures(request, {
    capacityUnavailableIdentifiers: ['conflict.student@example.com']
  });

  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();

  await expect(page.getByText('ECE320 Embedded Systems (O_CONFLICT)')).toBeVisible();
  await expect(page.getByText('Capacity unavailable')).toBeVisible();
  await expect(page.getByText('Remaining seats: 6')).toBeVisible();
});
