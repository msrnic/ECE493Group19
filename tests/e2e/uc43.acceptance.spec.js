const { test, expect } = require('@playwright/test');

const { resetFixtures, setAccountCreationFixtures } = require('./reset-fixtures');

const ADMIN_PASSWORD = 'AdminPass!234';
const VALID_PASSWORD = 'ValidPass!234';

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('admin@example.com');
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#admin-operations')).toBeVisible();
}

async function openCreateUser(page) {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: 'Create New User' }).click();
  await expect(page.getByRole('heading', { name: 'Create New User' })).toBeVisible();
}

async function submitCreateUser(page, details) {
  await page.getByLabel('Email').fill(details.email);
  await page.getByLabel('Role').selectOption({ label: details.role || 'Student' });
  await page.locator('#password').fill(details.password);
  await page.getByRole('button', { name: 'Create User' }).click();
}

async function expectFirstLoginPasswordChange(browser, email, password) {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:3111' });

  try {
    const page = await context.newPage();
    await page.goto('/login');
    await page.getByLabel('Username or email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/account\/security\/password-change\?required=1$/);
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
  } finally {
    await context.close();
  }
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC43-01 create account successfully with preset role and password', async ({ page, browser }) => {
  await openCreateUser(page);

  await submitCreateUser(page, {
    email: 'acceptance.success@example.com',
    password: VALID_PASSWORD,
    role: 'Student'
  });

  await expect(page.getByText('User created successfully.')).toBeVisible();
  await expect(page.getByText('Assigned role: Student')).toBeVisible();
  await expect(page.getByText('Must change password on first sign-in: Yes')).toBeVisible();
  await expect(page.getByText('Notification status: sent')).toBeVisible();

  await expectFirstLoginPasswordChange(browser, 'acceptance.success@example.com', VALID_PASSWORD);
});

test('AT-UC43-02 invalid user information is rejected until corrected', async ({ page }) => {
  await openCreateUser(page);

  await submitCreateUser(page, {
    email: 'not-an-email',
    password: VALID_PASSWORD,
    role: 'Student'
  });

  await expect(page.getByText('Please correct the highlighted fields.')).toBeVisible();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveValue('not-an-email');

  await page.getByLabel('Email').fill('acceptance.identity.fixed@example.com');
  await page.locator('#password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Create User' }).click();

  await expect(page.getByText('User created successfully.')).toBeVisible();
});

test('AT-UC43-03 role becomes invalid or disallowed and succeeds after correction', async ({ page, request }) => {
  await openCreateUser(page);
  await page.getByLabel('Email').fill('acceptance.role@example.com');
  await page.getByLabel('Role').selectOption({ label: 'Student' });
  await page.locator('#password').fill(VALID_PASSWORD);

  await setAccountCreationFixtures(request, {
    roleAssignabilityByKey: { student: false }
  });
  await page.getByRole('button', { name: 'Create User' }).click();

  await expect(page.getByText('Selected role is no longer available. Choose another role.')).toBeVisible();

  await setAccountCreationFixtures(request, {});
  await page.goto('/admin/users/new');
  await expect(page.getByRole('heading', { name: 'Create New User' })).toBeVisible();
  await submitCreateUser(page, {
    email: 'acceptance.role@example.com',
    password: VALID_PASSWORD,
    role: 'Student'
  });

  await expect(page.getByText('User created successfully.')).toBeVisible();
});

test('AT-UC43-04 password policy failures are shown until corrected', async ({ page }) => {
  await openCreateUser(page);

  await submitCreateUser(page, {
    email: 'acceptance.password@example.com',
    password: 'short',
    role: 'Student'
  });

  await expect(page.getByText('Password does not meet the policy requirements.')).toBeVisible();
  await expect(
    page.locator('ul.rule-list li').filter({ hasText: 'Use at least 12 characters.' }).first()
  ).toBeVisible();

  await page.locator('#password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Create User' }).click();

  await expect(page.getByText('User created successfully.')).toBeVisible();
});

test('AT-UC43-05 duplicate identifiers are rejected until a unique email is provided', async ({ page }) => {
  await openCreateUser(page);

  await submitCreateUser(page, {
    email: ' USERA@EXAMPLE.COM ',
    password: VALID_PASSWORD,
    role: 'Student'
  });

  await expect(page.getByRole('alert')).toHaveText('An account with that email already exists.');

  await page.getByLabel('Email').fill('acceptance.unique@example.com');
  await page.locator('#password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Create User' }).click();

  await expect(page.getByText('User created successfully.')).toBeVisible();
});

test('AT-UC43-06 system failures do not create the account and a later retry can succeed', async ({ page, request }) => {
  await setAccountCreationFixtures(request, {
    createFailureIdentifiers: ['acceptance.failure@example.com']
  });
  await openCreateUser(page);

  await submitCreateUser(page, {
    email: 'acceptance.failure@example.com',
    password: VALID_PASSWORD,
    role: 'Student'
  });

  await expect(page.getByText('We could not create the account. Please retry later.')).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveValue('acceptance.failure@example.com');

  await setAccountCreationFixtures(request, {});
  await page.locator('#password').fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Create User' }).click();

  await expect(page.getByText('User created successfully.')).toBeVisible();
});

test('AT-UC43-07 notification failures are reported without rolling back the created account', async ({ page, request, browser }) => {
  await setAccountCreationFixtures(request, {
    notificationFailureIdentifiers: ['acceptance.notify@example.com']
  });
  await openCreateUser(page);

  await submitCreateUser(page, {
    email: 'acceptance.notify@example.com',
    password: VALID_PASSWORD,
    role: 'Student'
  });

  await expect(page.getByText('User created successfully, but notification delivery failed.')).toBeVisible();
  await expect(page.getByText('Notification status: failed')).toBeVisible();
  await expect(page.getByText(/Resend/i)).toHaveCount(0);
  await expect(page.getByText(/Copy/i)).toHaveCount(0);

  await expectFirstLoginPasswordChange(browser, 'acceptance.notify@example.com', VALID_PASSWORD);
});
