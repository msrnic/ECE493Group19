const { test, expect } = require('@playwright/test');

const { resetFixtures, setForceEnrollFixtures } = require('./reset-fixtures');

const ADMIN_PASSWORD = 'AdminPass!234';

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('admin@example.com');
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#admin-operations')).toBeVisible();
}

async function openForceEnroll(page) {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: 'Force Enroll Students' }).click();
  await expect(page.getByRole('heading', { name: 'Force Enroll Student' })).toBeVisible();
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

async function submitForceEnroll(page, values) {
  await page.getByLabel('Student ID or email').fill(values.studentIdentifier);
  await selectOfferingByText(page, values.offeringText);
  await page.getByLabel('Required reason').fill(values.reason);
  await page.getByRole('button', { name: 'Force Enroll' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC37-01 admin force enrolls a student despite unmet prerequisites', async ({ page }) => {
  await openForceEnroll(page);

  await submitForceEnroll(page, {
    offeringText: 'O_OPEN',
    reason: 'Override required for exceptional academic progression.',
    studentIdentifier: 'prereqStudent'
  });

  await expect(page.getByText('prereqStudent was force enrolled successfully.')).toBeVisible();
  await expect(page.getByText(/audit record was created/i)).toBeVisible();
});

test('AT-UC37-02 unknown student or offering is rejected without creating enrollment', async ({ page }) => {
  await openForceEnroll(page);
  await page.getByLabel('Student ID or email').fill('missing-student');
  await selectOfferingByText(page, 'O_OPEN');
  await page.getByLabel('Required reason').fill('Override required for exceptional academic progression.');
  await page.getByRole('button', { name: 'Force Enroll' }).click();
  await expect(page.getByRole('alert')).toHaveText('Student was not found.');

  await page.getByLabel('Student ID or email').fill('prereqStudent');
  await selectOfferingByText(page, 'O_OPEN');
  await page.getByLabel('Required reason').fill('short');
  await page.getByRole('button', { name: 'Force Enroll' }).click();
  await expect(page.getByText(/reason between 10 and 500 characters/i)).toBeVisible();
});

test('AT-UC37-03 hard constraints still block force enrollment for ineligible students', async ({ page }) => {
  await openForceEnroll(page);

  await submitForceEnroll(page, {
    offeringText: 'O_OPEN',
    reason: 'Override required for exceptional academic progression.',
    studentIdentifier: 'disabled.user@example.com'
  });

  await expect(page.getByRole('alert')).toHaveText('The selected student is not eligible for enrollment.');
});

test('AT-UC37-04 full sections require explicit same-admin confirmation before enrollment completes', async ({ page }) => {
  await openForceEnroll(page);

  await submitForceEnroll(page, {
    offeringText: 'O_FULL',
    reason: 'Override required to support time-sensitive registration resolution.',
    studentIdentifier: 'outage.user@example.com'
  });

  await expect(page.getByText(/Over-capacity confirmation is required/i)).toBeVisible();
  await page.getByRole('button', { name: 'Confirm Over-Capacity Override' }).click();
  await expect(page.getByText('outageUser was force enrolled successfully.')).toBeVisible();
});

test('AT-UC37-05 system failures leave enrollment unchanged and allow later retry', async ({ page, request }) => {
  await setForceEnrollFixtures(request, {
    failureIdentifiers: ['prereq.student@example.com']
  });
  await openForceEnroll(page);

  await submitForceEnroll(page, {
    offeringText: 'O_OPEN',
    reason: 'Override required for exceptional academic progression.',
    studentIdentifier: 'prereqStudent'
  });

  await expect(page.getByRole('alert')).toHaveText(
    'Force enrollment could not be completed right now. No enrollment changes were saved.'
  );

  await setForceEnrollFixtures(request, {});
  await page.getByLabel('Required reason').fill('Override required for exceptional academic progression.');
  await page.getByRole('button', { name: 'Force Enroll' }).click();
  await expect(page.getByText('prereqStudent was force enrolled successfully.')).toBeVisible();
});
