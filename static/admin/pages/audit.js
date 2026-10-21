import {
  apiFetch, toast, openModal, escapeHtml, escapeAttr, fmtDateTime,
} from '../shared.js';

let current = [];
let state = {
  search: '',
  category: 'all',
  user: '',
  dateFrom: '',
  dateTo: '',
  datePreset: 'all',
};

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  create: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
};

const CATEGORY_LABELS = {
  login: 'Autenticação',
  content: 'Conteúdo',
  admin: 'Administração',
  message: 'Mensagens',
  other: 'Outros',
};

function categorize(action) {
  if (!action) return 'other';
  if (action.startsWith('admin.login')) return 'login';
  if (action.startsWith('admin.user')) return 'admin';
  if (action.startsWith('message.')) return 'message';
  if (/^(flyer|recipe|competition|store)\./.test(action)) return 'content';
  return 'other';
}

function actionIcon(action) {
  if (!action) return ICONS.activity;
  if (action.includes('login.success')) return ICONS.login;
  if (action.includes('login.failed')) return ICONS.alert;
  if (action.includes('logout')) return ICONS.logout;
  if (action.includes('password')) return ICONS.shield;
  if (action.includes('.created')) return ICONS.create;
  if (action.includes('.updated') || action.includes('.marked')) return ICONS.edit;
  if (action.includes('.deleted') || action.includes('.deactivated')) return ICONS.trash;
  if (action.includes('.archived')) return ICONS.archive;
  return ICONS.activity;
}

function actionTone(action) {
  if (!action) return 'neutral';
  if (action.includes('failed') || action.includes('deleted') || action.includes('deactivated')) return 'danger';
  if (action.includes('created') || action.includes('success')) return 'success';
  if (action.includes('updated') || action.includes('marked')) return 'info';
  return 'neutral';
}

export default {
  title: 'Auditoria',

  render() {
    return `
      <section class="admin-panel audit-panel">
        <header class="admin-panel-head">
          <div class="audit-head-left">
            <h2>Registo de atividade</h2>
            <span class="admin-badge-note" id="audit-count">A carregar…</span>
          </div>
          <button type="button" class="admin-btn" id="audit-export">
            ${ICONS.download}
            Exportar CSV
          </button>
        </header>

        <div class="msg-toolbar">
          <div class="msg-search">
            <span class="msg-search-icon">${ICONS.search}</span>
            <input type="search" id="audit-search"
                   placeholder="Pesquisar por utilizador, ação, entidade ou IP…"
                   autocomplete="off" spellcheck="false" />
            <button type="button" id="audit-search-clear" class="msg-search-clear" hidden aria-label="Limpar">
              ${ICONS.close}
            </button>
            <kbd class="msg-search-kbd">/</kbd>
          </div>

          <div class="audit-toolbar-actions">
            <div class="msg-date-filter">
              ${ICONS.calendar}
              <select id="audit-date-preset">
                <option value="all">Qualquer data</option>
                <option value="today">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="custom">Personalizado…</option>
              </select>
            </div>

            <div class="msg-date-filter">
              ${ICONS.filter}
              <select id="audit-user">
                <option value="">Todos os utilizadores</option>
              </select>
            </div>
          </div>
        </div>

        <div class="msg-date-custom" id="audit-date-custom" hidden>
          <div class="admin-field">
            <label for="audit-date-from">De</label>
            <input type="date" id="audit-date-from" />
          </div>
          <div class="admin-field">
            <label for="audit-date-to">Até</label>
            <input type="date" id="audit-date-to" />
          </div>
          <button type="button" class="admin-btn admin-btn-sm" id="audit-date-apply">Aplicar</button>
          <button type="button" class="admin-btn admin-btn-sm" id="audit-date-reset">Limpar</button>
        </div>

        <div class="msg-status-filters" id="audit-categories">
          <button type="button" class="msg-chip is-active" data-category="all">
            Todas <span class="msg-chip-count" data-count="all">0</span>
          </button>
          <button type="button" class="msg-chip" data-category="login">
            Autenticação <span class="msg-chip-count" data-count="login">0</span>
          </button>
          <button type="button" class="msg-chip" data-category="content">
            Conteúdo <span class="msg-chip-count" data-count="content">0</span>
          </button>
          <button type="button" class="msg-chip" data-category="admin">
            Administração <span class="msg-chip-count" data-count="admin">0</span>
          </button>
          <button type="button" class="msg-chip" data-category="message">
            Mensagens <span class="msg-chip-count" data-count="message">0</span>
          </button>
        </div>

        <div id="audit-body" class="audit-body">
          <div class="admin-loading"><div class="admin-spinner"></div></div>
        </div>
      </section>
    `;
  },

  async mount() {
    const body = document.getElementById('audit-body');
    const count = document.getElementById('audit-count');
    const searchInput = document.getElementById('audit-search');
    const searchClear = document.getElementById('audit-search-clear');
    const categories = document.getElementById('audit-categories');
    const datePreset = document.getElementById('audit-date-preset');
    const dateCustom = document.getElementById('audit-date-custom');
    const dateFrom = document.getElementById('audit-date-from');
    const dateTo = document.getElementById('audit-date-to');
    const dateApply = document.getElementById('audit-date-apply');
    const dateReset = document.getElementById('audit-date-reset');
    const userFilter = document.getElementById('audit-user');
    const exportBtn = document.getElementById('audit-export');

    let searchTimer = null;

    state = { search: '', category: 'all', user: '', dateFrom: '', dateTo: '', datePreset: 'all' };
    searchInput.value = '';
    searchClear.hidden = true;
    datePreset.value = 'all';
    dateCustom.hidden = true;
    dateFrom.value = '';
    dateTo.value = '';
    userFilter.value = '';

    const load = async () => {
      try {
        const data = await apiFetch('/admin/api/audit');
        current = data.items || [];

        const users = Array.from(new Set(current.map((e) => e.username).filter(Boolean))).sort();
        userFilter.innerHTML = `<option value="">Todos os utilizadores</option>` +
          users.map((u) => `<option value="${escapeAttr(u)}">${escapeHtml(u)}</option>`).join('');
        userFilter.value = state.user;

        render();
      } catch (e) {
        body.innerHTML = `
          <div class="admin-empty-state">
            <div class="admin-empty-icon">${ICONS.alert}</div>
            <p>${escapeHtml(e.message)}</p>
          </div>`;
      }
    };

    const applyFilters = () => {
      let items = [...current];

      if (state.category !== 'all') {
        items = items.filter((e) => categorize(e.action) === state.category);
      }

      if (state.user) {
        items = items.filter((e) => e.username === state.user);
      }

      if (state.search) {
        const q = state.search.toLowerCase();
        items = items.filter((e) =>
          (e.username || '').toLowerCase().includes(q) ||
          (e.action || '').toLowerCase().includes(q) ||
          (e.entity_type || '').toLowerCase().includes(q) ||
          (e.ip_address || '').toLowerCase().includes(q) ||
          (e.details ? JSON.stringify(e.details).toLowerCase() : '').includes(q)
        );
      }

      if (state.dateFrom || state.dateTo) {
        const from = state.dateFrom ? new Date(state.dateFrom + 'T00:00:00').getTime() : -Infinity;
        const to = state.dateTo ? new Date(state.dateTo + 'T23:59:59').getTime() : Infinity;
        items = items.filter((e) => {
          const t = new Date(e.created_at).getTime();
          return t >= from && t <= to;
        });
      }

      return items;
    };

    const render = () => {
      const counts = {
        all: current.length,
        login: current.filter((e) => categorize(e.action) === 'login').length,
        content: current.filter((e) => categorize(e.action) === 'content').length,
        admin: current.filter((e) => categorize(e.action) === 'admin').length,
        message: current.filter((e) => categorize(e.action) === 'message').length,
      };

      document.querySelectorAll('#audit-categories .msg-chip-count').forEach((el) => {
        const key = el.dataset.count;
        el.textContent = String(counts[key] ?? 0);
        el.classList.toggle('is-zero', (counts[key] ?? 0) === 0);
      });

      const items = applyFilters();
      count.textContent = items.length === current.length
        ? `${current.length} registo(s)`
        : `${items.length} de ${current.length} registo(s)`;

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

    const onCategoryFilter = (e) => {
      const btn = e.target.closest('[data-category]');
      if (!btn) return;
      state.category = btn.dataset.category;
      categories.querySelectorAll('.msg-chip').forEach((b) =>
        b.classList.toggle('is-active', b === btn)
      );
      render();
    };

    const onUserChange = () => {
      state.user = userFilter.value;
      render();
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

    const onExport = () => {
      const items = applyFilters();
      if (!items.length) {
        toast('Não há registos para exportar', 'error');
        return;
      }

      const header = ['Data', 'Utilizador', 'Ação', 'Entidade', 'ID', 'IP', 'Detalhes'];
      const rows = items.map((e) => [
        fmtDateTime(e.created_at),
        e.username || '',
        e.action || '',
        e.entity_type || '',
        e.entity_id != null ? String(e.entity_id) : '',
        e.ip_address || '',
        e.details ? JSON.stringify(e.details) : '',
      ]);

      const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
      const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');

      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria-kero-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast(`${items.length} registo(s) exportados`);
    };

    const onAction = (e) => {
      const openBtn = e.target.closest('[data-open]');
      if (!openBtn) return;
      const id = Number(openBtn.dataset.open);
      const entry = current.find((x) => x.id === id);
      if (entry) openDetail(entry);
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
    categories.addEventListener('click', onCategoryFilter);
    userFilter.addEventListener('change', onUserChange);
    datePreset.addEventListener('change', onDatePreset);
    dateApply.addEventListener('click', onDateApply);
    dateReset.addEventListener('click', onDateReset);
    exportBtn.addEventListener('click', onExport);
    body.addEventListener('click', onAction);
    document.addEventListener('keydown', onKeyDown);

    await load();

    return () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchInput.removeEventListener('input', onSearchInput);
      searchClear.removeEventListener('click', onSearchClear);
      categories.removeEventListener('click', onCategoryFilter);
      userFilter.removeEventListener('change', onUserChange);
      datePreset.removeEventListener('change', onDatePreset);
      dateApply.removeEventListener('click', onDateApply);
      dateReset.removeEventListener('click', onDateReset);
      exportBtn.removeEventListener('click', onExport);
      body.removeEventListener('click', onAction);
      document.removeEventListener('keydown', onKeyDown);
    };
  },
};

function renderList(container, items) {
  if (!items.length) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <div class="admin-empty-icon">${ICONS.activity}</div>
        <p>Nenhum registo encontrado.</p>
        <small>Ajuste os filtros ou a pesquisa.</small>
      </div>
    `;
    return;
  }

  const groups = groupByDay(items);

  container.innerHTML = groups.map((group) => `
    <div class="audit-day">
      <div class="audit-day-head">
        <span class="audit-day-label">${escapeHtml(group.label)}</span>
        <span class="audit-day-count">${group.items.length} ${group.items.length === 1 ? 'registo' : 'registos'}</span>
      </div>
      <div class="audit-list">
        ${group.items.map((e) => `
          <article class="audit-item tone-${actionTone(e.action)}" data-open="${e.id}" tabindex="0" role="button">
            <span class="audit-item-icon">${actionIcon(e.action)}</span>
            <div class="audit-item-body">
              <div class="audit-item-top">
                <code class="audit-item-action">${escapeHtml(e.action)}</code>
                <span class="audit-item-time">${fmtTime(e.created_at)}</span>
              </div>
              <div class="audit-item-meta">
                <span class="audit-item-meta-item">
                  <strong>${e.username ? escapeHtml(e.username) : 'sistema'}</strong>
                </span>
                ${e.entity_type ? `
                  <span class="audit-item-meta-item">
                    ${escapeHtml(e.entity_type)}${e.entity_id ? ` #${e.entity_id}` : ''}
                  </span>
                ` : ''}
                ${e.ip_address ? `
                  <span class="audit-item-meta-item audit-item-ip">${escapeHtml(e.ip_address)}</span>
                ` : ''}
              </div>
            </div>
            <button class="admin-icon-btn" title="Ver detalhes" data-open="${e.id}">
              ${ICONS.eye}
            </button>
          </article>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function groupByDay(items) {
  const groups = [];
  const map = new Map();

  for (const e of items) {
    const d = new Date(e.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map.has(key)) {
      const g = { key, label: dayLabel(d), items: [] };
      map.set(key, g);
      groups.push(g);
    }
    map.get(key).items.push(e);
  }

  return groups;
}

function dayLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, yesterday)) return 'Ontem';

  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function fmtTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function openDetail(e) {
  const detailsHtml = e.details
    ? `<pre class="audit-detail-json">${escapeHtml(JSON.stringify(e.details, null, 2))}</pre>`
    : '<p class="admin-modal-meta">Sem detalhes adicionais.</p>';

  openModal({
    title: escapeHtml(e.action),
    bodyHtml: `
      <div class="audit-detail-head tone-${actionTone(e.action)}">
        <span class="audit-detail-icon">${actionIcon(e.action)}</span>
        <div>
          <strong>${escapeHtml(e.action)}</strong>
          <span>${fmtDateTime(e.created_at)}</span>
        </div>
      </div>

      <dl class="admin-detail-grid">
        <div>
          <dt>Utilizador</dt>
          <dd>${e.username ? escapeHtml(e.username) : '<em>sistema</em>'}</dd>
        </div>
        <div>
          <dt>Categoria</dt>
          <dd>${escapeHtml(CATEGORY_LABELS[categorize(e.action)] || '—')}</dd>
        </div>
        <div>
          <dt>Entidade</dt>
          <dd>${e.entity_type ? escapeHtml(e.entity_type) : '—'}</dd>
        </div>
        <div>
          <dt>ID da entidade</dt>
          <dd>${e.entity_id != null ? `#${e.entity_id}` : '—'}</dd>
        </div>
        <div>
          <dt>Endereço IP</dt>
          <dd>${e.ip_address ? escapeHtml(e.ip_address) : '—'}</dd>
        </div>
        <div>
          <dt>Registo</dt>
          <dd>#${e.id}</dd>
        </div>
      </dl>

      <h4 class="admin-message-section-title">Detalhes</h4>
      ${detailsHtml}
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Fechar</button>
    `,
  });
}
