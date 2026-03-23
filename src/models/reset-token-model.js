const crypto = require('crypto');

function digestToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function createResetTokenModel(db) {
  const selectByDigest = db.prepare('SELECT * FROM password_reset_tokens WHERE token_digest = ?');
  const consumeTokenStatement = db.prepare(`
    UPDATE password_reset_tokens
    SET consumed_at = @consumed_at
    WHERE id = @id
  `);

  function findByRawToken(token) {
    return selectByDigest.get(digestToken(token)) || null;
  }

  function consumeToken(tokenId, consumedAt) {
    consumeTokenStatement.run({ id: tokenId, consumed_at: consumedAt });
    return db.prepare('SELECT * FROM password_reset_tokens WHERE id = ?').get(tokenId) || null;
  }

  return {
    consumeToken,
    digestToken,
    findByRawToken
  };
}

module.exports = { createResetTokenModel, digestToken };
