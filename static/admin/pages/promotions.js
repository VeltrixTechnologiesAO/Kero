import { apiFetch, toast, openModal, closeModal, confirmDialog, escapeHtml, escapeAttr, fmtDate } from '../shared.js';

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
};

export default {
  title: 'Promoções',
  render() {
    return `
      <div class="flyers-panel">
        <div class="admin-panel-head">
          <div class="flyers-head-left">
            <h2>Promoções</h2>
            <span class="admin-badge-note">Produtos específicos ou campanhas gerais</span>
          </div>
          <button type="button" class="admin-btn admin-btn-primary" id="new-promo">
            ${ICONS.plus} Nova promoção
          </button>
        </div>

        <div class="users-toolbar" style="grid-template-columns:1fr auto">
          <div class="admin-filters" id="promo-filter">
            <button class="admin-filter-btn is-active" data-kind="">Todas</button>
            <button class="admin-filter-btn" data-kind="product">Produto</button>
            <button class="admin-filter-btn" data-kind="general">Geral</button>
          </div>
        </div>

        <div class="flyers-body">
          <div id="promo-list" class="flyer-admin-grid"></div>
        </div>
      </div>
    `;
  },

  async mount() {
    const list = document.getElementById('promo-list');
    const newBtn = document.getElementById('new-promo');
    const filters = document.getElementById('promo-filter');
    if (!list) return null;

    let promos = [];
    let kind = '';

    const load = async () => {
      list.innerHTML = '<div class="admin-loading-inline"><div class="admin-spinner"></div></div>';
      try {
        const data = await apiFetch(`/admin/api/promotions?kind=${kind}`);
        promos = data.items || [];
        renderList(list, promos);
      } catch (e) {
        list.innerHTML = `<p class="admin-empty">Erro: ${escapeHtml(e.message)}</p>`;
      }
    };

    const onFilter = (e) => {
      const btn = e.target.closest('[data-kind]');
      if (!btn) return;
      kind = btn.dataset.kind || '';
      filters.querySelectorAll('.admin-filter-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      load();
    };

    const onListClick = async (e) => {
      const editBtn = e.target.closest('[data-edit]');
      const delBtn = e.target.closest('[data-del]');
      if (editBtn) {
        const p = promos.find((x) => x.id === Number(editBtn.dataset.edit));
        if (p) openForm(p);
      } else if (delBtn) {
        const p = promos.find((x) => x.id === Number(delBtn.dataset.del));
        if (!p) return;
        const ok = await confirmDialog({
          title: 'Eliminar promoção',
          message: `Eliminar "${p.title}"?`,
          confirmLabel: 'Eliminar',
          danger: true,
        });
        if (!ok) return;
        try {
          await apiFetch(`/admin/api/promotions/${p.id}`, { method: 'DELETE' });
          toast('Promoção eliminada', 'success');
          load();
        } catch (err) { toast(err.message, 'error'); }
      }
    };

    const openForm = async (promo = null) => {
      const isEdit = !!promo;

      // Precisamos da lista de produtos para o select
      let products = [];
      try {
        const res = await apiFetch('/admin/api/products?search=');
        products = res.items || [];
      } catch (_) {}

      const productOptions = products.map((p) =>
        `<option value="${p.id}" ${promo?.product_id === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
      ).join('');

      openModal({
        title: isEdit ? 'Editar promoção' : 'Nova promoção',
        bodyHtml: `
          <form class="admin-form" id="promo-form">
            <div class="admin-field">
              <label for="pr-title">Título *</label>
              <input id="pr-title" name="title" required maxlength="200" value="${escapeAttr(promo?.title || '')}" />
            </div>
            <div class="admin-field">
              <label for="pr-desc">Descrição</label>
              <textarea id="pr-desc" name="description" rows="2" maxlength="1000">${escapeHtml(promo?.description || '')}</textarea>
            </div>

            <div class="admin-form-row">
              <div class="admin-field">
                <label for="pr-kind">Tipo *</label>
                <select id="pr-kind" name="kind" required>
                  <option value="product" ${promo?.kind === 'product' || !promo ? 'selected' : ''}>Produto específico</option>
                  <option value="general" ${promo?.kind === 'general' ? 'selected' : ''}>Campanha geral</option>
                </select>
              </div>
              <div class="admin-field" id="pr-product-wrap">
                <label for="pr-product">Produto *</label>
                <select id="pr-product" name="product_id">
                  <option value="">— Escolher —</option>
                  ${productOptions}
                </select>
              </div>
            </div>

            <div class="admin-form-row">
              <div class="admin-field">
                <label for="pr-discount">Desconto (%)</label>
                <input id="pr-discount" name="discount_percent" type="number" min="1" max="100" value="${promo?.discount_percent ?? ''}" />
              </div>
              <div class="admin-field">
                <label for="pr-price">Preço promocional (AOA)</label>
                <input id="pr-price" name="promo_price" type="number" step="0.01" min="0" value="${promo?.promo_price ?? ''}" />
              </div>
            </div>

            <div class="admin-form-row">
              <div class="admin-field">
                <label for="pr-start">Data de início *</label>
                <input id="pr-start" name="start_date" type="date" required value="${promo?.start_date || ''}" />
              </div>
              <div class="admin-field">
                <label for="pr-end">Data de fim *</label>
                <input id="pr-end" name="end_date" type="date" required value="${promo?.end_date || ''}" />
              </div>
            </div>

            <div class="admin-field">
              <label for="pr-image">Imagem (URL)</label>
              <input id="pr-image" name="image_url" maxlength="500" value="${escapeAttr(promo?.image_url || '')}" />
            </div>

            <div class="admin-checkbox-group">
              <label class="admin-checkbox">
                <input type="checkbox" name="is_featured" ${promo?.is_featured ? 'checked' : ''} />
                <span>Destacar (aparece em primeiro)</span>
              </label>
              <label class="admin-checkbox">
                <input type="checkbox" name="is_active" ${promo?.is_active !== false ? 'checked' : ''} />
                <span>Ativa</span>
              </label>
            </div>

            <div class="admin-field-hint">Preenche desconto (%) OU preço promocional. Se ambos vazios, apenas aparece como campanha informativa.</div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="admin-btn" data-close>Cancelar</button>
          <button type="button" class="admin-btn admin-btn-primary" id="save-promo">
            ${isEdit ? 'Guardar alterações' : 'Criar promoção'}
          </button>
        `,
      });

      const form = document.getElementById('promo-form');
      const saveBtn = document.getElementById('save-promo');
      const kindSel = form.querySelector('[name="kind"]');
      const productWrap = document.getElementById('pr-product-wrap');
      const productSel = form.querySelector('[name="product_id"]');

      const syncKind = () => {
        const isGeneral = kindSel.value === 'general';
        productWrap.style.display = isGeneral ? 'none' : '';
        if (isGeneral) productSel.value = '';
      };
      kindSel.addEventListener('change', syncKind);
      syncKind();

      saveBtn.addEventListener('click', async () => {
        if (!form.reportValidity()) return;
        const fd = new FormData(form);
        const discount = fd.get('discount_percent');
        const promoPrice = fd.get('promo_price');
        const payload = {
          title: fd.get('title'),
          description: fd.get('description') || '',
          kind: fd.get('kind'),
          product_id: fd.get('product_id') ? Number(fd.get('product_id')) : null,
          discount_percent: discount ? Number(discount) : null,
          promo_price: promoPrice ? Number(promoPrice) : null,
          start_date: fd.get('start_date'),
          end_date: fd.get('end_date'),
          image_url: fd.get('image_url') || '',
          is_featured: fd.get('is_featured') === 'on',
          is_active: fd.get('is_active') === 'on',
        };
        saveBtn.disabled = true;
        saveBtn.textContent = 'A guardar…';
        try {
          if (isEdit) {
            await apiFetch(`/admin/api/promotions/${promo.id}`, {
              method: 'PUT', body: JSON.stringify(payload),
            });
            toast('Promoção atualizada', 'success');
          } else {
            await apiFetch('/admin/api/promotions', {
              method: 'POST', body: JSON.stringify(payload),
            });
            toast('Promoção criada', 'success');
          }
          closeModal();
          load();
        } catch (err) {
          toast(err.message, 'error');
          saveBtn.disabled = false;
          saveBtn.textContent = isEdit ? 'Guardar alterações' : 'Criar promoção';
        }
      });
    };

    filters.addEventListener('click', onFilter);
    newBtn.addEventListener('click', () => openForm(null));
    list.addEventListener('click', onListClick);

    await load();

    return () => {
      filters.removeEventListener('click', onFilter);
      list.removeEventListener('click', onListClick);
    };
  },
};

function renderList(container, promos) {
  if (!promos.length) {
    container.innerHTML = '<p class="admin-empty">Sem promoções ainda.</p>';
    return;
  }
  container.innerHTML = promos.map((p) => {
    const discount = p.discount_percent ? `-${p.discount_percent}%` : '—';
    const statusPill = p.is_current
      ? '<span class="admin-pill admin-pill-green">Ativa</span>'
      : p.is_active
        ? '<span class="admin-pill">Agendada</span>'
        : '<span class="admin-pill admin-pill-muted">Inativa</span>';

    return `
      <article class="flyer-admin-card">
        <div class="flyer-admin-media">
          ${p.image_url ? `<img src="${escapeAttr(p.image_url)}" alt="" loading="lazy" />` : ''}
          <div class="flyer-admin-status">${statusPill}</div>
        </div>
        <div class="flyer-admin-body">
          <span class="flyer-admin-region">${p.kind === 'general' ? 'Campanha' : 'Produto'}</span>
          <h3>${escapeHtml(p.title)}</h3>
          ${p.product_name ? `<div class="flyer-admin-store">${escapeHtml(p.product_name)}</div>` : ''}
          <div class="flyer-admin-dates">
            ${ICONS.calendar}
            <span>${fmtDate(p.start_date)} — ${fmtDate(p.end_date)}</span>
          </div>
          <span class="flyer-days-badge ${p.days_remaining <= 3 ? 'is-urgent' : ''}">${discount} · ${p.days_remaining}d</span>
        </div>
        <div class="flyer-admin-foot">
          <button type="button" class="admin-icon-btn" data-edit="${p.id}">${ICONS.edit}</button>
          <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-del="${p.id}">${ICONS.trash}</button>
        </div>
      </article>
    `;
  }).join('');
}
