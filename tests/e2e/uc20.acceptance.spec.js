const { test, expect } = require('@playwright/test');

const {
  resetFixtures,
  setCourseHistoryFixtures,
  setStudentRecordFixtures
} = require('./reset-fixtures');

async function login(page, identifier, password = 'CorrectPass!234') {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill(identifier);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC20-01 student views complete course history', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'View my course history' }).click();
  await expect(page).toHaveURL(/\/academic\/course-history$/);
  await expect(page.getByRole('heading', { name: 'Course History' })).toBeVisible();
  await expect(page.getByText('CMPUT301')).toBeVisible();
  await expect(page.getByText('ECE493')).toBeVisible();
});

test('AT-UC20-02 student sees partial course history messaging when records are incomplete', async ({ page }) => {
  await login(page, 'prereq.student@example.com');
  await page.goto('/academic/course-history');
  await expect(page.getByText('Some course history details are incomplete.')).toBeVisible();
  await expect(page.getByText('STAT235')).toBeVisible();
});

test('AT-UC20-03 unauthorized actor is denied and unavailable state is distinct', async ({ page, request }) => {
  await setCourseHistoryFixtures(request, {
    retrievalFailureIdentifiers: ['outage.user@example.com']
  });
  await login(page, 'outage.user@example.com');
  await page.goto('/academic/course-history');
  await expect(page.getByText('Course history unavailable')).toBeVisible();

  await resetFixtures(request);
  await setStudentRecordFixtures(request, {
    accessStatesByIdentifier: {
      'restricted.inbox@example.com': {
        courseHistoryAccess: 'denied',
        transcriptAccess: 'denied'
      }
    }
  });
  await login(page, 'restricted.inbox@example.com');
  await page.goto('/academic/course-history');
  await expect(page.getByText('Access denied')).toBeVisible();
});
