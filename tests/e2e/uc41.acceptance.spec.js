const { test, expect } = require('@playwright/test');

const { resetFixtures } = require('./reset-fixtures');

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

test('AT-UC41-01 eligible student enrolls successfully', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.locator("form[action='/enrollment']").nth(1).getByRole('button', { name: 'Enroll' }).click();
  await expect(page.getByText('enrolled successfully')).toBeVisible();
  await expect(page.getByText('Fee assessment change: $450.00')).toBeVisible();
});

test('AT-UC41-02 and AT-UC41-03 blocked enrollment shows prerequisite and capacity reasons', async ({ page }) => {
  await login(page, 'prereq.student@example.com');
  await page.goto('/enrollment');
  await page.locator("form[action='/enrollment']").nth(1).getByRole('button', { name: 'Enroll' }).click();
  await expect(page.getByText('Unmet prerequisite: CMPUT301')).toBeVisible();

  await login(page, 'userA@example.com');
  await page.goto('/enrollment');
  await page.getByText('O_FULL').locator('..').locator("button[type='submit']").click();
  await expect(page.getByText('0 seats remaining')).toBeVisible();
});

test('AT-UC41-04 and AT-UC41-05 blocked hold and system error paths are visible', async ({ page }) => {
  await login(page, 'hold.student@example.com');
  await page.goto('/enrollment');
  await page.locator("form[action='/enrollment']").nth(1).getByRole('button', { name: 'Enroll' }).click();
  await expect(page.getByText('Outstanding fees must be cleared before enrolling in new classes.')).toBeVisible();

  await login(page, 'outage.user@example.com');
  await page.goto('/enrollment');
  await page.getByText('O_ERROR').locator('..').locator("button[type='submit']").click();
  await expect(page.getByText('Enrollment could not be completed right now. Please retry.')).toBeVisible();
});
