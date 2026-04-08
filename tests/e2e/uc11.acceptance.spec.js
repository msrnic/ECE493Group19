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

test('AT-UC11-01 student adds a bank account from payment methods and sees it available for fee payments', async ({ page }) => {
  await login(page, 'userA@example.com');

  await page.getByRole('link', { name: 'Store banking information' }).click();
  await expect(page).toHaveURL(/\/account\/payment-methods$/);
  await expect(page.getByRole('heading', { name: 'Payment Methods' })).toBeVisible();
  await expect(page.getByText('No payment methods yet')).toBeVisible();

  await page.getByRole('link', { name: 'Add bank account' }).click();
  await page.getByLabel('Account Holder Name').fill('Taylor Example');
  await page.getByLabel('Routing Number').fill('021000021');
  await page.getByLabel('Account Number').fill('123456789');
  await page.getByRole('button', { name: 'Save Bank Account' }).click();

  await expect(page.getByText('Bank account saved.')).toBeVisible();
  await expect(page.getByText('Taylor Example')).toBeVisible();
  await expect(page.getByText('Acct ending 6789')).toBeVisible();
  await expect(page.getByText('Available for fee payments')).toBeVisible();
});

test('AT-UC11-02 student cancels add-bank flow and returns without saving', async ({ page }) => {
  await login(page, 'userA@example.com');

  await page.getByRole('link', { name: 'Store banking information' }).click();
  await page.getByRole('link', { name: 'Add bank account' }).click();
  await page.getByLabel('Account Holder Name').fill('Cancel Example');
  await page.getByLabel('Routing Number').fill('021000021');
  await page.getByLabel('Account Number').fill('123456789');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page).toHaveURL(/\/account\/payment-methods\?cancelled=1$/);
  await expect(page.getByText('Bank account entry cancelled. No changes were saved.')).toBeVisible();
  await expect(page.getByText('Cancel Example')).toHaveCount(0);
});

test('AT-UC11-03 invalid bank details are rejected and corrected details save successfully', async ({ page }) => {
  await login(page, 'userA@example.com');

  await page.getByRole('link', { name: 'Store banking information' }).click();
  await page.getByRole('link', { name: 'Add bank account' }).click();
  await page.getByRole('button', { name: 'Save Bank Account' }).click();

  await expect(page.getByText('Please correct the highlighted banking details.')).toBeVisible();
  await expect(page.getByText('Enter the account holder name.')).toBeVisible();
  await expect(page.getByText('Enter the 9-digit routing number.')).toBeVisible();
  await expect(page.getByText('Enter the bank account number.')).toBeVisible();

  await page.getByLabel('Account Holder Name').fill('Recovery Example');
  await page.getByLabel('Routing Number').fill('021000021');
  await page.getByLabel('Account Number').fill('987654321');
  await page.getByRole('button', { name: 'Save Bank Account' }).click();

  await expect(page.getByText('Bank account saved.')).toBeVisible();
  await expect(page.getByText('Recovery Example')).toBeVisible();
  await expect(page.getByText('Acct ending 4321')).toBeVisible();
});
