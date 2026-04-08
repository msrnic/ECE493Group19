const { test, expect } = require('@playwright/test');

const { resetFixtures } = require('./reset-fixtures');

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

test('AT-UC12-01 student stores a valid credit card', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'Store banking information' }).click();
  await page.getByRole('link', { name: 'Add credit card' }).click();
  await page.getByLabel('Name on Card').fill('Taylor Example');
  await page.getByLabel('Card Number').fill('4111111111114242');
  await page.getByLabel('Expiry Month').fill('12');
  await page.getByLabel('Expiry Year').fill('2028');
  await page.getByRole('button', { name: 'Save Credit Card' }).click();

  await expect(page.getByText('Visa ending 4242 was saved for future fee payments.')).toBeVisible();
  await expect(page.getByText('Credit Card')).toBeVisible();
  await expect(page.getByText('4111111111114242')).toHaveCount(0);
});

test('AT-UC12-02 processor rejection allows safe retry', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.goto('/account/payment-methods/credit-cards/new');
  await page.getByLabel('Name on Card').fill('Taylor Example');
  await page.getByLabel('Card Number').fill('4111111111110002');
  await page.getByLabel('Expiry Month').fill('12');
  await page.getByLabel('Expiry Year').fill('2028');
  await page.getByRole('button', { name: 'Save Credit Card' }).click();
  await expect(page.getByText('The credit card was declined. Check the details and try again.')).toBeVisible();

  await page.getByLabel('Card Number').fill('4111111111114242');
  await page.getByRole('button', { name: 'Save Credit Card' }).click();
  await expect(page.getByText('Visa ending 4242 was saved for future fee payments.')).toBeVisible();
});

test('AT-UC12-03 processor unavailability shows retry guidance and saves nothing', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.goto('/account/payment-methods/credit-cards/new');
  await page.getByLabel('Name on Card').fill('Taylor Example');
  await page.getByLabel('Card Number').fill('4111111111110009');
  await page.getByLabel('Expiry Month').fill('12');
  await page.getByLabel('Expiry Year').fill('2028');
  await page.getByRole('button', { name: 'Save Credit Card' }).click();

  await expect(page.getByText('Credit card processing is temporarily unavailable. Try again later or use another payment method.')).toBeVisible();
  await expect(page.getByText('Visa ending 0009')).toHaveCount(0);
});
