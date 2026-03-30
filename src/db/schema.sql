PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
  password_hash TEXT NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0 CHECK (must_change_password IN (0, 1)),
  status TEXT NOT NULL CHECK (status IN ('active', 'locked', 'disabled')),
  failed_attempt_count INTEGER NOT NULL DEFAULT 0,
  last_failed_at TEXT,
  locked_until TEXT,
  password_changed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_courses (
  account_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'ta')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (account_id, course_id, role),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_assignable INTEGER NOT NULL DEFAULT 1 CHECK (is_assignable IN (0, 1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS role_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  assigned_at TEXT NOT NULL,
  UNIQUE(account_id, role_id),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  route_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 1 CHECK (is_enabled IN (0, 1))
);

CREATE TABLE IF NOT EXISTS role_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER NOT NULL,
  module_id INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  UNIQUE(role_id, module_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dashboard_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  section_key TEXT NOT NULL UNIQUE,
  section_title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 1 CHECK (is_enabled IN (0, 1)),
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dashboard_section_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  section_id INTEGER NOT NULL,
  availability_status TEXT NOT NULL CHECK (availability_status IN ('available', 'unavailable')),
  status_reason TEXT,
  last_attempt_at TEXT NOT NULL,
  last_success_at TEXT,
  UNIQUE(account_id, section_id),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES dashboard_sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dashboard_load_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('initial_load', 'retry')),
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'partial', 'failure', 'auth_error')),
  attempted_sections INTEGER NOT NULL,
  successful_sections INTEGER NOT NULL,
  failed_sections INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  occurred_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS personal_details (
  account_id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  birth_date TEXT,
  country_of_origin TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_profiles (
  account_id INTEGER PRIMARY KEY,
  contact_email TEXT,
  phone_number TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  account_id INTEGER PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  relationship TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER,
  submitted_identifier TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (
    outcome IN ('success', 'invalid_credentials', 'locked', 'disabled', 'service_unavailable')
  ),
  source_ip TEXT,
  user_agent TEXT,
  attempted_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  invalidation_reason TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  token_digest TEXT NOT NULL UNIQUE,
  issued_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  revoked_at TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_cooldowns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope_key TEXT NOT NULL UNIQUE,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  cooldown_until TEXT,
  last_failure_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_change_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_account_id INTEGER,
  target_account_id INTEGER,
  verification_type TEXT NOT NULL CHECK (
    verification_type IN ('current_password', 'reset_token', 'admin_override')
  ),
  outcome TEXT NOT NULL CHECK (
    outcome IN (
      'success',
      'invalid_verification',
      'policy_rejected',
      'cooldown_blocked',
      'system_error',
      'cancelled'
    )
  ),
  failure_count_after_attempt INTEGER NOT NULL DEFAULT 0,
  cooldown_until TEXT,
  request_id TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (actor_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  FOREIGN KEY (target_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('password_changed')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed')),
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  sent_at TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped_disabled')),
  error_code TEXT,
  error_message TEXT,
  attempted_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planning_terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_available INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schedule_builder_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term_id INTEGER NOT NULL,
  course_code TEXT NOT NULL,
  title TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  compatibility_status TEXT NOT NULL DEFAULT 'ok' CHECK (
    compatibility_status IN ('ok', 'missing', 'inconsistent')
  ),
  shared_listing_group TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(term_id, course_code),
  FOREIGN KEY (term_id) REFERENCES planning_terms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_builder_option_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  option_code TEXT NOT NULL,
  professor_name TEXT NOT NULL,
  seats_remaining INTEGER NOT NULL DEFAULT 1 CHECK (seats_remaining >= 0),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(course_id, option_code),
  FOREIGN KEY (course_id) REFERENCES schedule_builder_courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_builder_option_meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  option_group_id INTEGER NOT NULL,
  component_type TEXT NOT NULL CHECK (
    component_type IN ('lecture', 'lab', 'tutorial', 'seminar', 'shared')
  ),
  section_code TEXT NOT NULL,
  meeting_days TEXT NOT NULL,
  start_minute INTEGER NOT NULL CHECK (start_minute >= 0 AND start_minute < 1440),
  end_minute INTEGER NOT NULL CHECK (end_minute > start_minute AND end_minute <= 1440),
  shared_component_key TEXT,
  FOREIGN KEY (option_group_id) REFERENCES schedule_builder_option_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_constraint_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  term_id INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  UNIQUE(account_id, term_id),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (term_id) REFERENCES planning_terms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_constraints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  constraint_set_id INTEGER NOT NULL,
  constraint_type TEXT NOT NULL CHECK (
    constraint_type IN (
      'earliest_start',
      'blocked_time',
      'professor_whitelist',
      'professor_blacklist'
    )
  ),
  label TEXT NOT NULL,
  value_json TEXT NOT NULL,
  priority_value INTEGER NOT NULL DEFAULT 3 CHECK (priority_value BETWEEN 1 AND 5),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (constraint_set_id) REFERENCES schedule_constraint_sets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_constraint_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  term_id INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(account_id, term_id, normalized_name),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (term_id) REFERENCES planning_terms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_generation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  term_id INTEGER,
  requested_result_count INTEGER,
  outcome_status TEXT NOT NULL CHECK (outcome_status IN ('success', 'partial', 'blocked', 'error')),
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (term_id) REFERENCES planning_terms(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_accounts_identifier ON accounts(email, username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_normalized_email ON accounts(lower(trim(email)));
CREATE INDEX IF NOT EXISTS idx_contact_profiles_email ON contact_profiles(contact_email);
CREATE INDEX IF NOT EXISTS idx_role_assignments_account ON role_assignments(account_id, is_active);
CREATE INDEX IF NOT EXISTS idx_role_modules_role ON role_modules(role_id, is_active);
CREATE INDEX IF NOT EXISTS idx_dashboard_sections_module ON dashboard_sections(module_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_dashboard_section_states_account ON dashboard_section_states(account_id, availability_status);
CREATE INDEX IF NOT EXISTS idx_dashboard_load_events_account ON dashboard_load_events(account_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_account_time ON login_attempts(account_id, attempted_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_account ON user_sessions(account_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_account ON password_reset_tokens(account_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_password_change_attempts_target ON password_change_attempts(target_account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_account ON notifications(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_attempts_account ON notification_attempts(account_id, attempted_at);
CREATE INDEX IF NOT EXISTS idx_schedule_builder_courses_term ON schedule_builder_courses(term_id, is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_builder_groups_course ON schedule_builder_option_groups(course_id, is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_builder_meetings_group ON schedule_builder_option_meetings(option_group_id);
CREATE INDEX IF NOT EXISTS idx_schedule_constraint_sets_account_term ON schedule_constraint_sets(account_id, term_id);
CREATE INDEX IF NOT EXISTS idx_schedule_constraints_set ON schedule_constraints(constraint_set_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_saved_constraint_sets_account_term ON saved_constraint_sets(account_id, term_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_schedule_generation_events_account ON schedule_generation_events(account_id, created_at);
