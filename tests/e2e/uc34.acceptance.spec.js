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

test('AT-UC34-01 professor enters valid grades and submits them', async ({ page }) => {
  await login(page, 'professor@example.com');
  await page.getByRole('link', { name: 'Enter final grades for ECE493' }).click();
  await page.locator('input[name="grade_1"]').fill('A');
  await page.locator('input[name="grade_9"]').fill('B+');
  await page.locator('input[name="grade_10"]').fill('A-');
  await page.getByRole('button', { name: 'Submit Grades' }).click();
  await expect(page.getByText('Final grades were submitted successfully.')).toBeVisible();
});

test('AT-UC34-02 invalid grade values are rejected', async ({ page }) => {
  await login(page, 'professor@example.com');
  await page.goto('/grades/offerings/1');
  await page.locator('input[name="grade_1"]').fill('ZZ');
  await page.getByRole('button', { name: 'Submit Grades' }).click();
  await expect(page.getByText('Please correct the highlighted final grades.')).toBeVisible();
});

test('AT-UC34-03 save failure preserves state', async ({ page, request }) => {
  await setGradebookFixtures(request, {
    saveFailureIdentifiers: ['professor@example.com']
  });
  await login(page, 'professor@example.com');
  await page.goto('/grades/offerings/1');
  await page.locator('input[name="grade_1"]').fill('A');
  await page.getByRole('button', { name: 'Submit Grades' }).click();
  await expect(page.getByText('We could not save final grades right now. Please retry.')).toBeVisible();
});
