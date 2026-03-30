document.addEventListener('DOMContentLoaded', () => {
  const stateNode = document.getElementById('schedule-builder-state');
  const warningNode = document.getElementById('schedule-builder-selection-warning');
  const presetSelect = document.getElementById('selected-saved-set');
  const presetVersion = document.getElementById('selected-saved-set-version');
  const cards = Array.from(document.querySelectorAll('[data-option-index]'));
  const positionNode = document.getElementById('schedule-builder-position');
  const prevButton = document.getElementById('schedule-builder-prev');
  const nextButton = document.getElementById('schedule-builder-next');

  function parseState() {
    try {
      return JSON.parse(stateNode?.textContent || '{}');
    } catch {
      return {};
    }
  }

  const state = parseState();

  function parseMeetingDays(value) {
    return String(value || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function rangesOverlap(leftStart, leftEnd, rightStart, rightEnd) {
    return leftStart < rightEnd && rightStart < leftEnd;
  }

  function hasPossibleConflict(selectedCodes) {
    const selected = new Set(selectedCodes);
    const selectedCourses = (state.selectionMetadata || []).filter((course) => selected.has(course.courseCode));

    for (let leftIndex = 0; leftIndex < selectedCourses.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < selectedCourses.length; rightIndex += 1) {
        for (const leftMeeting of selectedCourses[leftIndex].meetings || []) {
          for (const rightMeeting of selectedCourses[rightIndex].meetings || []) {
            const leftDays = parseMeetingDays(leftMeeting.meetingDays);
            const rightDays = new Set(parseMeetingDays(rightMeeting.meetingDays));
            if (!leftDays.some((day) => rightDays.has(day))) {
              continue;
            }

            if (rangesOverlap(
              Number(leftMeeting.startMinute),
              Number(leftMeeting.endMinute),
              Number(rightMeeting.startMinute),
              Number(rightMeeting.endMinute)
            )) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  function updateSelectionWarning() {
    if (!warningNode) {
      return;
    }

    const selectedCodes = Array.from(document.querySelectorAll('input[name="selectedCourseCodes"]:checked'))
      .map((input) => input.value);

    if (selectedCodes.length < 2 || !hasPossibleConflict(selectedCodes)) {
      warningNode.hidden = true;
      warningNode.textContent = '';
      return;
    }

    warningNode.hidden = false;
    warningNode.textContent = 'Possible time conflicts exist in the current course selection. You can still generate schedules and review the exact conflicts.';
  }

  function updatePresetVersion() {
    if (!presetSelect || !presetVersion) {
      return;
    }

    const selectedOption = presetSelect.options[presetSelect.selectedIndex];
    presetVersion.value = selectedOption?.dataset.version || '';
  }

  let currentIndex = 0;

  function renderCardPosition() {
    if (!cards.length) {
      return;
    }

    for (const card of cards) {
      card.hidden = Number(card.dataset.optionIndex) !== currentIndex;
    }

    if (positionNode) {
      positionNode.textContent = `Showing schedule ${currentIndex + 1} of ${cards.length}`;
    }
    if (prevButton) {
      prevButton.disabled = currentIndex === 0;
    }
    if (nextButton) {
      nextButton.disabled = currentIndex === cards.length - 1;
    }
  }

  document.addEventListener('change', (event) => {
    if (event.target instanceof HTMLInputElement && event.target.name === 'selectedCourseCodes') {
      updateSelectionWarning();
    }

    if (event.target instanceof HTMLSelectElement && event.target.id === 'selected-saved-set') {
      updatePresetVersion();
    }
  });

  prevButton?.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - 1);
    renderCardPosition();
  });

  nextButton?.addEventListener('click', () => {
    currentIndex = Math.min(cards.length - 1, currentIndex + 1);
    renderCardPosition();
  });

  updatePresetVersion();
  updateSelectionWarning();
  renderCardPosition();
});
