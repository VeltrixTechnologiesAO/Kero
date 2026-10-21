import { router } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  initYear();
  router.start();
});

function initMobileDrawer() {
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if (!toggle || !drawer) return;

  const panel = drawer.querySelector('.mobile-drawer-panel');
  const closeBtn = drawer.querySelector('.mobile-drawer-close');
  const backdrops = drawer.querySelectorAll('[data-drawer-close]');
  const links = drawer.querySelectorAll('a[href^="#/"]');

  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');

    requestAnimationFrame(() => {
      drawer.classList.add('is-open');
    });

    setTimeout(() => closeBtn?.focus(), 100);
  };

  const close = () => {
    drawer.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');

    setTimeout(() => {
      drawer.hidden = true;
      drawer.setAttribute('aria-hidden', 'true');
      lastFocused?.focus?.();
    }, 300);
  };

  const onKey = (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      close();
    }
  };

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) close();
    else open();
  });

  backdrops.forEach((el) => el.addEventListener('click', close));
  links.forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', onKey);

  panel?.addEventListener('click', (e) => e.stopPropagation());
}

function initYear() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
}
