const { test, expect } = require('@playwright/test');

const { resetFixtures, setEnrollmentFixtures } = require('./reset-fixtures');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function login(page, identifier) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill(identifier);
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

async function openSearch(page, keyword) {
  await page.goto('/classes/search');
  await page.getByLabel('Keyword').fill(keyword);
  await page.getByRole('button', { name: 'Search' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC17-01 student can enroll in an eligible found class', async ({ page }) => {
  await login(page, 'userA@example.com');
  await openSearch(page, 'ENGL');

  await page.getByRole('button', { name: 'Enroll' }).click();

  await expect(page.getByText('ENGL210 Technical Communication enrolled successfully.')).toBeVisible();
  await expect(page.getByText('Fee assessment change: $450.00')).toBeVisible();
  await expect(page.getByText('ENGL210 Technical Communication (O_OPEN)')).toBeVisible();
});

test('AT-UC17-02 unmet prerequisites block enrollment in a found class', async ({ page }) => {
  await login(page, 'prereq.student@example.com');
  await openSearch(page, 'ENGL');

  await page.getByRole('button', { name: 'Enroll' }).click();

  await expect(page.getByText('Enrollment was blocked.')).toBeVisible();
  await expect(page.getByText('Unmet prerequisite: CMPUT301')).toBeVisible();
  await expect(page.getByText('No enrolled classes yet.')).toBeVisible();
});

test('AT-UC17-04 registration holds are explained when enrollment is attempted from class details', async ({ page }) => {
  await login(page, 'hold.student@example.com');
  await openSearch(page, 'ENGL');
  await page.getByRole('link', { name: 'View class details' }).click();

  await page.getByRole('button', { name: 'Enroll in this class' }).click();

  await expect(page.getByText('Enrollment was blocked.')).toBeVisible();
  await expect(page.getByText('Outstanding fees must be cleared before enrolling in new classes.')).toBeVisible();
});

