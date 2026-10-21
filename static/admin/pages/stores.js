import {
  apiFetch, toast, openModal, closeModal, confirmDialog,
  escapeHtml, escapeAttr,
} from '../shared.js';

let current = [];
let regions = [];
let state = { search: '', region: '', status: 'all' };

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

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
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Falha ao carregar Leaflet'));
    document.head.appendChild(script);
  });
  return leafletLoader;
}

const ANGOLA_CENTER = [-11.2027, 17.8739];
const ANGOLA_ZOOM = 6;

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  navigate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9 14h.01"/><path d="M15 14h.01"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"/></svg>',
};

export default {
  title: 'Lojas',

  render() {
    return `
      <section class="stores-panel">
        <header class="stores-head">
          <div>
            <h2>Lojas</h2>
            <span class="admin-badge-note" id="stores-count">A carregar…</span>
          </div>
          <button type="button" class="admin-btn admin-btn-primary" id="stores-new-btn">
            ${ICONS.plus}
            Nova loja
          </button>
        </header>

        <div class="stores-toolbar">
          <div class="msg-search">
            <span class="msg-search-icon">${ICONS.search}</span>
            <input type="search" id="stores-search"
                   placeholder="Pesquisar por nome, província ou morada…"
                   autocomplete="off" />
            <button type="button" id="stores-search-clear" class="msg-search-clear" hidden aria-label="Limpar">
              ${ICONS.close}
            </button>
          </div>

          <div class="msg-date-filter">
            ${ICONS.pin}
            <select id="stores-region">
              <option value="">Todas as províncias</option>
            </select>
          </div>
        </div>

        <div class="msg-status-filters" id="stores-status-filters">
          <button type="button" class="msg-chip is-active" data-status="all">
            Todas <span class="msg-chip-count" data-count="all">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="active">
            Ativas <span class="msg-chip-count" data-count="active">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="inactive">
            Inativas <span class="msg-chip-count" data-count="inactive">0</span>
          </button>
        </div>

        <div class="stores-layout">
          <div class="stores-list-col" id="stores-body">
            <div class="admin-loading"><div class="admin-spinner"></div></div>
          </div>

          <aside class="stores-map-col">
            <div class="stores-map-card">
              <div class="stores-map-head">
                <div>
                  <strong>Mapa de Angola</strong>
                  <span>Clique num marcador para detalhes</span>
                </div>
                <span class="stores-map-legend">
                  <span class="stores-map-legend-dot"></span>
                  Loja
                </span>
              </div>
              <div id="stores-map" class="stores-map" role="img" aria-label="Mapa das lojas"></div>
            </div>
          </aside>
        </div>
      </section>
    `;
  },

  async mount() {
    const body = document.getElementById('stores-body');
    const count = document.getElementById('stores-count');
    const newBtn = document.getElementById('stores-new-btn');
    const searchInput = document.getElementById('stores-search');
    const searchClear = document.getElementById('stores-search-clear');
    const regionSelect = document.getElementById('stores-region');
    const statusFilters = document.getElementById('stores-status-filters');
    const mapEl = document.getElementById('stores-map');

    mapInstance = null;
    markersLayer = null;
    storeMarkers = {};

    let searchTimer = null;

    const load = async () => {
      try {
        const data = await apiFetch('/admin/api/stores');
        current = data.items || [];
        regions = data.regions || [];

        regionSelect.innerHTML = `<option value="">Todas as províncias</option>` +
          regions.map((r) => `<option value="${escapeAttr(r)}">${escapeHtml(r)}</option>`).join('');
        regionSelect.value = state.region;

        await ensureMap();
        render();
      } catch (e) {
        body.innerHTML = `
          <div class="admin-empty-state">
            <div class="admin-empty-icon">${ICONS.empty}</div>
            <p>${escapeHtml(e.message)}</p>
          </div>`;
      }
    };

    const applyFilters = () => {
      let items = [...current];

      if (state.status === 'active') items = items.filter((s) => s.is_active);
      else if (state.status === 'inactive') items = items.filter((s) => !s.is_active);

      if (state.region) items = items.filter((s) => s.region === state.region);

      if (state.search) {
        const q = state.search.toLowerCase();
        items = items.filter((s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.region || '').toLowerCase().includes(q) ||
          (s.address || '').toLowerCase().includes(q) ||
          (s.phone || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q)
        );
      }

      return items;
    };

    const render = () => {
      const counts = {
        all: current.length,
        active: current.filter((s) => s.is_active).length,
        inactive: current.filter((s) => !s.is_active).length,
      };
      document.querySelectorAll('#stores-status-filters .msg-chip-count').forEach((el) => {
        const key = el.dataset.count;
        el.textContent = String(counts[key] ?? 0);
        el.classList.toggle('is-zero', (counts[key] ?? 0) === 0);
      });

      const items = applyFilters();
      count.textContent = items.length === current.length
        ? `${current.length} loja(s)`
        : `${items.length} de ${current.length} loja(s)`;

      renderList(body, items);
      renderMapMarkers(items);
    };

    const onSearchInput = () => {
      if (searchTimer) clearTimeout(searchTimer);
      const value = searchInput.value;
      searchClear.hidden = !value;
      searchTimer = setTimeout(() => {
        state.search = value.trim();
        render();
      }, 200);
    };

    const onSearchClear = () => {
      searchInput.value = '';
      searchClear.hidden = true;
      state.search = '';
      render();
      searchInput.focus();
    };

    const onRegionChange = () => {
      state.region = regionSelect.value;
      render();
    };

    const onStatusFilter = (e) => {
      const btn = e.target.closest('[data-status]');
      if (!btn) return;
      state.status = btn.dataset.status;
      statusFilters.querySelectorAll('.msg-chip').forEach((b) =>
        b.classList.toggle('is-active', b === btn)
      );
      render();
    };

    const onAction = async (e) => {
      const openBtn = e.target.closest('[data-open]');
      if (openBtn) {
        const s = current.find((x) => x.id === Number(openBtn.dataset.open));
        if (s) openEdit(s, { onSaved: load, onFocusMap: focusOnMap });
        return;
      }

      const focusBtn = e.target.closest('[data-focus-map]');
      if (focusBtn) {
        e.stopPropagation();
        const id = Number(focusBtn.dataset.focusMap);
        const s = current.find((x) => x.id === id);
        if (s) focusOnMap(id);
        return;
      }

      const del = e.target.closest('[data-delete]');
      if (del) {
        e.stopPropagation();
        const id = Number(del.dataset.delete);
        const s = current.find((x) => x.id === id);
        if (!s) return;
        const ok = await confirmDialog({
          title: s.is_active ? 'Desativar loja' : 'Reativar loja',
          message: s.is_active
            ? `Desativar "${s.name}"? A loja deixa de aparecer no site.`
            : `Reativar "${s.name}"? A loja volta a aparecer no site.`,
          confirmLabel: s.is_active ? 'Desativar' : 'Reativar',
          danger: s.is_active,
        });
        if (!ok) return;
        try {
          await apiFetch(`/admin/api/stores/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_active: !s.is_active }),
          });
          toast(s.is_active ? 'Loja desativada' : 'Loja reativada');
          load();
        } catch (err) { toast(err.message, 'error'); }
      }
    };

    const onNew = () => openCreate({ onSaved: load });

    searchInput.addEventListener('input', onSearchInput);
    searchClear.addEventListener('click', onSearchClear);
    regionSelect.addEventListener('change', onRegionChange);
    statusFilters.addEventListener('click', onStatusFilter);
    body.addEventListener('click', onAction);
    newBtn.addEventListener('click', onNew);

    await load();

    return () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchInput.removeEventListener('input', onSearchInput);
      searchClear.removeEventListener('click', onSearchClear);
      regionSelect.removeEventListener('change', onRegionChange);
      statusFilters.removeEventListener('click', onStatusFilter);
      body.removeEventListener('click', onAction);
      newBtn.removeEventListener('click', onNew);

      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
      markersLayer = null;
      storeMarkers = {};
    };
  },
};


async function ensureMap() {
  const mapEl = document.getElementById('stores-map');
  if (!mapEl || mapInstance) return mapInstance;

  try {
    const L = await loadLeaflet();

    mapInstance = L.map(mapEl, {
      center: ANGOLA_CENTER,
      zoom: ANGOLA_ZOOM,
      minZoom: 5,
      maxZoom: 18,
      scrollWheelZoom: false,
      zoomControl: true,
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
    console.error('[stores-map]', err);
    if (mapEl) {
      mapEl.innerHTML = '<p class="stores-map-error">Não foi possível carregar o mapa.</p>';
    }
    return null;
  }
}

function renderMapMarkers(stores) {
  const L = window.L;
  if (!L || !markersLayer) return;

  markersLayer.clearLayers();
  storeMarkers = {};

  const bounds = [];

  stores.forEach((s) => {
    if (s.latitude == null || s.longitude == null) return;

    const icon = L.divIcon({
      className: 'store-marker',
      html: `<span class="store-marker-pin ${!s.is_active ? 'is-inactive' : ''}">${ICONS.mapPin}</span>`,
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
        ${!s.is_active ? `<span class="store-popup-inactive">Inativa</span>` : ''}
        <button type="button" class="store-popup-btn" data-popup-open="${s.id}">
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
  });

  if (bounds.length === 1) {
    mapInstance.setView(bounds[0], 12);
  } else if (bounds.length > 1) {
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  } else {
    mapInstance.setView(ANGOLA_CENTER, ANGOLA_ZOOM);
  }
}

function focusOnMap(storeId) {
  const marker = storeMarkers[storeId];
  if (!marker || !mapInstance) return;

  const latlng = marker.getLatLng();
  mapInstance.flyTo(latlng, Math.max(mapInstance.getZoom(), 13), { duration: 0.8 });
  setTimeout(() => marker.openPopup(), 850);

  const card = document.querySelector(`.store-card[data-store-id="${storeId}"]`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('is-highlighted');
    setTimeout(() => card.classList.remove('is-highlighted'), 1800);
  }
}


function renderList(container, items) {
  if (!items.length) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <div class="admin-empty-icon">${ICONS.empty}</div>
        <p>Nenhuma loja encontrada.</p>
        <small>Ajuste os filtros ou a pesquisa.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="store-grid">
      ${items.map((s) => {
        const hasCoords = s.latitude != null && s.longitude != null;
        return `
          <article class="store-card ${!s.is_active ? 'is-inactive' : ''}" data-store-id="${s.id}">
            <header class="store-card-head">
              <div class="store-card-head-top">
                <span class="store-region-badge">
                  <span class="store-region-dot"></span>
                  ${escapeHtml(s.region)}
                </span>
                ${s.is_active
                  ? '<span class="admin-pill admin-pill-green">Ativa</span>'
                  : '<span class="admin-pill admin-pill-muted">Inativa</span>'}
              </div>
              <h3>${escapeHtml(s.name)}</h3>
              ${s.address ? `<p class="store-card-address">${ICONS.pin}${escapeHtml(s.address)}</p>` : ''}
            </header>

            <div class="store-card-body">
              ${s.phone ? `
                <div class="store-detail-row">
                  <span class="store-detail-icon">${ICONS.phone}</span>
                  <a href="tel:${escapeAttr(s.phone.replace(/\s+/g, ''))}">${escapeHtml(s.phone)}</a>
                </div>
              ` : ''}
              ${s.email ? `
                <div class="store-detail-row">
                  <span class="store-detail-icon">${ICONS.mail}</span>
                  <a href="mailto:${escapeAttr(s.email)}">${escapeHtml(s.email)}</a>
                </div>
              ` : ''}
              ${s.opening_hours ? `
                <div class="store-detail-row">
                  <span class="store-detail-icon">${ICONS.clock}</span>
                  <span>${escapeHtml(s.opening_hours)}</span>
                </div>
              ` : ''}
            </div>

            <footer class="store-card-foot">
              ${hasCoords ? `
                <button type="button" class="store-card-btn" data-focus-map="${s.id}" title="Ver no mapa">
                  ${ICONS.navigate}
                  <span>Mapa</span>
                </button>
              ` : '<span></span>'}
              <div class="store-card-actions">
                <button class="admin-icon-btn" title="Editar" data-open="${s.id}">
                  ${ICONS.edit}
                </button>
                <button class="admin-icon-btn admin-icon-btn-danger"
                        title="${s.is_active ? 'Desativar' : 'Reativar'}"
                        data-delete="${s.id}">
                  ${s.is_active ? ICONS.trash : ICONS.plus}
                </button>
              </div>
            </footer>
          </article>
        `;
      }).join('')}
    </div>
  `;
}


function openCreate({ onSaved }) {
  openStoreForm({
    isNew: true,
    store: {
      name: '', region: '', address: '', phone: '', email: '',
      opening_hours: '', latitude: null, longitude: null, is_active: true,
    },
    onSaved,
  });
}


function openEdit(s, { onSaved, onFocusMap }) {
  openStoreForm({ isNew: false, store: s, onSaved });
}

function openStoreForm({ isNew, store, onSaved }) {
  const s = store;

  openModal({
    title: isNew ? 'Nova loja' : `Editar — ${s.name}`,
    bodyHtml: `
      <form id="store-form" class="admin-form">
        <div class="admin-form-row">
          <div class="admin-field">
            <label>Nome *</label>
            <input name="name" value="${escapeAttr(s.name)}" required maxlength="120"
                   placeholder="Ex: Kero Belas">
          </div>
          <div class="admin-field">
            <label>Província *</label>
            <input name="region" value="${escapeAttr(s.region)}" required maxlength="80"
                   placeholder="Ex: Luanda">
          </div>
        </div>

        <div class="admin-field">
          <label>Morada</label>
          <input name="address" value="${escapeAttr(s.address || '')}" maxlength="255"
                 placeholder="Ex: Rua das Amoreiras, Belas">
        </div>

        <div class="admin-form-row">
          <div class="admin-field">
            <label>Telefone</label>
            <input name="phone" value="${escapeAttr(s.phone || '')}" maxlength="40"
                   placeholder="+244 9XX XXX XXX">
          </div>
          <div class="admin-field">
            <label>Email</label>
            <input type="email" name="email" value="${escapeAttr(s.email || '')}"
                   placeholder="loja@kero.co.ao">
          </div>
        </div>

        <div class="admin-field">
          <label>Horário</label>
          <input name="opening_hours" value="${escapeAttr(s.opening_hours || '')}" maxlength="160"
                 placeholder="Ex: Seg–Sáb: 08h–21h">
        </div>

        <div class="admin-field">
          <label>Localização no mapa</label>
          <p class="admin-field-hint">
            Clique no mapa para definir as coordenadas, ou arraste o marcador.
          </p>
          <div id="store-form-map" class="store-form-map"></div>
          <div class="store-form-coords">
            <div class="admin-field">
              <label>Latitude</label>
              <input name="latitude" type="number" step="any" min="-90" max="90"
                     value="${s.latitude != null ? s.latitude : ''}">
            </div>
            <div class="admin-field">
              <label>Longitude</label>
              <input name="longitude" type="number" step="any" min="-180" max="180"
                     value="${s.longitude != null ? s.longitude : ''}">
            </div>
          </div>
        </div>

        <label class="admin-checkbox">
          <input type="checkbox" name="is_active" ${s.is_active ? 'checked' : ''}>
          Loja ativa (aparece no site)
        </label>
      </form>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>
        ${isNew ? 'Criar loja' : 'Guardar alterações'}
      </button>
    `,
  });

  const form = document.getElementById('store-form');

  initFormMap(form, s);

  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const fd = new FormData(form);
    const latStr = (fd.get('latitude') || '').toString().trim();
    const lngStr = (fd.get('longitude') || '').toString().trim();

    const payload = {
      name: fd.get('name').trim(),
      region: fd.get('region').trim(),
      address: (fd.get('address') || '').trim() || null,
      phone: (fd.get('phone') || '').trim() || null,
      email: (fd.get('email') || '').trim() || null,
      opening_hours: (fd.get('opening_hours') || '').trim() || null,
      latitude: latStr ? Number(latStr) : null,
      longitude: lngStr ? Number(lngStr) : null,
      is_active: fd.get('is_active') === 'on',
    };

    saveBtn.disabled = true;
    const originalHtml = saveBtn.innerHTML;
    saveBtn.textContent = 'A guardar…';

    try {
      if (isNew) {
        await apiFetch('/admin/api/stores', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast('Loja criada');
      } else {
        await apiFetch(`/admin/api/stores/${s.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast('Loja atualizada');
      }
      closeModal();
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHtml;
    }
  };

  saveBtn.addEventListener('click', onSave);
}

async function initFormMap(form, store) {
  const el = form.querySelector('#store-form-map');
  const latInput = form.querySelector('input[name="latitude"]');
  const lngInput = form.querySelector('input[name="longitude"]');
  if (!el) return;

  try {
    const L = await loadLeaflet();

    const hasCoords = store.latitude != null && store.longitude != null;
    const initial = hasCoords ? [store.latitude, store.longitude] : ANGOLA_CENTER;
    const initialZoom = hasCoords ? 14 : ANGOLA_ZOOM;

    const miniMap = L.map(el, {
      center: initial,
      zoom: initialZoom,
      minZoom: 5,
      maxZoom: 18,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(miniMap);

    const icon = L.divIcon({
      className: 'store-marker',
      html: `<span class="store-marker-pin">${ICONS.mapPin}</span>`,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
    });

    let marker = null;
    if (hasCoords) {
      marker = L.marker(initial, { icon, draggable: true }).addTo(miniMap);
    }

    const setCoords = (lat, lng) => {
      latInput.value = lat.toFixed(6);
      lngInput.value = lng.toFixed(6);
    };

    const onMapClick = (e) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { icon, draggable: true }).addTo(miniMap);
        marker.on('dragend', () => {
          const p = marker.getLatLng();
          setCoords(p.lat, p.lng);
        });
      }
      setCoords(lat, lng);
    };

    miniMap.on('click', onMapClick);

    if (marker) {
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        setCoords(p.lat, p.lng);
      });
    }

    const syncFromInputs = () => {
      const lat = parseFloat(latInput.value);
      const lng = parseFloat(lngInput.value);
      if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        miniMap.setView([lat, lng], Math.max(miniMap.getZoom(), 12));
        if (marker) marker.setLatLng([lat, lng]);
        else {
          marker = L.marker([lat, lng], { icon, draggable: true }).addTo(miniMap);
        }
      }
    };

    latInput.addEventListener('change', syncFromInputs);
    lngInput.addEventListener('change', syncFromInputs);

    form._miniMap = miniMap;
  } catch (err) {
    console.error('[store-form-map]', err);
    el.innerHTML = '<p class="stores-map-error">Mapa indisponível</p>';
  }
}
