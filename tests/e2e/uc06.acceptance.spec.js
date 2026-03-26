const { test, expect } = require('@playwright/test');

const { resetFixtures, setProfileFixtures } = require('./reset-fixtures');

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

test('AT-UC06-01 dashboard personal profile shows the user contact information', async ({ page }) => {
  await loginAsStudent(page);

  await expect(page.getByRole('heading', { name: 'Welcome, userA' })).toBeVisible();
  await page.getByRole('link', { name: 'Personal Profile' }).click();

  const profileSection = page.locator('#security-center');
  await expect(profileSection).toContainText('Full Name: Alex Example');
  await expect(profileSection).toContainText('Birthday: 15/04/2001');
  await expect(profileSection).toContainText('Country of Origin: Canada');
  await expect(profileSection).toContainText('Phone Number: +1 780 555 1234');
  await expect(profileSection).toContainText('Email: userA.contact@example.com');
  await expect(profileSection).toContainText('Emergency Contact Name: Jordan Example');
  await expect(profileSection).toContainText('Emergency Contact Phone Number: +1 780 555 2234');
  await expect(profileSection).toContainText('Emergency Contact Relation: Parent');
  await expect(profileSection.getByRole('link', { name: 'Update Contact Information' })).toBeVisible();
});

test('AT-UC06-02 dashboard personal profile keeps available data visible and marks incomplete items', async ({ page, request }) => {
  await setProfileFixtures(request, {
    recordsByIdentifier: {
      'userA@example.com': {
        contactInformation: {
          contactEmail: 'userA.contact@example.com',
          emergencyFullName: null,
          emergencyPhoneNumber: null,
          emergencyRelationship: null,
          phoneNumber: '+1 780 555 1234'
        }
      }
    }
  });

  await loginAsStudent(page);

  const profileSection = page.locator('#security-center');
  await expect(profileSection).toContainText('Phone Number: +1 780 555 1234');
  await expect(profileSection).toContainText('Email: userA.contact@example.com');
  await expect(profileSection).toContainText('Emergency Contact Name: Not provided');
  await expect(profileSection).toContainText('Emergency Contact Phone Number: Not provided');
  await expect(profileSection).toContainText('Emergency Contact Relation: Not provided');
  await expect(profileSection.getByRole('link', { name: 'Update Contact Information' })).toBeVisible();
});
