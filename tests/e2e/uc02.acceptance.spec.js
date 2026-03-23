const { test, expect } = require('@playwright/test');

const { resetFixtures } = require('./reset-fixtures');

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC02-01 successful login routes to the dashboard and logout returns to login', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Go to login' }).click();
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Welcome, userA' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('AT-UC02-02 invalid credentials show an error and retry succeeds', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill('WrongPass!000');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('alert')).toContainText('Invalid username/email or password.');

  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
});

test('AT-UC02-03 repeated failures lock the account temporarily', async ({ page }) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.goto('/login');
    await page.getByLabel('Username or email').fill('userA@example.com');
    await page.getByLabel('Password').fill('WrongPass!000');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toContainText('Invalid username/email or password.');
  }

  await page.goto('/login');
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('alert')).toContainText('temporarily locked');
});

test('AT-UC02-04 locked and disabled accounts are denied with guidance', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('locked.user@example.com');
  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('temporarily locked');

  await page.goto('/login');
  await page.getByLabel('Username or email').fill('disabled.user@example.com');
  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('Please contact support');
});

test('AT-UC02-05 authentication service outage denies login and shows guidance', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('outage.user@example.com');
  await page.getByLabel('Password').fill('CorrectPass!234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('alert')).toContainText('Login service is unavailable');
});
