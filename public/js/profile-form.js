document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-profile-form]');
  const cancelButton = document.querySelector('[data-cancel-profile]');

  if (!(form instanceof HTMLFormElement) || !(cancelButton instanceof HTMLButtonElement)) {
    return;
  }

  let allowNavigation = false;
  const initialValues = JSON.stringify([...new FormData(form).entries()]);

  function isDirty() {
    return JSON.stringify([...new FormData(form).entries()]) !== initialValues;
  }

  window.addEventListener('beforeunload', (event) => {
    if (!allowNavigation && isDirty()) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  form.addEventListener('submit', () => {
    allowNavigation = true;
  });

  cancelButton.addEventListener('click', () => {
    if (isDirty() && !window.confirm('Discard your unsaved changes?')) {
      return;
    }

    allowNavigation = true;
    window.location.assign(cancelButton.dataset.returnTo || '/dashboard');
  });
});
