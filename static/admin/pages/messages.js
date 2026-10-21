import {
  apiFetch, toast, openModal, closeModal,
  secureConfirmDialog,
  escapeHtml, escapeAttr, fmtDateTime,
} from '../shared.js';

let current = [];
let state = {
  filter: 'all',
  search: '',
  dateFrom: '',
  dateTo: '',
  datePreset: 'all',
};

const ICONS = {
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/><path d="M4 12h16"/><path d="M4 16h16"/></svg>',
};

export default {
  title: 'Mensagens',

  render() {
    return `
      <section class="admin-panel msg-panel">
        <header class="admin-panel-head">
          <div class="msg-head-left">
            <h2>Mensagens de contacto</h2>
            <span class="admin-badge-note" id="messages-count">A carregar…</span>
          </div>
        </header>

        <div class="msg-toolbar">
          <div class="msg-search">
            <span class="msg-search-icon">${ICONS.search}</span>
            <input type="search" id="msg-search-input"
                   placeholder="Pesquisar por nome, email, assunto ou conteúdo…"
                   autocomplete="off" spellcheck="false" />
            <button type="button" id="msg-search-clear" class="msg-search-clear" hidden aria-label="Limpar">
              ${ICONS.close}
            </button>
            <kbd class="msg-search-kbd">/</kbd>
          </div>

          <div class="msg-date-filter">
            <span class="msg-date-icon">${ICONS.calendar}</span>
            <select id="msg-date-preset">
              <option value="all">Qualquer data</option>
              <option value="today">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="custom">Personalizado…</option>
            </select>
          </div>
        </div>

        <div class="msg-date-custom" id="msg-date-custom" hidden>
          <div class="admin-field">
            <label for="msg-date-from">De</label>
            <input type="date" id="msg-date-from" />
          </div>
          <div class="admin-field">
            <label for="msg-date-to">Até</label>
            <input type="date" id="msg-date-to" />
          </div>
          <button type="button" class="admin-btn admin-btn-sm" id="msg-date-apply">Aplicar</button>
          <button type="button" class="admin-btn admin-btn-sm" id="msg-date-reset">Limpar</button>
        </div>

        <div class="msg-status-filters" id="msg-status-filters">
          <button type="button" class="msg-chip is-active" data-filter="all">
            Todas <span class="msg-chip-count" data-count="all">0</span>
          </button>
          <button type="button" class="msg-chip" data-filter="unread">
            Não lidas <span class="msg-chip-count" data-count="unread">0</span>
          </button>
          <button type="button" class="msg-chip" data-filter="read">
            Lidas <span class="msg-chip-count" data-count="read">0</span>
          </button>
          <button type="button" class="msg-chip" data-filter="archived">
            Arquivadas <span class="msg-chip-count" data-count="archived">0</span>
          </button>
        </div>

        <div id="messages-body" class="msg-body">
          <div class="admin-loading"><div class="admin-spinner"></div></div>
        </div>
      </section>
    `;
  },

  async mount() {
    const body = document.getElementById('messages-body');
    const countEl = document.getElementById('messages-count');
    const searchInput = document.getElementById('msg-search-input');
    const searchClear = document.getElementById('msg-search-clear');
    const statusFilters = document.getElementById('msg-status-filters');
    const datePreset = document.getElementById('msg-date-preset');
    const dateCustom = document.getElementById('msg-date-custom');
    const dateFrom = document.getElementById('msg-date-from');
    const dateTo = document.getElementById('msg-date-to');
    const dateApply = document.getElementById('msg-date-apply');
    const dateReset = document.getElementById('msg-date-reset');

    let searchTimer = null;

    state = { filter: 'all', search: '', dateFrom: '', dateTo: '', datePreset: 'all' };
    searchInput.value = '';
    searchClear.hidden = true;
    datePreset.value = 'all';
    dateCustom.hidden = true;
    dateFrom.value = '';
    dateTo.value = '';

    const load = async () => {
      try {
        const data = await apiFetch('/admin/api/messages');
        current = data.items || [];
        render();
      } catch (e) {
        body.innerHTML = `<div class="admin-empty-state">
          <div class="admin-empty-icon">${ICONS.empty}</div>
          <p>${escapeHtml(e.message)}</p>
        </div>`;
      }
    };

    const applyFilters = () => {
      let items = [...current];

      if (state.filter === 'unread') items = items.filter((m) => !m.is_read && !m.is_archived);
      else if (state.filter === 'read') items = items.filter((m) => m.is_read && !m.is_archived);
      else if (state.filter === 'archived') items = items.filter((m) => m.is_archived);

      if (state.search) {
        const q = state.search.toLowerCase();
        items = items.filter((m) =>
          (m.first_name || '').toLowerCase().includes(q) ||
          (m.last_name || '').toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q) ||
          (m.subject || '').toLowerCase().includes(q) ||
          (m.message || '').toLowerCase().includes(q) ||
          (m.store_name || '').toLowerCase().includes(q)
        );
      }

      if (state.dateFrom || state.dateTo) {
        const from = state.dateFrom ? new Date(state.dateFrom + 'T00:00:00').getTime() : -Infinity;
        const to = state.dateTo ? new Date(state.dateTo + 'T23:59:59').getTime() : Infinity;
        items = items.filter((m) => {
          const t = new Date(m.created_at).getTime();
          return t >= from && t <= to;
        });
      }

      return items;
    };

    const render = () => {
      const counts = {
        all: current.length,
        unread: current.filter((m) => !m.is_read && !m.is_archived).length,
        read: current.filter((m) => m.is_read && !m.is_archived).length,
        archived: current.filter((m) => m.is_archived).length,
      };
      document.querySelectorAll('.msg-chip-count').forEach((el) => {
        const key = el.dataset.count;
        el.textContent = String(counts[key] ?? 0);
        el.classList.toggle('is-zero', (counts[key] ?? 0) === 0);
      });

      const items = applyFilters();
      countEl.textContent = items.length === current.length
        ? `${current.length} mensagem(ns)`
        : `${items.length} de ${current.length} mensagem(ns)`;

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

    const onDatePreset = () => {
      const value = datePreset.value;
      state.datePreset = value;

      if (value === 'custom') {
        dateCustom.hidden = false;
        return;
      }

      dateCustom.hidden = true;
      dateFrom.value = '';
      dateTo.value = '';

      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      if (value === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        state.dateFrom = start.toISOString().slice(0, 10);
        state.dateTo = endOfToday.toISOString().slice(0, 10);
      } else if (value === '7d') {
        const start = new Date(endOfToday);
        start.setDate(start.getDate() - 6);
        state.dateFrom = start.toISOString().slice(0, 10);
        state.dateTo = endOfToday.toISOString().slice(0, 10);
      } else if (value === '30d') {
        const start = new Date(endOfToday);
        start.setDate(start.getDate() - 29);
        state.dateFrom = start.toISOString().slice(0, 10);
        state.dateTo = endOfToday.toISOString().slice(0, 10);
      } else {
        state.dateFrom = '';
        state.dateTo = '';
      }
      render();
    };

    const onDateApply = () => {
      state.dateFrom = dateFrom.value || '';
      state.dateTo = dateTo.value || '';
      if (state.dateFrom && state.dateTo && state.dateTo < state.dateFrom) {
        toast('A data final não pode ser anterior à inicial', 'error');
        return;
      }
      render();
    };

    const onDateReset = () => {
      dateFrom.value = '';
      dateTo.value = '';
      state.dateFrom = '';
      state.dateTo = '';
      render();
    };

    const onStatusFilter = (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      state.filter = btn.dataset.filter;
      statusFilters.querySelectorAll('.msg-chip').forEach((b) =>
        b.classList.toggle('is-active', b === btn)
      );
      render();
    };

    const markRead = async (m) => {
      if (m.is_read) return;
      try {
        await apiFetch(`/admin/api/messages/${m.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_read: true }),
        });
        m.is_read = true;
        render();
      } catch (err) { /* silencioso */ }
    };

    const confirmDelete = async (m) => {
      const detailsHtml = `
        <div class="detail-row">
          <span class="detail-label">Assunto</span>
          <span class="detail-value">${escapeHtml(m.subject)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">De</span>
          <span class="detail-value">${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)} — ${escapeHtml(m.email)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Recebida</span>
          <span class="detail-value">${fmtDateTime(m.created_at)}</span>
        </div>
      `;

      const ok = await secureConfirmDialog({
        title: 'Eliminar mensagem',
        message: 'Esta ação é permanente e não pode ser desfeita. O conteúdo da mensagem será eliminado da base de dados.',
        detailsHtml,
        confirmWord: 'ELIMINAR',
        confirmLabel: 'Eliminar definitivamente',
        danger: true,
      });
      if (!ok) return false;

      try {
        await apiFetch(`/admin/api/messages/${m.id}`, { method: 'DELETE' });
        current = current.filter((x) => x.id !== m.id);
        render();
        toast('Mensagem eliminada');
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
        const m = current.find((x) => x.id === id);
        if (m) await confirmDelete(m);
        return;
      }

      const toggleRead = e.target.closest('[data-toggle-read]');
      if (toggleRead) {
        e.stopPropagation();
        const id = Number(toggleRead.dataset.toggleRead);
        const m = current.find((x) => x.id === id);
        if (!m) return;
        try {
          await apiFetch(`/admin/api/messages/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_read: !m.is_read }),
          });
          m.is_read = !m.is_read;
          render();
          toast(m.is_read ? 'Marcada como lida' : 'Marcada como não lida');
        } catch (err) { toast(err.message, 'error'); }
        return;
      }

      const toggleArchive = e.target.closest('[data-toggle-archive]');
      if (toggleArchive) {
        e.stopPropagation();
        const id = Number(toggleArchive.dataset.toggleArchive);
        const m = current.find((x) => x.id === id);
        if (!m) return;
        try {
          await apiFetch(`/admin/api/messages/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_archived: !m.is_archived }),
          });
          m.is_archived = !m.is_archived;
          render();
          toast(m.is_archived ? 'Arquivada' : 'Restaurada');
        } catch (err) { toast(err.message, 'error'); }
        return;
      }

      const openBtn = e.target.closest('[data-open]');
      if (openBtn) {
        const id = Number(openBtn.dataset.open);
        const m = current.find((x) => x.id === id);
        if (m) openDetail(m, { markRead, load, confirmDelete });
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
        if (searchInput.value) {
          onSearchClear();
        } else {
          searchInput.blur();
        }
      }
    };

    searchInput.addEventListener('input', onSearchInput);
    searchClear.addEventListener('click', onSearchClear);
    statusFilters.addEventListener('click', onStatusFilter);
    datePreset.addEventListener('change', onDatePreset);
    dateApply.addEventListener('click', onDateApply);
    dateReset.addEventListener('click', onDateReset);
    body.addEventListener('click', onAction);
    document.addEventListener('keydown', onKeyDown);

    await load();

    return () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchInput.removeEventListener('input', onSearchInput);
      searchClear.removeEventListener('click', onSearchClear);
      statusFilters.removeEventListener('click', onStatusFilter);
      datePreset.removeEventListener('change', onDatePreset);
      dateApply.removeEventListener('click', onDateApply);
      dateReset.removeEventListener('click', onDateReset);
      body.removeEventListener('click', onAction);
      document.removeEventListener('keydown', onKeyDown);
    };
  },
};


function openDetail(m, { markRead, load, confirmDelete }) {
  markRead(m);

  const statusClass = m.is_archived ? 'admin-pill-muted'
                    : !m.is_read ? 'admin-pill-red'
                    : 'admin-pill-green';
  const statusLabel = m.is_archived ? 'Arquivada'
                    : !m.is_read ? 'Nova'
                    : 'Lida';

  openModal({
    title: escapeHtml(m.subject),
    bodyHtml: `
      <div class="admin-message-header">
        <div class="admin-message-from">
          <div class="admin-message-avatar" style="background:${avatarGradient(m.email)}">
            ${escapeHtml(initials(m))}
          </div>
          <div>
            <strong>${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}</strong>
            <a href="mailto:${escapeAttr(m.email)}" class="admin-link">${escapeHtml(m.email)}</a>
          </div>
        </div>
        <span class="admin-pill ${statusClass}">${statusLabel}</span>
      </div>

      <dl class="admin-detail-grid">
        ${m.phone ? `
          <div>
            <dt><span class="icon">${ICONS.phone}</span> Telefone</dt>
            <dd><a href="tel:${escapeAttr(m.phone.replace(/\s+/g, ''))}" class="admin-link">${escapeHtml(m.phone)}</a></dd>
          </div>
        ` : ''}
        ${m.province ? `
          <div>
            <dt><span class="icon">${ICONS.pin}</span> Província</dt>
            <dd>${escapeHtml(m.province)}</dd>
          </div>
        ` : ''}
        ${m.store_name ? `
          <div>
            <dt><span class="icon">${ICONS.store}</span> Loja</dt>
            <dd>${escapeHtml(m.store_name)}</dd>
          </div>
        ` : ''}
        ${m.department ? `
          <div>
            <dt><span class="icon">${ICONS.tag}</span> Área</dt>
            <dd>${escapeHtml(m.department)}</dd>
          </div>
        ` : ''}
        ${m.message_type ? `
          <div>
            <dt><span class="icon">${ICONS.tag}</span> Tipo</dt>
            <dd>${escapeHtml(m.message_type)}</dd>
          </div>
        ` : ''}
        <div>
          <dt><span class="icon">${ICONS.calendar}</span> Recebida</dt>
          <dd>${fmtDateTime(m.created_at)}</dd>
        </div>
      </dl>

      <h4 class="admin-message-section-title">Mensagem</h4>
      <div class="admin-message-body">${escapeHtml(m.message).replace(/\n/g, '<br>')}</div>

      <p class="admin-modal-meta">
        IP: ${escapeHtml(m.ip_address || '—')}
        ${m.user_agent ? `<br>User-Agent: ${escapeHtml(m.user_agent)}` : ''}
      </p>
    `,
    footerHtml: `
      <button type="button" class="admin-btn admin-btn-danger" data-delete-modal>
        Eliminar
      </button>
      <button type="button" class="admin-btn" data-toggle-read-modal>
        ${m.is_read ? 'Marcar como não lida' : 'Marcar como lida'}
      </button>
      <button type="button" class="admin-btn" data-toggle-archive-modal>
        ${m.is_archived ? 'Restaurar' : 'Arquivar'}
      </button>
      <button type="button" class="admin-btn" data-close>Fechar</button>
    `,
  });

  const footer = document.querySelector('#admin-modal-foot');

  footer.querySelector('[data-delete-modal]')?.addEventListener('click', () => {
    closeModal();
    setTimeout(() => confirmDelete(m), 150);
  });

  footer.querySelector('[data-toggle-read-modal]')?.addEventListener('click', async () => {
    try {
      await apiFetch(`/admin/api/messages/${m.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_read: !m.is_read }),
      });
      m.is_read = !m.is_read;
      toast(m.is_read ? 'Marcada como lida' : 'Marcada como não lida');
      closeModal();
      load();
    } catch (err) { toast(err.message, 'error'); }
  });

  footer.querySelector('[data-toggle-archive-modal]')?.addEventListener('click', async () => {
    try {
      await apiFetch(`/admin/api/messages/${m.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_archived: !m.is_archived }),
      });
      m.is_archived = !m.is_archived;
      toast(m.is_archived ? 'Arquivada' : 'Restaurada');
      closeModal();
      load();
    } catch (err) { toast(err.message, 'error'); }
  });
}


function renderList(container, items) {
  if (!items.length) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <div class="admin-empty-icon">${ICONS.inbox}</div>
        <p>Nenhuma mensagem encontrada.</p>
        <small>Ajuste os filtros ou a pesquisa para ver mais resultados.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="msg-list">
      ${items.map((m) => `
        <article class="msg-item ${!m.is_read ? 'is-unread' : ''} ${m.is_archived ? 'is-archived' : ''}"
                 data-open="${m.id}" tabindex="0" role="button">
          <div class="msg-item-avatar" style="background:${avatarGradient(m.email)}">
            ${escapeHtml(initials(m))}
          </div>

          <div class="msg-item-body">
            <div class="msg-item-top">
              <strong class="msg-item-name">
                ${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}
              </strong>
              <span class="msg-item-date">${fmtDateTime(m.created_at)}</span>
            </div>

            <div class="msg-item-mid">
              <span class="msg-item-subject">${escapeHtml(m.subject)}</span>
              ${!m.is_read && !m.is_archived ? '<span class="msg-dot" title="Não lida"></span>' : ''}
              ${m.is_archived ? '<span class="admin-pill admin-pill-muted">Arquivada</span>' : ''}
            </div>

            <p class="msg-item-preview">${escapeHtml((m.message || '').slice(0, 140))}${(m.message || '').length > 140 ? '…' : ''}</p>

            <div class="msg-item-meta">
              <span class="msg-item-meta-item">
                ${ICONS.mail}
                ${escapeHtml(m.email)}
              </span>
              ${m.province ? `
                <span class="msg-item-meta-item">
                  ${ICONS.pin}
                  ${escapeHtml(m.province)}
                </span>
              ` : ''}
              ${m.store_name ? `
                <span class="msg-item-meta-item">
                  ${ICONS.store}
                  ${escapeHtml(m.store_name)}
                </span>
              ` : ''}
              ${m.message_type ? `
                <span class="msg-item-meta-item msg-item-type">
                  ${escapeHtml(m.message_type)}
                </span>
              ` : ''}
            </div>
          </div>

          <div class="msg-item-actions">
            <button class="admin-icon-btn" title="Ver mensagem completa" data-open="${m.id}">
              ${ICONS.eye}
            </button>
            <button class="admin-icon-btn" title="${m.is_read ? 'Marcar como não lida' : 'Marcar como lida'}" data-toggle-read="${m.id}">
              ${m.is_read ? ICONS.undo : ICONS.check}
            </button>
            <button class="admin-icon-btn" title="${m.is_archived ? 'Restaurar' : 'Arquivar'}" data-toggle-archive="${m.id}">
              ${ICONS.archive}
            </button>
            <button class="admin-icon-btn admin-icon-btn-danger" title="Eliminar" data-delete="${m.id}">
              ${ICONS.trash}
            </button>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}


function initials(m) {
  const first = (m.first_name || '').charAt(0).toUpperCase();
  const last = (m.last_name || '').charAt(0).toUpperCase();
  if (first && last) return first + last;
  if (first) return first;
  const email = (m.email || '?').charAt(0).toUpperCase();
  return email;
}

function avatarGradient(email) {
  const palettes = [
    ['#00873A', '#003D19'],
    ['#0F172A', '#334155'],
    ['#1D4ED8', '#1E3A8A'],
    ['#7C2D12', '#431407'],
    ['#0F766E', '#134E4A'],
    ['#B45309', '#78350F'],
    ['#6D28D9', '#4C1D95'],
    ['#BE185D', '#831843'],
    ['#15803D', '#14532D'],
    ['#0369A1', '#0C4A6E'],
  ];
  let hash = 0;
  for (let i = 0; i < (email || '').length; i++) {
    hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  }
  const [a, b] = palettes[Math.abs(hash) % palettes.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
