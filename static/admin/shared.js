import { getCsrfToken } from './router.js';


export async function apiFetch(url, options = {}) {
  const opts = { ...options, headers: { ...(options.headers || {}) } };

  if (opts.method && opts.method !== 'GET') {
    opts.headers['X-CSRF-Token'] = getCsrfToken();
  }

  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  if (opts.body && !isFormData && !opts.headers['Content-Type']) {
    opts.headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, opts);

  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Sessão expirada');
  }

  let data = null;
  try { data = await res.json(); } catch (_) { /* resposta vazia */ }

  if (!res.ok) {
    const detail = (data && data.detail) || `Erro ${res.status}`;
    const err = new Error(typeof detail === 'string' ? detail : 'Erro inesperado');
    err.status = res.status;
    throw err;
  }

  return data;
}


let toastContainer = null;

function ensureToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.className = 'admin-toasts';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function toast(message, type = 'success', timeout = 3500) {
  const c = ensureToastContainer();
  const el = document.createElement('div');
  el.className = `admin-toast is-${type}`;
  el.textContent = message;
  c.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 250);
  }, timeout);
}


let modalRoot = null;
let modalKeyHandler = null;

function ensureModalRoot() {
  if (modalRoot) return modalRoot;

  modalRoot = document.createElement('div');
  modalRoot.className = 'admin-modal-root';
  modalRoot.hidden = true;
  modalRoot.innerHTML = `
    <div class="admin-modal-overlay" data-close></div>
    <div class="admin-modal" role="dialog" aria-modal="true">
      <header class="admin-modal-head">
        <h3 id="admin-modal-title"></h3>
        <button type="button" class="admin-modal-close" aria-label="Fechar" data-close>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </header>
      <div class="admin-modal-body" id="admin-modal-body"></div>
      <footer class="admin-modal-foot" id="admin-modal-foot"></footer>
    </div>
  `;
  document.body.appendChild(modalRoot);

  modalRoot.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      e.preventDefault();
      closeModal();
    }
  });

  modalKeyHandler = (e) => {
    if (e.key === 'Escape' && !modalRoot.hidden) closeModal();
  };
  document.addEventListener('keydown', modalKeyHandler);

  return modalRoot;
}

export function openModal({ title, bodyHtml, footerHtml = '' }) {
  const root = ensureModalRoot();
  root.querySelector('#admin-modal-title').textContent = title;
  root.querySelector('#admin-modal-body').innerHTML = bodyHtml;
  root.querySelector('#admin-modal-foot').innerHTML = footerHtml;
  root.hidden = false;
  document.body.classList.add('modal-open');

  const firstFocusable = root.querySelector(
    'input, textarea, select, button.admin-btn, [data-close]'
  );
  if (firstFocusable) {
    setTimeout(() => firstFocusable.focus(), 50);
  }
}

export function closeModal() {
  if (!modalRoot || modalRoot.hidden) return;

  if (modalRoot._resolveConfirm) {
    const resolve = modalRoot._resolveConfirm;
    modalRoot._resolveConfirm = null;
    resolve(false);
  }

  modalRoot.hidden = true;
  document.body.classList.remove('modal-open');

  modalRoot.querySelector('#admin-modal-body').innerHTML = '';
  modalRoot.querySelector('#admin-modal-foot').innerHTML = '';
}

export function confirmDialog({
  title = 'Confirmar',
  message = 'Tem a certeza?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();
    root._resolveConfirm = resolve;

    root.querySelector('#admin-modal-title').textContent = title;
    root.querySelector('#admin-modal-body').innerHTML = `
      <p class="admin-modal-text">${escapeHtml(message)}</p>
    `;
    root.querySelector('#admin-modal-foot').innerHTML = `
      <button type="button" class="admin-btn" data-cancel>${escapeHtml(cancelLabel)}</button>
      <button type="button" class="admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}" data-confirm>
        ${escapeHtml(confirmLabel)}
      </button>
    `;
    root.hidden = false;
    document.body.classList.add('modal-open');

    // Handlers one-shot para confirm/cancel
    const onConfirm = () => {
      root._resolveConfirm = null;
      closeModal();
      resolve(true);
    };
    const onCancel = () => {
      root._resolveConfirm = null;
      closeModal();
      resolve(false);
    };

    const confirmBtn = root.querySelector('[data-confirm]');
    const cancelBtn = root.querySelector('[data-cancel]');

    confirmBtn.addEventListener('click', onConfirm, { once: true });
    cancelBtn.addEventListener('click', onCancel, { once: true });

    setTimeout(() => cancelBtn.focus(), 50);
  });
}

export function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[ch]);
}

export function escapeAttr(v) {
  return escapeHtml(v);
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function setupImagePreview(inputEl, previewEl, maxSizeMb = 10) {
  if (!inputEl || !previewEl) return;

  inputEl.addEventListener('change', () => {
    const file = inputEl.files?.[0];
    if (!file) {
      previewEl.innerHTML = '';
      previewEl.hidden = true;
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      toast(`Imagem maior que ${maxSizeMb} MB`, 'error');
      inputEl.value = '';
      previewEl.innerHTML = '';
      previewEl.hidden = true;
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast('Ficheiro tem de ser uma imagem', 'error');
      inputEl.value = '';
      previewEl.innerHTML = '';
      previewEl.hidden = true;
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      previewEl.innerHTML = `
        <img src="${ev.target.result}" alt="" />
        <div class="admin-upload-meta">
          <strong>${escapeHtml(file.name)}</strong>
          <span>${(file.size / 1024).toFixed(1)} KB</span>
        </div>
      `;
      previewEl.hidden = false;
    };
    reader.readAsDataURL(file);
  });
}

export function secureConfirmDialog({
  title = 'Confirmar ação sensível',
  message = '',
  detailsHtml = '',
  confirmWord = 'ELIMINAR',
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  danger = true,
} = {}) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();
    root._resolveConfirm = resolve;

    root.querySelector('#admin-modal-title').textContent = title;
    root.querySelector('#admin-modal-body').innerHTML = `
      <div class="secure-confirm">
        <div class="secure-confirm-warn">
          <span class="secure-confirm-warn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </span>
          <div>
            <strong>Atenção</strong>
            <p>${escapeHtml(message || 'Esta ação é permanente e não pode ser desfeita.')}</p>
          </div>
        </div>

        ${detailsHtml ? `<div class="secure-confirm-details">${detailsHtml}</div>` : ''}

        <div class="secure-confirm-field">
          <label for="secure-confirm-input">
            Para confirmar, escreva <strong>${escapeHtml(confirmWord)}</strong>:
          </label>
          <input id="secure-confirm-input" type="text" autocomplete="off"
                 spellcheck="false" autocapitalize="off"
                 placeholder="${escapeHtml(confirmWord)}" />
        </div>
      </div>
    `;
    root.querySelector('#admin-modal-foot').innerHTML = `
      <button type="button" class="admin-btn" data-cancel>${escapeHtml(cancelLabel)}</button>
      <button type="button" class="admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}" data-confirm disabled>
        ${escapeHtml(confirmLabel)}
      </button>
    `;
    root.hidden = false;
    document.body.classList.add('modal-open');

    const input = root.querySelector('#secure-confirm-input');
    const confirmBtn = root.querySelector('[data-confirm]');
    const cancelBtn = root.querySelector('[data-cancel]');

    const checkMatch = () => {
      const ok = input.value.trim().toUpperCase() === confirmWord.toUpperCase();
      confirmBtn.disabled = !ok;
    };

    const onConfirm = () => {
      if (confirmBtn.disabled) return;
      root._resolveConfirm = null;
      closeModal();
      resolve(true);
    };

    const onCancel = () => {
      root._resolveConfirm = null;
      closeModal();
      resolve(false);
    };

    const onKey = (e) => {
      if (e.key === 'Enter' && !confirmBtn.disabled) {
        e.preventDefault();
        onConfirm();
      }
    };

    input.addEventListener('input', checkMatch);
    input.addEventListener('keydown', onKey);
    confirmBtn.addEventListener('click', onConfirm, { once: true });
    cancelBtn.addEventListener('click', onCancel, { once: true });

    setTimeout(() => input.focus(), 80);
  });
}
