const { test, expect } = require('@playwright/test');

const { resetFixtures, setScheduleBuilderFixtures } = require('./reset-fixtures');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAsStudent(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC22-UC24-UC23 student opens the Schedule Builder, sees pre-generation conflict warnings, and cycles multiple results', async ({ page }) => {
  await loginAsStudent(page);
  await page.getByRole('link', { name: 'Open Schedule Builder' }).click();

  await expect(page.getByRole('heading', { name: 'Schedule Builder' })).toBeVisible();
  await page.locator('input[value="SCH101"]').check();
  await page.locator('input[value="SCH202"]').check();
  await expect(page.locator('#schedule-builder-selection-warning')).toContainText('Possible time conflicts');

  await page.getByLabel('Requested Results').fill('3');
  await page.getByRole('button', { name: 'Generate Schedules' }).click();

  await expect(page.locator('#schedule-builder-position')).toContainText('Showing schedule 1 of 3');
  await expect(page.getByText('Generated Schedules')).toBeVisible();
  await expect(page.getByRole('button', { name: /Next/ })).toBeVisible();

  await page.getByRole('button', { name: /Next/ }).click();
  await expect(page.locator('#schedule-builder-position')).toContainText('Showing schedule 2 of 3');
  await page.getByRole('button', { name: /Previous/ }).click();
  await expect(page.locator('#schedule-builder-position')).toContainText('Showing schedule 1 of 3');
});

test('AT-UC26-UC27-UC28 student saves prioritized constraints as a preset and reloads them later', async ({ page }) => {
  await loginAsStudent(page);
  await page.goto('/schedule-builder');

  await page.getByLabel('No Classes Before').fill('11:00');
  await page.getByLabel('Earliest-Start Priority').selectOption('1');
  await page.getByLabel('Professor Whitelist').fill('Prof. Baker');
  await page.getByLabel('Whitelist Priority').selectOption('2');
  await page.getByRole('button', { name: 'Save Constraints' }).click();
  await expect(page.getByText('Constraints and priorities saved')).toBeVisible();

  await page.getByLabel('New Preset Name').fill('Late Start');
  await page.getByRole('button', { name: 'Save Current Preset' }).click();
  await expect(page.getByText('saved as a reusable preset')).toBeVisible();

  await page.goto('/dashboard');
  await page.getByRole('link', { name: 'Open Schedule Builder' }).click();
  await expect(page.getByLabel('No Classes Before')).toHaveValue('11:00');

  await page.getByLabel('Saved Presets').selectOption({ label: 'Late Start' });
  await page.getByLabel('No Classes Before').fill('');
  await page.getByRole('button', { name: 'Load Selected Preset' }).click();
  await expect(page.getByText('Late Start was loaded')).toBeVisible();
  await expect(page.getByLabel('No Classes Before')).toHaveValue('11:00');
});

test('AT-UC29 compatible shared components render once and missing compatibility blocks generation', async ({ page, request }) => {
  await loginAsStudent(page);
  await page.goto('/schedule-builder');

  await page.locator('input[value="XLIST410A"]').check();
  await page.locator('input[value="XLIST410B"]').check();
  await page.getByLabel('Requested Results').fill('2');
  await page.getByRole('button', { name: 'Generate Schedules' }).click();
  await expect(page.getByText('Shared Components')).toBeVisible();
  await expect(page.getByText('SHR-01 for XLIST410A, XLIST410B')).toBeVisible();

  await setScheduleBuilderFixtures(request, {
    compatibilityStatusByCode: {
      SCH101: 'missing'
    }
  });

  await page.goto('/schedule-builder');
  await page.locator('input[value="SCH101"]').check();
  await page.getByLabel('Requested Results').fill('1');
  await page.getByRole('button', { name: 'Generate Schedules' }).click();
  await expect(page.getByText('Compatibility rules are missing for SCH101')).toBeVisible();
});

test('AT-UC30-UC31 live full and removed-course updates show regenerated best-effort results', async ({ page, request }) => {
  await loginAsStudent(page);
  await page.goto('/schedule-builder');

  await page.locator('input[value="SCH101"]').check();
  await page.locator('input[value="SCH150"]').check();
  await page.locator('input[value="SCH303"]').check();
  await page.getByLabel('Requested Results').fill('4');
  await page.getByRole('button', { name: 'Generate Schedules' }).click();
  await expect(page.locator('#schedule-builder-position')).toContainText('Showing schedule 1 of 4');

  await setScheduleBuilderFixtures(request, {
    courseActivityByCode: {
      SCH150: false
    },
    optionSeatsByCode: {
      'SCH303-A': 0,
      'SCH303-B': 0
    }
  });

  await page.getByRole('button', { name: 'Generate Schedules' }).click();
  await expect(page.getByText('Removed live course updates: SCH150')).toBeVisible();
  await expect(
    page.getByText('These courses are currently full and are shown only as best-effort results: SCH303.')
  ).toBeVisible();
  await expect(page.getByText('Best-effort schedules are included')).toBeVisible();
});
