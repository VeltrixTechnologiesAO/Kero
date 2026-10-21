const ICONS = {
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
};

const HERO_IMAGE = '/static/assets/image_promocoes.png';
const HERO_FALLBACK = '/static/assets/image_logo.png';

export default {
  title: 'Promoções — Kero Angola',

  render() {
    return `
      <section class="page-hero page-hero-promotions">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Promoções</span>
            <h1>Promoções ativas no Kero</h1>
            <p>Descubra todas as promoções em vigor — produtos específicos e campanhas gerais. Aproveite antes que terminem.</p>
          </div>
          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="promotions-toolbar-section">
        <div class="container">
          <div class="promotions-filters">
            <button type="button" class="filter-chip is-active" data-kind="">Todas</button>
            <button type="button" class="filter-chip" data-kind="product">Produtos específicos</button>
            <button type="button" class="filter-chip" data-kind="general">Campanhas gerais</button>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div id="promotions-grid" class="promotions-grid">
            <div class="section-loading"><div class="spinner"></div></div>
          </div>
        </div>
      </section>
    `;
  },

  mount() {
    const grid = document.getElementById('promotions-grid');
    const filters = document.querySelector('.promotions-filters');
    if (!grid) return null;

    const controller = new AbortController();
    let currentKind = '';

    const load = async () => {
      grid.innerHTML = '<div class="section-loading"><div class="spinner"></div></div>';
      const params = new URLSearchParams();
      if (currentKind) params.set('kind', currentKind);
      try {
        const res = await fetch(`/api/promotions?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderPromotions(grid, data.items || []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[promocoes]', err);
        grid.innerHTML = '<p class="products-empty">Não foi possível carregar as promoções.</p>';
      }
    };

    const stopHero = setupHeroMedia(document.querySelector('[data-hero-media]'));
    grid.addEventListener('error', onImgError, true);

    filters?.querySelectorAll('.filter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.kind || '';
        if (kind === currentKind) return;
        currentKind = kind;
        filters.querySelectorAll('.filter-chip').forEach((b) => b.classList.toggle('is-active', b === btn));
        load();
      });
    });

    load();

    return () => {
      controller.abort();
      stopHero();
      grid.removeEventListener('error', onImgError, true);
    };
  },
};

function renderPromotions(container, promos) {
  if (!promos.length) {
    container.innerHTML = `
      <div class="section-empty">
        <span class="section-empty-icon icon">${ICONS.inbox}</span>
        <h3>Sem promoções ativas</h3>
        <p>Volte em breve — novas campanhas são anunciadas regularmente.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = promos.map((p) => {
    const isProduct = p.kind === 'product' && p.product_slug;
    const cta = isProduct
      ? `<a href="#/produtos/${encodeURIComponent(p.product_slug)}" class="promo-card-cta">Ver produto <span class="icon">${ICONS.arrowRight}</span></a>`
      : '';

    const discountLabel = p.discount_percent
      ? `<span class="promo-card-discount">-${p.discount_percent}%</span>`
      : '';

    return `
      <article class="promo-card${p.is_featured ? ' is-featured' : ''}">
        <div class="promo-card-media media-box">
          ${p.image_url ? mediaImages(p.image_url, p.title) : ''}
          ${discountLabel}
          ${p.is_featured ? `<span class="promo-card-featured">Destaque</span>` : ''}
        </div>
        <div class="promo-card-body">
          <span class="promo-card-kind">${p.kind === 'general' ? 'Campanha' : 'Produto'}</span>
          <h3>${escapeHtml(p.title)}</h3>
          ${p.description ? `<p class="promo-card-desc">${escapeHtml(p.description)}</p>` : ''}
          ${p.product_name ? `<span class="promo-card-product">${escapeHtml(p.product_name)}</span>` : ''}
          <div class="promo-card-dates">
            <span class="icon">${ICONS.calendar}</span>
            <span>${formatDate(p.start_date)} — ${formatDate(p.end_date)}</span>
          </div>
          <div class="promo-card-foot">
            <span class="promo-card-days">
              ${p.days_remaining <= 0 ? 'Termina hoje' : p.days_remaining === 1 ? 'Termina amanhã' : `${p.days_remaining} dias restantes`}
            </span>
            ${cta}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

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

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}
