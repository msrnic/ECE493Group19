PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
  password_hash TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_accounts_identifier ON accounts(email, username);
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
