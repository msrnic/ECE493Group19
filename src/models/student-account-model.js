function mapStudentAccount(row) {
  if (!row) {
    return null;
  }

  return {
    accountId: row.id,
    displayName: row.username,
    email: row.email,
    role: row.role,
    status: row.status,
    studentId: row.username
  };
}

function createStudentAccountModel(db) {
  const selectStudentById = db.prepare(`
    SELECT id, email, username, role, status
    FROM accounts
    WHERE lower(username) = lower(?)
      AND role = 'student'
    LIMIT 1
  `);
  const selectStudentByAccountId = db.prepare(`
    SELECT id, email, username, role, status
    FROM accounts
    WHERE id = ?
      AND role = 'student'
    LIMIT 1
  `);
  const selectStudentsByCourseCode = db.prepare(`
    SELECT DISTINCT a.id, a.email, a.username, a.role, a.status
    FROM account_courses ac
    INNER JOIN accounts a ON a.id = ac.account_id
    INNER JOIN courses c ON c.id = ac.course_id
    WHERE lower(c.course_code) = lower(?)
      AND ac.role = 'student'
      AND a.role = 'student'
    ORDER BY a.username ASC
  `);

  return {
    findByStudentId(studentId) {
      if (!studentId) {
        return null;
      }

      return mapStudentAccount(selectStudentById.get(studentId));
    },
    findByAccountId(accountId) {
      if (!accountId) {
        return null;
      }

      return mapStudentAccount(selectStudentByAccountId.get(accountId));
    },
    findActiveByAccountId(accountId) {
      const account = this.findByAccountId(accountId);
      if (!account || account.status !== 'active') {
        return null;
      }

      return account;
    },
    listByCourseCode(courseCode) {
      if (!courseCode) {
        return [];
      }

      return selectStudentsByCourseCode.all(courseCode).map(mapStudentAccount);
    }
  };
}

module.exports = { createStudentAccountModel };
