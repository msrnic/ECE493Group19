const { test, expect } = require('@playwright/test');

const { resetFixtures, setCourseCapacityFixtures } = require('./reset-fixtures');

const ADMIN_PASSWORD = 'AdminPass!234';

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('admin@example.com');
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#admin-operations')).toBeVisible();
}

async function openCapacityPage(page, offeringCode) {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: 'Manage Course Offerings' }).click();
  const row = page.locator('li', { hasText: offeringCode });
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: 'Edit capacity' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Course Capacity' })).toBeVisible();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC40-01 admin updates capacity and sees recalculated remaining seats', async ({ page }) => {
  await openCapacityPage(page, 'O_CONFLICT');
  await page.getByLabel('New capacity').fill('28');
  await page.getByRole('button', { name: 'Save Capacity' }).click();
  await expect(page.getByText(/Course capacity updated successfully/)).toBeVisible();
  await expect(page.getByText('Remaining seats: 27').first()).toBeVisible();
});

test('AT-UC40-02 below-enrollment capacity requires override approval details', async ({ page }) => {
  await openCapacityPage(page, 'O_ROSTER');
  await page.getByLabel('New capacity').fill('1');
  await page.getByRole('button', { name: 'Save Capacity' }).click();
  await expect(page.getByRole('alert')).toContainText(/override is required/i);
});

test('AT-UC40-03 failed updates keep stored capacity unchanged', async ({ page, request }) => {
  await setCourseCapacityFixtures(request, { failureIdentifiers: ['o_conflict'] });
  await openCapacityPage(page, 'O_CONFLICT');
  await page.getByLabel('New capacity').fill('28');
  await page.getByRole('button', { name: 'Save Capacity' }).click();
  await expect(page.getByText(/stored values were left unchanged/i)).toBeVisible();
});
