const { test, expect } = require('@playwright/test');

const { resetFixtures, setProfileFixtures } = require('./reset-fixtures');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAsStudent(page) {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill('userA@example.com');
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

async function openPersonalInformation(page) {
  await loginAsStudent(page);
  await page.getByRole('link', { name: 'Update Personal Information' }).click();
  await expect(page.getByRole('heading', { name: 'Update Personal Information' })).toBeVisible();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC05-01 edit personal details with valid data', async ({ page }) => {
  await openPersonalInformation(page);

  await expect(page.getByLabel('First Name')).toHaveValue('Alex');
  await expect(page.getByLabel('Last Name')).toHaveValue('Example');
  await expect(page.getByLabel('Birthday (dd/mm/yyyy)')).toHaveValue('15/04/2001');
  await expect(page.getByLabel('Country of Origin')).toHaveValue('Canada');

  await page.getByLabel('First Name').fill('Jamie');
  await page.getByLabel('Last Name').fill('Student');
  await page.getByLabel('Birthday (dd/mm/yyyy)').fill('16/05/2002');
  await page.getByLabel('Country of Origin').fill('United States');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Personal information updated successfully.')).toBeVisible();
  await page.goto('/account/personal-information');
  await expect(page.getByLabel('First Name')).toHaveValue('Jamie');
  await expect(page.getByLabel('Last Name')).toHaveValue('Student');
  await expect(page.getByLabel('Birthday (dd/mm/yyyy)')).toHaveValue('16/05/2002');
  await expect(page.getByLabel('Country of Origin')).toHaveValue('United States');
});

test('AT-UC05-02 invalid personal details are rejected until corrected', async ({ page }) => {
  await openPersonalInformation(page);

  await page.getByLabel('Birthday (dd/mm/yyyy)').fill('2002/05/16');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Please correct the highlighted personal details.')).toBeVisible();
  await expect(page.getByText('Birthday must use the format dd/mm/yyyy.')).toBeVisible();

  await page.getByLabel('Birthday (dd/mm/yyyy)').fill('16/05/2002');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Personal information updated successfully.')).toBeVisible();
  await page.goto('/account/personal-information');
  await expect(page.getByLabel('Birthday (dd/mm/yyyy)')).toHaveValue('16/05/2002');
});

test('AT-UC05-03 save failures leave stored personal details unchanged', async ({ page, request }) => {
  await setProfileFixtures(request, {
    personalSaveFailureIdentifiers: ['userA@example.com']
  });

  await openPersonalInformation(page);

  await page.getByLabel('First Name').fill('Failed');
  await page.getByLabel('Last Name').fill('Write');
  await page.getByLabel('Birthday (dd/mm/yyyy)').fill('16/05/2002');
  await page.getByLabel('Country of Origin').fill('United States');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('We could not save your personal information. Please retry.')).toBeVisible();

  await setProfileFixtures(request, {});
  await page.goto('/account/personal-information');
  await expect(page.getByLabel('First Name')).toHaveValue('Alex');
  await expect(page.getByLabel('Last Name')).toHaveValue('Example');
  await expect(page.getByLabel('Birthday (dd/mm/yyyy)')).toHaveValue('15/04/2001');
  await expect(page.getByLabel('Country of Origin')).toHaveValue('Canada');
});

test('AT-UC05-04 cancelling an edit discards unsaved personal-detail changes', async ({ page }) => {
  await openPersonalInformation(page);

  await page.getByLabel('First Name').fill('Discarded');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page).toHaveURL(/\/dashboard#security-center$/);
  await page.getByRole('link', { name: 'Update Personal Information' }).click();
  await expect(page.getByLabel('First Name')).toHaveValue('Alex');
});
