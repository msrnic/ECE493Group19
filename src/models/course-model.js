function createCourseModel(db) {
  const selectCoursesForAccount = db.prepare(`
    SELECT c.course_code, c.title, c.credits, ac.role
    FROM account_courses ac
    INNER JOIN courses c ON c.id = ac.course_id
    WHERE ac.account_id = ?
    ORDER BY c.course_code
  `);

  return {
    listCoursesForAccount(accountId) {
      return selectCoursesForAccount.all(accountId);
    }
  };
}

module.exports = { createCourseModel };
