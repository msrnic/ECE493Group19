const path = require('path');

const {
  createAuthRedirectResponse,
  createDashboardResponse,
  createErrorResponse
} = require('./dashboard-response');
const { formatBirthdayForDisplay } = require('./validators/profile-validator');
const { validateRetryRequest } = require('./validators/dashboard-validator');
const { escapeHtml, renderHtml } = require('../views/render');

const STUDENT_DASHBOARD_PRESENTATION = Object.freeze({
  inbox: {
    displayName: 'Inbox',
    order: 10,
    title: 'Inbox'
  },
  'security-center': {
    displayName: 'Personal Profile',
    order: 20,
    title: 'Personal Profile'
  },
  'student-academics': {
    displayName: 'Academic Records',
    order: 30,
    title: 'Academic Records'
  },
  'schedule-builder': {
    displayName: 'Schedule Builder',
    order: 40,
    title: 'Schedule Builder'
  },
  'enrollment-hub': {
    displayName: 'Enrollment Hub',
    order: 50,
    title: 'Enrollment Hub'
  },
  'financial-summary': {
    displayName: 'Financial Summary',
    order: 60,
    title: 'Financial Summary'
  }
});

const PROFESSOR_DASHBOARD_PRESENTATION = Object.freeze({
  inbox: {
    displayName: 'Inbox',
    order: 10,
    title: 'Inbox'
  },
  'security-center': {
    displayName: 'Personal Profile',
    order: 20,
    title: 'Personal Profile'
  },
  'teaching-workload': {
    displayName: 'Current Courses',
    order: 30,
    title: 'Current Courses'
  }
});

const ADMIN_DASHBOARD_PRESENTATION = Object.freeze({
  inbox: {
    displayName: 'Inbox',
    order: 10,
    title: 'Inbox'
  },
  'personal-profile': {
    displayName: 'Personal Profile',
    order: 20,
    title: 'Personal Profile'
  },
  'admin-operations': {
    displayName: 'Admin Operations',
    order: 40,
    title: 'Admin Operations'
  },
  'security-center': {
    displayName: 'Security Center',
    order: 50,
    title: 'Security Center'
  }
});

const DASHBOARD_PRESENTATION_BY_ROLE = Object.freeze({
  admin: ADMIN_DASHBOARD_PRESENTATION,
  professor: PROFESSOR_DASHBOARD_PRESENTATION,
  student: STUDENT_DASHBOARD_PRESENTATION
});

const DASHBOARD_PRESENTATION_PRIORITY = Object.freeze(['student', 'professor', 'admin']);

function wantsJson(req) {
  const matchesContentType = typeof req.is === 'function' ? req.is('application/json') : false;
  const acceptHeader = typeof req.get === 'function' ? req.get('accept') : req.headers?.accept;
  return matchesContentType || String(acceptHeader || '').includes('application/json');
}

function toIdentifierKey(value) {
  return String(value || '').toLowerCase();
}

function serializeForScriptTag(payload) {
  return JSON.stringify(payload).replaceAll('<', '\\u003c');
}

function createDashboardController(services) {
  function getProfileDetails(account) {
    if (
      typeof services.personalDetailsModel?.getByAccountId !== 'function' ||
      typeof services.contactInfoModel?.getByAccountId !== 'function'
    ) {
      return null;
    }

    return {
      contactInformation: services.contactInfoModel.getByAccountId(account.id) || {},
      personalDetails: services.personalDetailsModel.getByAccountId(account.id) || {}
    };
  }

  function createProfileFact(label, value) {
    return `${label}: ${value || 'Not provided'}`;
  }

  function buildProfileSectionContent(account, options) {
    const details = getProfileDetails(account);
    const links = [
      { href: '/account/personal-information', label: 'Update Personal Information' },
      { href: '/account/contact-information', label: 'Update Contact Information' }
    ];
    links.push({ href: '/account/security/password-change', label: 'Change password' });

    if (!details) {
      return {
        items: [options.fallbackItem],
        links,
        summary: options.summary
      };
    }

    const personal = details.personalDetails;
    const contact = details.contactInformation;
    const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(' ').trim();

    return {
      items: [
        createProfileFact('Full Name', fullName),
        createProfileFact(
          'Birthday',
          personal.birthDate ? formatBirthdayForDisplay(personal.birthDate) : null
        ),
        createProfileFact('Country of Origin', personal.countryOfOrigin),
        createProfileFact('Phone Number', contact.phoneNumber),
        createProfileFact('Email', contact.contactEmail),
        createProfileFact('Emergency Contact Name', contact.emergencyFullName),
        createProfileFact('Emergency Contact Phone Number', contact.emergencyPhoneNumber),
        createProfileFact('Emergency Contact Relation', contact.emergencyRelationship)
      ],
      links,
      summary: options.summary
    };
  }

  function normalizeRoleKey(role) {
    if (!role || typeof role === 'string') {
      return toIdentifierKey(role);
    }

    if (role.role_key) {
      return toIdentifierKey(role.role_key);
    }

    if (role.display_name) {
      return toIdentifierKey(role.display_name);
    }

    return toIdentifierKey(role);
  }

  function getPresentationRoleKeys(account, roles) {
    const roleKeys = new Set(roles.map(normalizeRoleKey).filter(Boolean));

    if (roleKeys.size === 0 && account.role) {
      roleKeys.add(toIdentifierKey(account.role));
    }

    return roleKeys;
  }

  function getPresentationOverride(roleKeys, key) {
    let override = null;

    for (const roleKey of DASHBOARD_PRESENTATION_PRIORITY) {
      if (!roleKeys.has(roleKey)) {
        continue;
      }

      const nextOverride = DASHBOARD_PRESENTATION_BY_ROLE[roleKey]?.[key] || null;
      if (nextOverride) {
        override = nextOverride;
      }
    }

    return override;
  }

  function sortByPresentationOrder(items, labelField) {
    return [...items].sort((left, right) => {
      if (left.presentation_order !== right.presentation_order) {
        return left.presentation_order - right.presentation_order;
      }

      return String(left[labelField]).localeCompare(String(right[labelField]));
    });
  }

  function applyModulePresentation(roleKeys, modules) {
    return sortByPresentationOrder(
      modules.map((module) => {
        const override = getPresentationOverride(roleKeys, module.module_key);
        return {
          ...module,
          display_name: override?.displayName || module.display_name,
          presentation_order: override?.order || module.sort_order
        };
      }),
      'display_name'
    );
  }

  function applySectionPresentation(roleKeys, sections) {
    return sortByPresentationOrder(
      sections.map((section) => {
        const override = getPresentationOverride(roleKeys, section.section_key);
        return {
          ...section,
          presentation_order: override?.order || section.sort_order,
          section_title: override?.title || section.section_title
        };
      }),
      'section_title'
    );
  }

  function getUnavailableSectionKeys(account) {
    const mappings = services.dashboardTestState?.unavailableSectionsByIdentifier || {};
    const emailKey = toIdentifierKey(account.email);
    const usernameKey = toIdentifierKey(account.username);
    const sectionKeys = [];

    if (Array.isArray(mappings[emailKey])) {
      sectionKeys.push(...mappings[emailKey]);
    }

    if (Array.isArray(mappings[usernameKey])) {
      sectionKeys.push(...mappings[usernameKey]);
    }

    return new Set(sectionKeys);
  }

  function shouldFailRoleLookup(account) {
    const configuredIdentifiers = services.dashboardTestState?.roleFailureIdentifiers;
    const failingIdentifiers = new Set(
      (Array.isArray(configuredIdentifiers) ? configuredIdentifiers : []).map(toIdentifierKey)
    );

    if (failingIdentifiers.has(toIdentifierKey(account.email))) {
      return true;
    }

    return failingIdentifiers.has(toIdentifierKey(account.username));
  }

  function createSectionContent(account, sectionKey) {
    switch (sectionKey) {
      case 'inbox':
        return {
          items: [
            'No unread messages require action right now.',
            'New course, account, and dashboard updates will appear here as they arrive.'
          ],
          links: [],
          summary: account.role === 'professor'
            ? 'Your teaching and account updates are collected in one place.'
            : 'Recent course and account updates are collected in one place.'
        };
      case 'student-academics':
        return {
          items: account.courses.length
            ? account.courses.map(
                (course) => `${course.course_code} ${course.title} (${course.role})`
              )
            : ['Your academic record details will appear here once courses are assigned.'],
          links: [],
          summary: account.courses.length
            ? `${account.courses.length} course record(s) are available for this term.`
            : 'No course records are currently assigned to this account.'
        };
      case 'schedule-builder':
        return {
          items: [
            'Build and compare timetable options before registration opens.',
            'Saved schedule plans remain available from your dashboard.'
          ],
          links: [],
          summary: 'Plan upcoming class schedules in one place.'
        };
      case 'enrollment-hub':
        return {
          items: [
            'Browse eligible courses and manage your registration choices.',
            'Enrollment notices and seat updates appear here when available.'
          ],
          links: [],
          summary: 'Handle add, drop, and waitlist activity from your dashboard.'
        };
      case 'financial-summary':
        return {
          items: ['Outstanding balance: $0.00', 'Next statement refresh: 08:00 daily'],
          links: [],
          summary: 'Financial dashboard services are available for your active student account.'
        };
      case 'teaching-workload': {
        const teachingCourses = account.courses.filter(
          (course) => course.role === 'instructor' || course.role === 'ta'
        );
        return {
          items: teachingCourses.length
            ? teachingCourses.map(
                (course) => `${course.course_code} ${course.title} (${course.role})`
              )
            : ['Teaching assignments will appear here once courses are assigned.'],
          links: [],
          summary: teachingCourses.length
            ? `${teachingCourses.length} teaching assignment(s) are ready for review.`
            : 'No teaching assignments are currently linked to this account.'
        };
      }
      case 'grading-queue':
        return {
          items: ['Grade submission summary is ready for the current teaching term.'],
          links: [],
          summary: 'Grading workflows are enabled for your professor dashboard.'
        };
      case 'personal-profile':
        return buildProfileSectionContent(account, {
          fallbackItem: 'Your account profile and password tools remain available from this page.',
          includePasswordLink: true,
          summary: 'Review your own account details and update your password from one place.'
        });
      case 'admin-operations':
        return {
          items: [
            `${Math.max(services.accountModel.listAccounts().length - 1, 0)} managed account(s) are available.`,
            'New accounts require a password change at first sign-in.'
          ],
          links: [
            { href: '/admin/users/new', label: 'Create New User' }
          ],
          summary: 'Administrative controls are active for this account.'
        };
      case 'security-center': {
        if (account.role === 'student' || account.role === 'professor') {
          return buildProfileSectionContent(account, {
            fallbackItem: 'Profile details and password tools remain available from this page.',
            includePasswordLink: true,
            summary: 'Review your personal information and keep your account secure from one place.'
          });
        }

        const links = [];

        if (account.role === 'admin') {
          for (const target of services.accountModel.listPasswordManagementTargets(account.id)) {
            links.push({
              href: `/admin/users/${target.id}/password`,
              label: `Reset ${target.username} password`
            });
          }

          return {
            items: ['Administrative security controls and delegated password recovery tools remain available.'],
            links,
            summary: 'Manage user recovery actions and security operations from one place.'
          };
        }

        return {
          items: ['Session protection and password recovery tools remain available.'],
          links: [
            { href: '/account/security/password-change', label: 'Change password' }
          ],
          summary: 'Protect your account and active sessions from one place.'
        };
      }
      default:
        return {
          summary: ''
        };
    }
  }

  function buildSectionResponse(account, section, state) {
    const isUnavailable = state.availability_status === 'unavailable';
    return {
      availabilityStatus: isUnavailable ? 'unavailable' : 'available',
      content: isUnavailable ? undefined : createSectionContent(account, section.section_key),
      sectionId: section.id,
      sectionKey: section.section_key,
      title: section.section_title,
      unavailableLabel: isUnavailable ? 'Unavailable' : undefined
    };
  }

  function buildModuleResponses(modules, sectionResponses, sectionsById) {
    const unavailableModules = new Set(
      sectionResponses
        .filter((section) => section.availabilityStatus === 'unavailable')
        .map((section) => sectionsById.get(section.sectionId).module_id)
    );

    return modules.map((module) => ({
      displayName: module.display_name,
      moduleId: module.id,
      moduleKey: module.module_key,
      navigationState: unavailableModules.has(module.id) ? 'disabled_unavailable' : 'enabled',
      routePath: module.route_path
    }));
  }

  function classifyStatus(sectionResponses) {
    const unavailableCount = sectionResponses.filter(
      (section) => section.availabilityStatus === 'unavailable'
    ).length;
    const availableCount = sectionResponses.length - unavailableCount;

    if (availableCount === 0) {
      return 'failure';
    }

    if (unavailableCount > 0) {
      return 'partial';
    }

    return 'success';
  }

  function loadSections(account, modules, sections, requestType, requestedSectionIds = null) {
    const startedAt = Date.now();
    const attemptedSectionIds = new Set(requestedSectionIds || sections.map((section) => section.id));
    const attemptedSections = sections.filter((section) => attemptedSectionIds.has(section.id));
    const unavailableKeys = getUnavailableSectionKeys(account);
    const existingStates = new Map(
      services.dashboardSectionStateModel
        .listStatesForAccount(account.id)
        .map((state) => [state.section_id, state])
    );
    const updatedStates = [];
    const occurredAt = services.now().toISOString();

    for (const section of attemptedSections) {
      const isUnavailable = unavailableKeys.has(section.section_key);
      const nextState = {
        accountId: account.id,
        availabilityStatus: isUnavailable ? 'unavailable' : 'available',
        lastAttemptAt: occurredAt,
        lastSuccessAt: isUnavailable ? existingStates.get(section.id)?.last_success_at || null : occurredAt,
        sectionId: section.id,
        statusReason: isUnavailable ? 'Simulated dashboard data outage.' : null
      };
      updatedStates.push(nextState);
      existingStates.set(section.id, {
        availability_status: nextState.availabilityStatus,
        last_attempt_at: nextState.lastAttemptAt,
        last_success_at: nextState.lastSuccessAt,
        section_id: nextState.sectionId,
        status_reason: nextState.statusReason
      });
    }

    if (updatedStates.length > 0) {
      services.dashboardSectionStateModel.upsertStates(updatedStates);
    }

    const sectionsById = new Map(sections.map((section) => [section.id, section]));
    const sectionResponses = sections.map((section) => {
      const persistedState = existingStates.get(section.id) || {
        availability_status: 'available',
        section_id: section.id,
        status_reason: null
      };
      return buildSectionResponse(account, section, persistedState);
    });
    const status = classifyStatus(sectionResponses);

    services.dashboardLoadModel.recordEvent({
      accountId: account.id,
      attemptedSections: attemptedSections.length,
      durationMs: Date.now() - startedAt,
      failedSections: updatedStates.filter((state) => state.availabilityStatus === 'unavailable').length,
      occurredAt,
      outcome: status,
      requestType,
      successfulSections: updatedStates.filter((state) => state.availabilityStatus === 'available').length
    });

    return {
      modules: buildModuleResponses(modules, sectionResponses, sectionsById),
      sectionResponses,
      status
    };
  }

  function buildDashboardPayload(account, requestType, requestedSectionIds = null) {
    if (shouldFailRoleLookup(account)) {
      return createDashboardResponse({
        actorId: account.id,
        modules: [],
        retryAvailable: true,
        sections: [],
        status: 'role_data_error'
      });
    }

    const roles = services.roleModel.listActiveRolesForAccount(account.id) || [];
    const roleIds = roles.map((role) => role.id);
    const presentationRoleKeys = getPresentationRoleKeys(account, roles);
    const modules = applyModulePresentation(
      presentationRoleKeys,
      services.moduleModel.listPermittedModulesForRoleIds(roleIds)
    );

    if (roles.length === 0 || !services.moduleModel.hasEnabledModules(roleIds)) {
      return createDashboardResponse({
        actorId: account.id,
        modules: [],
        sections: [],
        status: 'empty_access'
      });
    }

    const sections = applySectionPresentation(
      presentationRoleKeys,
      services.dashboardSectionModel.listEnabledSectionsForModuleIds(
        modules.map((module) => module.id)
      )
    );
    const { modules: moduleResponses, sectionResponses, status } = loadSections(
      account,
      modules,
      sections,
      requestType,
      requestedSectionIds
    );

    return createDashboardResponse({
      actorId: account.id,
      modules: moduleResponses,
      sections: sectionResponses,
      status
    });
  }

  function renderModuleNavigation(modules) {
    if (!modules.length) {
      return '<p class=\'dashboard-empty-note\'>No dashboard modules are available for this account.</p>';
    }

    return `<ul class='dashboard-nav-list'>${modules
      .map((module) => {
        if (module.navigationState === 'disabled_unavailable') {
          return `<li><span class='dashboard-nav-link is-disabled'>${escapeHtml(module.displayName)} <span class='dashboard-pill'>Unavailable</span></span></li>`;
        }

        return `<li><a class='dashboard-nav-link' href='${escapeHtml(module.routePath)}'>${escapeHtml(module.displayName)}</a></li>`;
      })
      .join('')}</ul>`;
  }

  function renderSectionContent(section) {
    if (section.availabilityStatus === 'unavailable') {
      return `<p class='dashboard-unavailable-label'>${escapeHtml(section.unavailableLabel)}</p><p class='help-text'>Retry the unavailable section when dashboard data recovers.</p>`;
    }

    const itemsHtml = (section.content?.items || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');
    const linksHtml = (section.content?.links || [])
      .map(
        (link) => `<a class='login-button-link secondary-link' href='${escapeHtml(link.href)}'>${escapeHtml(link.label)}</a>`
      )
      .join('');

    return `${section.content?.summary ? `<p class='help-text'>${escapeHtml(section.content.summary)}</p>` : ''}${itemsHtml ? `<ul class='course-list'>${itemsHtml}</ul>` : ''}${linksHtml ? `<div class='action-row'>${linksHtml}</div>` : ''}`;
  }

  function renderSections(payload) {
    if (payload.status === 'empty_access' || payload.status === 'role_data_error') {
      const heading = payload.status === 'empty_access'
        ? 'Minimal dashboard'
        : 'Authorization data error';
      return `<section class='dashboard-section-card dashboard-section-card--message'><h2>${escapeHtml(heading)}</h2><p class='help-text'>${escapeHtml(payload.message)}</p></section>`;
    }

    return payload.sections
      .map(
        (section) => `<section class='dashboard-section-card${section.availabilityStatus === 'unavailable' ? ' is-unavailable' : ''}' id='${escapeHtml(section.sectionKey)}' data-section-id='${section.sectionId}'><div class='dashboard-section-header'><h2>${escapeHtml(section.title)}</h2>${section.availabilityStatus === 'unavailable' ? '<span class=\'dashboard-pill\'>Unavailable</span>' : '<span class=\'dashboard-pill dashboard-pill--ok\'>Available</span>'}</div>${renderSectionContent(section)}</section>`
      )
      .join('');
  }

  function renderRetryPanel(payload) {
    if (!payload.retryAvailable) {
      return '';
    }

    return '<button id=\'dashboard-retry\' class=\'secondary-button\' type=\'button\'>Retry unavailable sections</button>';
  }

  function renderDashboardPage(req, res, account, roles, payload) {
    const sessionRecord = services.sessionModel.findActiveSession(req.sessionID);
    const html = renderHtml(path.resolve(__dirname, '../views/dashboard.html'), {
      dashboard_message: payload.message,
      dashboard_navigation_html: renderModuleNavigation(payload.modules),
      dashboard_sections_html: renderSections(payload),
      dashboard_state_json: serializeForScriptTag(payload),
      dashboard_status: payload.status,
      retry_panel_html: renderRetryPanel(payload),
      role_badges_html: roles.length
        ? roles.map((role) => `<span class='dashboard-pill'>${escapeHtml(role.display_name)}</span>`).join('')
        : `<span class='dashboard-pill'>${escapeHtml(account.role)}</span>`,
      session_created_at: sessionRecord ? sessionRecord.created_at : 'Session metadata unavailable.',
      username: account.username
    });

    return res.status(200).send(html);
  }

  function respondAccountMissing(req, res) {
    if (wantsJson(req)) {
      return res.status(401).json(createAuthRedirectResponse('/dashboard'));
    }

    if (req.method === 'POST') {
      return res.status(401).json(createAuthRedirectResponse('/dashboard'));
    }

    return res.redirect('/login?returnTo=%2Fdashboard');
  }

  return {
    getDashboard(req, res) {
      const account = services.accountModel.getDashboardAccount(req.session.accountId);
      if (!account) {
        return respondAccountMissing(req, res);
      }

      const roles = services.roleModel.listActiveRolesForAccount(account.id) || [];
      const payload = buildDashboardPayload(account, 'initial_load');

      if (wantsJson(req)) {
        return res.status(200).json(payload);
      }

      return renderDashboardPage(req, res, account, roles, payload);
    },

    postRetry(req, res) {
      const account = services.accountModel.getDashboardAccount(req.session.accountId);
      if (!account) {
        return respondAccountMissing(req, res);
      }

      const unavailableSectionIds = services.dashboardSectionStateModel.listUnavailableSectionIds(account.id);
      const validation = validateRetryRequest(req.body, unavailableSectionIds);
      if (!validation.isValid) {
        return res.status(400).json(createErrorResponse(validation.errorCode, validation.message));
      }

      const payload = buildDashboardPayload(account, 'retry', validation.sectionIds);
      return res.status(200).json(payload);
    }
  };
}

module.exports = { createDashboardController };
