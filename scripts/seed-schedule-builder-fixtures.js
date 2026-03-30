const { resolveDbPath } = require('../src/db/connection');
const {
  SCHEDULE_BUILDER_FIXTURES,
  seedScheduleBuilderFixtures
} = require('../src/db/migrations/seed-login-fixtures');

const resolvedPath = resolveDbPath(process.argv[2]);
seedScheduleBuilderFixtures(resolvedPath);
console.log(
  `Seeded ${SCHEDULE_BUILDER_FIXTURES.courses.length} schedule builder courses in ${resolvedPath}`
);
