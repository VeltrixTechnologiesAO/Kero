import {
  apiFetch, toast, openModal, closeModal, confirmDialog,
  escapeHtml, escapeAttr, fmtDateTime,
} from '../shared.js';

let current = [];
let canManage = false;
let meId = null;
let state = { search: '', role: 'all', status: 'all' };

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
};

export default {
  title: 'Utilizadores',

  render() {
    return `
      <section class="admin-panel users-panel">
        <header class="admin-panel-head">
          <div class="users-head-left">
            <h2>Utilizadores do painel</h2>
            <span class="admin-badge-note" id="users-count">A carregar…</span>
          </div>
          <button type="button" class="admin-btn admin-btn-primary" id="users-new-btn" hidden>
            ${ICONS.plus}
            Novo utilizador
          </button>
        </header>

        <div class="users-toolbar">
          <div class="msg-search">
            <span class="msg-search-icon">${ICONS.search}</span>
            <input type="search" id="users-search"
                   placeholder="Pesquisar por nome, username ou email…"
                   autocomplete="off" spellcheck="false" />
            <button type="button" id="users-search-clear" class="msg-search-clear" hidden aria-label="Limpar">
              ${ICONS.close}
            </button>
            <kbd class="msg-search-kbd">/</kbd>
          </div>

          <div class="msg-date-filter">
            ${ICONS.shield}
            <select id="users-role">
              <option value="all">Todas as roles</option>
              <option value="superadmin">Superadmins</option>
              <option value="editor">Editores</option>
            </select>
          </div>
        </div>

        <div class="msg-status-filters" id="users-status-filters">
          <button type="button" class="msg-chip is-active" data-status="all">
            Todos <span class="msg-chip-count" data-count="all">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="active">
            Ativos <span class="msg-chip-count" data-count="active">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="inactive">
            Inativos <span class="msg-chip-count" data-count="inactive">0</span>
          </button>
          <button type="button" class="msg-chip" data-status="locked">
            Bloqueados <span class="msg-chip-count" data-count="locked">0</span>
          </button>
        </div>

        <div id="users-body" class="users-body">
          <div class="admin-loading"><div class="admin-spinner"></div></div>
        </div>
      </section>
    `;
  },

  async mount() {
    const body = document.getElementById('users-body');
    const count = document.getElementById('users-count');
    const newBtn = document.getElementById('users-new-btn');
    const searchInput = document.getElementById('users-search');
    const searchClear = document.getElementById('users-search-clear');
    const roleSelect = document.getElementById('users-role');
    const statusFilters = document.getElementById('users-status-filters');

    let searchTimer = null;

    state = { search: '', role: 'all', status: 'all' };
    searchInput.value = '';
    searchClear.hidden = true;
    roleSelect.value = 'all';

    const load = async () => {
      try {
        const data = await apiFetch('/admin/api/users');
        current = data.items || [];
        canManage = data.can_manage;
        meId = data.me_id;
        newBtn.hidden = !canManage;
        render();
      } catch (e) {
        body.innerHTML = `
          <div class="admin-empty-state">
            <div class="admin-empty-icon">${ICONS.users}</div>
            <p>${escapeHtml(e.message)}</p>
          </div>`;
      }
    };

    const applyFilters = () => {
      let items = [...current];

      if (state.role !== 'all') items = items.filter((u) => u.role === state.role);

      if (state.status === 'active') items = items.filter((u) => u.is_active && !u.is_locked);
      else if (state.status === 'inactive') items = items.filter((u) => !u.is_active);
      else if (state.status === 'locked') items = items.filter((u) => u.is_locked);

      if (state.search) {
        const q = state.search.toLowerCase();
        items = items.filter((u) =>
          (u.username || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.display_name || '').toLowerCase().includes(q)
        );
      }

      return items;
    };

    const render = () => {
      const counts = {
        all: current.length,
        active: current.filter((u) => u.is_active && !u.is_locked).length,
        inactive: current.filter((u) => !u.is_active).length,
        locked: current.filter((u) => u.is_locked).length,
      };

      document.querySelectorAll('#users-status-filters .msg-chip-count').forEach((el) => {
        const key = el.dataset.count;
        el.textContent = String(counts[key] ?? 0);
        el.classList.toggle('is-zero', (counts[key] ?? 0) === 0);
      });

      const items = applyFilters();
      count.textContent = items.length === current.length
        ? `${current.length} utilizador(es)`
        : `${items.length} de ${current.length} utilizador(es)`;

      renderList(body, items, meId, canManage);
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

    const onRoleChange = () => {
      state.role = roleSelect.value;
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

    const onAction = async (e) => {
      const editBtn = e.target.closest('[data-edit]');
      if (editBtn) {
        e.stopPropagation();
        const u = current.find((x) => x.id === Number(editBtn.dataset.edit));
        if (u) return openEdit(u, meId, canManage, load);
      }

      const pwBtn = e.target.closest('[data-reset-pw]');
      if (pwBtn) {
        e.stopPropagation();
        const u = current.find((x) => x.id === Number(pwBtn.dataset.resetPw));
        if (u) return openResetPassword(u, load);
      }

      const delBtn = e.target.closest('[data-delete]');
      if (delBtn) {
        e.stopPropagation();
        const id = Number(delBtn.dataset.delete);
        const u = current.find((x) => x.id === id);
        if (!u) return;
        const ok = await confirmDialog({
          title: 'Eliminar utilizador',
          message: `Eliminar "${u.display_name}" (@${u.username})? Esta ação é permanente.`,
          confirmLabel: 'Eliminar',
          danger: true,
        });
        if (!ok) return;
        try {
          await apiFetch(`/admin/api/users/${id}`, { method: 'DELETE' });
          toast('Utilizador eliminado');
          load();
        } catch (err) { toast(err.message, 'error'); }
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
    roleSelect.addEventListener('change', onRoleChange);
    statusFilters.addEventListener('click', onStatusFilter);
    body.addEventListener('click', onAction);
    newBtn.addEventListener('click', onNew);
    document.addEventListener('keydown', onKeyDown);

    await load();

    return () => {
      if (searchTimer) clearTimeout(searchTimer);
      searchInput.removeEventListener('input', onSearchInput);
      searchClear.removeEventListener('click', onSearchClear);
      roleSelect.removeEventListener('change', onRoleChange);
      statusFilters.removeEventListener('click', onStatusFilter);
      body.removeEventListener('click', onAction);
      newBtn.removeEventListener('click', onNew);
      document.removeEventListener('keydown', onKeyDown);
    };
  },
};

function renderList(container, items, meId, canManage) {
  if (!items.length) {
    container.innerHTML = `
      <div class="admin-empty-state">
        <div class="admin-empty-icon">${ICONS.users}</div>
        <p>Nenhum utilizador encontrado.</p>
        <small>Ajuste os filtros ou a pesquisa.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="users-list">
      ${items.map((u) => {
        const isSelf = u.id === meId;
        const status = !u.is_active
          ? { label: 'Inativo', cls: 'admin-pill-muted' }
          : u.is_locked
            ? { label: 'Bloqueado', cls: 'admin-pill-red' }
            : { label: 'Ativo', cls: 'admin-pill-green' };

        return `
          <article class="user-item ${!u.is_active ? 'is-inactive' : ''}">
            <div class="user-item-avatar" style="background:${avatarGradient(u.username)}">
              ${escapeHtml(initials(u))}
            </div>

            <div class="user-item-body">
              <div class="user-item-top">
                <div class="user-item-name-line">
                  <strong>${escapeHtml(u.display_name)}</strong>
                  ${isSelf ? '<span class="user-self-badge">você</span>' : ''}
                </div>
                <span class="user-item-lastlogin">${fmtDateTime(u.last_login_at)}</span>
              </div>

              <div class="user-item-mid">
                <span class="user-item-username">@${escapeHtml(u.username)}</span>
                ${u.role === 'superadmin'
                  ? `<span class="admin-pill admin-pill-red user-role-pill">${ICONS.shield}Superadmin</span>`
                  : `<span class="admin-pill user-role-pill">${ICONS.user}Editor</span>`}
                <span class="admin-pill ${status.cls}">${status.label}</span>
              </div>

              <div class="user-item-meta">
                <span class="user-item-meta-item">
                  ${ICONS.mail}
                  ${escapeHtml(u.email)}
                </span>
                ${u.last_login_ip ? `
                  <span class="user-item-meta-item">
                    ${ICONS.pin}
                    ${escapeHtml(u.last_login_ip)}
                  </span>
                ` : ''}
              </div>
            </div>

            <div class="user-item-actions">
              ${canManage || isSelf ? `
                <button class="admin-icon-btn" title="Editar" data-edit="${u.id}">
                  ${ICONS.edit}
                </button>
              ` : ''}
              ${canManage || isSelf ? `
                <button class="admin-icon-btn" title="Repor password" data-reset-pw="${u.id}">
                  ${ICONS.key}
                </button>
              ` : ''}
              ${canManage && !isSelf ? `
                <button class="admin-icon-btn admin-icon-btn-danger" title="Eliminar" data-delete="${u.id}">
                  ${ICONS.trash}
                </button>
              ` : ''}
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function openCreate(onSaved) {
  openModal({
    title: 'Novo utilizador',
    bodyHtml: `
      <form id="new-user" class="admin-form">
        <div class="admin-form-row">
          <div class="admin-field">
            <label>Username *</label>
            <input name="username" required minlength="3" maxlength="60"
                   placeholder="ex: joao.silva" autocomplete="off">
          </div>
          <div class="admin-field">
            <label>Nome a mostrar *</label>
            <input name="display_name" required maxlength="120"
                   placeholder="ex: João Silva" autocomplete="off">
          </div>
        </div>

        <div class="admin-field">
          <label>Email *</label>
          <input name="email" type="email" required
                 placeholder="joao@kero.co.ao" autocomplete="off">
        </div>

        <div class="admin-field">
          <label>Password * (mín. 10 caracteres)</label>
          <input name="password" type="password" required minlength="10"
                 autocomplete="new-password">
        </div>

        <div class="admin-field">
          <label>Role *</label>
          <select name="role">
            <option value="editor">Editor — gere conteúdo</option>
            <option value="superadmin">Superadmin — acesso total</option>
          </select>
        </div>
      </form>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Criar utilizador</button>
    `,
  });

  const form = document.getElementById('new-user');
  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const fd = new FormData(form);
    const payload = {
      username: (fd.get('username') || '').trim().toLowerCase(),
      email: (fd.get('email') || '').trim().toLowerCase(),
      display_name: (fd.get('display_name') || '').trim(),
      password: fd.get('password'),
      role: fd.get('role'),
    };

    saveBtn.disabled = true;
    const original = saveBtn.innerHTML;
    saveBtn.textContent = 'A criar…';

    try {
      await apiFetch('/admin/api/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast('Utilizador criado');
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

function openEdit(u, meId, canManage, onSaved) {
  const isSelf = u.id === meId;

  openModal({
    title: `Editar — ${u.display_name}`,
    bodyHtml: `
      <div class="user-edit-header">
        <div class="user-item-avatar" style="background:${avatarGradient(u.username)}">
          ${escapeHtml(initials(u))}
        </div>
        <div>
          <strong>@${escapeHtml(u.username)}</strong>
          <span>Criado em ${fmtDateTime(u.created_at)}</span>
        </div>
      </div>

      <form id="edit-user" class="admin-form">
        <div class="admin-field">
          <label>Email *</label>
          <input name="email" type="email" value="${escapeAttr(u.email)}" required>
        </div>

        <div class="admin-field">
          <label>Nome a mostrar *</label>
          <input name="display_name" value="${escapeAttr(u.display_name)}" required maxlength="120">
        </div>

        ${canManage ? `
          <div class="admin-field">
            <label>Role</label>
            <select name="role" ${isSelf ? 'disabled' : ''}>
              <option value="editor" ${u.role === 'editor' ? 'selected' : ''}>Editor</option>
              <option value="superadmin" ${u.role === 'superadmin' ? 'selected' : ''}>Superadmin</option>
            </select>
            ${isSelf ? '<small class="admin-field-hint">Não pode alterar a sua própria role.</small>' : ''}
          </div>
        ` : ''}

        ${canManage && !isSelf ? `
          <label class="admin-checkbox">
            <input type="checkbox" name="is_active" ${u.is_active ? 'checked' : ''}>
            Conta ativa
          </label>
        ` : ''}
      </form>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Guardar alterações</button>
    `,
  });

  const form = document.getElementById('edit-user');
  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const fd = new FormData(form);
    const payload = {
      email: (fd.get('email') || '').trim().toLowerCase(),
      display_name: (fd.get('display_name') || '').trim(),
    };

    if (canManage && !isSelf) {
      payload.role = fd.get('role');
      payload.is_active = fd.get('is_active') === 'on';
    }

    saveBtn.disabled = true;
    const original = saveBtn.innerHTML;
    saveBtn.textContent = 'A guardar…';

    try {
      await apiFetch(`/admin/api/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      toast('Utilizador atualizado');
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

function openResetPassword(u, onSaved) {
  openModal({
    title: `Repor password — ${u.display_name}`,
    bodyHtml: `
      <div class="admin-alert admin-alert-info" style="margin-bottom:1.25rem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        Todas as sessões ativas deste utilizador serão encerradas.
      </div>

      <form id="reset-pw" class="admin-form">
        <div class="admin-field">
          <label>Nova password * (mín. 10 caracteres)</label>
          <input name="new_password" type="password" required minlength="10"
                 autocomplete="new-password" autofocus>
        </div>
      </form>
    `,
    footerHtml: `
      <button type="button" class="admin-btn" data-close>Cancelar</button>
      <button type="button" class="admin-btn admin-btn-primary" data-save>Repor password</button>
    `,
  });

  const form = document.getElementById('reset-pw');
  const saveBtn = document.querySelector('#admin-modal-foot [data-save]');

  const onSave = async () => {
    if (!form.reportValidity()) return;

    const fd = new FormData(form);

    saveBtn.disabled = true;
    const original = saveBtn.innerHTML;
    saveBtn.textContent = 'A repor…';

    try {
      await apiFetch(`/admin/api/users/${u.id}/password`, {
        method: 'POST',
        body: JSON.stringify({ new_password: fd.get('new_password') }),
      });
      toast('Password reposta');
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

function initials(u) {
  const name = (u.display_name || u.username || '?').trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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
  let hash = 0;
  const s = seed || '';
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  const [a, b] = palettes[Math.abs(hash) % palettes.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
