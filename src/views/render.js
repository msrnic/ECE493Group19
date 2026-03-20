const fs = require('fs');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderHtml(templatePath, replacements) {
  let template = fs.readFileSync(templatePath, 'utf8');

  for (const [key, value] of Object.entries(replacements)) {
    const escapedValue = key === 'course_list' ? String(value) : escapeHtml(value);
    template = template.replaceAll(`{{${key}}}`, escapedValue);
  }

  return template;
}

module.exports = { renderHtml };
