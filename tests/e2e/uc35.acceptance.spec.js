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

test('AT-UC35-01 professor updates submitted grades before deadline', async ({ page }) => {
  await login(page, 'professor@example.com');
  await page.goto('/grades/offerings/1');
  await page.locator('input[name="grade_1"]').fill('A');
  await page.getByRole('button', { name: 'Submit Grades' }).click();
  await page.locator('input[name="grade_1"]').fill('B+');
  await page.getByRole('button', { name: 'Submit Grades' }).click();
  await expect(page.getByText('Final grades were submitted successfully.')).toBeVisible();
});

test('AT-UC35-02 deadline passed prevents grade updates', async ({ page }) => {
  await login(page, 'professor@example.com');
  await page.goto('/grades/offerings/1');
  await page.locator('input[name="grade_1"]').fill('A');
  await page.getByRole('button', { name: 'Submit Grades' }).click();
  await page.goto('/grades/summary?offeringId=1');
  await expect(page.getByText('Grade Distribution')).toBeVisible();
});

test('AT-UC35-03 export grade summary is available and unauthorized export is denied', async ({ page, context }) => {
  await login(page, 'professor@example.com');
  const downloadPromise = page.waitForEvent('download');
  await page.goto('/grades/offerings/1/export-summary');
  await downloadPromise;

  const unauthorizedPage = await context.newPage();
  await login(unauthorizedPage, 'hybrid.staff@example.com');
  await unauthorizedPage.goto('/grades/offerings/1/export-summary');
  await expect(unauthorizedPage.locator('body')).toContainText('Grade summary export was denied.');
});
