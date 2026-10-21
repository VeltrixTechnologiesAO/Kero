import { apiFetch, escapeHtml, escapeAttr, fmtDateTime } from '../shared.js';

const ICONS = {
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>',
  chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
  create: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

function todayLabel() {
  const d = new Date();
  const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
}

function actionMeta(action) {
  if (!action) return { icon: ICONS.activity, tone: 'neutral' };
  if (action.includes('login.failed')) return { icon: ICONS.alert, tone: 'danger' };
  if (action.includes('login.success')) return { icon: ICONS.login, tone: 'success' };
  if (action.includes('logout')) return { icon: ICONS.logout, tone: 'neutral' };
  if (action.includes('password')) return { icon: ICONS.shield, tone: 'info' };
  if (action.includes('.created')) return { icon: ICONS.create, tone: 'success' };
  if (action.includes('.deleted') || action.includes('.deactivated')) return { icon: ICONS.trash, tone: 'danger' };
  if (action.includes('.archived')) return { icon: ICONS.archive, tone: 'neutral' };
  if (action.includes('.updated') || action.includes('.marked')) return { icon: ICONS.edit, tone: 'info' };
  return { icon: ICONS.activity, tone: 'neutral' };
}

export default {
  title: 'Dashboard',

  render() {
    return `
      <div class="dash-welcome">
        <div class="dash-welcome-copy">
          <h1>${greeting()}</h1>
          <p>${todayLabel()} · Aqui está o resumo do sistema.</p>
        </div>
        <div class="dash-welcome-actions">
          <a href="#/messages" class="admin-btn">
            ${ICONS.mail}
            Mensagens
          </a>
          <a href="#/flyers" class="admin-btn admin-btn-primary">
            ${ICONS.create}
            Novo folheto
          </a>
        </div>
      </div>

      <div class="dash-kpis" id="stats-grid">
        <div class="admin-loading"><div class="admin-spinner"></div></div>
      </div>

      <div class="dash-needs" id="needs-attention" hidden></div>

      <div class="dash-two-col">
        <section class="admin-panel">
          <header class="admin-panel-head">
            <h2>Mensagens recentes</h2>
            <a href="#/messages" class="admin-link">Ver todas ${ICONS.arrowRight}</a>
          </header>
          <div id="recent-messages">
            <div class="admin-loading-inline"><div class="admin-spinner"></div></div>
          </div>
        </section>

        <section class="admin-panel">
          <header class="admin-panel-head">
            <h2>Atividade recente</h2>
            <a href="#/audit" class="admin-link">Ver tudo ${ICONS.arrowRight}</a>
          </header>
          <div id="recent-audit">
            <div class="admin-loading-inline"><div class="admin-spinner"></div></div>
          </div>
        </section>
      </div>

      <div class="dash-shortcuts">
        <h3 class="dash-shortcuts-title">Atalhos rápidos</h3>
        <div class="dash-shortcuts-grid">
          <a href="#/messages" class="dash-shortcut">
            <span class="dash-shortcut-icon">${ICONS.mail}</span>
            <div>
              <strong>Mensagens</strong>
              <span>Ver contacto recebido</span>
            </div>
          </a>
          <a href="#/flyers" class="dash-shortcut">
            <span class="dash-shortcut-icon">${ICONS.news}</span>
            <div>
              <strong>Folhetos</strong>
              <span>Gerir promoções</span>
            </div>
          </a>
          <a href="#/recipes" class="dash-shortcut">
            <span class="dash-shortcut-icon">${ICONS.chef}</span>
            <div>
              <strong>Receitas</strong>
              <span>Adicionar novas</span>
            </div>
          </a>
          <a href="#/competitions" class="dash-shortcut">
            <span class="dash-shortcut-icon">${ICONS.trophy}</span>
            <div>
              <strong>Competições</strong>
              <span>Gerir sorteios</span>
            </div>
          </a>
          <a href="#/stores" class="dash-shortcut">
            <span class="dash-shortcut-icon">${ICONS.pin}</span>
            <div>
              <strong>Lojas</strong>
              <span>Ver localizações</span>
            </div>
          </a>
          <a href="#/users" class="dash-shortcut">
            <span class="dash-shortcut-icon">${ICONS.users}</span>
            <div>
              <strong>Utilizadores</strong>
              <span>Gerir acessos</span>
            </div>
          </a>
        </div>
      </div>
    `;
  },

  async mount() {
    const controller = new AbortController();

    try {
      const data = await apiFetch('/admin/api/dashboard', { signal: controller.signal });
      renderStats(data.stats);
      renderNeedsAttention(data.stats);
      renderMessages(data.recent_messages);
      renderAudit(data.recent_audit);
    } catch (err) {
      if (err.name === 'AbortError') return null;
      throw err;
    }

    return () => controller.abort();
  },
};

function renderStats(stats) {
  const el = document.getElementById('stats-grid');
  if (!el) return;

  const cards = [
    {
      icon: ICONS.mail,
      value: stats.unread_messages,
      label: 'Mensagens não lidas',
      route: '#/messages',
      accent: stats.unread_messages > 0,
    },
    {
      icon: ICONS.news,
      value: stats.total_flyers,
      label: 'Folhetos',
      route: '#/flyers',
    },
    {
      icon: ICONS.chef,
      value: stats.total_recipes,
      label: 'Receitas',
      route: '#/recipes',
    },
    {
      icon: ICONS.trophy,
      value: stats.total_competitions,
      label: 'Competições',
      route: '#/competitions',
    },
    {
      icon: ICONS.pin,
      value: stats.total_stores,
      label: 'Lojas ativas',
      route: '#/stores',
    },
    {
      icon: ICONS.users,
      value: stats.total_admins,
      label: 'Administradores',
      route: '#/users',
    },
  ];

  el.innerHTML = cards.map((c) => `
    <a href="${c.route}" class="dash-kpi ${c.accent ? 'is-accent' : ''}">
      <span class="dash-kpi-icon">${c.icon}</span>
      <div class="dash-kpi-body">
        <strong>${c.value}</strong>
        <span>${c.label}</span>
      </div>
      <span class="dash-kpi-arrow">${ICONS.arrowRight}</span>
    </a>
  `).join('');
}

function renderNeedsAttention(stats) {
  const el = document.getElementById('needs-attention');
  if (!el) return;

  const items = [];

  if (stats.unread_messages > 0) {
    items.push({
      tone: 'danger',
      icon: ICONS.bell,
      text: `${stats.unread_messages} ${stats.unread_messages === 1 ? 'mensagem por ler' : 'mensagens por ler'}`,
      route: '#/messages',
      cta: 'Ver mensagens',
    });
  }

  if (!items.length) {
    el.hidden = true;
    return;
  }

  el.hidden = false;
  el.innerHTML = `
    <div class="dash-needs-inner">
      ${items.map((item) => `
        <div class="dash-needs-item tone-${item.tone}">
          <span class="dash-needs-icon">${item.icon}</span>
          <span class="dash-needs-text">${escapeHtml(item.text)}</span>
          <a href="${item.route}" class="dash-needs-cta">
            ${escapeHtml(item.cta)}
            ${ICONS.arrowRight}
          </a>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMessages(items) {
  const el = document.getElementById('recent-messages');
  if (!el) return;

  if (!items.length) {
    el.innerHTML = `
      <div class="admin-empty-state">
        <div class="admin-empty-icon">${ICONS.mail}</div>
        <p>Sem mensagens recentes.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <ul class="dash-msg-list">
      ${items.map((m) => `
        <li class="dash-msg ${!m.is_read ? 'is-unread' : ''}">
          <div class="dash-msg-avatar" style="background:${avatarGradient(m.id)}">
            ${escapeHtml((m.first_name || '?').charAt(0).toUpperCase())}${escapeHtml((m.last_name || '').charAt(0).toUpperCase())}
          </div>
          <div class="dash-msg-body">
            <div class="dash-msg-top">
              <strong>${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}</strong>
              <span class="dash-msg-date">${fmtDateTime(m.created_at)}</span>
            </div>
            <span class="dash-msg-subject">${escapeHtml(m.subject)}</span>
          </div>
          ${!m.is_read ? '<span class="dash-msg-dot"></span>' : ''}
        </li>
      `).join('')}
    </ul>
  `;
}

function renderAudit(items) {
  const el = document.getElementById('recent-audit');
  if (!el) return;

  if (!items.length) {
    el.innerHTML = `
      <div class="admin-empty-state">
        <div class="admin-empty-icon">${ICONS.activity}</div>
        <p>Sem atividade recente.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <ul class="dash-audit-list">
      ${items.map((e) => {
        const meta = actionMeta(e.action);
        return `
          <li class="dash-audit tone-${meta.tone}">
            <span class="dash-audit-icon">${meta.icon}</span>
            <div class="dash-audit-body">
              <code class="dash-audit-action">${escapeHtml(e.action)}</code>
              ${e.username ? `<span class="dash-audit-user">por ${escapeHtml(e.username)}</span>` : ''}
            </div>
            <span class="dash-audit-date">${fmtDateTime(e.created_at)}</span>
          </li>
        `;
      }).join('')}
    </ul>
  `;
}

function avatarGradient(seed) {
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
  const idx = Math.abs(seed || 0) % palettes.length;
  const [a, b] = palettes[idx];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
