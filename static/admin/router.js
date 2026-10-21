const ROUTES = {
  '':             () => import('./pages/dashboard.js'),
  'dashboard':    () => import('./pages/dashboard.js'),
  'messages':     () => import('./pages/messages.js'),
  'flyers':       () => import('./pages/flyers.js'),
  'recipes':      () => import('./pages/recipes.js'),
  'competitions': () => import('./pages/competitions.js'),
  'stores':       () => import('./pages/stores.js'),
  'users':        () => import('./pages/users.js'),
  'audit':        () => import('./pages/audit.js'),
  'products':    () => import('./pages/products.js'),
  'promotions':  () => import('./pages/promotions.js'),
};

const app = document.getElementById('adminApp');
const titleEl = document.getElementById('adminPageTitle');

let currentCleanup = null;

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const segments = raw.split('/').filter(Boolean);
  return {
    section: segments[0] || 'dashboard',
    params: segments.slice(1),
  };
}

async function navigate() {
  const { section, params } = parseHash();
  const loader = ROUTES[section];

  if (!loader) {
    window.location.hash = '#/dashboard';
    return;
  }

  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch (e) { console.warn(e); }
    currentCleanup = null;
  }

  app.innerHTML = '<div class="admin-loading"><div class="admin-spinner"></div></div>';

  document.querySelectorAll('.admin-nav-link[data-route]').forEach((a) => {
    a.classList.toggle('is-active', a.dataset.route === section);
  });

  try {
    const mod = await loader();
    const page = mod.default;

    if (!page || typeof page.render !== 'function') {
      throw new Error(`Página inválida: ${section}`);
    }

    app.innerHTML = page.render(params);
    titleEl.textContent = page.title || 'Dashboard';
    document.title = `${page.title || 'Admin'} — Kero Angola`;

    if (typeof page.mount === 'function') {
      const result = await page.mount(params);
      currentCleanup = typeof result === 'function' ? result : null;
    }
  } catch (err) {
    console.error('[admin]', err);

    if (err.message && err.message.includes('401')) {
      window.location.href = '/admin/login';
      return;
    }

    app.innerHTML = `
      <div class="admin-error">
        <h2>Ops!</h2>
        <p>Não foi possível carregar esta secção.</p>
      </div>
    `;
  }
}

export const router = {
  start() {
    window.addEventListener('hashchange', navigate);
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    } else {
      navigate();
    }
  },
};

export function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content || '';
}
