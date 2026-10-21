const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
};

const HERO_IMAGE = '/static/assets/image_produtos.png';
const HERO_FALLBACK = '/static/assets/image_logo.png';

export default {
  title: 'Produtos — Kero Angola',

  render(params) {
    const slug = params[0] || null;
    return slug ? this._renderDetail() : this._renderList();
  },

  _renderList() {
    return `
      <section class="page-hero page-hero-products">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Produtos</span>
            <h1>Os produtos do seu Kero</h1>
            <p>Explore a nossa seleção e descubra as promoções ativas. Preços baixos todos os dias.</p>
          </div>
          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="flyers-toolbar-section">
        <div class="container">
          <div class="products-toolbar">
            <div class="products-search">
              <span class="products-search-icon icon">${ICONS.search}</span>
              <input id="products-search" type="search" placeholder="Pesquisar produto, marca ou categoria…"
                     autocomplete="off" aria-label="Pesquisar produtos" />
              <button type="button" id="products-search-clear" class="products-search-clear" hidden aria-label="Limpar">
                <span class="icon">${ICONS.close}</span>
              </button>
            </div>

            <label class="products-toggle">
              <input type="checkbox" id="products-only-promo" />
              <span>Só com promoção</span>
            </label>
          </div>

          <div class="products-filters" id="products-filters">
            <button type="button" class="filter-chip is-active" data-category="">Todas as categorias</button>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="products-meta">
            <span id="products-count" class="products-count">A carregar…</span>
          </div>
          <div id="products-grid" class="products-grid">
            <div class="section-loading"><div class="spinner"></div></div>
          </div>
        </div>
      </section>
    `;
  },

  _renderDetail() {
    return `
      <section class="section product-detail-section">
        <div class="container">
          <div id="product-detail">
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
    return () => { stopHero(); if (stopList) stopList(); };
  },

  _mountList() {
    const grid = document.getElementById('products-grid');
    const searchInput = document.getElementById('products-search');
    const clearBtn = document.getElementById('products-search-clear');
    const onlyPromo = document.getElementById('products-only-promo');
    const filters = document.getElementById('products-filters');
    const countEl = document.getElementById('products-count');

    if (!grid || !searchInput) return null;

    const controller = new AbortController();
    let currentSearch = '';
    let currentCategory = '';
    let currentOnlyPromo = false;
    let debounceTimer = null;

    const setCount = (n) => {
      if (!countEl) return;
      if (n === 0) countEl.textContent = 'Nenhum produto encontrado';
      else if (n === 1) countEl.textContent = '1 produto encontrado';
      else countEl.textContent = `${n} produtos encontrados`;
    };

    const load = async () => {
      grid.innerHTML = '<div class="section-loading"><div class="spinner"></div></div>';
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      if (currentCategory) params.set('category', currentCategory);
      if (currentOnlyPromo) params.set('only_promotions', 'true');

      try {
        const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderProducts(grid, data.items || []);
        setCount(data.total || 0);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[produtos]', err);
        grid.innerHTML = '<p class="products-empty">Não foi possível carregar os produtos.</p>';
        setCount(0);
      }
    };

    const loadCategories = async () => {
      try {
        const res = await fetch('/api/products/categories', { signal: controller.signal });
        if (!res.ok) return;
        const categories = await res.json();
        if (!filters || !categories.length) return;
        filters.innerHTML = `
          <button type="button" class="filter-chip is-active" data-category="">Todas as categorias</button>
          ${categories.map((c) => `
            <button type="button" class="filter-chip" data-category="${escapeAttr(c)}">${escapeHtml(c)}</button>
          `).join('')}
        `;
        filters.querySelectorAll('.filter-chip').forEach((btn) => {
          btn.addEventListener('click', () => {
            const cat = btn.dataset.category || '';
            if (cat === currentCategory) return;
            currentCategory = cat;
            filters.querySelectorAll('.filter-chip').forEach((b) => b.classList.toggle('is-active', b === btn));
            load();
          });
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('[produtos] categories:', err);
      }
    };

    const onSearch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      const v = searchInput.value.trim();
      clearBtn.hidden = !v;
      debounceTimer = setTimeout(() => { currentSearch = v; load(); }, 280);
    };

    const onClear = () => {
      searchInput.value = '';
      clearBtn.hidden = true;
      currentSearch = '';
      load();
      searchInput.focus();
    };

    const onToggle = () => {
      currentOnlyPromo = onlyPromo.checked;
      load();
    };

    searchInput.addEventListener('input', onSearch);
    clearBtn.addEventListener('click', onClear);
    onlyPromo?.addEventListener('change', onToggle);
    grid.addEventListener('error', onImgError, true);

    load();
    loadCategories();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      controller.abort();
      searchInput.removeEventListener('input', onSearch);
      clearBtn.removeEventListener('click', onClear);
      onlyPromo?.removeEventListener('change', onToggle);
      grid.removeEventListener('error', onImgError, true);
    };
  },

  _mountDetail(slug) {
    const wrap = document.getElementById('product-detail');
    if (!wrap) return null;

    const controller = new AbortController();
    wrap.addEventListener('error', onImgError, true);

    (async () => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, { signal: controller.signal });
        if (res.status === 404) { renderNotFound(wrap); return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const product = await res.json();
        renderDetail(wrap, product);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[produtos] detail:', err);
        wrap.innerHTML = '<p class="products-empty">Não foi possível carregar o produto.</p>';
      }
    })();

    return () => {
      controller.abort();
      wrap.removeEventListener('error', onImgError, true);
    };
  },
};

// ─── Render ───
function renderProducts(container, products) {
  if (!products.length) {
    container.innerHTML = `
      <div class="section-empty">
        <span class="section-empty-icon icon">${ICONS.inbox}</span>
        <h3>Sem produtos</h3>
        <p>Tente ajustar os filtros ou pesquisar outro termo.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map((p) => {
    const hasPromo = p.has_promotion && p.active_promotion;
    const discount = hasPromo && p.active_promotion.discount_percent
      ? `-${p.active_promotion.discount_percent}%` : '';

    return `
      <a href="#/produtos/${encodeURIComponent(p.slug)}" class="product-card">
        <div class="product-card-media media-box">
          ${p.image_url ? mediaImages(p.image_url, p.name) : ''}
          ${hasPromo ? `<span class="product-card-promo-badge">${discount || 'Promoção'}</span>` : ''}
        </div>
        <div class="product-card-body">
          <span class="product-card-cat">${escapeHtml(p.category)}</span>
          <h3>${escapeHtml(p.name)}</h3>
          ${p.brand ? `<span class="product-card-brand">${escapeHtml(p.brand)}</span>` : ''}
          <div class="product-card-price">
            ${hasPromo ? `<span class="product-price-old">${formatPrice(p.price)}</span>` : ''}
            <span class="product-price-current${hasPromo ? ' is-promo' : ''}">${formatPrice(p.current_price)}</span>
            <span class="product-price-unit">/ ${escapeHtml(p.unit)}</span>
          </div>
          ${hasPromo ? `
            <div class="product-card-promo-dates">
              <span class="icon">${ICONS.calendar}</span>
              <span>Promoção válida até ${formatDate(p.active_promotion.end_date)}</span>
            </div>
          ` : ''}
        </div>
      </a>
    `;
  }).join('');
}

function renderDetail(container, p) {
  const hasPromo = p.has_promotion && p.active_promotion;
  const promo = p.active_promotion;

  container.innerHTML = `
    <a href="#/produtos" class="link-more recipe-back">
      <span class="icon">${ICONS.arrowLeft}</span> Voltar aos produtos
    </a>

    <div class="product-detail-grid">
      <div class="product-detail-media media-box">
        ${p.image_url ? mediaImages(p.image_url, p.name) : ''}
      </div>

      <div class="product-detail-info">
        <span class="product-detail-cat">${escapeHtml(p.category)}</span>
        <h1>${escapeHtml(p.name)}</h1>
        ${p.brand ? `<p class="product-detail-brand">Marca: <strong>${escapeHtml(p.brand)}</strong></p>` : ''}

        <div class="product-detail-price">
          ${hasPromo ? `<span class="product-price-old">${formatPrice(p.price)}</span>` : ''}
          <span class="product-price-current${hasPromo ? ' is-promo' : ''}">${formatPrice(p.current_price)}</span>
          <span class="product-price-unit">/ ${escapeHtml(p.unit)}</span>
        </div>

        ${hasPromo ? `
          <div class="product-detail-promo">
            <span class="product-detail-promo-icon icon">${ICONS.tag}</span>
            <div>
              <strong>${escapeHtml(promo.title)}</strong>
              ${promo.description ? `<p>${escapeHtml(promo.description)}</p>` : ''}
              <span class="product-detail-promo-dates">
                <span class="icon">${ICONS.calendar}</span>
                ${formatDate(promo.start_date)} — ${formatDate(promo.end_date)}
                ${promo.days_remaining <= 3
                  ? `<em class="product-detail-promo-urgent">Termina em ${promo.days_remaining} dia${promo.days_remaining === 1 ? '' : 's'}!</em>`
                  : ''}
              </span>
            </div>
          </div>
        ` : ''}

        ${p.description ? `<p class="product-detail-desc">${escapeHtml(p.description)}</p>` : ''}

        <a href="#/lojas" class="btn btn-primary product-detail-cta">
          Encontrar loja
          <span class="icon">${ICONS.arrowRight}</span>
        </a>
      </div>
    </div>

    ${p.promotion_history && p.promotion_history.length > 1 ? `
      <section class="product-detail-history">
        <h2>Histórico de promoções</h2>
        <ul class="product-history-list">
          ${p.promotion_history.map((h) => `
            <li>
              <span class="product-history-dates">${formatDate(h.start_date)} — ${formatDate(h.end_date)}</span>
              <span class="product-history-title">${escapeHtml(h.title)}</span>
              ${h.discount_percent ? `<span class="product-history-discount">-${h.discount_percent}%</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </section>
    ` : ''}
  `;
}

function renderNotFound(container) {
  container.innerHTML = `
    <div class="section-empty">
      <span class="section-empty-icon icon">${ICONS.inbox}</span>
      <h2>Produto não encontrado</h2>
      <p>Este produto pode ter sido removido ou o link está errado.</p>
      <a href="#/produtos" class="btn btn-primary">Ver todos os produtos</a>
    </div>
  `;
}

// ─── Helpers ───
function mediaImages(src, alt) {
  const url = escapeHtml(src);
  return `
    <img class="media-box-bg" src="${url}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <img class="media-box-img" src="${url}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
  `;
}

function onImgError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  img.closest('.media-box')?.classList.add('is-broken');
}

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
  let used = false;
  const onError = () => {
    if (used) { box.classList.add('is-broken'); return; }
    used = true;
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

function formatPrice(value) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}
function escapeAttr(v) { return escapeHtml(v); }
