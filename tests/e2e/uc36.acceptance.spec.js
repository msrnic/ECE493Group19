const { test, expect } = require('@playwright/test');

const { resetFixtures, setGradebookFixtures } = require('./reset-fixtures');

async function login(page, identifier, password = 'CorrectPass!234') {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill(identifier);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC36-01 professor views submitted grade summary', async ({ page }) => {
  await login(page, 'professor@example.com');
  await page.getByRole('link', { name: 'View grade submission summary' }).click();
  await expect(page).toHaveURL(/\/grades\/summary\?offeringId=1$/);
  await expect(page.getByText('Grade Distribution')).toBeVisible();
});

test('AT-UC36-02 summary unavailable shows actionable message', async ({ page, request }) => {
  await setGradebookFixtures(request, {
    summaryFailureIdentifiers: ['professor@example.com']
  });
  await login(page, 'professor@example.com');
  await page.goto('/grades/summary?offeringId=1');
  await expect(page.getByText('Grade summary is temporarily unavailable. Retry later.')).toBeVisible();
});

test('AT-UC36-03 unauthorized summary access is denied', async ({ page }) => {
  await login(page, 'hybrid.staff@example.com');
  await page.goto('/grades/summary?offeringId=1');
  await expect(page.getByText('You are not authorized to view this grade summary.')).toBeVisible();
});
