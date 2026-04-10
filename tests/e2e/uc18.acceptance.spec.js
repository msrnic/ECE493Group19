const { test, expect } = require('@playwright/test');

const { resetFixtures, setEnrollmentFixtures } = require('./reset-fixtures');

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

test('AT-UC18-01 student can join a waitlist for a full waitlist-enabled section', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByLabel('Search Offerings').fill('STAT');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('link', { name: 'Join Waitlist' }).first().click();

  await expect(page.getByRole('heading', { name: 'Join Waitlist' })).toBeVisible();
  await expect(page.getByText('A waitlist position will be assigned')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm waitlist' }).click();

  await expect(page.getByText('STAT252 Applied Statistics waitlisted successfully.')).toBeVisible();
  await expect(page.getByText('Waitlist position: 2')).toBeVisible();
  await expect(page.getByText('Current Waitlists')).toBeVisible();
});

test('AT-UC18-02 section not eligible for waitlist offers alternatives', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByLabel('Search Offerings').fill('O_NOWL');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('link', { name: 'Join Waitlist' }).click();

  await expect(page.getByText('Waitlist request was blocked.')).toBeVisible();
  await expect(page.getByText('Waitlist unavailable for this section.')).toBeVisible();
  await expect(page.getByText('O_ALT_OPEN')).toBeVisible();
});

test('AT-UC18-03 duplicate waitlist requests are prevented', async ({ page }) => {
  await login(page, 'conflict.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByLabel('Search Offerings').fill('STAT');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('link', { name: 'Join Waitlist' }).first().click();
  await page.getByRole('button', { name: 'Confirm waitlist' }).click();

  await expect(page.getByText('already waitlisted')).toBeVisible();
});

test('AT-UC18-04 ineligible students are told why waitlisting is blocked', async ({ page }) => {
  await login(page, 'hold.student@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByLabel('Search Offerings').fill('STAT');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('link', { name: 'Join Waitlist' }).first().click();
  await page.getByRole('button', { name: 'Confirm waitlist' }).click();

  await expect(page.getByText('Resolve the registration hold before retrying.')).toBeVisible();
});

test('AT-UC18-05 waitlist recording failures leave no entry behind', async ({ page, request }) => {
  await setEnrollmentFixtures(request, {
    waitlistFailureIdentifiers: ['outage.user@example.com']
  });

  await login(page, 'outage.user@example.com');
  await page.getByRole('link', { name: 'Open Enrollment Hub' }).click();
  await page.getByLabel('Search Offerings').fill('STAT');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('link', { name: 'Join Waitlist' }).first().click();
  await page.getByRole('button', { name: 'Confirm waitlist' }).click();

  await expect(page.getByText('No waitlist entry was created.')).toBeVisible();
  await expect(page.getByText('No waitlist position was assigned.')).toBeVisible();
  await expect(page.getByText('Current Waitlists')).toBeVisible();
  await expect(page.getByText('STAT252 Applied Statistics (O_FULL)')).toHaveCount(0);
});
