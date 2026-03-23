document.addEventListener('DOMContentLoaded', () => {
  const stateNode = document.getElementById('dashboard-state');
  const navigationNode = document.getElementById('dashboard-navigation');
  const sectionsNode = document.getElementById('dashboard-sections');
  const statusNode = document.getElementById('dashboard-status');
  const retryPanel = document.getElementById('dashboard-retry-panel');

  if (!stateNode || !navigationNode || !sectionsNode || !statusNode || !retryPanel) {
    return;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function renderNavigation(payload) {
    if (!payload.modules.length) {
      return '<p class="dashboard-empty-note">No dashboard modules are available for this account.</p>';
    }

    return `<ul class="dashboard-nav-list">${payload.modules
      .map((module) => {
        if (module.navigationState === 'disabled_unavailable') {
          return `<li><span class="dashboard-nav-link is-disabled">${escapeHtml(module.displayName)} <span class="dashboard-pill">Unavailable</span></span></li>`;
        }

        return `<li><a class="dashboard-nav-link" href="${escapeHtml(module.routePath)}">${escapeHtml(module.displayName)}</a></li>`;
      })
      .join('')}</ul>`;
  }

  function renderSectionContent(section) {
    if (section.availabilityStatus === 'unavailable') {
      return `<p class="dashboard-unavailable-label">${escapeHtml(section.unavailableLabel || 'Unavailable')}</p><p class="help-text">Retry the unavailable section when dashboard data recovers.</p>`;
    }

    const itemsHtml = (section.content?.items || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');
    const linksHtml = (section.content?.links || [])
      .map(
        (link) => `<a class="login-button-link secondary-link" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`
      )
      .join('');

    return `${section.content?.summary ? `<p class="help-text">${escapeHtml(section.content.summary)}</p>` : ''}${itemsHtml ? `<ul class="course-list">${itemsHtml}</ul>` : ''}${linksHtml ? `<div class="action-row">${linksHtml}</div>` : ''}`;
  }

  function renderSections(payload) {
    if (payload.status === 'empty_access' || payload.status === 'role_data_error') {
      const title = payload.status === 'empty_access' ? 'Minimal dashboard' : 'Authorization data error';
      return `<section class="dashboard-section-card dashboard-section-card--message"><h2>${escapeHtml(title)}</h2><p class="help-text">${escapeHtml(payload.message || '')}</p></section>`;
    }

    return payload.sections
      .map(
        (section) => `<section class="dashboard-section-card${section.availabilityStatus === 'unavailable' ? ' is-unavailable' : ''}" id="${escapeHtml(section.sectionKey)}" data-section-id="${section.sectionId}"><div class="dashboard-section-header"><h2>${escapeHtml(section.title)}</h2>${section.availabilityStatus === 'unavailable' ? '<span class="dashboard-pill">Unavailable</span>' : '<span class="dashboard-pill dashboard-pill--ok">Available</span>'}</div>${renderSectionContent(section)}</section>`
      )
      .join('');
  }

  function updateRetryPanel(payload) {
    retryPanel.innerHTML = payload.retryAvailable
      ? '<button id="dashboard-retry" class="secondary-button" type="button">Retry unavailable sections</button>'
      : '';
  }

  function renderPayload(payload) {
    navigationNode.innerHTML = renderNavigation(payload);
    sectionsNode.innerHTML = renderSections(payload);
    statusNode.textContent = payload.message || '';
    statusNode.dataset.status = payload.status || 'success';
    updateRetryPanel(payload);
    stateNode.textContent = JSON.stringify(payload).replaceAll('<', '\\u003c');
  }

  function getPayload() {
    try {
      return JSON.parse(stateNode.textContent || '{}');
    } catch {
      return null;
    }
  }

  async function handleRetryClick() {
    const payload = getPayload();
    if (!payload || !Array.isArray(payload.unavailableSectionIds) || payload.unavailableSectionIds.length === 0) {
      return;
    }

    const response = await fetch('/dashboard/retry', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sectionIds: payload.unavailableSectionIds })
    });

    if (response.status === 401) {
      const authPayload = await response.json();
      window.location.assign(`${authPayload.loginUrl}?returnTo=${encodeURIComponent(authPayload.returnTo)}`);
      return;
    }

    const nextPayload = await response.json();
    if (!response.ok) {
      statusNode.dataset.status = 'failure';
      statusNode.textContent = nextPayload.message || 'Retry failed.';
      return;
    }

    renderPayload(nextPayload);
  }

  retryPanel.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.id === 'dashboard-retry') {
      handleRetryClick().catch(() => {
        statusNode.dataset.status = 'failure';
        statusNode.textContent = 'Retry failed.';
      });
    }
  });
});
