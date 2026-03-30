const bcrypt = require('bcrypt');

const { getDb } = require('../connection');
const { digestToken } = require('../../models/reset-token-model');
const { applySchema } = require('./apply-schema');

const RESET_TOKENS = {
  expired: 'TOKEN_EXPIRED',
  revoked: 'TOKEN_REVOKED',
  valid: 'TOKEN_VALID'
};

const SCHEDULE_BUILDER_FIXTURES = {
  courses: [
    {
      courseCode: 'SCH101',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 600,
              meetingDays: 'Mon,Wed',
              sectionCode: 'LEC-A1',
              startMinute: 540
            },
            {
              componentType: 'lab',
              endMinute: 600,
              meetingDays: 'Fri',
              sectionCode: 'LAB-A1',
              startMinute: 540
            }
          ],
          optionCode: 'SCH101-A',
          professorName: 'Prof. Ada',
          seatsRemaining: 5
        },
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 720,
              meetingDays: 'Tue,Thu',
              sectionCode: 'LEC-B1',
              startMinute: 660
            },
            {
              componentType: 'lab',
              endMinute: 840,
              meetingDays: 'Fri',
              sectionCode: 'LAB-B1',
              startMinute: 780
            }
          ],
          optionCode: 'SCH101-B',
          professorName: 'Prof. Baker',
          seatsRemaining: 5
        }
      ],
      title: 'Planning Foundations'
    },
    {
      courseCode: 'SCH111',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 1020,
              meetingDays: 'Mon,Wed',
              sectionCode: 'LEC-A1',
              startMinute: 960
            }
          ],
          optionCode: 'SCH111-A',
          professorName: 'Prof. Imani',
          seatsRemaining: 5
        },
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 1020,
              meetingDays: 'Tue,Thu',
              sectionCode: 'LEC-B1',
              startMinute: 960
            }
          ],
          optionCode: 'SCH111-B',
          professorName: 'Prof. Imani',
          seatsRemaining: 5
        }
      ],
      title: 'Human Factors in Scheduling'
    },
    {
      courseCode: 'SCH150',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 780,
              meetingDays: 'Mon,Wed',
              sectionCode: 'LEC-A1',
              startMinute: 720
            }
          ],
          optionCode: 'SCH150-A',
          professorName: 'Prof. Hall',
          seatsRemaining: 5
        },
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 960,
              meetingDays: 'Tue,Thu',
              sectionCode: 'LEC-B1',
              startMinute: 900
            }
          ],
          optionCode: 'SCH150-B',
          professorName: 'Prof. Hall',
          seatsRemaining: 5
        }
      ],
      title: 'Design Thinking for Timetables'
    },
    {
      courseCode: 'SCH202',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 630,
              meetingDays: 'Mon,Wed',
              sectionCode: 'LEC-A1',
              startMinute: 570
            },
            {
              componentType: 'seminar',
              endMinute: 660,
              meetingDays: 'Thu',
              sectionCode: 'SEM-A1',
              startMinute: 600
            }
          ],
          optionCode: 'SCH202-A',
          professorName: 'Prof. Chen',
          seatsRemaining: 5
        },
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 780,
              meetingDays: 'Tue,Thu',
              sectionCode: 'LEC-B1',
              startMinute: 720
            },
            {
              componentType: 'seminar',
              endMinute: 900,
              meetingDays: 'Wed',
              sectionCode: 'SEM-B1',
              startMinute: 840
            }
          ],
          optionCode: 'SCH202-B',
          professorName: 'Prof. Diaz',
          seatsRemaining: 5
        }
      ],
      title: 'Systems Studio'
    },
    {
      courseCode: 'SCH220',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 705,
              meetingDays: 'Mon,Wed',
              sectionCode: 'LEC-A1',
              startMinute: 630
            },
            {
              componentType: 'tutorial',
              endMinute: 710,
              meetingDays: 'Thu',
              sectionCode: 'TUT-A1',
              startMinute: 660
            }
          ],
          optionCode: 'SCH220-A',
          professorName: 'Prof. Jordan',
          seatsRemaining: 5
        },
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 855,
              meetingDays: 'Tue,Thu',
              sectionCode: 'LEC-B1',
              startMinute: 780
            },
            {
              componentType: 'tutorial',
              endMinute: 710,
              meetingDays: 'Fri',
              sectionCode: 'TUT-B1',
              startMinute: 660
            }
          ],
          optionCode: 'SCH220-B',
          professorName: 'Prof. Jordan',
          seatsRemaining: 5
        }
      ],
      title: 'Constraint Modeling'
    },
    {
      courseCode: 'SCH303',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 720,
              meetingDays: 'Mon,Wed',
              sectionCode: 'LEC-A1',
              startMinute: 660
            }
          ],
          optionCode: 'SCH303-A',
          professorName: 'Prof. Evans',
          seatsRemaining: 5
        },
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 900,
              meetingDays: 'Tue,Thu',
              sectionCode: 'LEC-B1',
              startMinute: 840
            }
          ],
          optionCode: 'SCH303-B',
          professorName: 'Prof. Evans',
          seatsRemaining: 5
        }
      ],
      title: 'Discrete Systems'
    },
    {
      courseCode: 'SCH330',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 855,
              meetingDays: 'Mon,Wed',
              sectionCode: 'LEC-A1',
              startMinute: 780
            }
          ],
          optionCode: 'SCH330-A',
          professorName: 'Prof. Kwan',
          seatsRemaining: 5
        },
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 555,
              meetingDays: 'Tue,Thu',
              sectionCode: 'LEC-B1',
              startMinute: 480
            }
          ],
          optionCode: 'SCH330-B',
          professorName: 'Prof. Kwan',
          seatsRemaining: 5
        }
      ],
      title: 'Networked Platforms'
    },
    {
      courseCode: 'SCH404',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 660,
              meetingDays: 'Tue,Thu',
              sectionCode: 'LEC-A1',
              startMinute: 600
            }
          ],
          optionCode: 'SCH404-A',
          professorName: 'Prof. Frost',
          seatsRemaining: 0
        }
      ],
      title: 'Applied Signals'
    },
    {
      courseCode: 'SCH450',
      optionGroups: [],
      title: 'Unavailable Topics'
    },
    {
      compatibilityStatus: 'missing',
      courseCode: 'SCH460',
      optionGroups: [],
      title: 'Compatibility Seminar'
    },
    {
      courseCode: 'XLIST410A',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 840,
              meetingDays: 'Mon',
              sectionCode: 'LEC-A1',
              startMinute: 780
            },
            {
              componentType: 'shared',
              endMinute: 960,
              meetingDays: 'Fri',
              sectionCode: 'SHR-01',
              sharedComponentKey: 'SHARED-X1',
              startMinute: 900
            }
          ],
          optionCode: 'XLIST410A-A',
          professorName: 'Prof. Green',
          seatsRemaining: 5
        }
      ],
      sharedListingGroup: 'XGROUP-410',
      title: 'Crosslisted Design A'
    },
    {
      courseCode: 'XLIST410B',
      optionGroups: [
        {
          meetings: [
            {
              componentType: 'lecture',
              endMinute: 840,
              meetingDays: 'Tue',
              sectionCode: 'LEC-A1',
              startMinute: 780
            },
            {
              componentType: 'shared',
              endMinute: 960,
              meetingDays: 'Fri',
              sectionCode: 'SHR-01',
              sharedComponentKey: 'SHARED-X1',
              startMinute: 900
            }
          ],
          optionCode: 'XLIST410B-A',
          professorName: 'Prof. Green',
          seatsRemaining: 5
        }
      ],
      sharedListingGroup: 'XGROUP-410',
      title: 'Crosslisted Design B'
    }
  ],
  term: {
    displayName: 'Fall 2026',
    isAvailable: 1,
    termCode: '2026FALL'
  }
};

function isoNow(now) {
  return now.toISOString();
}

function clearScheduleBuilderFixtures(db) {
  db.exec(`
    DELETE FROM schedule_generation_events;
    DELETE FROM saved_constraint_sets;
    DELETE FROM schedule_constraints;
    DELETE FROM schedule_constraint_sets;
    DELETE FROM schedule_builder_option_meetings;
    DELETE FROM schedule_builder_option_groups;
    DELETE FROM schedule_builder_courses;
    DELETE FROM planning_terms;
  `);
}

function seedScheduleBuilderTables(db, timestamp) {
  const insertPlanningTerm = db.prepare(`
    INSERT INTO planning_terms (
      term_code,
      display_name,
      is_available,
      created_at,
      updated_at
    ) VALUES (
      @term_code,
      @display_name,
      @is_available,
      @created_at,
      @updated_at
    )
  `);
  const insertScheduleBuilderCourse = db.prepare(`
    INSERT INTO schedule_builder_courses (
      term_id,
      course_code,
      title,
      is_active,
      compatibility_status,
      shared_listing_group,
      created_at,
      updated_at
    ) VALUES (
      @term_id,
      @course_code,
      @title,
      @is_active,
      @compatibility_status,
      @shared_listing_group,
      @created_at,
      @updated_at
    )
  `);
  const insertScheduleBuilderOptionGroup = db.prepare(`
    INSERT INTO schedule_builder_option_groups (
      course_id,
      option_code,
      professor_name,
      seats_remaining,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      @course_id,
      @option_code,
      @professor_name,
      @seats_remaining,
      @is_active,
      @created_at,
      @updated_at
    )
  `);
  const insertScheduleBuilderMeeting = db.prepare(`
    INSERT INTO schedule_builder_option_meetings (
      option_group_id,
      component_type,
      section_code,
      meeting_days,
      start_minute,
      end_minute,
      shared_component_key
    ) VALUES (
      @option_group_id,
      @component_type,
      @section_code,
      @meeting_days,
      @start_minute,
      @end_minute,
      @shared_component_key
    )
  `);
  const termId = Number(insertPlanningTerm.run({
    created_at: timestamp,
    display_name: SCHEDULE_BUILDER_FIXTURES.term.displayName,
    is_available: SCHEDULE_BUILDER_FIXTURES.term.isAvailable,
    term_code: SCHEDULE_BUILDER_FIXTURES.term.termCode,
    updated_at: timestamp
  }).lastInsertRowid);

  for (const course of SCHEDULE_BUILDER_FIXTURES.courses) {
    const courseId = Number(insertScheduleBuilderCourse.run({
      compatibility_status: course.compatibilityStatus ?? 'ok',
      course_code: course.courseCode,
      created_at: timestamp,
      is_active: 1,
      shared_listing_group: course.sharedListingGroup ?? null,
      term_id: termId,
      title: course.title,
      updated_at: timestamp
    }).lastInsertRowid);

    for (const optionGroup of course.optionGroups) {
      const optionGroupId = Number(insertScheduleBuilderOptionGroup.run({
        course_id: courseId,
        created_at: timestamp,
        is_active: 1,
        option_code: optionGroup.optionCode,
        professor_name: optionGroup.professorName,
        seats_remaining: optionGroup.seatsRemaining,
        updated_at: timestamp
      }).lastInsertRowid);

      for (const meeting of optionGroup.meetings) {
        insertScheduleBuilderMeeting.run({
          component_type: meeting.componentType,
          end_minute: meeting.endMinute,
          meeting_days: meeting.meetingDays,
          option_group_id: optionGroupId,
          section_code: meeting.sectionCode,
          shared_component_key: meeting.sharedComponentKey || null,
          start_minute: meeting.startMinute
        });
      }
    }
  }

  return {
    courseCount: SCHEDULE_BUILDER_FIXTURES.courses.length,
    termId
  };
}

function seedScheduleBuilderFixtures(dbPath, options = {}) {
  const { now = new Date('2026-03-07T12:00:00.000Z') } = options;
  const resolvedPath = applySchema(dbPath);
  const db = getDb(resolvedPath);

  clearScheduleBuilderFixtures(db);
  seedScheduleBuilderTables(db, isoNow(now));
  return resolvedPath;
}

function seedLoginFixtures(dbPath, options = {}) {
  const {
    now = new Date('2026-03-07T12:00:00.000Z'),
    lockedUntil = new Date(now.getTime() + 15 * 60 * 1000)
  } = options;
  const resolvedPath = applySchema(dbPath);
  const db = getDb(resolvedPath);

  db.exec(`
    DELETE FROM schedule_generation_events;
    DELETE FROM saved_constraint_sets;
    DELETE FROM schedule_constraints;
    DELETE FROM schedule_constraint_sets;
    DELETE FROM schedule_builder_option_meetings;
    DELETE FROM schedule_builder_option_groups;
    DELETE FROM schedule_builder_courses;
    DELETE FROM planning_terms;
    DELETE FROM dashboard_section_states;
    DELETE FROM dashboard_load_events;
    DELETE FROM emergency_contacts;
    DELETE FROM contact_profiles;
    DELETE FROM personal_details;
    DELETE FROM role_assignments;
    DELETE FROM role_modules;
    DELETE FROM dashboard_sections;
    DELETE FROM modules;
    DELETE FROM roles;
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
      must_change_password,
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
      @must_change_password,
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
  const insertRole = db.prepare(`
    INSERT INTO roles (role_key, display_name, is_assignable, is_active)
    VALUES (@role_key, @display_name, @is_assignable, 1)
  `);
  const insertRoleAssignment = db.prepare(`
    INSERT INTO role_assignments (account_id, role_id, is_active, assigned_at)
    VALUES (@account_id, @role_id, 1, @assigned_at)
  `);
  const insertModule = db.prepare(`
    INSERT INTO modules (module_key, display_name, route_path, sort_order, is_enabled)
    VALUES (@module_key, @display_name, @route_path, @sort_order, 1)
  `);
  const insertRoleModule = db.prepare(`
    INSERT INTO role_modules (role_id, module_id, is_active)
    VALUES (@role_id, @module_id, 1)
  `);
  const insertSection = db.prepare(`
    INSERT INTO dashboard_sections (module_id, section_key, section_title, sort_order, is_enabled)
    VALUES (@module_id, @section_key, @section_title, @sort_order, 1)
  `);
  const insertPersonalDetails = db.prepare(`
    INSERT INTO personal_details (
      account_id,
      first_name,
      last_name,
      birth_date,
      country_of_origin,
      version,
      updated_at
    ) VALUES (
      @account_id,
      @first_name,
      @last_name,
      @birth_date,
      @country_of_origin,
      @version,
      @updated_at
    )
  `);
  const insertContactProfile = db.prepare(`
    INSERT INTO contact_profiles (
      account_id,
      contact_email,
      phone_number,
      version,
      updated_at
    ) VALUES (
      @account_id,
      @contact_email,
      @phone_number,
      @version,
      @updated_at
    )
  `);
  const insertEmergencyContact = db.prepare(`
    INSERT INTO emergency_contacts (
      account_id,
      full_name,
      phone_number,
      relationship,
      updated_at
    ) VALUES (
      @account_id,
      @full_name,
      @phone_number,
      @relationship,
      @updated_at
    )
  `);
  const timestamp = isoNow(now);
  const passwordHash = bcrypt.hashSync('CorrectPass!234', 10);
  const adminPasswordHash = bcrypt.hashSync('AdminPass!234', 10);
  const lockedTimestamp = lockedUntil.toISOString();

  const accountIds = {};
  function createAccount(details) {
    const result = insertAccount.run({
      created_at: timestamp,
      failed_attempt_count: details.failedAttemptCount || 0,
      last_failed_at: details.lastFailedAt || null,
      locked_until: details.lockedUntil || null,
      must_change_password: details.mustChangePassword || 0,
      password_changed_at: timestamp,
      password_hash: details.passwordHash,
      role: details.role,
      status: details.status || 'active',
      updated_at: timestamp,
      email: details.email,
      username: details.username
    });
    accountIds[details.email] = Number(result.lastInsertRowid);
    return accountIds[details.email];
  }

  createAccount({
    email: 'userA@example.com',
    username: 'userA',
    role: 'student',
    passwordHash
  });
  createAccount({
    email: 'professor@example.com',
    username: 'profA',
    role: 'professor',
    passwordHash
  });
  createAccount({
    email: 'admin@example.com',
    username: 'adminA',
    role: 'admin',
    passwordHash: adminPasswordHash
  });
  createAccount({
    email: 'hybrid.staff@example.com',
    username: 'hybridStaff',
    role: 'admin',
    passwordHash
  });
  createAccount({
    email: 'nomodule.student@example.com',
    username: 'noModules',
    role: 'student',
    passwordHash
  });
  createAccount({
    email: 'locked.user@example.com',
    username: 'lockedUser',
    role: 'student',
    passwordHash,
    status: 'locked',
    failedAttemptCount: 5,
    lastFailedAt: timestamp,
    lockedUntil: lockedTimestamp
  });
  createAccount({
    email: 'disabled.user@example.com',
    username: 'disabledUser',
    role: 'student',
    passwordHash,
    status: 'disabled'
  });
  createAccount({
    email: 'outage.user@example.com',
    username: 'outageUser',
    role: 'student',
    passwordHash
  });

  const courseIds = {};
  function createCourse(details) {
    const result = insertCourse.run({
      course_code: details.courseCode,
      title: details.title,
      credits: details.credits,
      created_at: timestamp,
      updated_at: timestamp
    });
    courseIds[details.courseCode] = Number(result.lastInsertRowid);
    return courseIds[details.courseCode];
  }

  createCourse({ courseCode: 'ECE493', title: 'Software Engineering', credits: 3 });
  createCourse({ courseCode: 'CMPUT301', title: 'Introduction to Software Engineering', credits: 3 });
  createCourse({ courseCode: 'MATH201', title: 'Discrete Mathematics', credits: 3 });

  insertAccountCourse.run({
    account_id: accountIds['userA@example.com'],
    course_id: courseIds.ECE493,
    role: 'student',
    created_at: timestamp
  });
  insertAccountCourse.run({
    account_id: accountIds['userA@example.com'],
    course_id: courseIds.CMPUT301,
    role: 'student',
    created_at: timestamp
  });
  insertAccountCourse.run({
    account_id: accountIds['professor@example.com'],
    course_id: courseIds.ECE493,
    role: 'instructor',
    created_at: timestamp
  });
  insertAccountCourse.run({
    account_id: accountIds['hybrid.staff@example.com'],
    course_id: courseIds.MATH201,
    role: 'instructor',
    created_at: timestamp
  });

  seedScheduleBuilderTables(db, timestamp);

  const roleIds = {};
  for (const role of [
    { role_key: 'student', display_name: 'Student', is_assignable: 1 },
    { role_key: 'professor', display_name: 'Professor', is_assignable: 1 },
    { role_key: 'admin', display_name: 'Admin', is_assignable: 1 }
  ]) {
    roleIds[role.role_key] = Number(insertRole.run(role).lastInsertRowid);
  }

  insertRoleAssignment.run({
    account_id: accountIds['userA@example.com'],
    role_id: roleIds.student,
    assigned_at: timestamp
  });
  insertRoleAssignment.run({
    account_id: accountIds['professor@example.com'],
    role_id: roleIds.professor,
    assigned_at: timestamp
  });
  insertRoleAssignment.run({
    account_id: accountIds['admin@example.com'],
    role_id: roleIds.admin,
    assigned_at: timestamp
  });
  insertRoleAssignment.run({
    account_id: accountIds['hybrid.staff@example.com'],
    role_id: roleIds.professor,
    assigned_at: timestamp
  });
  insertRoleAssignment.run({
    account_id: accountIds['hybrid.staff@example.com'],
    role_id: roleIds.admin,
    assigned_at: timestamp
  });
  insertRoleAssignment.run({
    account_id: accountIds['locked.user@example.com'],
    role_id: roleIds.student,
    assigned_at: timestamp
  });
  insertRoleAssignment.run({
    account_id: accountIds['disabled.user@example.com'],
    role_id: roleIds.student,
    assigned_at: timestamp
  });
  insertRoleAssignment.run({
    account_id: accountIds['outage.user@example.com'],
    role_id: roleIds.student,
    assigned_at: timestamp
  });

  const moduleIds = {};
  for (const module of [
    {
      module_key: 'inbox',
      display_name: 'Inbox',
      route_path: '/dashboard#inbox',
      sort_order: 5
    },
    {
      module_key: 'personal-profile',
      display_name: 'Personal Profile',
      route_path: '/dashboard#personal-profile',
      sort_order: 15
    },
    {
      module_key: 'student-academics',
      display_name: 'Student Academics',
      route_path: '/dashboard#student-academics',
      sort_order: 10
    },
    {
      module_key: 'financial-summary',
      display_name: 'Financial Summary',
      route_path: '/dashboard#financial-summary',
      sort_order: 20
    },
    {
      module_key: 'schedule-builder',
      display_name: 'Schedule Builder',
      route_path: '/dashboard#schedule-builder',
      sort_order: 25
    },
    {
      module_key: 'enrollment-hub',
      display_name: 'Enrollment Hub',
      route_path: '/dashboard#enrollment-hub',
      sort_order: 27
    },
    {
      module_key: 'teaching-workload',
      display_name: 'Teaching Workload',
      route_path: '/dashboard#teaching-workload',
      sort_order: 30
    },
    {
      module_key: 'grading-queue',
      display_name: 'Grading Queue',
      route_path: '/dashboard#grading-queue',
      sort_order: 40
    },
    {
      module_key: 'admin-operations',
      display_name: 'Admin Operations',
      route_path: '/dashboard#admin-operations',
      sort_order: 50
    },
    {
      module_key: 'security-center',
      display_name: 'Security Center',
      route_path: '/dashboard#security-center',
      sort_order: 60
    }
  ]) {
    moduleIds[module.module_key] = Number(insertModule.run(module).lastInsertRowid);
  }

  for (const mapping of [
    ['student', 'inbox'],
    ['student', 'schedule-builder'],
    ['student', 'enrollment-hub'],
    ['student', 'student-academics'],
    ['student', 'financial-summary'],
    ['student', 'security-center'],
    ['professor', 'inbox'],
    ['professor', 'teaching-workload'],
    ['professor', 'security-center'],
    ['admin', 'inbox'],
    ['admin', 'personal-profile'],
    ['admin', 'admin-operations'],
    ['admin', 'security-center']
  ]) {
    insertRoleModule.run({
      role_id: roleIds[mapping[0]],
      module_id: moduleIds[mapping[1]]
    });
  }

  for (const section of [
    {
      moduleKey: 'inbox',
      section_key: 'inbox',
      section_title: 'Inbox',
      sort_order: 5
    },
    {
      moduleKey: 'personal-profile',
      section_key: 'personal-profile',
      section_title: 'Personal Profile',
      sort_order: 15
    },
    {
      moduleKey: 'schedule-builder',
      section_key: 'schedule-builder',
      section_title: 'Schedule Builder',
      sort_order: 25
    },
    {
      moduleKey: 'enrollment-hub',
      section_key: 'enrollment-hub',
      section_title: 'Enrollment Hub',
      sort_order: 27
    },
    {
      moduleKey: 'student-academics',
      section_key: 'student-academics',
      section_title: 'Student Academics',
      sort_order: 10
    },
    {
      moduleKey: 'financial-summary',
      section_key: 'financial-summary',
      section_title: 'Financial Summary',
      sort_order: 20
    },
    {
      moduleKey: 'teaching-workload',
      section_key: 'teaching-workload',
      section_title: 'Teaching Workload',
      sort_order: 30
    },
    {
      moduleKey: 'grading-queue',
      section_key: 'grading-queue',
      section_title: 'Grading Queue',
      sort_order: 40
    },
    {
      moduleKey: 'admin-operations',
      section_key: 'admin-operations',
      section_title: 'Admin Operations',
      sort_order: 50
    },
    {
      moduleKey: 'security-center',
      section_key: 'security-center',
      section_title: 'Security Center',
      sort_order: 60
    }
  ]) {
    insertSection.run({
      module_id: moduleIds[section.moduleKey],
      section_key: section.section_key,
      section_title: section.section_title,
      sort_order: section.sort_order
    });
  }

  insertResetToken.run({
    account_id: accountIds['userA@example.com'],
    token_digest: digestToken(RESET_TOKENS.valid),
    issued_at: timestamp,
    expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    consumed_at: null,
    revoked_at: null
  });
  insertResetToken.run({
    account_id: accountIds['userA@example.com'],
    token_digest: digestToken(RESET_TOKENS.expired),
    issued_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() - 60 * 1000).toISOString(),
    consumed_at: null,
    revoked_at: null
  });
  insertResetToken.run({
    account_id: accountIds['userA@example.com'],
    token_digest: digestToken(RESET_TOKENS.revoked),
    issued_at: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    consumed_at: null,
    revoked_at: timestamp
  });

  for (const details of [
    {
      accountId: accountIds['userA@example.com'],
      birthDate: '2001-04-15',
      contactEmail: 'userA.contact@example.com',
      countryOfOrigin: 'Canada',
      emergencyFullName: 'Jordan Example',
      emergencyPhoneNumber: '+1 780 555 2234',
      emergencyRelationship: 'Parent',
      firstName: 'Alex',
      lastName: 'Example',
      phoneNumber: '+1 780 555 1234'
    },
    {
      accountId: accountIds['professor@example.com'],
      birthDate: '1983-10-08',
      contactEmail: 'professor.contact@example.com',
      countryOfOrigin: 'Canada',
      emergencyFullName: 'Casey Example',
      emergencyPhoneNumber: '+1 780 555 3234',
      emergencyRelationship: 'Sibling',
      firstName: 'Morgan',
      lastName: 'Faculty',
      phoneNumber: '+1 780 555 2234'
    },
    {
      accountId: accountIds['admin@example.com'],
      birthDate: '1979-02-20',
      contactEmail: 'admin.contact@example.com',
      countryOfOrigin: 'Canada',
      emergencyFullName: 'Riley Admin',
      emergencyPhoneNumber: '+1 780 555 4234',
      emergencyRelationship: 'Partner',
      firstName: 'Taylor',
      lastName: 'Admin',
      phoneNumber: '+1 780 555 3234'
    },
    {
      accountId: accountIds['hybrid.staff@example.com'],
      birthDate: '1988-06-12',
      contactEmail: 'hybrid.contact@example.com',
      countryOfOrigin: 'United Kingdom',
      emergencyFullName: 'Dana Hybrid',
      emergencyPhoneNumber: '+1 780 555 5234',
      emergencyRelationship: 'Spouse',
      firstName: 'Harper',
      lastName: 'Hybrid',
      phoneNumber: '+1 780 555 4234'
    },
    {
      accountId: accountIds['nomodule.student@example.com'],
      birthDate: '2000-09-01',
      contactEmail: 'nomodule.contact@example.com',
      countryOfOrigin: 'India',
      emergencyFullName: 'Avery NoModule',
      emergencyPhoneNumber: '+1 780 555 6234',
      emergencyRelationship: 'Guardian',
      firstName: 'Jordan',
      lastName: 'NoModule',
      phoneNumber: '+1 780 555 5234'
    },
    {
      accountId: accountIds['locked.user@example.com'],
      birthDate: '1999-01-18',
      contactEmail: 'locked.contact@example.com',
      countryOfOrigin: 'Canada',
      emergencyFullName: 'Kai Locked',
      emergencyPhoneNumber: '+1 780 555 7234',
      emergencyRelationship: 'Parent',
      firstName: 'Parker',
      lastName: 'Locked',
      phoneNumber: '+1 780 555 6234'
    },
    {
      accountId: accountIds['disabled.user@example.com'],
      birthDate: '2002-07-07',
      contactEmail: 'disabled.contact@example.com',
      countryOfOrigin: 'Mexico',
      emergencyFullName: 'Sky Disabled',
      emergencyPhoneNumber: '+1 780 555 8234',
      emergencyRelationship: 'Sibling',
      firstName: 'Drew',
      lastName: 'Disabled',
      phoneNumber: '+1 780 555 7234'
    },
    {
      accountId: accountIds['outage.user@example.com'],
      birthDate: '2001-11-23',
      contactEmail: 'outage.contact@example.com',
      countryOfOrigin: 'Canada',
      emergencyFullName: 'Robin Outage',
      emergencyPhoneNumber: '+1 780 555 9234',
      emergencyRelationship: 'Friend',
      firstName: 'Sam',
      lastName: 'Outage',
      phoneNumber: '+1 780 555 8234'
    }
  ]) {
    insertPersonalDetails.run({
      account_id: details.accountId,
      first_name: details.firstName,
      last_name: details.lastName,
      birth_date: details.birthDate,
      country_of_origin: details.countryOfOrigin,
      version: 1,
      updated_at: timestamp
    });
    insertContactProfile.run({
      account_id: details.accountId,
      contact_email: details.contactEmail,
      phone_number: details.phoneNumber,
      version: 1,
      updated_at: timestamp
    });
    insertEmergencyContact.run({
      account_id: details.accountId,
      full_name: details.emergencyFullName,
      phone_number: details.emergencyPhoneNumber,
      relationship: details.emergencyRelationship,
      updated_at: timestamp
    });
  }

  return resolvedPath;
}

module.exports = {
  RESET_TOKENS,
  SCHEDULE_BUILDER_FIXTURES,
  seedLoginFixtures,
  seedScheduleBuilderFixtures
};
