import {
  apiFetch, toast, openModal, closeModal,
  secureConfirmDialog,
  escapeHtml, escapeAttr, fmtDate, setupImagePreview,
} from '../shared.js';

let current = [];
let state = { search: '', status: 'all', featured: 'all' };

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
};

export default {
  title: 'Competições',

  render() {
    return `
      <section class="admin-panel competitions-panel">
        <header class="admin-panel-head">
          <div class="competitions-head-left">
            <h2>Competições</h2>
            <span class="admin-badge-note" id="competitions-count">A carregar…</span>
          </div>
          <button type="button" class="admin-btn admin-btn-primary" id="competitions-new-btn">
            ${ICONS.plus}
            Nova competição
          </button>
        </header>

        <div class="msg-toolbar">
          <div class="msg-search">
            <span class="msg-search-icon">${ICONS.search}</span>
            <input type="search" id="competitions-search"
                   placeholder="Pesquisar por título, categoria ou descrição…"
                   autocomplete="off" spellcheck="false" />
            <button type="button" id="competitions-search-clear" class="msg-search-clear" hidden aria-label="Limpar">
              ${ICONS.close}
            </button>
            <kbd class="msg-search-kbd">/</kbd>
          </div>

          <div class="msg-date-filter">
            ${ICONS.filter}
            <select id="competitions-featured">
              <option value="all">Todas</option>
              <option value="featured">Só destacadas</option>
              <option value="normal">Só normais</option>
            </select>
          </div>
        </div>

        <div class="msg-status-filters" id="competitions-status-filters">
          <button type="button" class="msg-chip is-active" data-status="all">
            Todas <span class="msg-chip-count" data-count="all">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="active">
            A decorrer <span class="msg-chip-count" data-count="active">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="closed">
            Encerradas <span class="msg-chip-count" data-count="closed">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="draft">
            Rascunhos <span class="msg-chip-count" data-count="draft">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="winners">
            Com vencedores <span class="msg-chip-count" data-count="winners">0</span>
          </button>
        </div>

        <div id="competitions-body" class="competitions-body">
          <div class="admin-loading"><div class="admin-spinner"></div></div>
        </div>
      </section>
    `;
  },

  async mount() {
    const body = document.getElementById('competitions-body');
    const count = document.getElementById('competitions-count');
    const newBtn = document.getElementById('competitions-new-btn');
    const searchInput = document.getElementById('competitions-search');
    const searchClear = document.getElementById('competitions-search-clear');
    const featuredSelect = document.getElementById('competitions-featured');
    const statusFilters = document.getElementById('competitions-status-filters');

    let searchTimer = null;

    state = { search: '', status: 'all', featured: 'all' };
    searchInput.value = '';
    searchClear.hidden = true;
    featuredSelect.value = 'all';

    const load = async () => {
      try {
        const data = await apiFetch('/admin/api/competitions');
        current = data.items || [];
        render();
      } catch (e) {
        body.innerHTML = `
          <div class="admin-empty-state">
            <div class="admin-empty-icon">${ICONS.trophy}</div>
            <p>${escapeHtml(e.message)}</p>
          </div>`;
      }
    };

    const applyFilters = () => {
      let items = [...current];

      if (state.status === 'active') items = items.filter((c) => c.is_published && c.is_active);
      else if (state.status === 'closed') items = items.filter((c) => c.is_published && !c.is_active);
      else if (state.status === 'draft') items = items.filter((c) => !c.is_published);
      else if (state.status === 'winners') items = items.filter((c) => c.has_winners);

      if (state.featured === 'featured') items = items.filter((c) => c.is_featured);
      else if (state.featured === 'normal') items = items.filter((c) => !c.is_featured);

      if (state.search) {
        const q = state.search.toLowerCase();
        items = items.filter((c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
        );
      }

      return items;
    };

    const render = () => {
      const counts = {
        all: current.length,
        active: current.filter((c) => c.is_published && c.is_active).length,
        closed: current.filter((c) => c.is_published && !c.is_active).length,
        draft: current.filter((c) => !c.is_published).length,
        winners: current.filter((c) => c.has_winners).length,
      };

      document.querySelectorAll('#competitions-status-filters .msg-chip-count').forEach((el) => {
        const key = el.dataset.count;
        el.textContent = String(counts[key] ?? 0);
        el.classList.toggle('is-zero', (counts[key] ?? 0) === 0);
      });

      const items = applyFilters();
      count.textContent = items.length === current.length
        ? `${current.length} competição(ões)`
        : `${items.length} de ${current.length} competição(ões)`;

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

    const onFeaturedChange = () => {
      state.featured = featuredSelect.value;
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

    const onNew = () => openCreate(load);

    const confirmDelete = async (c) => {
      const detailsHtml = `
        <div class="detail-row">
          <span class="detail-label">Título</span>
          <span class="detail-value">${escapeHtml(c.title)}</span>
        </div>
        ${c.category ? `
          <div class="detail-row">
            <span class="detail-label">Categoria</span>
            <span class="detail-value">${escapeHtml(c.category)}</span>
          </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Slug</span>
          <span class="detail-value"><code class="admin-code">${escapeHtml(c.slug)}</code></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Período</span>
          <span class="detail-value">${fmtDate(c.valid_from)} — ${fmtDate(c.valid_until)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Vencedores</span>
          <span class="detail-value">${c.has_winners ? 'Sim' : 'Ainda não'}</span>
        </div>
      `;

      const ok = await secureConfirmDialog({
        title: 'Eliminar competição',
        message: 'Esta ação é permanente. A imagem, descrição e dados da competição serão eliminados da base de dados.',
        detailsHtml,
        confirmWord: 'ELIMINAR',
        confirmLabel: 'Eliminar definitivamente',
        danger: true,
      });
      if (!ok) return false;

      try {
        await apiFetch(`/admin/api/competitions/${c.id}`, { method: 'DELETE' });
        current = current.filter((x) => x.id !== c.id);
        render();
        toast('Competição eliminada');
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
        const c = current.find((x) => x.id === id);
        if (c) await confirmDelete(c);
        return;
      }

      const editBtn = e.target.closest('[data-edit]');
      if (editBtn) {
        e.stopPropagation();
        const c = current.find((x) => x.id === Number(editBtn.dataset.edit));
        if (c) openEdit(c, load);
        return;
      }

      const openBtn = e.target.closest('[data-open]');
      if (openBtn) {
        const c = current.find((x) => x.id === Number(openBtn.dataset.open));
        if (c) openDetail(c, { onSaved: load, confirmDelete });
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
    featuredSelect.addEventListener('change', onFeaturedChange);
    statusFilters.addEventListener('click', onStatusFilter);
    body.addEventListener('click', onAction);
    newBtn.addEventListener('click', onNew);
    document.addEventListener('keydown', onKeyDown);

    await load();

    return () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchInput.removeEventListener('input', onSearchInput);
      searchClear.removeEventListener('click', onSearchClear);
      featuredSelect.removeEventListener('change', onFeaturedChange);
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
        <div class="admin-empty-icon">${ICONS.trophy}</div>
        <p>Nenhuma competição encontrada.</p>
        <small>Ajuste os filtros ou crie uma nova competição.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="competition-grid">
      ${items.map((c) => {
        const status = !c.is_published
          ? { label: 'Rascunho', cls: 'admin-pill-muted' }
          : c.is_active
            ? { label: 'A decorrer', cls: 'admin-pill-green' }
            : { label: 'Encerrada', cls: 'admin-pill-muted' };

        return `
          <article class="competition-card ${c.is_featured ? 'is-featured' : ''}" data-open="${c.id}">
            <div class="competition-card-media">
              <img src="${escapeAttr(c.thumbnail_url)}" alt="" loading="lazy">
              <span class="admin-pill ${status.cls} competition-status">${status.label}</span>
              ${c.is_featured ? `
                <span class="competition-featured-badge">
                  ${ICONS.star}
                  Destaque
                </span>
              ` : ''}
            </div>

            <div class="competition-card-body">
              ${c.category ? `<span class="competition-cat">${escapeHtml(c.category)}</span>` : ''}
              <h3>${escapeHtml(c.title)}</h3>
              <p class="competition-desc">
                ${escapeHtml((c.description || '').slice(0, 120))}${(c.description || '').length > 120 ? '…' : ''}
              </p>

              <div class="competition-meta">
                <span class="competition-meta-item">
                  ${ICONS.calendar}
                  ${fmtDate(c.valid_until)}
                </span>
                ${c.has_winners ? `
                  <span class="competition-meta-item competition-meta-winners">
                    ${ICONS.trophy}
                    Com vencedores
                  </span>
                ` : ''}
              </div>
            </div>

            <footer class="competition-card-foot">
              <button type="button" class="admin-icon-btn" title="Ver detalhes" data-open="${c.id}">
                ${ICONS.eye}
              </button>
              <button type="button" class="admin-icon-btn" title="Editar" data-edit="${c.id}">
                ${ICONS.edit}
              </button>
              <button type="button" class="admin-icon-btn admin-icon-btn-danger" title="Eliminar" data-delete="${c.id}">
                ${ICONS.trash}
              </button>
            </footer>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function openDetail(c, { onSaved, confirmDelete }) {
  const status = !c.is_published
    ? { label: 'Rascunho', cls: 'admin-pill-muted' }
    : c.is_active
      ? { label: 'A decorrer', cls: 'admin-pill-green' }
      : { label: 'Encerrada', cls: 'admin-pill-muted' };

  openModal({
    title: escapeHtml(c.title),
    bodyHtml: `
      <div class="competition-detail-hero">
        <img src="${escapeAttr(c.thumbnail_url)}" alt="" loading="lazy">
        <span class="admin-pill ${status.cls}">${status.label}</span>
        ${c.is_featured ? `
          <span class="competition-featured-badge">
            ${ICONS.star}
            Destaque
          </span>
        ` : ''}
      </div>

      <dl class="admin-detail-grid">
        ${c.category ? `
          <div>
            <dt><span class="icon">${ICONS.filter}</span> Categoria</dt>
            <dd>${escapeHtml(c.category)}</dd>
          </div>
        ` : ''}
        <div>
          <dt><span class="icon">${ICONS.calendar}</span> Início</dt>
          <dd>${fmtDate(c.valid_from)}</dd>
        </div>
        <div>
          <dt><span class="icon">${ICONS.calendar}</span> Fim</dt>
          <dd>${fmtDate(c.valid_until)}</dd>
        </div>
        <div>
          <dt><span class="icon">${ICONS.trophy}</span> Vencedores</dt>
          <dd>${c.has_winners ? 'Sim' : 'Ainda não'}</dd>
        </div>
      </dl>

      <h4 class="admin-message-section-title">Descrição</h4>
      <div class="admin-message-body">${escapeHtml(c.description).replace(/\n/g, '<br>')}</div>

      ${c.winners_url ? `
        <h4 class="admin-message-section-title">Página dos vencedores</h4>
        <a href="${escapeAttr(c.winners_url)}" target="_blank" rel="noopener"
           class="competition-winners-link">
          ${ICONS.external}
          ${escapeHtml(c.winners_url)}
        </a>
      ` : ''}
    `,
    footerHtml: `
      <button type="button" class="admin-btn admin-btn-danger" data-delete-modal>
        Eliminar
      </button>
      <button type="button" class="admin-btn" data-close>Fechar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-edit-modal>Editar</button>
    `,
  });

  const footer = document.querySelector('#admin-modal-foot');

  footer.querySelector('[data-delete-modal]')?.addEventListener('click', () => {
    closeModal();
    setTimeout(() => confirmDelete(c), 150);
  });

  footer.querySelector('[data-edit-modal]')?.addEventListener('click', () => {
    closeModal();
    setTimeout(() => openEdit(c, onSaved), 100);
  });
}

function openCreate(onSaved) {
  const today = new Date().toISOString().slice(0, 10);

  openModal({
    title: 'Nova competição',
    bodyHtml: `
      <form id="create-competition" class="admin-form" enctype="multipart/form-data">
        <div class="admin-field">
          <label>Título *</label>
          <input name="title" required maxlength="160"
                 placeholder="Ex: Ganhe 100 carrinhos de compras">
        </div>

        <div class="admin-field">
          <label>Categoria</label>
          <input name="category" maxlength="80"
                 placeholder="Ex: Sorteio, Aniversário…">
        </div>

        <div class="admin-field">
          <label>Descrição *</label>
          <textarea name="description" rows="4" required maxlength="4000"
                    placeholder="Descreva os prémios e as regras da competição…"></textarea>
        </div>

        <div class="admin-form-row">
          <div class="admin-field">
            <label>Válida desde *</label>
            <input type="date" name="valid_from" required value="${today}">
          </div>
          <div class="admin-field">
            <label>Válida até *</label>
            <input type="date" name="valid_until" required value="${today}">
          </div>
        </div>

        <div class="admin-field">
          <label>URL dos vencedores (opcional)</label>
          <input type="url" name="winners_url" maxlength="500"
                 placeholder="https://…">
        </div>

        <div class="admin-field">
          <label>Imagem *</label>
          <label for="c-image" class="admin-upload-zone">
            <span class="admin-upload-icon">${ICONS.upload}</span>
            <span class="admin-upload-text">
              <strong>Clique para escolher</strong>
              <span>JPG, PNG ou WEBP · máx. 10 MB</span>
            </span>
            <input id="c-image" type="file" name="image"
                   accept="image/jpeg,image/png,image/webp" required hidden>
          </label>
          <div class="admin-upload-preview" id="c-image-preview" hidden></div>
        </div>

        <div class="admin-checkbox-group">
          <label class="admin-checkbox">
            <input type="checkbox" name="is_published" checked>
            Publicar imediatamente
          </label>
          <label class="admin-checkbox">
            <input type="checkbox" name="is_featured">
            Destacar na página inicial
          </label>
        </div>
      </form>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Criar competição</button>
    `,
  });

  const form = document.getElementById('create-competition');
  const fileInput = form.querySelector('#c-image');
  const preview = form.querySelector('#c-image-preview');
  setupImagePreview(fileInput, preview, 10);

  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const validFrom = form.valid_from.value;
    const validUntil = form.valid_until.value;
    if (validUntil < validFrom) {
      toast('A data final não pode ser anterior à inicial', 'error');
      return;
    }

    const file = fileInput.files?.[0];
    if (!file) {
      toast('Selecione uma imagem', 'error');
      return;
    }

    saveBtn.disabled = true;
    const original = saveBtn.innerHTML;
    saveBtn.textContent = 'A criar…';

    try {
      const fd = new FormData();
      fd.append('title', form.title.value.trim());
      fd.append('category', (form.category.value || '').trim());
      fd.append('description', form.description.value.trim());
      fd.append('valid_from', validFrom);
      fd.append('valid_until', validUntil);
      fd.append('winners_url', (form.winners_url.value || '').trim());
      fd.append('is_published', form.is_published.checked ? 'true' : 'false');
      fd.append('is_featured', form.is_featured.checked ? 'true' : 'false');
      fd.append('image', file);

      await apiFetch('/admin/api/competitions', {
        method: 'POST',
        body: fd,
      });

      toast('Competição criada');
      closeModal();
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = original;
    }
  };

  saveBtn.addEventListener('click', onSave);
}

function openEdit(c, onSaved) {
  openModal({
    title: `Editar — ${c.title}`,
    bodyHtml: `
      <form id="edit-competition" class="admin-form">
        <div class="admin-field">
          <label>Slug (não editável)</label>
          <input value="${escapeAttr(c.slug)}" disabled>
        </div>

        <div class="admin-field">
          <label>Título *</label>
          <input name="title" value="${escapeAttr(c.title)}" required maxlength="160">
        </div>

        <div class="admin-field">
          <label>Categoria</label>
          <input name="category" value="${escapeAttr(c.category || '')}" maxlength="80">
        </div>

        <div class="admin-field">
          <label>Descrição *</label>
          <textarea name="description" rows="4" required>${escapeHtml(c.description || '')}</textarea>
        </div>

        <div class="admin-form-row">
          <div class="admin-field">
            <label>Válida desde</label>
            <input type="date" name="valid_from" value="${escapeAttr(c.valid_from)}" required>
          </div>
          <div class="admin-field">
            <label>Válida até</label>
            <input type="date" name="valid_until" value="${escapeAttr(c.valid_until)}" required>
          </div>
        </div>

        <div class="admin-field">
          <label>URL dos vencedores</label>
          <input type="url" name="winners_url" value="${escapeAttr(c.winners_url || '')}" maxlength="500">
        </div>

        <div class="admin-checkbox-group">
          <label class="admin-checkbox">
            <input type="checkbox" name="is_published" ${c.is_published ? 'checked' : ''}>
            Publicada
          </label>
          <label class="admin-checkbox">
            <input type="checkbox" name="is_featured" ${c.is_featured ? 'checked' : ''}>
            Destacada
          </label>
        </div>
      </form>

      <h4 class="admin-message-section-title">Imagem atual</h4>
      <div class="admin-modal-preview">
        <img src="${escapeAttr(c.thumbnail_url)}" alt="" loading="lazy">
      </div>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Guardar alterações</button>
    `,
  });

  const form = document.getElementById('edit-competition');
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
    const original = saveBtn.innerHTML;
    saveBtn.textContent = 'A guardar…';

    try {
      await apiFetch(`/admin/api/competitions/${c.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: form.title.value.trim(),
          category: (form.category.value || '').trim() || null,
          description: form.description.value.trim(),
          valid_from: validFrom,
          valid_until: validUntil,
          winners_url: (form.winners_url.value || '').trim() || null,
          is_published: form.is_published.checked,
          is_featured: form.is_featured.checked,
        }),
      });
      toast('Competição atualizada');
      closeModal();
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = original;
    }
  };

  saveBtn.addEventListener('click', onSave);
}
