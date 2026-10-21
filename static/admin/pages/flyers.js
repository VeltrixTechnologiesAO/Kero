import {
  apiFetch, toast, openModal, closeModal,
  secureConfirmDialog,
  escapeHtml, escapeAttr, fmtDate,
} from '../shared.js';

let current = [];
let stores = [];
let state = { search: '', region: 'all', status: 'all', storeId: 'all' };

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  pages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
  arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>',
};

export default {
  title: 'Folhetos',

  render() {
    return `
      <section class="admin-panel flyers-panel">
        <header class="admin-panel-head">
          <div class="flyers-head-left">
            <h2>Folhetos e revistas</h2>
            <span class="admin-badge-note" id="flyers-count">A carregar…</span>
          </div>
          <button type="button" class="admin-btn admin-btn-primary" id="flyers-new-btn">
            ${ICONS.plus}
            Novo folheto
          </button>
        </header>

        <div class="msg-toolbar">
          <div class="msg-search">
            <span class="msg-search-icon">${ICONS.search}</span>
            <input type="search" id="flyers-search"
                   placeholder="Pesquisar por título, loja ou província…"
                   autocomplete="off" spellcheck="false" />
            <button type="button" id="flyers-search-clear" class="msg-search-clear" hidden aria-label="Limpar">
              ${ICONS.close}
            </button>
            <kbd class="msg-search-kbd">/</kbd>
          </div>

          <div class="flyers-toolbar-actions">
            <div class="msg-date-filter">
              ${ICONS.pin}
              <select id="flyers-region">
                <option value="all">Todas as províncias</option>
              </select>
            </div>

            <div class="msg-date-filter">
              ${ICONS.news}
              <select id="flyers-store">
                <option value="all">Todas as lojas</option>
              </select>
            </div>
          </div>
        </div>

        <div class="msg-status-filters" id="flyers-status-filters">
          <button type="button" class="msg-chip is-active" data-status="all">
            Todos <span class="msg-chip-count" data-count="all">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="active">
            Ativos <span class="msg-chip-count" data-count="active">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="expired">
            Expirados <span class="msg-chip-count" data-count="expired">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="draft">
            Rascunhos <span class="msg-chip-count" data-count="draft">0</span>
          </button>
        </div>

        <div id="flyers-body" class="flyers-body">
          <div class="admin-loading"><div class="admin-spinner"></div></div>
        </div>
      </section>
    `;
  },

  async mount() {
    const body = document.getElementById('flyers-body');
    const count = document.getElementById('flyers-count');
    const newBtn = document.getElementById('flyers-new-btn');
    const searchInput = document.getElementById('flyers-search');
    const searchClear = document.getElementById('flyers-search-clear');
    const regionSelect = document.getElementById('flyers-region');
    const storeSelect = document.getElementById('flyers-store');
    const statusFilters = document.getElementById('flyers-status-filters');

    let searchTimer = null;

    state = { search: '', region: 'all', status: 'all', storeId: 'all' };
    searchInput.value = '';
    searchClear.hidden = true;

    const load = async () => {
      try {
        const [flyersData, storesData] = await Promise.all([
          apiFetch('/admin/api/flyers'),
          apiFetch('/admin/api/stores'),
        ]);
        current = flyersData.items || [];
        stores = storesData.items || [];

        const regions = Array.from(new Set(stores.map((s) => s.region).filter(Boolean))).sort();
        regionSelect.innerHTML = `<option value="all">Todas as províncias</option>` +
          regions.map((r) => `<option value="${escapeAttr(r)}">${escapeHtml(r)}</option>`).join('');

        const activeStores = stores.filter((s) => s.is_active);
        storeSelect.innerHTML = `<option value="all">Todas as lojas</option>` +
          activeStores.map((s) => `<option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.region)}</option>`).join('');

        regionSelect.value = state.region;
        storeSelect.value = state.storeId;

        render();
      } catch (e) {
        body.innerHTML = `
          <div class="admin-empty-state">
            <div class="admin-empty-icon">${ICONS.news}</div>
            <p>${escapeHtml(e.message)}</p>
          </div>`;
      }
    };

    const applyFilters = () => {
      let items = [...current];

      if (state.status === 'active') items = items.filter((f) => f.is_published && f.is_active);
      else if (state.status === 'expired') items = items.filter((f) => f.is_published && !f.is_active);
      else if (state.status === 'draft') items = items.filter((f) => !f.is_published);

      if (state.region !== 'all') items = items.filter((f) => f.store_region === state.region);

      if (state.storeId !== 'all') {
        const targetStore = stores.find((s) => String(s.id) === String(state.storeId));
        if (targetStore) items = items.filter((f) => f.store_name === targetStore.name);
      }

      if (state.search) {
        const q = state.search.toLowerCase();
        items = items.filter((f) =>
          (f.title || '').toLowerCase().includes(q) ||
          (f.store_name || '').toLowerCase().includes(q) ||
          (f.store_region || '').toLowerCase().includes(q) ||
          (f.description || '').toLowerCase().includes(q)
        );
      }

      return items;
    };

    const render = () => {
      const counts = {
        all: current.length,
        active: current.filter((f) => f.is_published && f.is_active).length,
        expired: current.filter((f) => f.is_published && !f.is_active).length,
        draft: current.filter((f) => !f.is_published).length,
      };

      document.querySelectorAll('#flyers-status-filters .msg-chip-count').forEach((el) => {
        const key = el.dataset.count;
        el.textContent = String(counts[key] ?? 0);
        el.classList.toggle('is-zero', (counts[key] ?? 0) === 0);
      });

      const items = applyFilters();
      count.textContent = items.length === current.length
        ? `${current.length} folheto(s)`
        : `${items.length} de ${current.length} folheto(s)`;

      renderList(body, items);
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

    const onStoreChange = () => {
      state.storeId = storeSelect.value;
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

    const onNew = () => openCreate(stores, load);

    const confirmDelete = async (f) => {
      const detailsHtml = `
        <div class="detail-row">
          <span class="detail-label">Título</span>
          <span class="detail-value">${escapeHtml(f.title)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Loja</span>
          <span class="detail-value">${escapeHtml(f.store_name)} — ${escapeHtml(f.store_region)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Válido</span>
          <span class="detail-value">${fmtDate(f.valid_from)} — ${fmtDate(f.valid_until)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Páginas</span>
          <span class="detail-value">${f.page_count} página${f.page_count === 1 ? '' : 's'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tamanho total</span>
          <span class="detail-value">${(f.total_image_size / 1024).toFixed(1)} KB</span>
        </div>
      `;

      const ok = await secureConfirmDialog({
        title: 'Eliminar folheto',
        message: 'Esta ação é permanente. Todas as páginas serão eliminadas da base de dados.',
        detailsHtml,
        confirmWord: 'ELIMINAR',
        confirmLabel: 'Eliminar definitivamente',
        danger: true,
      });
      if (!ok) return false;

      try {
        await apiFetch(`/admin/api/flyers/${f.id}`, { method: 'DELETE' });
        current = current.filter((x) => x.id !== f.id);
        render();
        toast('Folheto eliminado');
        return true;
      } catch (err) {
        toast(err.message, 'error');
        return false;
      }
    };

    const onAction = async (e) => {
      const del = e.target.closest('[data-delete]');
      if (del) {
        e.stopPropagation();
        const id = Number(del.dataset.delete);
        const f = current.find((x) => x.id === id);
        if (f) await confirmDelete(f);
        return;
      }

      const editBtn = e.target.closest('[data-edit]');
      if (editBtn) {
        e.stopPropagation();
        const f = current.find((x) => x.id === Number(editBtn.dataset.edit));
        if (f) openEdit(f, load);
        return;
      }

      const openBtn = e.target.closest('[data-open]');
      if (openBtn) {
        const f = current.find((x) => x.id === Number(openBtn.dataset.open));
        if (f) openDetail(f, { onSaved: load, confirmDelete, onReload: load });
      }
    };

    const onKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        const tag = (document.activeElement?.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
          searchInput.focus();
        }
      }
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        if (searchInput.value) onSearchClear();
        else searchInput.blur();
      }
    };

    searchInput.addEventListener('input', onSearchInput);
    searchClear.addEventListener('click', onSearchClear);
    regionSelect.addEventListener('change', onRegionChange);
    storeSelect.addEventListener('change', onStoreChange);
    statusFilters.addEventListener('click', onStatusFilter);
    body.addEventListener('click', onAction);
    newBtn.addEventListener('click', onNew);
    document.addEventListener('keydown', onKeyDown);

    await load();

    return () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchInput.removeEventListener('input', onSearchInput);
      searchClear.removeEventListener('click', onSearchClear);
      regionSelect.removeEventListener('change', onRegionChange);
      storeSelect.removeEventListener('change', onStoreChange);
      statusFilters.removeEventListener('click', onStatusFilter);
      body.removeEventListener('click', onAction);
      newBtn.removeEventListener('click', onNew);
      document.removeEventListener('keydown', onKeyDown);
    };
  },
};

function renderList(container, items) {
  if (!items.length) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <div class="admin-empty-icon">${ICONS.news}</div>
        <p>Nenhum folheto encontrado.</p>
        <small>Ajuste os filtros ou crie um novo folheto.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="flyer-admin-grid">
      ${items.map((f) => {
        const status = !f.is_published
          ? { label: 'Rascunho', cls: 'admin-pill-muted' }
          : f.is_active
            ? { label: 'Ativo', cls: 'admin-pill-green' }
            : { label: 'Expirado', cls: 'admin-pill-muted' };

        const cover = f.cover_thumbnail_url || '';

        return `
          <article class="flyer-admin-card" data-open="${f.id}">
            <div class="flyer-admin-media">
              <img src="${escapeAttr(cover)}" alt="" loading="lazy">
              <span class="admin-pill ${status.cls} flyer-admin-status">${status.label}</span>
              ${f.page_count > 1 ? `
                <span class="flyer-admin-pages-pill">
                  ${ICONS.pages}
                  ${f.page_count}
                </span>
              ` : ''}
            </div>

            <div class="flyer-admin-body">
              <div class="flyer-admin-region">
                ${ICONS.pin}
                ${escapeHtml(f.store_region)}
              </div>
              <h3>${escapeHtml(f.title)}</h3>
              <span class="flyer-admin-store">${escapeHtml(f.store_name)}</span>

              <div class="flyer-admin-dates">
                ${ICONS.calendar}
                <span>${fmtDate(f.valid_from)} — ${fmtDate(f.valid_until)}</span>
              </div>

              <div class="flyer-admin-pages-badge">
                ${ICONS.pages}
                ${f.page_count} página${f.page_count === 1 ? '' : 's'}
              </div>
            </div>

            <footer class="flyer-admin-foot">
              <button type="button" class="admin-icon-btn" title="Ver páginas" data-open="${f.id}">
                ${ICONS.eye}
              </button>
              <button type="button" class="admin-icon-btn" title="Editar dados" data-edit="${f.id}">
                ${ICONS.edit}
              </button>
              <button type="button" class="admin-icon-btn admin-icon-btn-danger" title="Eliminar" data-delete="${f.id}">
                ${ICONS.trash}
              </button>
            </footer>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function openDetail(f, { onSaved, confirmDelete, onReload }) {
  const status = !f.is_published
    ? { label: 'Rascunho', cls: 'admin-pill-muted' }
    : f.is_active
      ? { label: 'Ativo', cls: 'admin-pill-green' }
      : { label: 'Expirado', cls: 'admin-pill-muted' };

  const days = daysRemaining(f.valid_until);
  const daysLabel = !f.is_active
    ? 'Já expirou'
    : days === 0 ? 'Termina hoje'
    : days === 1 ? 'Termina amanhã'
    : `Faltam ${days} dias`;

  const pages = f.pages || [];
  const totalPages = pages.length;

  openModal({
    title: escapeHtml(f.title),
    bodyHtml: `
      <div class="flyer-pages-viewer" id="flyer-pages-viewer">
        <button type="button" class="flyer-nav flyer-nav-prev" data-nav="-1" aria-label="Página anterior">
          ${ICONS.chevronLeft}
        </button>

        <div class="flyer-page-stage">
          ${pages.map((p, i) => `
            <img class="flyer-page-img ${i === 0 ? 'is-active' : ''}"
                 data-page="${i}"
                 src="${escapeAttr(p.image_url)}"
                 alt="Página ${p.page_number}"
                 loading="${i === 0 ? 'eager' : 'lazy'}">
          `).join('')}

          <div class="flyer-page-counter" id="flyer-page-counter">
            <span id="flyer-page-counter-current">1</span> / ${totalPages}
          </div>

          <button type="button" class="flyer-page-delete" data-delete-page
                  title="Eliminar esta página" ${totalPages <= 1 ? 'hidden' : ''}>
            ${ICONS.trash}
            Eliminar página
          </button>
        </div>

        <button type="button" class="flyer-nav flyer-nav-next" data-nav="1" aria-label="Página seguinte">
          ${ICONS.chevronRight}
        </button>
      </div>

      <div class="flyer-pages-thumbs" id="flyer-pages-thumbs">
        ${pages.map((p, i) => `
          <button type="button" class="flyer-thumb ${i === 0 ? 'is-active' : ''}" data-thumb="${i}">
            <img src="${escapeAttr(p.thumbnail_url)}" alt="">
            <span>${p.page_number}</span>
          </button>
        `).join('')}

        <label class="flyer-thumb flyer-thumb-add" title="Adicionar página">
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden id="flyer-add-page-input">
          <span class="flyer-thumb-add-icon">${ICONS.upload}</span>
          <span>Adicionar</span>
        </label>
      </div>

      <dl class="admin-detail-grid">
        <div>
          <dt><span class="icon">${ICONS.news}</span> Loja</dt>
          <dd>${escapeHtml(f.store_name)}</dd>
        </div>
        <div>
          <dt><span class="icon">${ICONS.pin}</span> Província</dt>
          <dd>${escapeHtml(f.store_region)}</dd>
        </div>
        <div>
          <dt><span class="icon">${ICONS.calendar}</span> Válido desde</dt>
          <dd>${fmtDate(f.valid_from)}</dd>
        </div>
        <div>
          <dt><span class="icon">${ICONS.calendar}</span> Válido até</dt>
          <dd>${fmtDate(f.valid_until)}</dd>
        </div>
        <div>
          <dt><span class="icon">${ICONS.clock}</span> Estado temporal</dt>
          <dd><span class="flyer-days-badge ${!f.is_active ? 'is-expired' : days <= 2 ? 'is-urgent' : ''}">${daysLabel}</span></dd>
        </div>
        <div>
          <dt><span class="icon">${ICONS.download}</span> Tamanho total</dt>
          <dd>${(f.total_image_size / 1024).toFixed(1)} KB</dd>
        </div>
      </dl>

      ${f.description ? `
        <h4 class="admin-message-section-title">Descrição</h4>
        <div class="admin-message-body">${escapeHtml(f.description).replace(/\n/g, '<br>')}</div>
      ` : ''}
    `,
    footerHtml: `
      <button type="button" class="admin-btn admin-btn-danger" data-delete-modal>
        Eliminar folheto
      </button>
      <button type="button" class="admin-btn" data-close>Fechar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-edit-modal>Editar dados</button>
    `,
  });

  const footer = document.querySelector('#admin-modal-foot');
  const viewer = document.getElementById('flyer-pages-viewer');
  const thumbs = document.getElementById('flyer-pages-thumbs');
  const counterCurrent = document.getElementById('flyer-page-counter-current');
  const deletePageBtn = viewer.querySelector('[data-delete-page]');

  let currentIndex = 0;

  const setActive = (i) => {
    currentIndex = Math.max(0, Math.min(totalPages - 1, i));
    viewer.querySelectorAll('.flyer-page-img').forEach((img) => {
      img.classList.toggle('is-active', Number(img.dataset.page) === currentIndex);
    });
    thumbs.querySelectorAll('.flyer-thumb[data-thumb]').forEach((t) => {
      t.classList.toggle('is-active', Number(t.dataset.thumb) === currentIndex);
    });
    if (counterCurrent) counterCurrent.textContent = String(currentIndex + 1);
  };

  viewer.querySelector('[data-nav="-1"]')?.addEventListener('click', () => setActive(currentIndex - 1));
  viewer.querySelector('[data-nav="1"]')?.addEventListener('click', () => setActive(currentIndex + 1));

  thumbs.addEventListener('click', (e) => {
    const t = e.target.closest('[data-thumb]');
    if (t) setActive(Number(t.dataset.thumb));
  });

  const keyHandler = (ev) => {
    if (document.querySelector('#admin-modal-root')?.hidden !== false) return;
    const activeTag = (document.activeElement?.tagName || '').toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea') return;

    if (ev.key === 'ArrowLeft') setActive(currentIndex - 1);
    if (ev.key === 'ArrowRight') setActive(currentIndex + 1);
  };
  document.addEventListener('keydown', keyHandler);

  deletePageBtn?.addEventListener('click', async () => {
    const p = pages[currentIndex];
    if (!p) return;

    const ok = await secureConfirmDialog({
      title: 'Eliminar página',
      message: `Eliminar a página ${p.page_number}? As restantes serão renumeradas.`,
      confirmWord: 'ELIMINAR',
      confirmLabel: 'Eliminar página',
      danger: true,
    });
    if (!ok) return;

    try {
      await apiFetch(`/admin/api/flyers/${f.id}/pages/${p.page_number}`, { method: 'DELETE' });
      toast('Página eliminada');
      document.removeEventListener('keydown', keyHandler);
      closeModal();
      onReload();
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  const addInput = document.getElementById('flyer-add-page-input');
  addInput?.addEventListener('change', async () => {
    const file = addInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Ficheiro tem de ser uma imagem', 'error');
      addInput.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Imagem maior que 10 MB', 'error');
      addInput.value = '';
      return;
    }

    try {
      const fd = new FormData();
      fd.append('image', file, file.name);
      await apiFetch(`/admin/api/flyers/${f.id}/pages`, { method: 'POST', body: fd });
      toast('Página adicionada');
      document.removeEventListener('keydown', keyHandler);
      closeModal();
      onReload();
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  footer.querySelector('[data-delete-modal]')?.addEventListener('click', () => {
    document.removeEventListener('keydown', keyHandler);
    closeModal();
    setTimeout(() => confirmDelete(f), 150);
  });

  footer.querySelector('[data-edit-modal]')?.addEventListener('click', () => {
    document.removeEventListener('keydown', keyHandler);
    closeModal();
    setTimeout(() => openEdit(f, onSaved), 100);
  });
}

function daysRemaining(isoUntil) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const until = new Date(isoUntil + 'T00:00:00');
  return Math.max(0, Math.round((until - today) / (1000 * 60 * 60 * 24)));
}

function openCreate(stores, onSaved) {
  const activeStores = stores.filter((s) => s.is_active);

  if (!activeStores.length) {
    toast('Não há lojas ativas para associar', 'error');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  openModal({
    title: 'Novo folheto',
    bodyHtml: `
      <form id="create-flyer" class="admin-form" enctype="multipart/form-data">
        <div class="admin-field">
          <label for="f-store">Loja *</label>
          <select id="f-store" name="store_id" required>
            <option value="">Selecione a loja…</option>
            ${activeStores.map((s) => `
              <option value="${s.id}">${escapeHtml(s.name)} — ${escapeHtml(s.region)}</option>
            `).join('')}
          </select>
        </div>

        <div class="admin-field">
          <label for="f-title">Título *</label>
          <input id="f-title" name="title" required maxlength="160"
                 placeholder="Ex: Revista semanal — Outubro">
        </div>

        <div class="admin-field">
          <label for="f-description">Descrição</label>
          <textarea id="f-description" name="description" rows="3" maxlength="2000"
                    placeholder="Breve descrição (opcional)"></textarea>
        </div>

        <div class="admin-form-row">
          <div class="admin-field">
            <label for="f-valid-from">Válido desde *</label>
            <input id="f-valid-from" type="date" name="valid_from" required value="${today}">
          </div>
          <div class="admin-field">
            <label for="f-valid-until">Válido até *</label>
            <input id="f-valid-until" type="date" name="valid_until" required value="${today}">
          </div>
        </div>

        <div class="admin-field">
          <label>Páginas da revista *</label>
          <p class="admin-field-hint">
            A primeira imagem será a capa. Pode adicionar mais páginas depois de criar.
          </p>
          <label for="f-pages" class="admin-upload-zone">
            <span class="admin-upload-icon">${ICONS.upload}</span>
            <span class="admin-upload-text">
              <strong>Clique para escolher ficheiros</strong>
              <span>JPG, PNG ou WEBP · máx. 10 MB por página</span>
            </span>
            <input id="f-pages" type="file" name="images"
               accept="image/jpeg,image/png,image/webp"
               multiple hidden>
          </label>
          <div id="f-pages-list" class="flyer-pages-edit" hidden></div>
        </div>

        <label class="admin-checkbox">
          <input type="checkbox" name="is_published" checked>
          Publicar imediatamente
        </label>
      </form>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Criar folheto</button>
    `,
  });

  const form = document.getElementById('create-flyer');
  const fileInput = form.querySelector('#f-pages');
  const listEl = form.querySelector('#f-pages-list');

  const filesState = [];

  const renderPages = () => {
    if (!filesState.length) {
      listEl.hidden = true;
      listEl.innerHTML = '';
      return;
    }
    listEl.hidden = false;
    listEl.innerHTML = filesState.map((f, i) => `
      <div class="flyer-page-item">
        <span class="flyer-page-badge">${i + 1}</span>
        <img src="${f.preview}" alt="">
        <div class="flyer-page-info">
          <strong>${escapeHtml(f.file.name)}</strong>
          <span>${(f.file.size / 1024).toFixed(1)} KB</span>
        </div>
        <div class="flyer-page-actions">
          <button type="button" class="admin-icon-btn" data-up="${i}" title="Mover para cima" ${i === 0 ? 'disabled' : ''}>
            ${ICONS.arrowUp}
          </button>
          <button type="button" class="admin-icon-btn" data-down="${i}" title="Mover para baixo" ${i === filesState.length - 1 ? 'disabled' : ''}>
            ${ICONS.arrowDown}
          </button>
          <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-remove="${i}" title="Remover">
            ${ICONS.close}
          </button>
        </div>
      </div>
    `).join('');
  };

  const readFile = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve({ file, preview: ev.target.result });
    reader.readAsDataURL(file);
  });

  fileInput.addEventListener('change', async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) return;

    if (filesState.length + files.length > 50) {
      toast('Máximo de 50 páginas', 'error');
      fileInput.value = '';
      return;
    }

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        toast(`${f.name} não é uma imagem válida`, 'error');
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast(`${f.name} é maior que 10 MB`, 'error');
        continue;
      }
      filesState.push(await readFile(f));
    }
    fileInput.value = '';
    renderPages();
  });

  listEl.addEventListener('click', (e) => {
    const up = e.target.closest('[data-up]');
    if (up) {
      const i = Number(up.dataset.up);
      if (i > 0) {
        [filesState[i - 1], filesState[i]] = [filesState[i], filesState[i - 1]];
        renderPages();
      }
      return;
    }
    const down = e.target.closest('[data-down]');
    if (down) {
      const i = Number(down.dataset.down);
      if (i < filesState.length - 1) {
        [filesState[i + 1], filesState[i]] = [filesState[i], filesState[i + 1]];
        renderPages();
      }
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      filesState.splice(Number(rm.dataset.remove), 1);
      renderPages();
    }
  });

  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const storeId = Number(form.store_id.value);
    if (!storeId) {
      toast('Selecione uma loja', 'error');
      return;
    }

    const validFrom = form.valid_from.value;
    const validUntil = form.valid_until.value;
    if (validUntil < validFrom) {
      toast('A data final não pode ser anterior à inicial', 'error');
      return;
    }

    if (!filesState.length) {
      toast('Adicione pelo menos uma página', 'error');
      return;
    }

    saveBtn.disabled = true;
    const originalHtml = saveBtn.innerHTML;
    saveBtn.textContent = 'A criar…';

    try {
      const fd = new FormData();
      fd.append('store_id', String(storeId));
      fd.append('title', form.title.value.trim());
      fd.append('description', (form.description.value || '').trim());
      fd.append('valid_from', validFrom);
      fd.append('valid_until', validUntil);
      fd.append('is_published', form.is_published.checked ? 'true' : 'false');
      filesState.forEach((f) => fd.append('images', f.file, f.file.name));

      await apiFetch('/admin/api/flyers', { method: 'POST', body: fd });

      toast('Folheto criado');
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

function openEdit(f, onSaved) {
  openModal({
    title: `Editar — ${f.title}`,
    bodyHtml: `
      <form id="edit-flyer" class="admin-form">
        <div class="admin-field">
          <label>Loja</label>
          <input value="${escapeAttr(f.store_name)} — ${escapeAttr(f.store_region)}" disabled>
          <small class="admin-field-hint">A loja não pode ser alterada após criação.</small>
        </div>

        <div class="admin-field">
          <label for="ef-title">Título *</label>
          <input id="ef-title" name="title" value="${escapeAttr(f.title)}" required maxlength="160">
        </div>

        <div class="admin-field">
          <label for="ef-description">Descrição</label>
          <textarea id="ef-description" name="description" rows="3">${escapeHtml(f.description || '')}</textarea>
        </div>

        <div class="admin-form-row">
          <div class="admin-field">
            <label>Válido desde</label>
            <input type="date" name="valid_from" value="${escapeAttr(f.valid_from)}">
          </div>
          <div class="admin-field">
            <label>Válido até</label>
            <input type="date" name="valid_until" value="${escapeAttr(f.valid_until)}">
          </div>
        </div>

        <label class="admin-checkbox">
          <input type="checkbox" name="is_published" ${f.is_published ? 'checked' : ''}>
          Publicado
        </label>
      </form>

      <h4 class="admin-message-section-title">Páginas (${f.page_count})</h4>
      <p class="admin-field-hint">
        Para gerir as páginas, feche este formulário e abra a vista de detalhes.
      </p>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Guardar alterações</button>
    `,
  });

  const form = document.getElementById('edit-flyer');
  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const validFrom = form.valid_from.value;
    const validUntil = form.valid_until.value;
    if (validUntil < validFrom) {
      toast('A data final não pode ser anterior à inicial', 'error');
      return;
    }

    saveBtn.disabled = true;
    const originalHtml = saveBtn.innerHTML;
    saveBtn.textContent = 'A guardar…';

    try {
      await apiFetch(`/admin/api/flyers/${f.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: form.title.value.trim(),
          description: (form.description.value || '').trim() || null,
          valid_from: validFrom,
          valid_until: validUntil,
          is_published: form.is_published.checked,
        }),
      });
      toast('Folheto atualizado');
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
