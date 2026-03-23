document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('[data-password-form]');

  for (const form of forms) {
    const clearPasswordFields = () => {
      for (const field of form.querySelectorAll('input[type="password"]')) {
        field.value = '';
      }
    };

    const resetFields = () => {
      form.reset();
      clearPasswordFields();
      window.setTimeout(clearPasswordFields, 0);
      window.setTimeout(clearPasswordFields, 100);
    };

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
