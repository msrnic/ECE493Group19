const { test, expect } = require('@playwright/test');

const { resetFixtures, setInboxFixtures } = require('./reset-fixtures');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function login(page, identifier, password = USER_PASSWORD) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill(identifier);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC19-01 student opens built-in inbox and sees delivered academic and admin notifications', async ({ page }) => {
  await login(page, 'userA@example.com');

  await page.getByRole('link', { name: 'Open Inbox' }).click();
  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole('heading', { name: 'Built-in Inbox' })).toBeVisible();
  await expect(page.getByText('ECE493 course update')).toBeVisible();
  await expect(page.getByText('CMPUT301 grade update')).toBeVisible();
  await expect(page.getByText('Welcome to the built-in inbox')).toBeVisible();
});

test('AT-UC19-02 restricted inbox access stores notifications for later viewing', async ({ page }) => {
  await login(page, 'restricted.inbox@example.com');

  await page.getByRole('link', { name: 'Open Inbox' }).click();
  await expect(page.getByText('Inbox access restricted')).toBeVisible();
  await expect(page.getByText('stored for later viewing')).toBeVisible();
});

test('AT-UC19-03 restored inbox access reveals messages after access state is re-enabled', async ({ page, request }) => {
  await setInboxFixtures(request, {
    accessStatesByIdentifier: {
      'restricted.inbox@example.com': {
        accessState: 'enabled',
        restrictionReason: null
      }
    }
  });

  await login(page, 'restricted.inbox@example.com');
  await page.getByRole('link', { name: 'Open Inbox' }).click();
  await expect(page.getByText('Academic standing notice')).toBeVisible();
});
