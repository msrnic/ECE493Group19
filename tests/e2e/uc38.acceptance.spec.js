const { test, expect } = require('@playwright/test');

const { resetFixtures, setForceWithdrawalFixtures } = require('./reset-fixtures');

const ADMIN_PASSWORD = 'AdminPass!234';

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('admin@example.com');
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#admin-operations')).toBeVisible();
}

async function openForceWithdrawal(page) {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: 'Force Withdraw Students' }).click();
  await expect(page.getByRole('heading', { name: 'Force Withdraw Student' })).toBeVisible();
}

async function selectOfferingByText(page, text) {
  await page.locator('#offeringId').evaluate((element, expectedText) => {
    const option = [...element.options].find((entry) => entry.text.includes(expectedText));
    if (!option) {
      throw new Error(`Offering option not found for: ${expectedText}`);
    }
    element.value = option.value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, text);
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC38-01 admin force withdraws an enrolled student successfully', async ({ page }) => {
  await openForceWithdrawal(page);
  await page.getByLabel('Student ID or email').fill('conflictStudent');
  await selectOfferingByText(page, 'O_CONFLICT');
  await page.getByLabel('Required reason').fill('Administrative removal after enrollment review.');
  await page.getByRole('button', { name: 'Force Withdraw' }).click();
  await expect(page.getByText('Forced withdrawal completed successfully.')).toBeVisible();
});

test('AT-UC38-02 student not enrolled is rejected', async ({ page }) => {
  await openForceWithdrawal(page);
  await page.getByLabel('Student ID or email').fill('userA');
  await selectOfferingByText(page, 'O_CONFLICT');
  await page.getByLabel('Required reason').fill('Administrative removal after enrollment review.');
  await page.getByRole('button', { name: 'Force Withdraw' }).click();
  await expect(page.getByRole('alert')).toHaveText('The selected student is not currently enrolled in this offering.');
});

test('AT-UC38-03 admin can cancel before applying forced withdrawal', async ({ page }) => {
  await openForceWithdrawal(page);
  await page.getByLabel('Student ID or email').fill('conflictStudent');
  await selectOfferingByText(page, 'O_CONFLICT');
  await page.getByLabel('Required reason').fill('Administrative removal after enrollment review.');
  await page.getByRole('button', { name: 'Review Implications' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Forced withdrawal was canceled. Enrollment remains unchanged.')).toBeVisible();
});

test('AT-UC38-04 processing failure leaves enrollment unchanged and later retry can succeed', async ({ page, request }) => {
  await setForceWithdrawalFixtures(request, {
    failureIdentifiers: ['conflict.student@example.com']
  });
  await openForceWithdrawal(page);
  await page.getByLabel('Student ID or email').fill('conflictStudent');
  await selectOfferingByText(page, 'O_CONFLICT');
  await page.getByLabel('Required reason').fill('Administrative removal after enrollment review.');
  await page.getByRole('button', { name: 'Force Withdraw' }).click();
  await expect(page.getByRole('alert')).toHaveText('Forced withdrawal could not be completed right now. No withdrawal changes were saved.');

  await setForceWithdrawalFixtures(request, {});
  await page.getByRole('button', { name: 'Force Withdraw' }).click();
  await expect(page.getByText('Forced withdrawal completed successfully.')).toBeVisible();
});

test('AT-UC38-05 audit logging failures surface pending-audit status after completion', async ({ page, request }) => {
  await setForceWithdrawalFixtures(request, {
    auditFailureIdentifiers: ['conflict.student@example.com']
  });
  await openForceWithdrawal(page);
  await page.getByLabel('Student ID or email').fill('conflictStudent');
  await selectOfferingByText(page, 'O_CONFLICT');
  await page.getByLabel('Required reason').fill('Administrative removal after enrollment review.');
  await page.getByRole('button', { name: 'Force Withdraw' }).click();
  await expect(page.getByText('Forced withdrawal completed, but audit logging is pending retry.')).toBeVisible();
  await expect(page.getByText('Pending Audit')).toBeVisible();
});
