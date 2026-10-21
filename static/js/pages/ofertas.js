const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  pages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
};

// Imagem do hero (com alternativa se não existir). A moldura adapta-se ao
// formato real da imagem (ver setupHeroMedia), por isso nunca é cortada.
const HERO_IMAGE = '/static/assets/image_flyers.png';
const HERO_FALLBACK = '/static/assets/image_logo.png';

export default {
  title: 'Ofertas e folhetos — Kero Angola',

  render() {
    return `
      <section class="page-hero page-hero-flyers">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Folhetos</span>
            <h1>Ofertas da semana</h1>
            <p>Consulte o folheto da sua loja, folheie página a página e aproveite antes que termine. Os folhetos são atualizados regularmente.</p>
          </div>

          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="flyers-toolbar-section">
        <div class="container">
          <div class="flyers-toolbar">
            <div class="flyers-search">
              <span class="flyers-search-icon icon">${ICONS.search}</span>
              <input
                id="flyers-search"
                type="search"
                placeholder="Pesquisar folheto, loja ou província…"
                autocomplete="off"
                spellcheck="false"
                aria-label="Pesquisar folhetos"
              />
              <button type="button" id="flyers-search-clear" class="flyers-search-clear" hidden aria-label="Limpar pesquisa">
                <span class="icon">${ICONS.close}</span>
              </button>
            </div>

            <div class="flyers-store-filter">
              <label for="flyers-store-select">Loja</label>
              <select id="flyers-store-select" aria-label="Filtrar por loja">
                <option value="">Todas as lojas</option>
              </select>
            </div>
          </div>

          <div class="flyers-filters" id="flyers-filters">
            <button type="button" class="filter-chip is-active" data-region="">Todas as províncias</button>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="flyers-meta">
            <span id="flyers-count" class="flyers-count">A carregar…</span>
          </div>

          <div id="flyers-grid" class="flyers-grid">
            <div class="section-loading"><div class="spinner"></div></div>
          </div>
        </div>
      </section>

      <div id="flyer-lightbox" class="flyer-lightbox" hidden aria-modal="true" role="dialog" aria-label="Visualizador de folheto">

        <header class="flyer-lb-header">
          <button type="button" class="flyer-lb-icon-btn flyer-lb-close" data-close aria-label="Fechar">
            <span class="icon">${ICONS.close}</span>
          </button>

          <div class="flyer-lb-heading">
            <strong id="flyer-lb-title">Folheto</strong>
            <span id="flyer-lb-subtitle"></span>
          </div>

          <div class="flyer-lb-header-actions">
            <span class="flyer-lb-counter" id="flyer-lb-counter" aria-live="polite">1 / 1</span>
            <a id="flyer-lb-download" href="#" download class="flyer-lb-icon-btn flyer-lb-download" aria-label="Baixar página">
              <span class="icon">${ICONS.download}</span>
            </a>
          </div>

          <div class="flyer-lb-progress" aria-hidden="true">
            <div class="flyer-lb-progress-bar" id="flyer-lb-progress"></div>
          </div>
        </header>

        <div class="flyer-lb-stage" id="flyer-lb-stage">
          <button type="button" class="flyer-lb-nav flyer-lb-nav-prev" data-nav="-1" aria-label="Página anterior">
            <span class="icon">${ICONS.chevronLeft}</span>
          </button>

          <div class="flyer-lb-pages" id="flyer-lb-pages"></div>

          <button type="button" class="flyer-lb-nav flyer-lb-nav-next" data-nav="1" aria-label="Página seguinte">
            <span class="icon">${ICONS.chevronRight}</span>
          </button>
        </div>

        <footer class="flyer-lb-footer">
          <div class="flyer-lb-thumbs" id="flyer-lb-thumbs" role="tablist" aria-label="Páginas do folheto"></div>

          <div class="flyer-lb-dots" id="flyer-lb-dots" aria-hidden="true"></div>
        </footer>

        <button type="button" class="flyer-lb-close-bottom" data-close aria-label="Fechar visualizador">
          Fechar
        </button>
      </div>
    `;
  },

  mount() {
    const grid = document.getElementById('flyers-grid');
    const searchInput = document.getElementById('flyers-search');
    const clearBtn = document.getElementById('flyers-search-clear');
    const storeSelect = document.getElementById('flyers-store-select');
    const filters = document.getElementById('flyers-filters');
    const countEl = document.getElementById('flyers-count');

    const lightbox = document.getElementById('flyer-lightbox');
    const lbTitle = document.getElementById('flyer-lb-title');
    const lbSubtitle = document.getElementById('flyer-lb-subtitle');
    const lbCounter = document.getElementById('flyer-lb-counter');
    const lbProgress = document.getElementById('flyer-lb-progress');
    const lbDownload = document.getElementById('flyer-lb-download');
    const lbPages = document.getElementById('flyer-lb-pages');
    const lbThumbs = document.getElementById('flyer-lb-thumbs');
    const lbDots = document.getElementById('flyer-lb-dots');
    const lbStage = document.getElementById('flyer-lb-stage');

    if (!grid || !searchInput || !lightbox) return null;

    const controller = new AbortController();
    const flyersById = new Map();

    let currentRegion = '';
    let currentStoreId = '';
    let currentSearch = '';
    let debounceTimer = null;
    let lastFocusedElement = null;
    let currentFlyer = null;
    let currentPageIdx = 0;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSwiping = false;

    const setCount = (n) => {
      if (!countEl) return;
      if (n === 0) countEl.textContent = 'Nenhum folheto encontrado';
      else if (n === 1) countEl.textContent = '1 folheto disponível';
      else countEl.textContent = `${n} folhetos disponíveis`;
    };

    const loadFlyers = async () => {
      grid.innerHTML = '<div class="section-loading"><div class="spinner"></div></div>';

      const params = new URLSearchParams();
      if (currentRegion) params.set('region', currentRegion);
      if (currentStoreId) params.set('store_id', currentStoreId);
      if (currentSearch) params.set('search', currentSearch);

      try {
        const res = await fetch(`/api/flyers?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = data.items || [];

        flyersById.clear();
        items.forEach((f) => flyersById.set(f.id, f));

        renderFlyers(grid, items);
        setCount(data.total || 0);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[ofertas]', err);
        grid.innerHTML = '<p class="flyers-empty">Não foi possível carregar os folhetos.</p>';
        setCount(0);
      }
    };

    const loadRegions = async () => {
      try {
        const res = await fetch('/api/flyers/regions', { signal: controller.signal });
        if (!res.ok) return;
        const regions = await res.json();
        if (!filters || !regions.length) return;

        filters.innerHTML = `
          <button type="button" class="filter-chip is-active" data-region="">Todas as províncias</button>
          ${regions.map((r) => `
            <button type="button" class="filter-chip" data-region="${escapeAttr(r)}">${escapeHtml(r)}</button>
          `).join('')}
        `;

        filters.querySelectorAll('.filter-chip').forEach((btn) => {
          btn.addEventListener('click', () => {
            const region = btn.dataset.region || '';
            if (region === currentRegion) return;
            currentRegion = region;
            filters.querySelectorAll('.filter-chip').forEach((b) =>
              b.classList.toggle('is-active', b === btn)
            );
            loadFlyers();
          });
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('[ofertas] regions:', err);
      }
    };

    const loadStores = async () => {
      try {
        const res = await fetch('/api/flyers/stores', { signal: controller.signal });
        if (!res.ok) return;
        const stores = await res.json();
        if (!storeSelect) return;

        storeSelect.innerHTML = `
          <option value="">Todas as lojas</option>
          ${stores.map((s) => `
            <option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.region)}</option>
          `).join('')}
        `;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('[ofertas] stores:', err);
      }
    };

    const preloadImage = (url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    };

    const preloadAdjacent = () => {
      if (!currentFlyer || currentFlyer.pages.length < 2) return;
      const total = currentFlyer.pages.length;
      const prevIdx = (currentPageIdx - 1 + total) % total;
      const nextIdx = (currentPageIdx + 1) % total;
      preloadImage(currentFlyer.pages[prevIdx].image_url);
      preloadImage(currentFlyer.pages[nextIdx].image_url);
    };

    const updateDownload = () => {
      if (!currentFlyer) return;
      const page = currentFlyer.pages[currentPageIdx];
      lbDownload.href = page.image_url;
      const safeTitle = currentFlyer.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'folheto';
      lbDownload.setAttribute('download', `${safeTitle}-pagina-${page.page_number}.jpg`);
    };

    const updateCounter = () => {
      if (!currentFlyer) return;
      lbCounter.textContent = `${currentPageIdx + 1} / ${currentFlyer.pages.length}`;
    };

    const updateProgress = () => {
      if (!currentFlyer || !lbProgress) return;
      const total = currentFlyer.pages.length;
      const pct = total <= 1 ? 100 : ((currentPageIdx + 1) / total) * 100;
      lbProgress.style.width = `${pct}%`;
    };

    const updateThumbs = () => {
      lbThumbs.querySelectorAll('.flyer-lb-thumb').forEach((el) => {
        const idx = Number(el.dataset.pageIdx);
        const isActive = idx === currentPageIdx;
        el.classList.toggle('is-active', isActive);
        el.setAttribute('aria-selected', String(isActive));
      });

      const activeThumb = lbThumbs.querySelector('.flyer-lb-thumb.is-active');
      if (activeThumb) {
        const target = activeThumb.offsetLeft - (lbThumbs.clientWidth / 2) + (activeThumb.clientWidth / 2);
        lbThumbs.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
      }

      lbDots.querySelectorAll('.flyer-lb-dot').forEach((d) => {
        d.classList.toggle('is-active', Number(d.dataset.pageIdx) === currentPageIdx);
      });
    };

    const showPage = (idx, options = {}) => {
      if (!currentFlyer || !currentFlyer.pages.length) return;

      const total = currentFlyer.pages.length;
      let target = idx;
      if (target < 0) target = total - 1;
      if (target >= total) target = 0;

      if (target === currentPageIdx && options.force !== true) return;

      const dir = target > currentPageIdx ? 1 : -1;
      currentPageIdx = target;

      lbPages.querySelectorAll('.flyer-lb-page').forEach((el) => {
        const i = Number(el.dataset.pageIdx);
        if (i === target) {
          el.style.setProperty('--enter-x', `${dir * 40}px`);
          el.classList.remove('is-active', 'was-active');
          void el.offsetWidth;
          el.classList.add('is-active');
        } else {
          el.classList.remove('is-active');
        }
      });

      updateThumbs();
      updateCounter();
      updateProgress();
      updateDownload();
      preloadAdjacent();
    };

    const buildDots = (total) => {
      if (total <= 1 || total > 30) {
        lbDots.innerHTML = '';
        return;
      }
      lbDots.innerHTML = Array.from({ length: total }, (_, i) =>
        `<span class="flyer-lb-dot ${i === 0 ? 'is-active' : ''}" data-page-idx="${i}"></span>`
      ).join('');
    };

    const openLightbox = (flyer, sourceEl) => {
      const pages = flyer.pages || [];
      if (!pages.length) return;

      currentFlyer = flyer;
      currentPageIdx = 0;
      lastFocusedElement = sourceEl || null;

      lbTitle.textContent = flyer.title;
      lbSubtitle.textContent = `${flyer.store.name} — ${flyer.store.region}`;

      lbPages.innerHTML = pages.map((p, i) => `
        <div class="flyer-lb-page ${i === 0 ? 'is-active' : ''}" data-page-idx="${i}">
          <img src="${escapeAttr(p.image_url)}"
               alt="Página ${p.page_number} de ${pages.length}"
               draggable="false"
               loading="${i === 0 ? 'eager' : 'lazy'}" />
        </div>
      `).join('');

      lbThumbs.innerHTML = pages.map((p, i) => `
        <button type="button"
                class="flyer-lb-thumb ${i === 0 ? 'is-active' : ''}"
                data-page-idx="${i}"
                role="tab"
                aria-selected="${i === 0}"
                aria-label="Ir para página ${p.page_number}">
          <img src="${escapeAttr(p.thumbnail_url || p.image_url)}" alt="" decoding="async" draggable="false" />
        </button>
      `).join('');

      buildDots(pages.length);

      const multi = pages.length > 1;
      lbThumbs.hidden = !multi;
      lbDots.hidden = !multi;
      document.querySelectorAll('.flyer-lb-nav').forEach((n) => { n.hidden = !multi; });

      updateCounter();
      updateProgress();
      updateDownload();
      preloadAdjacent();

      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');

      const closeBtn = lightbox.querySelector('.flyer-lb-close');
      closeBtn?.focus();
    };

    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');

      lbPages.innerHTML = '';
      lbThumbs.innerHTML = '';
      lbDots.innerHTML = '';
      currentFlyer = null;
      currentPageIdx = 0;

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    };

    const onSearch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      const value = searchInput.value.trim();
      clearBtn.hidden = !value;

      debounceTimer = setTimeout(() => {
        currentSearch = value;
        loadFlyers();
      }, 280);
    };

    const onSearchClear = () => {
      searchInput.value = '';
      clearBtn.hidden = true;
      currentSearch = '';
      loadFlyers();
      searchInput.focus();
    };

    const onStoreChange = () => {
      currentStoreId = storeSelect.value;
      loadFlyers();
    };

    const onGridClick = (event) => {
      const btn = event.target.closest('[data-flyer-id]');
      if (!btn) return;
      event.preventDefault();

      const id = Number(btn.dataset.flyerId);
      const flyer = flyersById.get(id);
      if (flyer) openLightbox(flyer, btn);
    };

    const onLightboxClick = (event) => {
      if (event.target.closest('[data-close]')) {
        closeLightbox();
        return;
      }

      const nav = event.target.closest('[data-nav]');
      if (nav) {
        const dir = Number(nav.dataset.nav);
        showPage(currentPageIdx + dir);
        return;
      }

      const thumb = event.target.closest('.flyer-lb-thumb');
      if (thumb) {
        showPage(Number(thumb.dataset.pageIdx));
        return;
      }

      const dot = event.target.closest('.flyer-lb-dot');
      if (dot) {
        showPage(Number(dot.dataset.pageIdx));
        return;
      }

      if (event.target === lbStage && currentFlyer && currentFlyer.pages.length > 1) {
        return;
      }

      if (event.target === lbStage) {
        closeLightbox();
      }
    };

    const onKeyDown = (event) => {
      if (lightbox.hidden) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (!currentFlyer || currentFlyer.pages.length < 2) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPage(currentPageIdx - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showPage(currentPageIdx + 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        showPage(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        showPage(currentFlyer.pages.length - 1);
      }
    };

    const onTouchStart = (event) => {
      if (lightbox.hidden || !currentFlyer || currentFlyer.pages.length < 2) return;
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      isSwiping = false;
    };

    const onTouchMove = (event) => {
      if (lightbox.hidden || !currentFlyer || currentFlyer.pages.length < 2) return;
      if (event.touches.length !== 1) return;
      if (!touchStartX) return;

      const touch = event.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        isSwiping = true;
        event.preventDefault();
      }
    };

    const onTouchEnd = (event) => {
      if (lightbox.hidden || !currentFlyer || currentFlyer.pages.length < 2) return;
      if (!touchStartX) return;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const dt = Date.now() - touchStartTime;

      const isHorizontal = Math.abs(dx) > Math.abs(dy);
      const isFast = dt < 300 && Math.abs(dx) > 30;
      const isFar = Math.abs(dx) > 60;

      if (isHorizontal && (isFast || isFar)) {
        if (dx < 0) showPage(currentPageIdx + 1);
        else showPage(currentPageIdx - 1);
      }

      touchStartX = 0;
      touchStartY = 0;
      touchStartTime = 0;
      isSwiping = false;
    };

    const stopHero = setupHeroMedia(document.querySelector('[data-hero-media]'));
    grid.addEventListener('error', onImgError, true);
    lightbox.addEventListener('error', onImgError, true);

    searchInput.addEventListener('input', onSearch);
    clearBtn.addEventListener('click', onSearchClear);
    storeSelect?.addEventListener('change', onStoreChange);
    grid.addEventListener('click', onGridClick);
    lightbox.addEventListener('click', onLightboxClick);
    document.addEventListener('keydown', onKeyDown);

    lbStage.addEventListener('touchstart', onTouchStart, { passive: true });
    lbStage.addEventListener('touchmove', onTouchMove, { passive: false });
    lbStage.addEventListener('touchend', onTouchEnd, { passive: true });

    loadFlyers();
    loadRegions();
    loadStores();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      controller.abort();

      stopHero();
      grid.removeEventListener('error', onImgError, true);
      lightbox.removeEventListener('error', onImgError, true);

      searchInput.removeEventListener('input', onSearch);
      clearBtn.removeEventListener('click', onSearchClear);
      storeSelect?.removeEventListener('change', onStoreChange);
      grid.removeEventListener('click', onGridClick);
      lightbox.removeEventListener('click', onLightboxClick);
      document.removeEventListener('keydown', onKeyDown);

      lbStage.removeEventListener('touchstart', onTouchStart);
      lbStage.removeEventListener('touchmove', onTouchMove);
      lbStage.removeEventListener('touchend', onTouchEnd);

      document.body.classList.remove('lightbox-open');
    };
  },
};

function renderFlyers(container, flyers) {
  if (!flyers.length) {
    container.innerHTML = `
      <div class="section-empty">
        <span class="section-empty-icon icon">${ICONS.inbox}</span>
        <h3>Sem folhetos ativos</h3>
        <p>Tente ajustar os filtros ou volte em breve — novos folhetos são publicados regularmente.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = flyers.map((f) => {
    const daysLabel = formatDaysRemaining(f.days_remaining);
    const urgencyClass = f.days_remaining <= 2 ? 'is-urgent' : '';
    const cover = f.cover_thumbnail_url || f.thumbnail_url || '';
    const pageCount = f.page_count || (f.pages ? f.pages.length : 1);
    const ctaLabel = pageCount > 1 ? 'Ver revista' : 'Ver folheto';

    return `
      <article class="flyer-card">
        <button type="button"
                class="flyer-card-media media-box${cover ? '' : ' is-broken'}"
                data-flyer-id="${f.id}"
                aria-label="${escapeAttr(ctaLabel)} de ${escapeAttr(f.title)}">
          ${cover ? mediaImages(cover, f.title) : ''}

          <span class="flyer-card-overlay">
            <span class="flyer-card-overlay-icon">${ICONS.eye}</span>
            <span>${ctaLabel}</span>
          </span>

          <span class="flyer-region-badge">
            <span class="flyer-region-dot"></span>
            ${escapeHtml(f.store.region)}
          </span>

          ${pageCount > 1 ? `
            <span class="flyer-pages-badge" aria-label="${pageCount} páginas">
              <span class="icon">${ICONS.pages}</span>
              ${pageCount}
            </span>
          ` : ''}
        </button>

        <div class="flyer-card-body">
          <h3>${escapeHtml(f.store.name)}</h3>
          ${f.title && f.title !== f.store.name ? `<p class="flyer-card-subtitle">${escapeHtml(f.title)}</p>` : ''}

          <div class="flyer-card-dates">
            <span class="flyer-card-dates-icon icon">${ICONS.calendar}</span>
            <div>
              <span class="flyer-card-dates-label">Válido</span>
              <span class="flyer-card-dates-value">
                ${formatShortDate(f.valid_from)} — ${formatShortDate(f.valid_until)}
              </span>
            </div>
          </div>

          <span class="flyer-days-pill ${urgencyClass}">${daysLabel}</span>
        </div>

        <footer class="flyer-card-foot">
          <button type="button"
                  class="flyer-open-btn"
                  data-flyer-id="${f.id}">
            <span class="icon">${ICONS.eye}</span>
            <span>${ctaLabel}</span>
          </button>
        </footer>
      </article>
    `;
  }).join('');
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
// Se uma imagem falhar, mostra-se um estado neutro em vez do ícone de imagem partida.
function onImgError(event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  img.closest('.media-box, .flyer-lb-page, .flyer-lb-thumb')?.classList.add('is-broken');
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

function formatShortDate(iso) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDaysRemaining(days) {
  if (days <= 0) return 'Termina hoje';
  if (days === 1) return 'Termina amanhã';
  if (days <= 2) return `Apenas ${days} dias`;
  return `${days} dias restantes`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}
