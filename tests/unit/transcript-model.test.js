const test = require('node:test');
const assert = require('node:assert/strict');

const { createTestContext } = require('../helpers/test-context');
const { createTranscriptModel } = require('../../src/models/transcript-model');

test('transcript model lists seeded entries and builds a full view', () => {
  const context = createTestContext();

  try {
    const model = createTranscriptModel(context.db);
    const accountId = context.app.locals.services.accountModel.findByIdentifier('userA@example.com').id;
    const entries = model.listByAccountId(accountId);

    assert.equal(entries.length, 3);
    const view = model.buildView(entries);
    assert.equal(view.state, 'full');
    assert.equal(view.termGroups.length, 2);
    assert.equal(view.missingDataMessage, null);
  } finally {
    context.cleanup();
  }
});

test('transcript model builds partial and empty views', () => {
  const context = createTestContext();

  try {
    const model = createTranscriptModel(context.db);
    const partialAccountId = context.app.locals.services.accountModel.findByIdentifier('hold.student@example.com').id;
    const partialView = model.buildView(model.listByAccountId(partialAccountId));
    assert.equal(partialView.state, 'partial');
    assert.match(partialView.missingDataMessage, /grades are unavailable/);

    const emptyView = model.buildView([]);
    assert.equal(emptyView.state, 'empty');
    assert.equal(emptyView.termGroups.length, 0);
  } finally {
    context.cleanup();
  }
});
