const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { createTestContext } = require('../helpers/test-context');

const USER_PASSWORD = 'CorrectPass' + String.fromCharCode(33) + '234';

async function loginAs(agent, identifier, password = USER_PASSWORD) {
  await agent
    .post('/login')
    .type('form')
    .send({ identifier, password })
    .expect(302);
}

test('student dashboard links to the Schedule Builder and professor access is forbidden', async () => {
  const context = createTestContext();
  const studentAgent = request.agent(context.app);
  await loginAs(studentAgent, 'userA@example.com');

  const dashboardResponse = await studentAgent.get('/dashboard').expect(200);
  assert.match(dashboardResponse.text, /Open Schedule Builder/);

  const builderResponse = await studentAgent.get('/schedule-builder').expect(200);
  assert.match(builderResponse.text, /Schedule Builder/);
  assert.match(builderResponse.text, /Course Selection/);

  const professorAgent = request.agent(context.app);
  await loginAs(professorAgent, 'professor@example.com');
  const forbiddenResponse = await professorAgent.get('/schedule-builder').expect(403);
  assert.match(forbiddenResponse.text, /student accounts only/);

  context.cleanup();
});

test('schedule builder persists constraints and named presets across reloads', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  await loginAs(agent, 'userA@example.com');

  const saveConstraints = await agent
    .post('/schedule-builder')
    .type('form')
    .send({
      blockedDay: 'Tue',
      blockedEnd: '16:00',
      blockedPriority: '2',
      blockedStart: '15:00',
      earliestStart: '11:00',
      earliestStartPriority: '1',
      intent: 'save-constraints',
      professorBlacklist: 'Prof. Chen',
      professorBlacklistPriority: '4',
      professorWhitelist: 'Prof. Baker',
      professorWhitelistPriority: '3',
      requestedResultCount: '3',
      termCode: '2026FALL'
    })
    .expect(200);
  assert.match(saveConstraints.text, /Constraints and priorities saved/);

  const savePreset = await agent
    .post('/schedule-builder')
    .type('form')
    .send({
      earliestStart: '11:00',
      earliestStartPriority: '1',
      intent: 'save-preset',
      presetName: 'Late Start',
      requestedResultCount: '3',
      termCode: '2026FALL'
    })
    .expect(200);
  assert.match(savePreset.text, /saved as a reusable preset/);

  const presetId = context.db.prepare(`
    SELECT id, version
    FROM saved_constraint_sets
    WHERE display_name = 'Late Start'
  `).get();

  const renamed = await agent
    .post('/schedule-builder')
    .type('form')
    .send({
      intent: 'rename-preset',
      renamePresetName: 'Late Start Updated',
      selectedSavedSetId: String(presetId.id),
      selectedSavedSetVersion: String(presetId.version),
      termCode: '2026FALL'
    })
    .expect(200);
  assert.match(renamed.text, /renamed successfully/);

  const reload = await agent.get('/schedule-builder').expect(200);
  assert.match(reload.text, /value='11:00'/);
  assert.match(reload.text, /Late Start Updated/);

  context.cleanup();
});

test('schedule builder generates ranked results and reflects live full and removed course updates', async () => {
  const context = createTestContext();
  const agent = request.agent(context.app);
  await loginAs(agent, 'userA@example.com');

  const firstGeneration = await agent
    .post('/schedule-builder')
    .type('form')
    .send({
      intent: 'generate',
      requestedResultCount: '4',
      selectedCourseCodes: ['SCH101', 'SCH150', 'SCH303'],
      termCode: '2026FALL'
    })
    .expect(200);
  assert.match(firstGeneration.text, /Showing schedule 1 of 4/);
  assert.match(firstGeneration.text, /Conflict free|Best effort/);

  context.db.prepare(`
    UPDATE schedule_builder_option_groups
    SET seats_remaining = 0
    WHERE option_code IN ('SCH303-A', 'SCH303-B')
  `).run();
  context.db.prepare(`
    UPDATE schedule_builder_courses
    SET is_active = 0
    WHERE course_code = 'SCH150'
  `).run();

  const regenerated = await agent
    .post('/schedule-builder')
    .type('form')
    .send({
      intent: 'generate',
      requestedResultCount: '4',
      selectedCourseCodes: ['SCH101', 'SCH150', 'SCH303'],
      termCode: '2026FALL'
    })
    .expect(200);
  assert.match(regenerated.text, /Removed live course updates: SCH150/);
  assert.match(regenerated.text, /currently full/);

  context.cleanup();
});
