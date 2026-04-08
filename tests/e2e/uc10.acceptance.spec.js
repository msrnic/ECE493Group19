const { test, expect } = require('@playwright/test');

const { resetFixtures, setTransactionHistoryFixtures } = require('./reset-fixtures');

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

test('AT-UC10-01 student can open transaction history from the dashboard and review successful payments', async ({ page }) => {
  await login(page, 'userA@example.com');

  await page.getByRole('link', { name: 'Records of past financial transactions' }).click();

  await expect(page).toHaveURL(/\/transactions\/history/);
  await expect(page.getByRole('heading', { name: 'Transaction History' })).toBeVisible();
  await expect(page.locator('#transaction-history-status')).toContainText('Transaction history loaded successfully.');
  await expect(page.getByText('Reference number: TXN-2026-0001')).toBeVisible();
  await expect(page.getByText('Succeeded')).toBeVisible();
  await expect(page.getByText('Pending')).toBeVisible();
  await expect(page.getByText('Campus Parking')).toHaveCount(0);
});

test('AT-UC10-02 retrieval errors show a failure state and retry succeeds after recovery', async ({ page, request }) => {
  await setTransactionHistoryFixtures(request, {
    retrievalFailureIdentifiers: ['userA@example.com']
  });

  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'Records of past financial transactions' }).click();

  await expect(page.locator('#transaction-history-status')).toContainText('Transaction history is temporarily unavailable. Please retry.');
  await expect(page.getByText('Unable to load transaction history')).toBeVisible();

  await setTransactionHistoryFixtures(request, {});
  await page.getByRole('link', { name: 'Retry transaction history' }).click();

  await expect(page.locator('#transaction-history-status')).toContainText('Transaction history loaded successfully.');
  await expect(page.getByText('Reference number: TXN-2026-0004')).toBeVisible();
});

test('AT-UC10-03 students with no fee-payment history see a clear empty state', async ({ page, request }) => {
  await setTransactionHistoryFixtures(request, {
    recordsByIdentifier: {
      'userA@example.com': []
    }
  });

  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'Records of past financial transactions' }).click();

  await expect(page.getByText('No transactions found')).toBeVisible();
  await expect(page.locator('#transaction-history-status')).toContainText('No past tuition or fee payment records are available right now.');
});
