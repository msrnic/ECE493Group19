const { test, expect } = require('@playwright/test');

const { resetFixtures, setDashboardFixtures } = require('./reset-fixtures');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';
const ADMIN_PASSWORD = 'AdminPass' + String.fromCharCode(33) + '234';

async function loginAsStudent(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

async function loginAsProfessor(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('professor@example.com');
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('admin@example.com');
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC03-01 dashboard loads after login and permitted feature navigation works', async ({ page }) => {
  await loginAsStudent(page);

  await expect(page.getByRole('heading', { name: 'Welcome, userA' })).toBeVisible();
  await expect(page.locator('#inbox')).toBeVisible();
  await expect(page.locator('#security-center')).toBeVisible();
  await expect(page.locator('#student-academics')).toBeVisible();
  await expect(page.locator('#schedule-builder')).toBeVisible();
  await expect(page.locator('#enrollment-hub')).toBeVisible();
  await expect(page.locator('#financial-summary')).toBeVisible();
  await expect(page.locator('#financial-summary')).toContainText('Outstanding balance: $1,245.67');
  await expect(page.url()).toContain('/dashboard');
  await expect(page.locator('#dashboard-navigation li')).toHaveText([
    'Inbox',
    'Personal Profile',
    'Academic Records',
    'Schedule Builder',
    'Enrollment Hub',
    'Financial Summary'
  ]);
  await expect(page.locator('.dashboard-section-card h2')).toHaveText([
    'Inbox',
    'Personal Profile',
    'Academic Records',
    'Schedule Builder',
    'Enrollment Hub',
    'Financial Summary'
  ]);

  await page.getByRole('link', { name: 'Personal Profile' }).click();
  await expect(page.url()).toContain('/dashboard#security-center');
  await expect(page.locator('#security-center')).toBeVisible();

  await page.getByRole('link', { name: 'Change password' }).first().click();
  await expect(page.url()).toContain('/account/security/password-change');
  await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
});

test('AT-UC03-02 partial dashboard states are shown and retry restores the full dashboard', async ({ page, request }) => {
  await setDashboardFixtures(request, {
    unavailableSectionsByIdentifier: {
      'usera@example.com': ['financial-summary']
    }
  });

  await loginAsStudent(page);

  await expect(page.url()).toContain('/dashboard');
  await expect(page.locator('#dashboard-status')).toContainText('Some dashboard sections are currently unavailable.');
  await expect(page.locator('#financial-summary')).toContainText('Unavailable');
  await expect(page.locator('#financial-summary')).toContainText(
    'Live financial data is temporarily unavailable. Showing the last confirmed values.'
  );
  await expect(page.getByRole('button', { name: 'Retry unavailable sections' })).toBeVisible();

  await page.getByRole('link', { name: 'Academic Records' }).click();
  await expect(page.url()).toContain('/dashboard#student-academics');
  await expect(page.locator('#student-academics')).toBeVisible();

  await setDashboardFixtures(request, {});
  await page.getByRole('button', { name: 'Retry unavailable sections' }).click();

  await expect(page.locator('#dashboard-status')).toContainText('Dashboard loaded successfully.');
  await expect(page.locator('#financial-summary')).toContainText('Available');
  await expect(page.getByRole('button', { name: 'Retry unavailable sections' })).toHaveCount(0);
});

test('AT-UC03-03 professor dashboard shows inbox, personal profile, and current courses only', async ({ page }) => {
  await loginAsProfessor(page);

  await expect(page.getByRole('heading', { name: 'Welcome, profA' })).toBeVisible();
  await expect(page.locator('#inbox')).toBeVisible();
  await expect(page.locator('#security-center')).toBeVisible();
  await expect(page.locator('#teaching-workload')).toBeVisible();
  await expect(page.locator('#grading-queue')).toHaveCount(0);
  await expect(page.locator('#dashboard-navigation li')).toHaveText([
    'Inbox',
    'Personal Profile',
    'Current Courses'
  ]);
  await expect(page.locator('.dashboard-section-card h2')).toHaveText([
    'Inbox',
    'Personal Profile',
    'Current Courses'
  ]);

  await page.getByRole('link', { name: 'Current Courses' }).click();
  await expect(page.url()).toContain('/dashboard#teaching-workload');
  await expect(page.locator('#teaching-workload')).toContainText('ECE493 Software Engineering (instructor)');
});


test('AT-UC03-04 admin dashboard shows inbox, personal profile, admin operations, and security center in order', async ({ page }) => {
  await loginAsAdmin(page);

  await expect(page.getByRole('heading', { name: 'Welcome, adminA' })).toBeVisible();
  await expect(page.locator('#inbox')).toBeVisible();
  await expect(page.locator('#personal-profile')).toBeVisible();
  await expect(page.locator('#admin-operations')).toBeVisible();
  await expect(page.locator('#security-center')).toBeVisible();
  await expect(page.locator('#dashboard-navigation li')).toHaveText([
    'Inbox',
    'Personal Profile',
    'Admin Operations',
    'Security Center'
  ]);
  await expect(page.locator('.dashboard-section-card h2')).toHaveText([
    'Inbox',
    'Personal Profile',
    'Admin Operations',
    'Security Center'
  ]);

  await expect(page.locator('#personal-profile').getByRole('link', { name: 'Change Password' })).toBeVisible();
  await expect(page.locator('#security-center').getByLabel('Choose a user')).toBeVisible();
  await expect(page.locator('#security-center').getByRole('option', { name: 'Reset userA password' })).toBeVisible();
  await expect(page.locator('#security-center').getByRole('button', { name: 'Open' })).toBeVisible();

  await page.getByRole('link', { name: 'Personal Profile' }).click();
  await expect(page.url()).toContain('/dashboard#personal-profile');
});
