document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('[data-password-form]');

  for (const form of forms) {
    const passwordFields = [...form.querySelectorAll('input[type="password"]')];
    let pendingClearTimers = [];

    const cancelPendingClears = () => {
      for (const timerId of pendingClearTimers) {
        window.clearTimeout(timerId);
      }
      pendingClearTimers = [];
    };

    const clearField = (field) => {
      if (field.dataset.userEdited === 'true' || field === document.activeElement) {
        return;
      }

      field.value = '';
    };

    const clearPasswordFields = () => {
      for (const field of passwordFields) {
        clearField(field);
      }
    };

    const resetFields = () => {
      cancelPendingClears();
      form.reset();

      for (const field of passwordFields) {
        field.dataset.userEdited = 'false';
      }

      clearPasswordFields();
      pendingClearTimers = [
        window.setTimeout(clearPasswordFields, 0),
        window.setTimeout(clearPasswordFields, 100)
      ];
    };

    for (const field of passwordFields) {
      field.addEventListener('input', () => {
        field.dataset.userEdited = 'true';
      });
    }

    resetFields();
    window.addEventListener('pageshow', resetFields);

    const cancelButton = form.querySelector('[data-cancel-password-change]');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        resetFields();
      });
    }
  }
});
