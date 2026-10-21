const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  navigate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"/></svg>',
};

// Imagem do hero (com alternativa se não existir). A moldura adapta-se ao
// formato real da imagem (ver setupHeroMedia), por isso nunca é cortada.
const HERO_IMAGE = '/static/assets/image_shope.png';
const HERO_FALLBACK = '/static/assets/image_logo.png';

const ANGOLA_CENTER = [-11.2027, 17.8739];
const ANGOLA_ZOOM = 6;
const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
const LEAFLET_CSS_SRI = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
const LEAFLET_JS_SRI = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';

let leafletLoader = null;
let mapInstance = null;
let markersLayer = null;
let storeMarkers = {};

async function loadLeaflet() {
  if (window.L) return window.L;
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      link.integrity = LEAFLET_CSS_SRI;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.integrity = LEAFLET_JS_SRI;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Falha ao carregar Leaflet'));
    document.head.appendChild(script);
  });

  return leafletLoader;
}

export default {
  title: 'Localizador de lojas — Kero Angola',

  render() {
    return `
      <section class="page-hero page-hero-stores">
        <div class="container page-hero-inner">
          <div class="page-hero-copy">
            <span class="badge badge-light">Localizador</span>
            <h1>Encontre a loja mais próxima</h1>
            <p>12 lojas Kero em Angola, de Cabinda ao Namibe. Pesquise por nome, província ou morada.</p>
          </div>

          <div class="page-hero-media media-box" data-hero-media>
            <img class="media-box-bg" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" />
            <img class="media-box-img" src="${HERO_IMAGE}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section class="stores-search">
        <div class="container">
          <div class="search-bar" role="search">
            <span class="search-bar-icon icon">${ICONS.search}</span>
            <input
              id="store-search"
              type="search"
              placeholder="Pesquisar por loja, província ou morada…"
              autocomplete="off"
              spellcheck="false"
              aria-label="Pesquisar lojas"
            />
            <button type="button" id="store-search-clear" class="search-clear" hidden aria-label="Limpar pesquisa">
              <span class="icon">${ICONS.close}</span>
            </button>
          </div>

          <div class="stores-filters" id="stores-filters">
            <button type="button" class="filter-chip is-active" data-region="">Todas as províncias</button>
          </div>
        </div>
      </section>

      <section class="stores-map-section">
        <div class="container">
          <div class="stores-map-head">
            <div>
              <span class="badge">Mapa</span>
              <h2>Localização das lojas em Angola</h2>
              <p class="section-sub">Clique num marcador para ver os detalhes da loja.</p>
            </div>
            <div class="stores-map-legend">
              <span class="stores-map-legend-dot"></span>
              <span>Loja Kero</span>
            </div>
          </div>

          <div class="stores-map-wrapper">
            <div id="stores-map" class="stores-map" role="img" aria-label="Mapa das lojas Kero em Angola"></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="stores-meta">
            <span id="stores-count" class="stores-count">A carregar…</span>
          </div>

          <div id="stores-grid" class="stores-grid">
            <div class="section-loading"><div class="spinner"></div></div>
          </div>
        </div>
      </section>
    `;
  },

  async mount() {
    const grid = document.getElementById('stores-grid');
    const searchInput = document.getElementById('store-search');
    const clearBtn = document.getElementById('store-search-clear');
    const filters = document.getElementById('stores-filters');
    const countEl = document.getElementById('stores-count');
    const mapEl = document.getElementById('stores-map');

    if (!grid || !searchInput) return null;

    const stopHero = setupHeroMedia(document.querySelector('[data-hero-media]'));

    mapInstance = null;
    markersLayer = null;
    storeMarkers = {};

    const controller = new AbortController();
    let currentRegion = '';
    let currentSearch = '';
    let debounceTimer = null;

    const setCount = (n) => {
      if (!countEl) return;
      if (n === 0) countEl.textContent = 'Nenhuma loja encontrada';
      else if (n === 1) countEl.textContent = '1 loja encontrada';
      else countEl.textContent = `${n} lojas encontradas`;
    };

    const ensureMap = async () => {
      if (!mapEl) return null;
      if (mapInstance) return mapInstance;

      try {
        const L = await loadLeaflet();
        if (controller.signal.aborted) return null;

        mapInstance = L.map(mapEl, {
          center: ANGOLA_CENTER,
          zoom: ANGOLA_ZOOM,
          minZoom: 5,
          maxZoom: 18,
          scrollWheelZoom: false,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(mapInstance);

        mapInstance.on('click', () => mapInstance.scrollWheelZoom.enable());
        mapEl.addEventListener('mouseleave', () => mapInstance.scrollWheelZoom.disable());

        markersLayer = L.layerGroup().addTo(mapInstance);
        return mapInstance;
      } catch (err) {
        console.error('[lojas] mapa:', err);
        if (mapEl) {
          mapEl.innerHTML = '<p class="stores-map-error">Não foi possível carregar o mapa.</p>';
        }
        return null;
      }
    };

    const renderMapMarkers = async (stores) => {
      const L = window.L;
      if (!L) return;

      const map = await ensureMap();
      if (!map || !markersLayer) return;

      markersLayer.clearLayers();
      storeMarkers = {};

      const bounds = [];
      let markerCount = 0;

      stores.forEach((s) => {
        if (s.latitude == null || s.longitude == null) return;

        const icon = L.divIcon({
          className: 'store-marker',
          html: `<span class="store-marker-pin">${ICONS.mapPin}</span>`,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -44],
        });

        const marker = L.marker([s.latitude, s.longitude], {
          icon,
          title: s.name,
          riseOnHover: true,
        });

        const popupHtml = `
          <div class="store-popup">
            <span class="store-popup-region">${escapeHtml(s.region)}</span>
            <strong>${escapeHtml(s.name)}</strong>
            ${s.address ? `<p>${escapeHtml(s.address)}</p>` : ''}
            ${s.phone ? `<a href="tel:${escapeAttr(s.phone.replace(/\s+/g, ''))}">${escapeHtml(s.phone)}</a>` : ''}
            <button type="button" class="store-popup-btn" data-store-id="${s.id}">
              Ver detalhes
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          closeButton: true,
          maxWidth: 260,
          className: 'store-popup-wrapper',
        });

        marker.addTo(markersLayer);
        storeMarkers[s.id] = marker;
        bounds.push([s.latitude, s.longitude]);
        markerCount += 1;
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      } else {
        map.setView(ANGOLA_CENTER, ANGOLA_ZOOM);
      }

      mapEl.dataset.markers = String(markerCount);
    };

    const openStoreOnMap = (storeId) => {
      const marker = storeMarkers[storeId];
      if (!marker || !mapInstance) return;

      const latlng = marker.getLatLng();
      mapInstance.flyTo(latlng, Math.max(mapInstance.getZoom(), 13), {
        duration: 0.8,
      });

      window.setTimeout(() => marker.openPopup(), 850);

      const mapSection = document.querySelector('.stores-map-section');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const loadStores = async () => {
      grid.innerHTML = '<div class="section-loading"><div class="spinner"></div></div>';

      const params = new URLSearchParams();
      if (currentRegion) params.set('region', currentRegion);
      if (currentSearch) params.set('search', currentSearch);

      try {
        const res = await fetch(`/api/stores?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const stores = data.items || [];

        renderStores(grid, stores);
        setCount(data.total || 0);
        await renderMapMarkers(stores);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('[lojas]', err);
        grid.innerHTML = '<p class="stores-empty">Não foi possível carregar as lojas.</p>';
        setCount(0);
      }
    };

    const loadRegions = async () => {
      try {
        const res = await fetch('/api/stores/regions', { signal: controller.signal });
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
            loadStores();
          });
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('[lojas] regions:', err);
      }
    };

    const onSearch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      const value = searchInput.value.trim();
      clearBtn.hidden = !value;

      debounceTimer = setTimeout(() => {
        currentSearch = value;
        loadStores();
      }, 280);
    };

    const onClear = () => {
      searchInput.value = '';
      clearBtn.hidden = true;
      currentSearch = '';
      loadStores();
      searchInput.focus();
    };

    const onGridClick = (event) => {
      const btn = event.target.closest('[data-store-map]');
      if (!btn) return;
      const id = Number(btn.dataset.storeMap);
      if (Number.isFinite(id)) openStoreOnMap(id);
    };

    const onPopupClick = (event) => {
      const btn = event.target.closest('.store-popup-btn');
      if (!btn) return;
      const id = Number(btn.dataset.storeId);
      if (!Number.isFinite(id)) return;

      const card = document.querySelector(`.store-card[data-store-id="${id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('is-highlighted');
        window.setTimeout(() => card.classList.remove('is-highlighted'), 1800);
      }
    };

    searchInput.addEventListener('input', onSearch);
    clearBtn.addEventListener('click', onClear);
    grid.addEventListener('click', onGridClick);
    document.addEventListener('click', onPopupClick);

    await ensureMap();
    loadStores();
    loadRegions();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      controller.abort();

      stopHero();
      searchInput.removeEventListener('input', onSearch);
      clearBtn.removeEventListener('click', onClear);
      grid.removeEventListener('click', onGridClick);
      document.removeEventListener('click', onPopupClick);

      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
      markersLayer = null;
      storeMarkers = {};
    };
  },
};

function renderStores(container, stores) {
  if (!stores.length) {
    container.innerHTML = `
      <div class="section-empty">
        <span class="section-empty-icon icon">${ICONS.inbox}</span>
        <h3>Sem resultados</h3>
        <p>Tente ajustar os termos da pesquisa ou selecionar outra província.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = stores.map((s) => {
    const hasCoords = s.latitude != null && s.longitude != null;
    const mapsUrl = hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name}, ${s.address || s.region}, Angola`)}`;

    return `
      <article class="store-card" data-store-id="${s.id}">
        <header class="store-card-header">
          <span class="store-region-badge">
            <span class="store-region-dot"></span>
            ${escapeHtml(s.region)}
          </span>

          <h3>${escapeHtml(s.name)}</h3>

          ${s.address ? `
            <p class="store-card-address">
              <span class="icon">${ICONS.pin}</span>
              <span>${escapeHtml(s.address)}</span>
            </p>
          ` : ''}

          <div class="store-card-glow" aria-hidden="true"></div>
        </header>

        <div class="store-card-body">
          <ul class="store-details">
            ${s.opening_hours ? `
              <li>
                <span class="store-detail-icon">${ICONS.clock}</span>
                <div class="store-detail-text">
                  <span class="store-detail-label">Horário</span>
                  <span class="store-detail-value">${escapeHtml(s.opening_hours)}</span>
                </div>
              </li>
            ` : ''}

            ${s.phone ? `
              <li>
                <span class="store-detail-icon">${ICONS.phone}</span>
                <div class="store-detail-text">
                  <span class="store-detail-label">Telefone</span>
                  <a href="tel:${escapeAttr(s.phone.replace(/\s+/g, ''))}" class="store-detail-value">${escapeHtml(s.phone)}</a>
                </div>
              </li>
            ` : ''}

            ${s.email ? `
              <li>
                <span class="store-detail-icon">${ICONS.mail}</span>
                <div class="store-detail-text">
                  <span class="store-detail-label">Email</span>
                  <a href="mailto:${escapeAttr(s.email)}" class="store-detail-value">${escapeHtml(s.email)}</a>
                </div>
              </li>
            ` : ''}
          </ul>
        </div>

        <footer class="store-card-foot">
          ${hasCoords ? `
            <button type="button" class="store-map-btn" data-store-map="${s.id}">
              <span>Ver no mapa</span>
              <span class="icon">${ICONS.navigate}</span>
            </button>
          ` : `
            <a href="${mapsUrl}" target="_blank" rel="noopener" class="store-map-btn">
              <span>Ver no mapa</span>
              <span class="icon">${ICONS.navigate}</span>
            </a>
          `}
        </footer>
      </article>
    `;
  }).join('');
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
