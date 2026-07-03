// AI Fluency — shared JS

// Theme persistence
(function () {
  const saved = localStorage.getItem('af-theme');
  if (saved) document.documentElement.dataset.theme = saved;
})();

function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? '' : 'dark';
  localStorage.setItem('af-theme', html.dataset.theme);
}

// Generic tab switching — works for both overview tabs and role tabs
function initTabs(containerSel, tabSel, panelSel) {
  const container = containerSel ? document.querySelector(containerSel) : document;
  if (!container) return;
  container.querySelectorAll(tabSel).forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll(tabSel).forEach(t => t.classList.remove('active'));
      container.querySelectorAll(panelSel).forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab || tab.dataset.role);
      if (target) target.classList.add('active');
    });
  });
}

// Highlight current page in nav
function highlightNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-pill').forEach(pill => {
    if (pill.getAttribute('href') === page) pill.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs(null, '.tab', '.panel');
  initTabs(null, '.role-btn', '.role-panel');
  highlightNav();
});
