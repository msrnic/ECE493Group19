const { test, expect } = require('@playwright/test');

const { resetFixtures, setClassSearchFixtures } = require('./reset-fixtures');

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

test('AT-UC13-01 student can search for available classes and open details', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'Search for available classes' }).click();
  await page.getByLabel('Keyword').fill('ENGL');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByText('Technical Communication')).toBeVisible();
  await page.getByRole('link', { name: 'View class details' }).click();
  await expect(page.getByText('ENGL210 Technical Communication')).toBeVisible();
});

test('AT-UC13-02 system error during class search shows safe feedback', async ({ page, request }) => {
  await setClassSearchFixtures(request, {
    failureIdentifiers: ['userA@example.com']
  });

  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'Search for available classes' }).click();
  await page.getByLabel('Keyword').fill('ENGL');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByText('Class search cannot be completed right now. Please retry.')).toBeVisible();
  await expect(page.getByText('Technical Communication')).toHaveCount(0);
});
