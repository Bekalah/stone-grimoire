<!-- FILE: assets/js/theme.js -->
<script type="module">
// Theme engine: reads data-theme from <body>, lets you switch if needed.
function applyThemeFromBody() {
  const body = document.body;
  const theme = body.getAttribute('data-theme') || 'tiphereth';
  document.documentElement.dataset.theme = theme;
}

// Optional: expose a toggle (you can call window.toggleHighContrast() from a button later)
function toggleHighContrast() {
  document.documentElement.classList.toggle('high-contrast');
}

window.addEventListener('DOMContentLoaded', applyThemeFromBody);
window.toggleHighContrast = toggleHighContrast;
</script>