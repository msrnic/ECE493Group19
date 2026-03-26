const { test, expect } = require('@playwright/test');

const { resetFixtures, setProfileFixtures } = require('./reset-fixtures');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAsStudent(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

async function openContactInformation(page) {
  await loginAsStudent(page);
  await page.getByRole('link', { name: 'Update Contact Information' }).click();
  await expect(page.getByRole('heading', { name: 'Update Contact Information' })).toBeVisible();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC07-01 edit contact information with valid data', async ({ page }) => {
  await openContactInformation(page);

  await expect(page.getByLabel('Email')).toHaveValue('userA.contact@example.com');
  await expect(page.getByLabel('Phone Number').first()).toHaveValue('+1 780 555 1234');
  await expect(page.getByLabel('Full Name')).toHaveValue('Jordan Example');
  await expect(page.getByLabel('Phone Number').nth(1)).toHaveValue('+1 780 555 2234');
  await expect(page.getByLabel('Relation to You')).toHaveValue('Parent');

  await page.getByLabel('Email').fill('jamie.updated@example.com');
  await page.getByLabel('Phone Number').first().fill('+1 780 555 6666');
  await page.getByLabel('Full Name').fill('Morgan Updated');
  await page.getByLabel('Phone Number').nth(1).fill('+1 780 555 7777');
  await page.getByLabel('Relation to You').fill('Sibling');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Contact information updated successfully.')).toBeVisible();
  await page.goto('/account/contact-information');
  await expect(page.getByLabel('Email')).toHaveValue('jamie.updated@example.com');
  await expect(page.getByLabel('Phone Number').first()).toHaveValue('+1 780 555 6666');
  await expect(page.getByLabel('Full Name')).toHaveValue('Morgan Updated');
  await expect(page.getByLabel('Phone Number').nth(1)).toHaveValue('+1 780 555 7777');
  await expect(page.getByLabel('Relation to You')).toHaveValue('Sibling');
});

test('AT-UC07-02 invalid contact formats are rejected until corrected', async ({ page }) => {
  await openContactInformation(page);

  await page.getByLabel('Phone Number').first().fill('123456');
  await page.getByLabel('Phone Number').nth(1).fill('abc123');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Please correct the highlighted contact details.')).toBeVisible();
  await expect(page.getByText('Enter a valid phone number.')).toBeVisible();
  await expect(page.getByText('Enter a valid emergency contact phone number.')).toBeVisible();

  await page.getByLabel('Phone Number').first().fill('+1 780 555 6666');
  await page.getByLabel('Phone Number').nth(1).fill('+1 780 555 7777');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Contact information updated successfully.')).toBeVisible();
  await page.goto('/account/contact-information');
  await expect(page.getByLabel('Phone Number').first()).toHaveValue('+1 780 555 6666');
  await expect(page.getByLabel('Phone Number').nth(1)).toHaveValue('+1 780 555 7777');
});

test('AT-UC07-03 save failures leave stored contact details unchanged', async ({ page, request }) => {
  await setProfileFixtures(request, {
    contactSaveFailureIdentifiers: ['userA@example.com']
  });

  await openContactInformation(page);

  await page.getByLabel('Email').fill('broken.write@example.com');
  await page.getByLabel('Phone Number').first().fill('+1 780 555 3333');
  await page.getByLabel('Full Name').fill('Broken Write');
  await page.getByLabel('Phone Number').nth(1).fill('+1 780 555 4444');
  await page.getByLabel('Relation to You').fill('Friend');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('We could not save your contact information. Please retry later.')).toBeVisible();

  await setProfileFixtures(request, {});
  await page.goto('/account/contact-information');
  await expect(page.getByLabel('Email')).toHaveValue('userA.contact@example.com');
  await expect(page.getByLabel('Phone Number').first()).toHaveValue('+1 780 555 1234');
  await expect(page.getByLabel('Full Name')).toHaveValue('Jordan Example');
  await expect(page.getByLabel('Phone Number').nth(1)).toHaveValue('+1 780 555 2234');
  await expect(page.getByLabel('Relation to You')).toHaveValue('Parent');
});

test('AT-UC07-04 cancelling an edit discards unsaved contact-information changes', async ({ page }) => {
  await openContactInformation(page);

  await page.getByLabel('Email').fill('discarded@example.com');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page).toHaveURL(/\/dashboard#security-center$/);
  await page.getByRole('link', { name: 'Update Contact Information' }).click();
  await expect(page.getByLabel('Email')).toHaveValue('userA.contact@example.com');
});
