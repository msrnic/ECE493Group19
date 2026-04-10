document.addEventListener('DOMContentLoaded', () => {
  const query = document.getElementById('query');
  if (query && query.value === '') {
    query.focus();
  }
});
