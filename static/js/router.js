const ROUTES = {
  '':            () => import('./pages/home.js'),
  'ofertas':     () => import('./pages/ofertas.js'),
  'receitas':    () => import('./pages/receitas.js'),
  'sobre':       () => import('./pages/sobre.js'),
  'lojas':       () => import('./pages/lojas.js'),
  'contacto':    () => import('./pages/contacto.js'),
  'competicoes': () => import('./pages/competicoes.js'),
  'privacidade': () => import('./pages/privacidade.js'),
  'termos': () => import('./pages/termos.js'),
  'talho':              () => import('./pages/talho.js'),
  'produtos':   () => import('./pages/produtos.js'),
  'promocoes':  () => import('./pages/promocoes.js'),
};

const content = document.getElementById('app');
let currentCleanup = null;

function clearPageCSS() {
  document.querySelectorAll('link[data-page-css]').forEach((link) => link.remove());
}

function setPageCSS(pageName) {
  clearPageCSS();
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/static/css/pages/${pageName}.css`;
  link.setAttribute('data-page-css', 'true');
  document.head.appendChild(link);
}

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, queryString = ''] = raw.split('?');
  const segments = path.split('/').filter(Boolean);

  return {
    section: segments[0] || '',
    params: segments.slice(1),
    query: new URLSearchParams(queryString),
  };
}

function renderNotFound() {
  return `
    <section class="section">
      <div class="container" style="text-align:center">
        <h1>Página não encontrada</h1>
        <p>O endereço que procura não existe ou foi movido.</p>
        <a href="#/" class="btn btn-primary">Voltar ao início</a>
      </div>
    </section>
  `;
}

function renderError() {
  return `
    <section class="section">
      <div class="container" style="text-align:center">
        <h1>Ops!</h1>
        <p>Não foi possível carregar esta página.</p>
        <a href="#/" class="btn btn-primary">Voltar ao início</a>
      </div>
    </section>
  `;
}

async function navigate() {
  const { section, params, query } = parseHash();

  const loader = ROUTES[section];

  if (!loader) {
    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch (e) { console.warn(e); }
      currentCleanup = null;
    }
    clearPageCSS();
    content.innerHTML = renderNotFound();
    document.title = 'Página não encontrada — Kero Angola';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }

  content.innerHTML = '<div class="page-loading"><div class="spinner"></div></div>';

  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch (e) { console.warn(e); }
    currentCleanup = null;
  }

  setPageCSS(section || 'home');

  try {
    const mod = await loader();
    const page = mod.default;

    if (!page || typeof page.render !== 'function') {
      throw new Error(`Página inválida: ${section || 'home'}`);
    }

    content.innerHTML = page.render(params, query);
    document.title = page.title || 'Kero Angola';

    if (typeof page.mount === 'function') {
      const result = await page.mount(params, query);
      currentCleanup = typeof result === 'function' ? result : null;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  } catch (err) {
    console.error(err);
    content.innerHTML = renderError();
  }
}

export const router = {
  start() {
    window.addEventListener('hashchange', navigate);
    navigate();
  },
};
