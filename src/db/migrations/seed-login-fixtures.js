const bcrypt = require('bcrypt');

const { getDb, resolveDbPath } = require('../connection');
const { digestToken } = require('../../models/reset-token-model');
const { applySchema } = require('./apply-schema');

const RESET_TOKENS = {
  expired: 'TOKEN_EXPIRED',
  revoked: 'TOKEN_REVOKED',
  valid: 'TOKEN_VALID'
};

function isoNow(now) {
  return now.toISOString();
}

function seedLoginFixtures(dbPath, options = {}) {
  const now = options.now || new Date('2026-03-07T12:00:00.000Z');
  const lockedUntil = options.lockedUntil || new Date(now.getTime() + 15 * 60 * 1000);
  const resolvedPath = applySchema(dbPath);
  const db = getDb(resolvedPath);

  db.exec(`
    DELETE FROM account_courses;
    DELETE FROM courses;
    DELETE FROM login_attempts;
    DELETE FROM notifications;
    DELETE FROM password_change_attempts;
    DELETE FROM verification_cooldowns;
    DELETE FROM password_reset_tokens;
    DELETE FROM user_sessions;
    DELETE FROM accounts;
  `);

  const insertAccount = db.prepare(`
    INSERT INTO accounts (
      email,
      username,
      role,
      password_hash,
      status,
      failed_attempt_count,
      last_failed_at,
      locked_until,
      password_changed_at,
      created_at,
      updated_at
    ) VALUES (
      @email,
      @username,
      @role,
      @password_hash,
      @status,
      @failed_attempt_count,
      @last_failed_at,
      @locked_until,
      @password_changed_at,
      @created_at,
      @updated_at
    )
  `);

  const insertCourse = db.prepare(`
    INSERT INTO courses (course_code, title, credits, created_at, updated_at)
    VALUES (@course_code, @title, @credits, @created_at, @updated_at)
  `);

  const insertAccountCourse = db.prepare(`
    INSERT INTO account_courses (account_id, course_id, role, created_at)
    VALUES (@account_id, @course_id, @role, @created_at)
  `);

  const insertResetToken = db.prepare(`
    INSERT INTO password_reset_tokens (
      account_id,
      token_digest,
      issued_at,
      expires_at,
      consumed_at,
      revoked_at
    ) VALUES (
      @account_id,
      @token_digest,
      @issued_at,
      @expires_at,
      @consumed_at,
      @revoked_at
    )
  `);

  const timestamp = isoNow(now);
  const passwordHash = bcrypt.hashSync('CorrectPass!234', 10);
  const adminPasswordHash = bcrypt.hashSync('AdminPass!234', 10);
  const lockedTimestamp = lockedUntil.toISOString();

  const activeAccount = insertAccount.run({
    email: 'userA@example.com',
    username: 'userA',
    role: 'student',
    password_hash: passwordHash,
    status: 'active',
    failed_attempt_count: 0,
    last_failed_at: null,
    locked_until: null,
    password_changed_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp
  });

  insertAccount.run({
    email: 'admin@example.com',
    username: 'adminA',
    role: 'admin',
    password_hash: adminPasswordHash,
    status: 'active',
    failed_attempt_count: 0,
    last_failed_at: null,
    locked_until: null,
    password_changed_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp
  });

  insertAccount.run({
    email: 'locked.user@example.com',
    username: 'lockedUser',
    role: 'student',
    password_hash: passwordHash,
    status: 'locked',
    failed_attempt_count: 5,
    last_failed_at: timestamp,
    locked_until: lockedTimestamp,
    password_changed_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp
  });

  insertAccount.run({
    email: 'disabled.user@example.com',
    username: 'disabledUser',
    role: 'student',
    password_hash: passwordHash,
    status: 'disabled',
    failed_attempt_count: 0,
    last_failed_at: null,
    locked_until: null,
    password_changed_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp
  });

  insertAccount.run({
    email: 'outage.user@example.com',
    username: 'outageUser',
    role: 'student',
    password_hash: passwordHash,
    status: 'active',
    failed_attempt_count: 0,
    last_failed_at: null,
    locked_until: null,
    password_changed_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp
  });

  const courseOne = insertCourse.run({
    course_code: 'ECE493',
    title: 'Software Engineering',
    credits: 3,
    created_at: timestamp,
    updated_at: timestamp
  });

  const courseTwo = insertCourse.run({
    course_code: 'CMPUT301',
    title: 'Introduction to Software Engineering',
    credits: 3,
    created_at: timestamp,
    updated_at: timestamp
  });

  insertAccountCourse.run({
    account_id: activeAccount.lastInsertRowid,
    course_id: courseOne.lastInsertRowid,
    role: 'student',
    created_at: timestamp
  });

  insertAccountCourse.run({
    account_id: activeAccount.lastInsertRowid,
    course_id: courseTwo.lastInsertRowid,
    role: 'student',
    created_at: timestamp
  });

  insertResetToken.run({
    account_id: activeAccount.lastInsertRowid,
    token_digest: digestToken(RESET_TOKENS.valid),
    issued_at: timestamp,
    expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    consumed_at: null,
    revoked_at: null
  });

  insertResetToken.run({
    account_id: activeAccount.lastInsertRowid,
    token_digest: digestToken(RESET_TOKENS.expired),
    issued_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() - 60 * 1000).toISOString(),
    consumed_at: null,
    revoked_at: null
  });

  insertResetToken.run({
    account_id: activeAccount.lastInsertRowid,
    token_digest: digestToken(RESET_TOKENS.revoked),
    issued_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    consumed_at: null,
    revoked_at: timestamp
  });

  return resolvedPath;
}

if (require.main === module) {
  const resolvedPath = resolveDbPath(process.argv[2]);
  seedLoginFixtures(resolvedPath);
  console.log(`Seeded login fixtures in ${resolvedPath}`);
}

module.exports = { RESET_TOKENS, seedLoginFixtures };
