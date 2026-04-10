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

CREATE TABLE IF NOT EXISTS financial_summary_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  balance_due_cents INTEGER NOT NULL DEFAULT 0 CHECK (balance_due_cents >= 0),
  outstanding_fees_cents INTEGER NOT NULL DEFAULT 0 CHECK (outstanding_fees_cents >= 0),
  payment_status TEXT NOT NULL CHECK (
    payment_status IN ('current', 'overdue', 'pending_confirmation')
  ),
  source_state TEXT NOT NULL CHECK (source_state IN ('live', 'stale')),
  last_confirmed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  transaction_reference TEXT NOT NULL,
  posted_at TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL,
  payment_method_label TEXT NOT NULL,
  masked_method_identifier TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'reversed')),
  transaction_scope TEXT NOT NULL CHECK (
    transaction_scope IN ('sis_fee_payment', 'housing', 'bookstore', 'parking')
  ),
  source_system TEXT NOT NULL CHECK (source_system IN ('sis', 'payment_processor', 'banking_network')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  method_type TEXT NOT NULL CHECK (method_type IN ('bank_account', 'credit_card')),
  display_label TEXT NOT NULL,
  bank_holder_name TEXT,
  routing_identifier TEXT,
  account_identifier_masked TEXT,
  account_identifier_fingerprint TEXT,
  card_brand TEXT,
  card_last4 TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  token_reference TEXT,
  token_fingerprint TEXT,
  status TEXT NOT NULL CHECK (status IN ('active')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  UNIQUE(account_id, account_identifier_fingerprint),
  UNIQUE(account_id, token_fingerprint)
);

CREATE TABLE IF NOT EXISTS inbox_access_states (
  account_id INTEGER PRIMARY KEY,
  access_state TEXT NOT NULL CHECK (access_state IN ('enabled', 'restricted')),
  restriction_reason TEXT,
  show_status_indicator INTEGER NOT NULL DEFAULT 1 CHECK (show_status_indicator IN (0, 1)),
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_recipient_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_group_memberships (
  group_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (group_id, account_id),
  FOREIGN KEY (group_id) REFERENCES notification_recipient_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_send_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  sender_account_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'completed_with_failures', 'failed')),
  total_unique_recipients INTEGER NOT NULL DEFAULT 0,
  duplicate_recipients_removed INTEGER NOT NULL DEFAULT 0,
  successful_deliveries INTEGER NOT NULL DEFAULT 0,
  failed_deliveries INTEGER NOT NULL DEFAULT 0,
  sent_at TEXT NOT NULL,
  retry_expires_at TEXT NOT NULL,
  last_error TEXT,
  FOREIGN KEY (message_id) REFERENCES notification_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inbox_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('academic_event', 'admin_message')),
  event_type TEXT NOT NULL CHECK (
    event_type IN ('course_update', 'grade_update', 'academic_standing', 'admin_message')
  ),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_status TEXT NOT NULL CHECK (
    notification_status IN ('generated', 'delivered', 'delivery_failed', 'stored_for_later', 'read')
  ),
  deduplication_key TEXT NOT NULL,
  send_request_id INTEGER,
  sender_account_id INTEGER,
  created_at TEXT NOT NULL,
  available_at TEXT,
  read_at TEXT,
  last_failure_reason TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (send_request_id) REFERENCES notification_send_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (sender_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  UNIQUE (account_id, deduplication_key)
);

CREATE TABLE IF NOT EXISTS inbox_delivery_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inbox_notification_id INTEGER NOT NULL,
  attempt_sequence INTEGER NOT NULL CHECK (attempt_sequence > 0),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  failure_reason TEXT,
  retry_eligible_until TEXT,
  attempted_at TEXT NOT NULL,
  delivered_at TEXT,
  FOREIGN KEY (inbox_notification_id) REFERENCES inbox_notifications(id) ON DELETE CASCADE,
  UNIQUE (inbox_notification_id, attempt_sequence)
);

CREATE TABLE IF NOT EXISTS class_offerings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offering_code TEXT NOT NULL UNIQUE,
  course_code TEXT NOT NULL,
  title TEXT NOT NULL,
  term_code TEXT NOT NULL,
  section_code TEXT NOT NULL DEFAULT 'A1',
  offering_status TEXT NOT NULL DEFAULT 'open' CHECK (offering_status IN ('open', 'closed', 'archived')),
  meeting_days TEXT NOT NULL,
  start_minute INTEGER NOT NULL CHECK (start_minute >= 0),
  end_minute INTEGER NOT NULL CHECK (end_minute > start_minute),
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  seats_remaining INTEGER NOT NULL CHECK (seats_remaining >= 0),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  waitlist_enabled INTEGER NOT NULL DEFAULT 0 CHECK (waitlist_enabled IN (0, 1)),
  waitlist_uses_position INTEGER NOT NULL DEFAULT 1 CHECK (waitlist_uses_position IN (0, 1)),
  prerequisite_course_code TEXT,
  fee_change_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS completed_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  course_code TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  UNIQUE(account_id, course_code)
);

CREATE TABLE IF NOT EXISTS registration_holds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  hold_code TEXT NOT NULL,
  reason TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS class_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE,
  UNIQUE(account_id, offering_id)
);

CREATE TABLE IF NOT EXISTS offering_instructors (
  offering_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  assigned_at TEXT NOT NULL,
  PRIMARY KEY (offering_id, account_id),
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_program_profiles (
  account_id INTEGER PRIMARY KEY,
  program_name TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roster_view_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'empty', 'forbidden', 'error')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (actor_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollment_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('enrolled', 'blocked', 'error')),
  reason_summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  waitlist_status TEXT NOT NULL DEFAULT 'waitlisted' CHECK (waitlist_status IN ('waitlisted')),
  waitlist_position INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE,
  UNIQUE(account_id, offering_id)
);

CREATE TABLE IF NOT EXISTS waitlist_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('waitlisted', 'blocked', 'error')),
  reason_summary TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS withdrawal_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  transcript_impact TEXT NOT NULL,
  fee_impact_summary TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drop_deadline_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term_code TEXT NOT NULL UNIQUE,
  deadline_at TEXT NOT NULL,
  timezone_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS drop_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  fee_impact_summary TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS force_enroll_requests (
  request_id TEXT PRIMARY KEY,
  initiated_by_account_id INTEGER NOT NULL,
  student_account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending_confirmation', 'completed', 'rejected')),
  requires_over_capacity_confirmation INTEGER NOT NULL DEFAULT 0 CHECK (
    requires_over_capacity_confirmation IN (0, 1)
  ),
  over_capacity_confirmation_by_account_id INTEGER,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  rejection_reason TEXT,
  FOREIGN KEY (initiated_by_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (student_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE,
  FOREIGN KEY (over_capacity_confirmation_by_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS force_enroll_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL UNIQUE,
  admin_account_id INTEGER NOT NULL,
  student_account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  prerequisite_override INTEGER NOT NULL DEFAULT 1 CHECK (prerequisite_override IN (0, 1)),
  over_capacity_override INTEGER NOT NULL DEFAULT 0 CHECK (over_capacity_override IN (0, 1)),
  created_at TEXT NOT NULL,
  FOREIGN KEY (request_id) REFERENCES force_enroll_requests(request_id) ON DELETE CASCADE,
  FOREIGN KEY (admin_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (student_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS force_withdrawal_actions (
  action_id TEXT PRIMARY KEY,
  initiated_by_account_id INTEGER NOT NULL,
  student_account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('completed', 'rejected_not_enrolled', 'failed', 'pending_audit', 'canceled')
  ),
  created_at TEXT NOT NULL,
  completed_at TEXT,
  failure_reason TEXT,
  FOREIGN KEY (initiated_by_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (student_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS force_withdrawal_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_id TEXT NOT NULL UNIQUE,
  admin_account_id INTEGER NOT NULL,
  student_account_id INTEGER NOT NULL,
  offering_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (action_id) REFERENCES force_withdrawal_actions(action_id) ON DELETE CASCADE,
  FOREIGN KEY (admin_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (student_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS force_withdrawal_pending_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_id TEXT NOT NULL UNIQUE,
  next_retry_at TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'resolved')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (action_id) REFERENCES force_withdrawal_actions(action_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS offering_change_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offering_id INTEGER,
  offering_code TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('add', 'delete')),
  actor_account_id INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'blocked', 'conflict')),
  override_used INTEGER NOT NULL DEFAULT 0 CHECK (override_used IN (0, 1)),
  override_reason TEXT,
  failure_reason TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE SET NULL,
  FOREIGN KEY (actor_account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS offering_change_audit_retry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_payload_json TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at TEXT NOT NULL,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS capacity_update_requests (
  request_id TEXT PRIMARY KEY,
  offering_id INTEGER NOT NULL,
  submitted_by_account_id INTEGER NOT NULL,
  submitted_capacity INTEGER NOT NULL CHECK (submitted_capacity > 0),
  submitted_version INTEGER NOT NULL CHECK (submitted_version > 0),
  override_request_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'rejected', 'failed', 'stale', 'noop')),
  status_message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE,
  FOREIGN KEY (submitted_by_account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS capacity_override_authorizations (
  override_request_id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  offering_id INTEGER NOT NULL,
  requested_by_account_id INTEGER NOT NULL,
  approved_by_account_id INTEGER,
  decision TEXT NOT NULL CHECK (decision IN ('requested', 'approved', 'denied')),
  reason TEXT NOT NULL,
  allow_self_approval INTEGER NOT NULL DEFAULT 1 CHECK (allow_self_approval IN (0, 1)),
  approved_at TEXT,
  retention_until TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (request_id) REFERENCES capacity_update_requests(request_id) ON DELETE CASCADE,
  FOREIGN KEY (offering_id) REFERENCES class_offerings(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by_account_id) REFERENCES accounts(id) ON DELETE SET NULL
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
CREATE INDEX IF NOT EXISTS idx_financial_summary_snapshots_account ON financial_summary_snapshots(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id, posted_at);
CREATE INDEX IF NOT EXISTS idx_payment_methods_account ON payment_methods(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_inbox_access_states_account ON inbox_access_states(access_state, updated_at);
CREATE INDEX IF NOT EXISTS idx_notification_recipient_groups_key ON notification_recipient_groups(group_key, is_active);
CREATE INDEX IF NOT EXISTS idx_notification_group_memberships_account ON notification_group_memberships(account_id);
CREATE INDEX IF NOT EXISTS idx_notification_send_requests_sender ON notification_send_requests(sender_account_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_inbox_notifications_account ON inbox_notifications(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_inbox_notifications_send_request ON inbox_notifications(send_request_id, notification_status);
CREATE INDEX IF NOT EXISTS idx_inbox_delivery_attempts_notification ON inbox_delivery_attempts(inbox_notification_id, attempt_sequence);
CREATE INDEX IF NOT EXISTS idx_class_offerings_term ON class_offerings(term_code, course_code);
CREATE INDEX IF NOT EXISTS idx_completed_courses_account ON completed_courses(account_id, course_code);
CREATE INDEX IF NOT EXISTS idx_registration_holds_account ON registration_holds(account_id, is_active);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_account ON class_enrollments(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_enrollment_attempts_account ON enrollment_attempts(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawal_records_account ON withdrawal_records(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_drop_deadline_rules_term ON drop_deadline_rules(term_code);
CREATE INDEX IF NOT EXISTS idx_drop_records_account ON drop_records(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_force_enroll_requests_actor ON force_enroll_requests(initiated_by_account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_force_enroll_requests_student ON force_enroll_requests(student_account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_force_enroll_audit_actor ON force_enroll_audit(admin_account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_force_withdrawal_actions_actor ON force_withdrawal_actions(initiated_by_account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_force_withdrawal_actions_student ON force_withdrawal_actions(student_account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_force_withdrawal_pending_audit_status ON force_withdrawal_pending_audit(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_offering_change_logs_actor ON offering_change_logs(actor_account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_capacity_update_requests_offering ON capacity_update_requests(offering_id, created_at);
CREATE INDEX IF NOT EXISTS idx_capacity_override_authorizations_offering ON capacity_override_authorizations(offering_id, created_at);
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
