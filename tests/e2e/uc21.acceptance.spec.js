const { test, expect } = require('@playwright/test');

const {
  resetFixtures,
  setStudentRecordFixtures,
  setTranscriptFixtures
} = require('./reset-fixtures');

async function login(page, identifier, password = 'CorrectPass!234') {
  await page.goto('/login');
  await page.getByLabel('Username or email').fill(identifier);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.beforeEach(async ({ request }) => {
  await resetFixtures(request);
});

test('AT-UC21-01 student views full transcript', async ({ page }) => {
  await login(page, 'userA@example.com');
  await page.getByRole('link', { name: 'View my transcript' }).click();
  await expect(page).toHaveURL(/\/academic\/transcript$/);
  await expect(page.getByRole('heading', { name: 'Transcript' })).toBeVisible();
  await expect(page.getByText('Final result: A-')).toBeVisible();
});

test('AT-UC21-02 student sees partial transcript messaging when entries are incomplete', async ({ page }) => {
  await login(page, 'hold.student@example.com');
  await page.goto('/academic/transcript');
  await expect(page.getByText('Some transcript details are incomplete.')).toBeVisible();
  await expect(page.getByText('STAT151')).toBeVisible();
});

test('AT-UC21-03 unauthorized actor is denied and unavailable state is distinct', async ({ page, request }) => {
  await setTranscriptFixtures(request, {
    retrievalFailureIdentifiers: ['outage.user@example.com']
  });
  await login(page, 'outage.user@example.com');
  await page.goto('/academic/transcript');
  await expect(page.getByText('Transcript unavailable')).toBeVisible();

  await resetFixtures(request);
  await setStudentRecordFixtures(request, {
    accessStatesByIdentifier: {
      'restricted.inbox@example.com': {
        courseHistoryAccess: 'denied',
        transcriptAccess: 'denied'
      }
    }
  });
  await login(page, 'restricted.inbox@example.com');
  await page.goto('/academic/transcript');
  await expect(page.getByText('Access denied')).toBeVisible();
});
