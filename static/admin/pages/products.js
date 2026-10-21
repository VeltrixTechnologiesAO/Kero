import { apiFetch, toast, openModal, closeModal, confirmDialog, escapeHtml, escapeAttr } from '../shared.js';

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

export default {
  title: 'Produtos',
  render() {
    return `
      <div class="users-panel">
        <div class="admin-panel-head">
          <div class="users-head-left">
            <h2>Produtos</h2>
            <span class="admin-badge-note">Catálogo completo</span>
          </div>
          <button type="button" class="admin-btn admin-btn-primary" id="new-product">
            ${ICONS.plus} Novo produto
          </button>
        </div>

        <div class="users-toolbar">
          <div class="msg-search">
            <span class="msg-search-icon">${ICONS.search}</span>
            <input id="products-search" type="search" placeholder="Pesquisar por nome, marca ou categoria…" />
          </div>
        </div>

        <div class="users-body">
          <div id="products-list" class="users-list"></div>
        </div>
      </div>
    `;
  },

  async mount() {
    const list = document.getElementById('products-list');
    const searchInput = document.getElementById('products-search');
    const newBtn = document.getElementById('new-product');
    if (!list) return null;

    let products = [];
    let search = '';
    let timer = null;

    const load = async () => {
      list.innerHTML = '<div class="admin-loading-inline"><div class="admin-spinner"></div></div>';
      try {
        const data = await apiFetch(`/admin/api/products?search=${encodeURIComponent(search)}`);
        products = data.items || [];
        renderList(list, products);
      } catch (e) {
        list.innerHTML = `<p class="admin-empty">Erro ao carregar: ${escapeHtml(e.message)}</p>`;
      }
    };

    const onSearch = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { search = searchInput.value.trim(); load(); }, 280);
    };

    const onListClick = async (e) => {
      const editBtn = e.target.closest('[data-edit]');
      const delBtn = e.target.closest('[data-del]');
      if (editBtn) {
        const id = Number(editBtn.dataset.edit);
        const p = products.find((x) => x.id === id);
        if (p) openForm(p);
      } else if (delBtn) {
        const id = Number(delBtn.dataset.del);
        const p = products.find((x) => x.id === id);
        if (!p) return;
        const ok = await confirmDialog({
          title: 'Eliminar produto',
          message: `Eliminar "${p.name}"? As promoções associadas também serão removidas.`,
          confirmLabel: 'Eliminar',
          danger: true,
        });
        if (!ok) return;
        try {
          await apiFetch(`/admin/api/products/${id}`, { method: 'DELETE' });
          toast('Produto eliminado', 'success');
          load();
        } catch (err) {
          toast(err.message, 'error');
        }
      }
    };

    const openForm = (product = null) => {
      const isEdit = !!product;
      openModal({
        title: isEdit ? 'Editar produto' : 'Novo produto',
        bodyHtml: `
          <form class="admin-form" id="product-form">
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="p-name">Nome *</label>
                <input id="p-name" name="name" required maxlength="200" value="${escapeAttr(product?.name || '')}" />
              </div>
              <div class="admin-field">
                <label for="p-slug">Slug *</label>
                <input id="p-slug" name="slug" required maxlength="200" value="${escapeAttr(product?.slug || '')}" />
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="p-cat">Categoria *</label>
                <input id="p-cat" name="category" required maxlength="80" value="${escapeAttr(product?.category || '')}" />
              </div>
              <div class="admin-field">
                <label for="p-brand">Marca</label>
                <input id="p-brand" name="brand" maxlength="120" value="${escapeAttr(product?.brand || '')}" />
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-field">
                <label for="p-price">Preço base (AOA) *</label>
                <input id="p-price" name="price" type="number" step="0.01" min="0" required value="${product?.price ?? ''}" />
              </div>
              <div class="admin-field">
                <label for="p-unit">Unidade</label>
                <input id="p-unit" name="unit" maxlength="40" placeholder="un, kg, L…" value="${escapeAttr(product?.unit || 'un')}" />
              </div>
            </div>
            <div class="admin-field">
              <label for="p-img">Imagem (URL)</label>
              <input id="p-img" name="image_url" maxlength="500" value="${escapeAttr(product?.image_url || '')}" placeholder="/static/assets/..." />
            </div>
            <div class="admin-field">
              <label for="p-desc">Descrição</label>
              <textarea id="p-desc" name="description" rows="3" maxlength="2000">${escapeHtml(product?.description || '')}</textarea>
            </div>
            <label class="admin-checkbox">
              <input type="checkbox" name="is_active" ${product?.is_active !== false ? 'checked' : ''} />
              <span>Produto ativo (visível no site)</span>
            </label>
          </form>
        `,
        footerHtml: `
          <button type="button" class="admin-btn" data-close>Cancelar</button>
          <button type="button" class="admin-btn admin-btn-primary" id="save-product">
            ${isEdit ? 'Guardar alterações' : 'Criar produto'}
          </button>
        `,
      });

      const form = document.getElementById('product-form');
      const saveBtn = document.getElementById('save-product');

      // Auto-slug
      const slugInput = form.querySelector('[name="slug"]');
      if (!isEdit) {
        form.querySelector('[name="name"]').addEventListener('input', (e) => {
          if (!slugInput.dataset.touched) {
            slugInput.value = slugify(e.target.value);
          }
        });
        slugInput.addEventListener('input', () => { slugInput.dataset.touched = '1'; });
      }

      saveBtn.addEventListener('click', async () => {
        if (!form.reportValidity()) return;
        const fd = new FormData(form);
        const payload = {
          name: fd.get('name'),
          slug: fd.get('slug'),
          category: fd.get('category'),
          brand: fd.get('brand') || '',
          price: parseFloat(fd.get('price')),
          unit: fd.get('unit') || 'un',
          image_url: fd.get('image_url') || '',
          description: fd.get('description') || '',
          is_active: fd.get('is_active') === 'on',
        };
        saveBtn.disabled = true;
        saveBtn.textContent = 'A guardar…';
        try {
          if (isEdit) {
            await apiFetch(`/admin/api/products/${product.id}`, {
              method: 'PUT',
              body: JSON.stringify(payload),
            });
            toast('Produto atualizado', 'success');
          } else {
            await apiFetch('/admin/api/products', {
              method: 'POST',
              body: JSON.stringify(payload),
            });
            toast('Produto criado', 'success');
          }
          closeModal();
          load();
        } catch (err) {
          toast(err.message, 'error');
          saveBtn.disabled = false;
          saveBtn.textContent = isEdit ? 'Guardar alterações' : 'Criar produto';
        }
      });
    };

    searchInput.addEventListener('input', onSearch);
    newBtn.addEventListener('click', () => openForm(null));
    list.addEventListener('click', onListClick);

    await load();

    return () => {
      if (timer) clearTimeout(timer);
      searchInput.removeEventListener('input', onSearch);
      newBtn.removeEventListener('click', () => openForm(null));
      list.removeEventListener('click', onListClick);
    };
  },
};

function renderList(container, products) {
  if (!products.length) {
    container.innerHTML = '<p class="admin-empty">Sem produtos ainda.</p>';
    return;
  }
  container.innerHTML = products.map((p) => `
    <article class="user-item">
      <div class="user-item-avatar" style="background:linear-gradient(135deg,#00873A,#006229)">
        ${escapeHtml(p.name.slice(0, 2).toUpperCase())}
      </div>
      <div class="user-item-body">
        <div class="user-item-top">
          <div class="user-item-name-line">
            <strong>${escapeHtml(p.name)}</strong>
            ${!p.is_active ? '<span class="admin-pill admin-pill-muted">Inativo</span>' : ''}
            ${p.has_promotion ? '<span class="admin-pill admin-pill-green">Promoção ativa</span>' : ''}
          </div>
        </div>
        <div class="user-item-mid">
          <span class="user-item-username">${escapeHtml(p.slug)}</span>
          <span class="admin-pill">${escapeHtml(p.category)}</span>
          <span class="admin-badge-note">${formatPrice(p.current_price)} / ${escapeHtml(p.unit)}</span>
        </div>
      </div>
      <div class="user-item-actions">
        <button type="button" class="admin-icon-btn" data-edit="${p.id}" title="Editar">${ICONS.edit}</button>
        <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-del="${p.id}" title="Eliminar">${ICONS.trash}</button>
      </div>
    </article>
  `).join('');
}

function slugify(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 200);
}

function formatPrice(v) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(n);
}
