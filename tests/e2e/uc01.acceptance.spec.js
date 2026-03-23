const { test, expect } = require('@playwright/test');

const { RESET_TOKENS } = require('../../src/db/migrations/seed-login-fixtures');
const { resetFixtures } = require('./reset-fixtures');

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC01-01 logged-in users can navigate from the dashboard and change their password successfully', async ({ browser, page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Go to login' }).click();
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.locator('#security-center').getByRole('link', { name: 'Change password' }).click();
  await expect(page.getByText('Use at least 12 characters.')).toBeVisible();
  await expect(page.getByText('Include at least one uppercase letter.')).toBeVisible();
  await page.getByLabel('Current password').fill('CorrectPass!234');
  await page.getByLabel('New password').fill('NewSecure!234');
  await page.getByRole('button', { name: 'Update password' }).click();

  await expect(page.getByRole('heading', { name: 'Password updated' })).toBeVisible();

  const oldContext = await browser.newContext();
  const oldPage = await oldContext.newPage();
  await oldPage.goto('/login');
  await oldPage.getByLabel('Username or email').fill('userA@example.com');
  await oldPage.getByLabel('Password').fill('CorrectPass!234');
  await oldPage.getByRole('button', { name: 'Sign in' }).click();
  await expect(oldPage.getByRole('alert')).toContainText('Invalid username/email or password.');
  await oldContext.close();

  const newContext = await browser.newContext();
  const newPage = await newContext.newPage();
  await newPage.goto('/login');
  await newPage.getByLabel('Username or email').fill('userA@example.com');
  await newPage.getByLabel('Password').fill('NewSecure!234');
  await newPage.getByRole('button', { name: 'Sign in' }).click();
  await expect(newPage).toHaveURL(/\/dashboard$/);
  await newContext.close();
});

test('AT-UC01-02 reset-token recovery accepts a valid token and rejects an expired token', async ({ page }) => {
  await page.goto(`/auth/reset-password?token=${RESET_TOKENS.valid}`);
  await page.getByLabel('Reset token').fill(RESET_TOKENS.valid);
  await page.getByLabel('New password').fill('TokenSecure!234');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByRole('heading', { name: 'Password updated' })).toBeVisible();

  await page.goto('/auth/reset-password');
  await page.getByLabel('Reset token').fill(RESET_TOKENS.expired);
  await page.getByLabel('New password').fill('TokenSecure!234');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByRole('alert')).toContainText('Reset token verification failed');
});

test('AT-UC01-03 policy failures and cooldown feedback are shown without changing the password', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.locator('#security-center').getByRole('link', { name: 'Change password' }).click();

  await page.getByLabel('Current password').fill('CorrectPass!234');
  await page.getByLabel('New password').fill('bad');
  await page.getByRole('button', { name: 'Update password' }).click();
  await expect(page.getByRole('alert')).toContainText('password requirements');

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.goto('/account/security/password-change');
    await page.getByLabel('Current password').fill('WrongPass!000');
    await page.getByLabel('New password').fill('NewSecure!234');
    await page.getByRole('button', { name: 'Update password' }).click();
  }

  await expect(page.getByRole('alert')).toContainText('Retry after 30 seconds');
});

test('AT-UC01-04 admins can change another users password without target verification fields', async ({ browser, page }) => {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('admin@example.com');
  await page.getByLabel('Password').fill('AdminPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.locator('#security-center').getByRole('link', { name: 'Reset userA password' }).click();
  await expect(page.getByText(/Administrative authorization is sufficient/)).toBeVisible();
  await expect(page.getByLabel('Current password')).toHaveCount(0);
  await expect(page.getByLabel('Reset token')).toHaveCount(0);
  await page.getByLabel('New password').fill('AdminSet!234');
  await page.getByRole('button', { name: 'Apply password change' }).click();
  await expect(page.getByRole('heading', { name: 'Password updated' })).toBeVisible();

  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await userPage.goto('/login');
  await userPage.getByLabel('Username or email').fill('userA@example.com');
  await userPage.getByLabel('Password').fill('AdminSet!234');
  await userPage.getByRole('button', { name: 'Sign in' }).click();
  await expect(userPage).toHaveURL(/\/dashboard$/);
  await userContext.close();
});

test('AT-UC01-05 cancelling the flow discards unsaved inputs and makes no password changes', async ({ browser, page }) => {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.locator('#security-center').getByRole('link', { name: 'Change password' }).click();

  await page.getByLabel('Current password').fill('CorrectPass!234');
  await page.getByLabel('New password').fill('CancelMe!234');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Password change cancelled' })).toBeVisible();

  const oldContext = await browser.newContext();
  const oldPage = await oldContext.newPage();
  await oldPage.goto('/login');
  await oldPage.getByLabel('Username or email').fill('userA@example.com');
  await oldPage.getByLabel('Password').fill('CorrectPass!234');
  await oldPage.getByRole('button', { name: 'Sign in' }).click();
  await expect(oldPage).toHaveURL(/\/dashboard$/);
  await oldContext.close();
});
