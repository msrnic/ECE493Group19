const { test, expect } = require('@playwright/test');

const { resetFixtures, setDashboardFixtures } = require('./reset-fixtures');

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

test('AT-UC09-01 student financial dashboard loads after login with only permitted features', async ({ page }) => {
  await login(page, 'userA@example.com');

  await expect(page.getByRole('heading', { name: 'Welcome, userA' })).toBeVisible();
  await expect(page.locator('#inbox').getByRole('heading', { name: 'Inbox' })).toBeVisible();
  await expect(page.locator('#security-center').getByRole('heading', { name: 'Personal Profile' })).toBeVisible();
  await expect(page.locator('#student-academics').getByRole('heading', { name: 'Academic Records' })).toBeVisible();
  await expect(page.locator('#schedule-builder').getByRole('heading', { name: 'Schedule Builder' })).toBeVisible();
  await expect(page.locator('#enrollment-hub').getByRole('heading', { name: 'Enrollment Hub' })).toBeVisible();
  await expect(page.locator('#financial-summary')).toContainText('Financial Summary');
  await expect(page.locator('#financial-summary').getByRole('heading', { name: 'Financial Summary' })).toBeVisible();
  await expect(page.getByText('Teaching Workload')).toHaveCount(0);
  await expect(page.url()).toContain('/dashboard');

  await page.getByRole('link', { name: 'Financial Summary' }).click();
  await expect(page.url()).toContain('/dashboard#financial-summary');
  await expect(page.locator('#financial-summary')).toBeVisible();
});

test('AT-UC09-02 students with no assigned modules see a minimal dashboard and admin-contact guidance', async ({ page }) => {
  await login(page, 'nomodule.student@example.com');

  await expect(page.getByRole('heading', { name: 'Welcome, noModules' })).toBeVisible();
  await expect(page.getByText('Minimal dashboard')).toBeVisible();
  await expect(page.locator('#dashboard-status')).toContainText('Contact an administrator');
  await expect(page.getByText('Financial Summary')).toHaveCount(0);
  await expect(page.getByText('Teaching Workload')).toHaveCount(0);
});

test('AT-UC09-03 financial dashboard faults show a partial view and recover after retry', async ({ page, request }) => {
  await setDashboardFixtures(request, {
    unavailableSectionsByIdentifier: {
      'usera@example.com': ['financial-summary']
    }
  });

  await login(page, 'userA@example.com');

  await expect(page.locator('#dashboard-status')).toContainText('Some dashboard sections are currently unavailable.');
  await expect(page.locator('#financial-summary')).toContainText('Unavailable');
  await expect(page.locator('#student-academics')).toContainText('Academic Records');

  await setDashboardFixtures(request, {});
  await page.getByRole('button', { name: 'Retry unavailable sections' }).click();

  await expect(page.locator('#dashboard-status')).toContainText('Dashboard loaded successfully.');
  await expect(page.locator('#financial-summary')).toContainText('Available');
});
