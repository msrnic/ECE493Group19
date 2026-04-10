const { test, expect } = require('@playwright/test');

const { resetFixtures, setDeadlineFixtures } = require('./reset-fixtures');

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

test('AT-UC15-01 deadline is displayed and drop is allowed before the cutoff', async ({ page }) => {
  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'View Add/Drop Deadlines' }).click();

  await expect(page.getByRole('heading', { name: 'Add/Drop Deadlines' })).toBeVisible();
  await expect(page.getByText('Drop action is currently allowed before the published deadline.')).toBeVisible();
  await expect(page.getByText('2026FALL')).toBeVisible();

  await page.getByRole('button', { name: 'Check drop eligibility' }).click();
  await expect(page.getByText('Drop action may proceed before the published deadline.')).toBeVisible();
});

test('AT-UC15-02 deadline is marked passed and drop is blocked after the cutoff', async ({ page, request }) => {
  await setDeadlineFixtures(request, {
    deadlineAtByTerm: {
      '2026FALL': '2026-03-01T00:00:00.000Z'
    }
  });

  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'View Add/Drop Deadlines' }).click();

  await expect(page.getByText('Drop action is blocked because the published deadline has passed.')).toBeVisible();
  await page.getByRole('button', { name: 'Attempt drop check' }).click();
  await expect(page.getByText('Drop action cannot proceed after the published deadline.')).toBeVisible();
});

test('AT-UC15-03 deadline retrieval failure blocks drop safely', async ({ page, request }) => {
  await setDeadlineFixtures(request, {
    failureIdentifiers: ['conflict.student@example.com']
  });

  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'View Add/Drop Deadlines' }).click();

  await expect(page.getByText('We cannot confirm add/drop deadline information right now. Please retry later.')).toBeVisible();
  await expect(page.getByText('Deadline information is currently unavailable')).toBeVisible();
  await page.getByRole('button', { name: 'Retry deadline check' }).click();
  await expect(page.getByText('Drop action remains blocked until deadline information can be confirmed.')).toBeVisible();
});
