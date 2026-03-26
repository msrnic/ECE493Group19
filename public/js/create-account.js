document.addEventListener('DOMContentLoaded', () => {
  const firstInvalidField = document.querySelector('.input-error');
  const emailField = document.getElementById('email');

  if (firstInvalidField) {
    firstInvalidField.focus();
    return;
  }

  if (emailField) {
    emailField.focus();
  }
});
