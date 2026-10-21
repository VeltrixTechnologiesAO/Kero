import { router } from './router.js';

window.addEventListener('unhandledrejection', (event) => {
  console.error('[admin] Promise rejeitada:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('[admin] Erro:', event.error);
});

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('adminMenuToggle');
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('adminOverlay');

  if (toggle && sidebar && overlay) {
    const close = () => {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
      overlay.classList.toggle('is-open');
    });

    overlay.addEventListener('click', close);
    sidebar.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  router.start();
});
