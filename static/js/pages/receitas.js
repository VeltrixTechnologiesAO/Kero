const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  servings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
};

// Imagem do hero (com alternativa se não existir). A moldura adapta-se ao
// formato real da imagem (ver setupHeroMedia), por isso nunca é cortada.
const HERO_IMAGE = '/static/assets/image_recite.png';
const HERO_FALLBACK = '/static/assets/image_logo.png';

export default {
  title: 'Receitas — Kero Angola',

  render(params) {
    const slug = params[0] || null;
    return slug ? this._renderDetail() : this._renderList();
  },

  _renderList() {
    return `
      <section class="page-hero page-hero-recipes">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Receitas Kero</span>
            <h1>Receitas para todos os momentos</h1>
            <p>Temos receitas encantadoras adequadas para todos os gostos, dietas e ocasiões. Encontre todos os ingredientes nas lojas Kero.</p>
          </div>

          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="recipes-toolbar">
            <div>
              <span class="badge">Todas as receitas</span>
              <h2>Escolha a sua próxima refeição</h2>
              <p class="section-sub">Filtre por categoria para encontrar rapidamente o que procura.</p>
            </div>

            <div class="recipes-filters" id="recipes-filters">
              <button type="button" class="filter-chip is-active" data-category="">Todas</button>
            </div>
          </div>

          <div id="recipes-grid" class="recipes-grid">
            <div class="section-loading"><div class="spinner"></div></div>
          </div>
        </div>
      </section>
    `;
  },

  _renderDetail() {
    return `
      <section class="section recipe-detail-section">
        <div class="container">
          <div id="recipe-detail">
            <div class="section-loading"><div class="spinner"></div></div>
          </div>
        </div>
      </section>
    `;
  },

  async mount(params) {
    const slug = params[0] || null;
    if (slug) return this._mountDetail(slug);

    const stopHero = setupHeroMedia(document.querySelector('[data-hero-media]'));
    const stopList = this._mountList();

    return () => {
      stopHero();
      if (stopList) stopList();
    };
  },

  _mountList() {
    const grid = document.getElementById('recipes-grid');
    const filters = document.getElementById('recipes-filters');
    if (!grid) return null;

    const controller = new AbortController();
    let currentCategory = '';

    const loadRecipes = async (category = '') => {
      grid.innerHTML = '<div class="section-loading"><div class="spinner"></div></div>';

      try {
        const url = category
          ? `/api/recipes?category=${encodeURIComponent(category)}`
          : '/api/recipes';

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderList(grid, data.items || []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[receitas]', err);
        grid.innerHTML = '<p class="recipes-empty">Não foi possível carregar as receitas.</p>';
      }
    };

    const loadCategories = async () => {
      try {
        const res = await fetch('/api/recipes/categories', { signal: controller.signal });
        if (!res.ok) return;
        const categories = await res.json();
        if (!filters || !categories.length) return;

        filters.innerHTML = `
          <button type="button" class="filter-chip is-active" data-category="">Todas</button>
          ${categories.map((c) => `
            <button type="button" class="filter-chip" data-category="${escapeAttr(c)}">
              ${escapeHtml(c)}
            </button>
          `).join('')}
        `;

        filters.querySelectorAll('.filter-chip').forEach((btn) => {
          btn.addEventListener('click', () => {
            const category = btn.dataset.category || '';
            if (category === currentCategory) return;
            currentCategory = category;
            filters.querySelectorAll('.filter-chip').forEach((b) =>
              b.classList.toggle('is-active', b === btn)
            );
            loadRecipes(category);
          });
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('[receitas] categorias:', err);
      }
    };

    grid.addEventListener('error', onImgError, true);

    loadRecipes();
    loadCategories();

    return () => {
      controller.abort();
      grid.removeEventListener('error', onImgError, true);
    };
  },

  _mountDetail(slug) {
    const wrap = document.getElementById('recipe-detail');
    if (!wrap) return null;

    const controller = new AbortController();

    wrap.addEventListener('error', onImgError, true);

    (async () => {
      try {
        const res = await fetch(`/api/recipes/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });

        if (res.status === 404) {
          renderNotFound(wrap);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const recipe = await res.json();
        renderDetail(wrap, recipe);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[receitas]', err);
        wrap.innerHTML = '<p class="recipes-empty">Não foi possível carregar a receita.</p>';
      }
    })();

    return () => {
      controller.abort();
      wrap.removeEventListener('error', onImgError, true);
    };
  },
};

function renderList(container, recipes) {
  if (!recipes.length) {
    container.innerHTML = `
      <div class="section-empty">
        <span class="section-empty-icon icon">${ICONS.inbox}</span>
        <p>Sem receitas nesta categoria.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recipes.map((r) => `
    <a href="#/receitas/${encodeURIComponent(r.slug)}" class="recipe-card">
      <div class="recipe-thumb media-box">
        ${mediaImages(r.thumbnail_url, r.title)}
      </div>
      <div class="recipe-body">
        ${r.category ? `<span class="recipe-category">${escapeHtml(r.category)}</span>` : ''}
        <h3>${escapeHtml(r.title)}</h3>
        <ul class="recipe-meta">
          <li><span class="icon">${ICONS.clock}</span> ${r.prep_time_minutes} min</li>
          <li><span class="icon">${ICONS.servings}</span> ${escapeHtml(r.servings)}</li>
        </ul>
        <p class="recipe-desc">${escapeHtml(r.description)}</p>
        <span class="recipe-cta">
          Ver receita <span class="icon">${ICONS.arrowRight}</span>
        </span>
      </div>
    </a>
  `).join('');
}

function renderDetail(container, r) {
  container.innerHTML = `
    <a href="#/receitas" class="link-more recipe-back">
      <span class="icon">${ICONS.arrowLeft}</span> Voltar às receitas
    </a>

    <header class="recipe-detail-head">
      ${r.category ? `<span class="recipe-category">${escapeHtml(r.category)}</span>` : ''}
      <h1>${escapeHtml(r.title)}</h1>
      <p class="recipe-detail-desc">${escapeHtml(r.description)}</p>
    </header>

    <figure class="recipe-detail__image media-box">
      ${mediaImages(r.image_url, r.title)}
    </figure>

    <div class="recipe-detail__meta">
      <div class="recipe-detail__meta-item">
        <span class="icon">${ICONS.clock}</span>
        <div>
          <strong>${r.prep_time_minutes} min</strong>
          <span>Tempo de preparação</span>
        </div>
      </div>
      <div class="recipe-detail__meta-item">
        <span class="icon">${ICONS.servings}</span>
        <div>
          <strong>${escapeHtml(r.servings)}</strong>
          <span>Porções</span>
        </div>
      </div>
      <div class="recipe-detail__meta-item">
        <span class="icon">${ICONS.chef}</span>
        <div>
          <strong>${r.ingredients.length} ingredientes</strong>
          <span>Fáceis de encontrar</span>
        </div>
      </div>
    </div>

    <div class="recipe-detail__columns">
      <aside class="recipe-detail__ingredients-wrap">
        <h2>Ingredientes</h2>
        <ul class="recipe-detail__ingredients">
          ${r.ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
        </ul>
      </aside>

      <div class="recipe-detail__instructions-wrap">
        <h2>Preparação</h2>
        <ol class="recipe-detail__instructions">
          ${r.instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
        </ol>
      </div>
    </div>

    <aside class="recipe-detail__cta">
      <div>
        <h3>Encontre todos os ingredientes</h3>
        <p>Visite a loja Kero mais próxima e leve tudo o que precisa.</p>
      </div>
      <a href="#/lojas" class="btn btn-primary">Encontrar loja</a>
    </aside>
  `;
}

function renderNotFound(container) {
  container.innerHTML = `
    <div class="section-empty">
      <span class="section-empty-icon icon">${ICONS.inbox}</span>
      <h2>Receita não encontrada</h2>
      <p>Esta receita pode ter sido removida ou o link está errado.</p>
      <a href="#/receitas" class="btn btn-primary">Ver todas as receitas</a>
    </div>
  `;
}

// Imagem completa: a principal (contain) + cópia desfocada a preencher a moldura.
function mediaImages(src, alt) {
  const url = escapeHtml(src);
  return `
    <img class="media-box-bg" src="${url}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <img class="media-box-img" src="${url}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
  `;
}

// Os erros de imagem não "sobem" no DOM, por isso ouvimos na fase de captura.
function onImgError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  img.closest('.media-box')?.classList.add('is-broken');
}

// Hero: a moldura passa a ter o formato real da imagem (limitado a 1.2–2.4).
// Se a imagem não existir, usa a alternativa uma única vez.
function setupHeroMedia(box) {
  if (!box) return () => {};

  const main = box.querySelector('.media-box-img');
  const bg = box.querySelector('.media-box-bg');
  if (!main) return () => {};

  const applyRatio = () => {
    if (!main.naturalWidth || !main.naturalHeight) return;
    const ratio = Math.min(2.4, Math.max(1.2, main.naturalWidth / main.naturalHeight));
    box.style.setProperty('--ratio', ratio.toFixed(4));
  };

  let usedFallback = false;
  const onError = () => {
    if (usedFallback) {
      box.classList.add('is-broken');
      return;
    }
    usedFallback = true;
    main.src = HERO_FALLBACK;
    if (bg) bg.src = HERO_FALLBACK;
  };

  main.addEventListener('load', applyRatio);
  main.addEventListener('error', onError);
  if (main.complete) applyRatio();

  return () => {
    main.removeEventListener('load', applyRatio);
    main.removeEventListener('error', onError);
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}
