const { test, expect } = require('@playwright/test');

const { resetFixtures, setOfferingAdminFixtures } = require('./reset-fixtures');

const ADMIN_PASSWORD = 'AdminPass!234';

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('admin@example.com');
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#admin-operations')).toBeVisible();
}

async function openOfferingAdmin(page) {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: 'Manage Course Offerings' }).click();
  await expect(page.getByRole('heading', { name: 'Course Offerings Administration' })).toBeVisible();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC39-01 admin adds a valid offering', async ({ page }) => {
  await openOfferingAdmin(page);
  await page.getByLabel('Course code').fill('ECE497');
  await page.getByLabel('Title').fill('Systems Integration');
  await page.getByLabel('Term').fill('2026FALL');
  await page.getByLabel('Section').fill('Z1');
  await page.getByLabel('Instructor').selectOption({ label: /professor/i });
  await page.getByLabel('Capacity').fill('20');
  await page.getByLabel('Meeting days').fill('Tue,Thu');
  await page.getByLabel('Start time').fill('11:00');
  await page.getByLabel('End time').fill('12:00');
  await page.getByRole('button', { name: 'Add Offering' }).click();
  await expect(page.getByText('Offering created successfully.')).toBeVisible();
});

test('AT-UC39-03 delete is blocked when active enrollments exist', async ({ page }) => {
  await openOfferingAdmin(page);
  await page.locator('form[action*="/admin/offerings/5/delete"] button').click();
  await expect(page.getByRole('alert')).toHaveText(/Active enrollments prevent deletion/);
});

test('AT-UC39-04 invalid add data is rejected until corrected', async ({ page }) => {
  await openOfferingAdmin(page);
  await page.getByRole('button', { name: 'Add Offering' }).click();
  await expect(page.getByRole('alert')).toHaveText('Please correct the highlighted fields.');
});

test('AT-UC39-05 system errors during add/delete leave catalog unchanged', async ({ page, request }) => {
  await setOfferingAdminFixtures(request, { createFailureIdentifiers: ['ece497-2026fall-z1'] });
  await openOfferingAdmin(page);
  await page.getByLabel('Course code').fill('ECE497');
  await page.getByLabel('Title').fill('Systems Integration');
  await page.getByLabel('Term').fill('2026FALL');
  await page.getByLabel('Section').fill('Z1');
  await page.getByLabel('Instructor').selectOption({ label: /professor/i });
  await page.getByLabel('Capacity').fill('20');
  await page.getByLabel('Meeting days').fill('Tue,Thu');
  await page.getByLabel('Start time').fill('11:00');
  await page.getByLabel('End time').fill('12:00');
  await page.getByRole('button', { name: 'Add Offering' }).click();
  await expect(page.getByRole('alert')).toHaveText(/Offering could not be created right now/);
});
