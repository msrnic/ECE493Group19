const { test, expect } = require('@playwright/test');

const { resetFixtures, setCourseRosterFixtures } = require('./reset-fixtures');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAsProfessor(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('professor@example.com');
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC32-01 professor can view enrolled students for an assigned offering', async ({ page }) => {
  await loginAsProfessor(page);
  await page.getByRole('link', { name: 'Open Course Rosters' }).click();
  await page.getByRole('link', { name: /O_ROSTER/ }).click();

  await expect(page.getByText('Alex Example')).toBeVisible();
  await expect(page.getByText('userA')).toBeVisible();
  await expect(page.getByText('Software Engineering')).toBeVisible();
});

test('AT-UC32-02 empty roster shows a clear empty-state message', async ({ page }) => {
  await loginAsProfessor(page);
  await page.goto('/teaching/rosters');
  await page.getByRole('link', { name: /O_EMPTY/ }).click();

  await expect(page.getByText('No students are currently enrolled in this offering.')).toBeVisible();
});

test('AT-UC32-03 unauthorized offering access is denied', async ({ page }) => {
  await loginAsProfessor(page);
  await page.goto('/teaching/rosters?offeringId=8');

  await expect(page.getByText('Access denied')).toBeVisible();
});

test('AT-UC32-04 system errors retrieving roster show a safe failure state', async ({ page, request }) => {
  await setCourseRosterFixtures(request, {
    failureIdentifiers: ['professor@example.com']
  });

  await loginAsProfessor(page);
  await page.goto('/teaching/rosters?offeringId=6');

  await expect(page.getByText('Roster information is temporarily unavailable. Please retry.')).toBeVisible();
  await expect(page.getByText('Alex Example')).toHaveCount(0);
});

test('AT-UC32-05 professor can filter and sort the roster view', async ({ page }) => {
  await loginAsProfessor(page);
  await page.goto('/teaching/rosters?offeringId=6');

  await page.getByLabel('Program').selectOption('Software Engineering');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText('Alex Example')).toBeVisible();
  await expect(page.getByText('Hold Student')).toHaveCount(0);

  await page.getByLabel('Sort by').selectOption('student_id');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText('userA')).toBeVisible();

  await page.getByRole('link', { name: 'Clear filter' }).click();
  await expect(page.getByText('Hold Student')).toBeVisible();
});
