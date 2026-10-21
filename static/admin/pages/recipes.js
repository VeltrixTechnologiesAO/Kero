import {
  apiFetch, toast, openModal, closeModal,
  secureConfirmDialog,
  escapeHtml, escapeAttr, setupImagePreview,
} from '../shared.js';

let current = [];
let state = { search: '', category: 'all', status: 'all' };

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
  steps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h6v6H3z"/><path d="M15 3h6v6h-6z"/><path d="M3 15h6v6H3z"/><path d="M15 15h6v6h-6z"/></svg>',
};

export default {
  title: 'Receitas',

  render() {
    return `
      <section class="admin-panel recipes-panel">
        <header class="admin-panel-head">
          <div class="recipes-head-left">
            <h2>Receitas</h2>
            <span class="admin-badge-note" id="recipes-count">A carregar…</span>
          </div>
          <button type="button" class="admin-btn admin-btn-primary" id="recipes-new-btn">
            ${ICONS.plus}
            Nova receita
          </button>
        </header>

        <div class="msg-toolbar">
          <div class="msg-search">
            <span class="msg-search-icon">${ICONS.search}</span>
            <input type="search" id="recipes-search"
                   placeholder="Pesquisar por título, categoria ou descrição…"
                   autocomplete="off" spellcheck="false" />
            <button type="button" id="recipes-search-clear" class="msg-search-clear" hidden aria-label="Limpar">
              ${ICONS.close}
            </button>
            <kbd class="msg-search-kbd">/</kbd>
          </div>

          <div class="msg-date-filter">
            ${ICONS.filter}
            <select id="recipes-category">
              <option value="all">Todas as categorias</option>
            </select>
          </div>
        </div>

        <div class="msg-status-filters" id="recipes-status-filters">
          <button type="button" class="msg-chip is-active" data-status="all">
            Todas <span class="msg-chip-count" data-count="all">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="published">
            Publicadas <span class="msg-chip-count" data-count="published">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="draft">
            Rascunhos <span class="msg-chip-count" data-count="draft">0</span>
          </button>
        </div>

        <div id="recipes-body" class="recipes-body">
          <div class="admin-loading"><div class="admin-spinner"></div></div>
        </div>
      </section>
    `;
  },

  async mount() {
    const body = document.getElementById('recipes-body');
    const count = document.getElementById('recipes-count');
    const newBtn = document.getElementById('recipes-new-btn');
    const searchInput = document.getElementById('recipes-search');
    const searchClear = document.getElementById('recipes-search-clear');
    const categorySelect = document.getElementById('recipes-category');
    const statusFilters = document.getElementById('recipes-status-filters');

    let searchTimer = null;

    state = { search: '', category: 'all', status: 'all' };
    searchInput.value = '';
    searchClear.hidden = true;

    const load = async () => {
      try {
        const data = await apiFetch('/admin/api/recipes');
        current = data.items || [];

        const categories = Array.from(
          new Set(current.map((r) => r.category).filter(Boolean))
        ).sort();

        categorySelect.innerHTML = `<option value="all">Todas as categorias</option>` +
          categories.map((c) => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join('');
        categorySelect.value = state.category;

        render();
      } catch (e) {
        body.innerHTML = `
          <div class="admin-empty-state">
            <div class="admin-empty-icon">${ICONS.chef}</div>
            <p>${escapeHtml(e.message)}</p>
          </div>`;
      }
    };

    const applyFilters = () => {
      let items = [...current];

      if (state.status === 'published') items = items.filter((r) => r.is_published);
      else if (state.status === 'draft') items = items.filter((r) => !r.is_published);

      if (state.category !== 'all') items = items.filter((r) => r.category === state.category);

      if (state.search) {
        const q = state.search.toLowerCase();
        items = items.filter((r) =>
          (r.title || '').toLowerCase().includes(q) ||
          (r.category || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q)
        );
      }

      return items;
    };

    const render = () => {
      const counts = {
        all: current.length,
        published: current.filter((r) => r.is_published).length,
        draft: current.filter((r) => !r.is_published).length,
      };

      document.querySelectorAll('#recipes-status-filters .msg-chip-count').forEach((el) => {
        const key = el.dataset.count;
        el.textContent = String(counts[key] ?? 0);
        el.classList.toggle('is-zero', (counts[key] ?? 0) === 0);
      });

      const items = applyFilters();
      count.textContent = items.length === current.length
        ? `${current.length} receita(s)`
        : `${items.length} de ${current.length} receita(s)`;

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

    const onCategoryChange = () => {
      state.category = categorySelect.value;
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

    const confirmDelete = async (r) => {
      const detailsHtml = `
        <div class="detail-row">
          <span class="detail-label">Título</span>
          <span class="detail-value">${escapeHtml(r.title)}</span>
        </div>
        ${r.category ? `
          <div class="detail-row">
            <span class="detail-label">Categoria</span>
            <span class="detail-value">${escapeHtml(r.category)}</span>
          </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Slug</span>
          <span class="detail-value"><code class="admin-code">${escapeHtml(r.slug)}</code></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ingredientes</span>
          <span class="detail-value">${(r.ingredients || []).length}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Passos</span>
          <span class="detail-value">${(r.instructions || []).length}</span>
        </div>
      `;

      const ok = await secureConfirmDialog({
        title: 'Eliminar receita',
        message: 'Esta ação é permanente. A imagem, ingredientes e passos serão eliminados da base de dados.',
        detailsHtml,
        confirmWord: 'ELIMINAR',
        confirmLabel: 'Eliminar definitivamente',
        danger: true,
      });
      if (!ok) return false;

      try {
        await apiFetch(`/admin/api/recipes/${r.id}`, { method: 'DELETE' });
        current = current.filter((x) => x.id !== r.id);
        render();
        toast('Receita eliminada');
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
        const r = current.find((x) => x.id === id);
        if (r) await confirmDelete(r);
        return;
      }

      const editBtn = e.target.closest('[data-edit]');
      if (editBtn) {
        e.stopPropagation();
        const r = current.find((x) => x.id === Number(editBtn.dataset.edit));
        if (r) openEdit(r, load);
        return;
      }

      const openBtn = e.target.closest('[data-open]');
      if (openBtn) {
        const r = current.find((x) => x.id === Number(openBtn.dataset.open));
        if (r) openDetail(r, { onSaved: load, confirmDelete });
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
    categorySelect.addEventListener('change', onCategoryChange);
    statusFilters.addEventListener('click', onStatusFilter);
    body.addEventListener('click', onAction);
    newBtn.addEventListener('click', onNew);
    document.addEventListener('keydown', onKeyDown);

    await load();

    return () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchInput.removeEventListener('input', onSearchInput);
      searchClear.removeEventListener('click', onSearchClear);
      categorySelect.removeEventListener('change', onCategoryChange);
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
        <div class="admin-empty-icon">${ICONS.chef}</div>
        <p>Nenhuma receita encontrada.</p>
        <small>Ajuste os filtros ou crie uma nova receita.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="recipe-grid">
      ${items.map((r) => `
        <article class="recipe-admin-card" data-open="${r.id}">
          <div class="recipe-admin-media">
            <img src="${escapeAttr(r.thumbnail_url)}" alt="" loading="lazy">
            ${!r.is_published ? `
              <span class="admin-pill admin-pill-muted recipe-admin-status">Rascunho</span>
            ` : `
              <span class="admin-pill admin-pill-green recipe-admin-status">Publicada</span>
            `}
          </div>

          <div class="recipe-admin-body">
            ${r.category ? `<span class="recipe-admin-cat">${escapeHtml(r.category)}</span>` : ''}
            <h3>${escapeHtml(r.title)}</h3>
            <p class="recipe-admin-desc">
              ${escapeHtml((r.description || '').slice(0, 110))}${(r.description || '').length > 110 ? '…' : ''}
            </p>

            <div class="recipe-admin-meta">
              <span class="recipe-admin-meta-item">
                ${ICONS.clock}
                ${r.prep_time_minutes} min
              </span>
              <span class="recipe-admin-meta-item">
                ${ICONS.users}
                ${escapeHtml(r.servings)}
              </span>
              <span class="recipe-admin-meta-item">
                ${ICONS.list}
                ${(r.ingredients || []).length} ing.
              </span>
            </div>
          </div>

          <footer class="recipe-admin-foot">
            <button type="button" class="admin-icon-btn" title="Ver receita" data-open="${r.id}">
              ${ICONS.eye}
            </button>
            <button type="button" class="admin-icon-btn" title="Editar" data-edit="${r.id}">
              ${ICONS.edit}
            </button>
            <button type="button" class="admin-icon-btn admin-icon-btn-danger" title="Eliminar" data-delete="${r.id}">
              ${ICONS.trash}
            </button>
          </footer>
        </article>
      `).join('')}
    </div>
  `;
}

function openDetail(r, { onSaved, confirmDelete }) {
  const ingredientsHtml = (r.ingredients || []).length
    ? `<ul class="recipe-detail-list">${r.ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
    : '<p class="admin-modal-meta">Sem ingredientes registados.</p>';

  const instructionsHtml = (r.instructions || []).length
    ? `<ol class="recipe-detail-list recipe-detail-steps">${r.instructions.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ol>`
    : '<p class="admin-modal-meta">Sem passos registados.</p>';

  openModal({
    title: escapeHtml(r.title),
    bodyHtml: `
      <div class="recipe-detail-hero">
        <img src="${escapeAttr(r.thumbnail_url)}" alt="" loading="lazy">
        ${!r.is_published
          ? '<span class="admin-pill admin-pill-muted recipe-admin-status">Rascunho</span>'
          : '<span class="admin-pill admin-pill-green recipe-admin-status">Publicada</span>'}
      </div>

      ${r.category ? `<span class="recipe-admin-cat">${escapeHtml(r.category)}</span>` : ''}

      <div class="recipe-detail-meta">
        <div class="recipe-detail-meta-item">
          <span class="recipe-detail-meta-icon">${ICONS.clock}</span>
          <div>
            <strong>${r.prep_time_minutes} min</strong>
            <span>Tempo de preparação</span>
          </div>
        </div>
        <div class="recipe-detail-meta-item">
          <span class="recipe-detail-meta-icon">${ICONS.users}</span>
          <div>
            <strong>${escapeHtml(r.servings)}</strong>
            <span>Porções</span>
          </div>
        </div>
        <div class="recipe-detail-meta-item">
          <span class="recipe-detail-meta-icon">${ICONS.list}</span>
          <div>
            <strong>${(r.ingredients || []).length} ingredientes</strong>
            <span>Lista completa</span>
          </div>
        </div>
      </div>

      <h4 class="admin-message-section-title">Descrição</h4>
      <div class="admin-message-body">${escapeHtml(r.description || '').replace(/\n/g, '<br>')}</div>

      <h4 class="admin-message-section-title">Ingredientes</h4>
      ${ingredientsHtml}

      <h4 class="admin-message-section-title">Preparação</h4>
      ${instructionsHtml}

      <p class="admin-modal-meta">Slug: <code class="admin-code">${escapeHtml(r.slug)}</code></p>
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
    setTimeout(() => confirmDelete(r), 150);
  });

  footer.querySelector('[data-edit-modal]')?.addEventListener('click', () => {
    closeModal();
    setTimeout(() => openEdit(r, onSaved), 100);
  });
}

function listEditorHtml(name, values, placeholder) {
  const items = values.length ? values : [''];
  return `
    <div class="admin-list-editor" data-list="${name}">
      ${items.map((v) => listRowHtml(v, placeholder)).join('')}
      <button type="button" class="admin-list-add" data-add="${name}">
        ${ICONS.plus}
        Adicionar linha
      </button>
    </div>
  `;
}

function listRowHtml(value, placeholder) {
  return `
    <div class="admin-list-row" data-row>
      <input type="text" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder)}" data-input>
      <button type="button" class="admin-list-remove" data-remove title="Remover">
        ${ICONS.close}
      </button>
    </div>
  `;
}

function wireListEditor(root, name, placeholder) {
  const container = root.querySelector(`[data-list="${name}"]`);
  if (!container) return;

  container.querySelector('[data-add]').addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'admin-list-row';
    newRow.setAttribute('data-row', '');
    newRow.innerHTML = `
      <input type="text" placeholder="${escapeAttr(placeholder)}" data-input>
      <button type="button" class="admin-list-remove" data-remove title="Remover">
        ${ICONS.close}
      </button>
    `;
    container.insertBefore(newRow, container.querySelector('[data-add]'));
    newRow.querySelector('[data-input]').focus();
  });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    const row = btn.closest('[data-row]');
    const allRows = container.querySelectorAll('[data-row]');
    if (allRows.length === 1) {
      row.querySelector('[data-input]').value = '';
      return;
    }
    row.remove();
  });
}

function readList(root, name) {
  const container = root.querySelector(`[data-list="${name}"]`);
  if (!container) return [];
  return Array.from(container.querySelectorAll('[data-row] input'))
    .map((i) => i.value.trim())
    .filter(Boolean);
}

function openCreate(onSaved) {
  openModal({
    title: 'Nova receita',
    bodyHtml: `
      <form id="create-recipe" class="admin-form" enctype="multipart/form-data">
        <div class="admin-field">
          <label for="r-title">Título *</label>
          <input id="r-title" name="title" required maxlength="160"
                 placeholder="Ex: Calulu de peixe">
        </div>

        <div class="admin-field">
          <label for="r-category">Categoria</label>
          <input id="r-category" name="category" maxlength="80"
                 placeholder="Ex: Prato principal, Sobremesa…">
        </div>

        <div class="admin-field">
          <label for="r-description">Descrição *</label>
          <textarea id="r-description" name="description" rows="3" required
                    maxlength="4000"
                    placeholder="Breve introdução à receita…"></textarea>
        </div>

        <div class="admin-form-row">
          <div class="admin-field">
            <label for="r-prep">Tempo (min) *</label>
            <input id="r-prep" type="number" name="prep_time_minutes" required
                   min="1" max="1000" value="30">
          </div>
          <div class="admin-field">
            <label for="r-servings">Porções *</label>
            <input id="r-servings" name="servings" required maxlength="20"
                   placeholder="Ex: 4 ou 2-3" value="4">
          </div>
        </div>

        <div class="admin-field">
          <label>Ingredientes *</label>
          ${listEditorHtml('ingredients', [], 'Ex: 2 chávenas de farinha')}
        </div>

        <div class="admin-field">
          <label>Passos de preparação *</label>
          ${listEditorHtml('instructions', [], 'Ex: Misture os ingredientes secos…')}
        </div>

        <div class="admin-field">
          <label for="r-image">Imagem *</label>
          <label for="r-image" class="admin-upload-zone">
            <span class="admin-upload-icon">${ICONS.upload}</span>
            <span class="admin-upload-text">
              <strong>Clique para escolher</strong>
              <span>JPG, PNG ou WEBP · máx. 10 MB</span>
            </span>
            <input id="r-image" type="file" name="image"
                   accept="image/jpeg,image/png,image/webp" required hidden>
          </label>
          <div class="admin-upload-preview" id="r-image-preview" hidden></div>
        </div>

        <label class="admin-checkbox">
          <input type="checkbox" name="is_published" checked>
          Publicar imediatamente
        </label>
      </form>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Criar receita</button>
    `,
  });

  const form = document.getElementById('create-recipe');
  const fileInput = form.querySelector('#r-image');
  const preview = form.querySelector('#r-image-preview');

  setupImagePreview(fileInput, preview, 10);
  wireListEditor(form, 'ingredients', 'Ex: 2 chávenas de farinha');
  wireListEditor(form, 'instructions', 'Ex: Misture os ingredientes secos…');

  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const ingredients = readList(form, 'ingredients');
    const instructions = readList(form, 'instructions');

    if (!ingredients.length) {
      toast('Adicione pelo menos um ingrediente', 'error');
      return;
    }
    if (!instructions.length) {
      toast('Adicione pelo menos um passo', 'error');
      return;
    }

    const file = fileInput.files?.[0];
    if (!file) {
      toast('Selecione uma imagem', 'error');
      return;
    }

    saveBtn.disabled = true;
    const originalHtml = saveBtn.innerHTML;
    saveBtn.textContent = 'A criar…';

    try {
      const fd = new FormData();
      fd.append('title', form.title.value.trim());
      fd.append('category', (form.category.value || '').trim());
      fd.append('description', form.description.value.trim());
      fd.append('prep_time_minutes', String(Number(form.prep_time_minutes.value)));
      fd.append('servings', form.servings.value.trim());
      fd.append('ingredients', JSON.stringify(ingredients));
      fd.append('instructions', JSON.stringify(instructions));
      fd.append('is_published', form.is_published.checked ? 'true' : 'false');
      fd.append('image', file);

      await apiFetch('/admin/api/recipes', { method: 'POST', body: fd });

      toast('Receita criada');
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

function openEdit(r, onSaved) {
  openModal({
    title: `Editar — ${r.title}`,
    bodyHtml: `
      <form id="edit-recipe" class="admin-form">
        <div class="admin-field">
          <label>Slug (não editável)</label>
          <input value="${escapeAttr(r.slug)}" disabled>
        </div>

        <div class="admin-field">
          <label for="er-title">Título *</label>
          <input id="er-title" name="title" value="${escapeAttr(r.title)}" required maxlength="160">
        </div>

        <div class="admin-field">
          <label for="er-category">Categoria</label>
          <input id="er-category" name="category" value="${escapeAttr(r.category || '')}" maxlength="80">
        </div>

        <div class="admin-field">
          <label for="er-description">Descrição *</label>
          <textarea id="er-description" name="description" rows="3" required>${escapeHtml(r.description || '')}</textarea>
        </div>

        <div class="admin-form-row">
          <div class="admin-field">
            <label for="er-prep">Tempo (min) *</label>
            <input id="er-prep" type="number" name="prep_time_minutes" required
                   min="1" max="1000" value="${r.prep_time_minutes}">
          </div>
          <div class="admin-field">
            <label for="er-servings">Porções *</label>
            <input id="er-servings" name="servings" value="${escapeAttr(r.servings)}" required maxlength="20">
          </div>
        </div>

        <div class="admin-field">
          <label>Ingredientes *</label>
          ${listEditorHtml('ingredients', r.ingredients || [], 'Ex: 2 chávenas de farinha')}
        </div>

        <div class="admin-field">
          <label>Passos de preparação *</label>
          ${listEditorHtml('instructions', r.instructions || [], 'Ex: Misture os ingredientes secos…')}
        </div>

        <label class="admin-checkbox">
          <input type="checkbox" name="is_published" ${r.is_published ? 'checked' : ''}>
          Publicada
        </label>
      </form>

      <h4 class="admin-message-section-title">Imagem atual</h4>
      <div class="admin-modal-preview">
        <img src="${escapeAttr(r.thumbnail_url)}" alt="" loading="lazy">
      </div>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Guardar alterações</button>
    `,
  });

  const form = document.getElementById('edit-recipe');
  wireListEditor(form, 'ingredients', 'Ex: 2 chávenas de farinha');
  wireListEditor(form, 'instructions', 'Ex: Misture os ingredientes secos…');

  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const ingredients = readList(form, 'ingredients');
    const instructions = readList(form, 'instructions');

    if (!ingredients.length) {
      toast('Adicione pelo menos um ingrediente', 'error');
      return;
    }
    if (!instructions.length) {
      toast('Adicione pelo menos um passo', 'error');
      return;
    }

    saveBtn.disabled = true;
    const originalHtml = saveBtn.innerHTML;
    saveBtn.textContent = 'A guardar…';

    try {
      await apiFetch(`/admin/api/recipes/${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: form.title.value.trim(),
          category: (form.category.value || '').trim() || null,
          description: form.description.value.trim(),
          prep_time_minutes: Number(form.prep_time_minutes.value),
          servings: form.servings.value.trim(),
          ingredients,
          instructions,
          is_published: form.is_published.checked,
        }),
      });
      toast('Receita atualizada');
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
