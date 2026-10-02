/**
 * admin.js - Painel Admin Completo — Loja de Roupas
 * Controle total: produtos, variantes, estoque, pedidos, categorias, configurações
 */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // ===== STATE =====
  let currentSection = 'dashboard';
  let editingProductId = null;
  let editingCategoryId = null;
  let productImageData = null;
  let currentOrderFilter = 'all';
  let confirmCallback = null;
  let variantList = []; // [{color, colorHex, sizes: {PP:0, P:0, ...}}]
  let igPostsList = []; // Manual Instagram posts manager

  // ===== 1. LOGIN =====
  async function initLogin() {
    const loginModal = $('login-modal');
    const btnLogout = $('btn-logout');

    if (window.SupabaseService) await window.SupabaseService.init();

    const isSupabaseAuth = window.SupabaseService ? await window.SupabaseService.isAuthenticated() : false;
    const isLocalAuth = sessionStorage.getItem('fashion_admin_logged') === 'true';

    if (isSupabaseAuth || isLocalAuth) {
      loginModal.classList.remove('active');
      await initAdmin();
    } else {
      await DataStore.init({ enableRealtime: false, isAdmin: false });
      loginModal.classList.add('active');
    }

    $('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const email = $('login-email') ? $('login-email').value.trim() : 'admin@loja.com';
      const password = $('login-password').value;
      const submitBtn = $('btn-login-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Verificando...'; }

      try {
        if (window.SupabaseService && window.SupabaseService.isConfigured()) {
          const { data, error } = await window.SupabaseService.signIn(email, password);
          if (!error && data && data.user) {
            sessionStorage.setItem('fashion_admin_logged', 'true');
            loginModal.classList.remove('active');
            await initAdmin();
            Utils.showToast(`Bem-vindo, ${data.user.email}!`, 'success');
            return;
          }
        }

        const settings = DataStore.getSettings();
        const inputHash = await Utils.hashPassword(password);
        if (inputHash === settings.adminPassword || password === settings.adminPassword) {
          sessionStorage.setItem('fashion_admin_logged', 'true');
          loginModal.classList.remove('active');
          await initAdmin();
          Utils.showToast('Login efetuado com sucesso!', 'success');
        } else {
          Utils.showToast('Senha incorreta!', 'error');
        }
      } catch (err) {
        Utils.showToast('Erro ao fazer login: ' + (err.message || ''), 'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Entrar no Painel'; }
      }
    });

    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        if (window.SupabaseService) await window.SupabaseService.signOut();
        sessionStorage.removeItem('fashion_admin_logged');
        loginModal.classList.add('active');
        Utils.showToast('Sessão encerrada.', 'info');
      });
    }
  }

  // ===== 2. INIT ADMIN =====
  async function initAdmin() {
    await DataStore.init({ enableRealtime: true, isAdmin: true });
    const settings = DataStore.getSettings();

    // Apply branding to sidebar
    if ($('admin-brand-icon')) $('admin-brand-icon').textContent = settings.storeLogoEmoji || '⚡';
    if ($('admin-brand-title')) $('admin-brand-title').textContent = settings.storeName || 'Fit Vibe Activewear';

    // Nav click
    $$('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        $$('.admin-nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        navigateTo(item.dataset.section);
        // Close mobile sidebar
        $('admin-sidebar').classList.remove('open');
      });
    });

    // Mobile toggle
    const mobileToggle = $('admin-mobile-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        $('admin-sidebar').classList.toggle('open');
      });
    }

    // Global modals
    bindGlobalModals();

    // Pre-initialize configuration sections so DOM values are loaded
    renderDelivery();
    renderVisual();
    renderPayments();

    // Open dashboard
    navigateTo('dashboard');

    // Listen to real-time orders update
    document.addEventListener('orders-updated', () => {
      if (currentSection === 'dashboard') renderDashboard();
      if (currentSection === 'orders') renderOrders();
    });
  }

  function navigateTo(section) {
    currentSection = section;
    $$('.admin-section').forEach(s => s.classList.remove('active'));
    const el = $(`section-${section}`);
    if (el) el.classList.add('active');

    const renderers = {
      dashboard: renderDashboard,
      products: renderProducts,
      stock: renderStock,
      categories: renderCategories,
      orders: renderOrders,
      delivery: renderDelivery,
      payments: renderPayments,
      schedule: renderSchedule,
      visual: renderVisual,
      sizes: renderSizes,
      security: renderSecurity
    };
    if (renderers[section]) renderers[section]();
  }

  // ===== 3. DASHBOARD =====
  function renderDashboard() {
    const products = DataStore.getProducts({ includeInactive: true });
    const orders = DataStore.getOrders();
    const settings = DataStore.getSettings();
    const totalRevenue = orders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0);
    const activeProducts = products.filter(p => p.active).length;

    // Stats
    const statsEl = $('admin-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card"><div class="stat-card-icon">📋</div><div class="stat-card-value">${orders.length}</div><div class="stat-card-label">Total de Pedidos</div></div>
        <div class="stat-card"><div class="stat-card-icon">💰</div><div class="stat-card-value">${Utils.formatCurrency(totalRevenue)}</div><div class="stat-card-label">Receita Total</div></div>
        <div class="stat-card"><div class="stat-card-icon">👗</div><div class="stat-card-value">${activeProducts}</div><div class="stat-card-label">Produtos Ativos</div></div>
        <div class="stat-card"><div class="stat-card-icon">🆕</div><div class="stat-card-value">${orders.filter(o => o.status === 'novo').length}</div><div class="stat-card-label">Pedidos Novos</div></div>`;
    }

    // Store toggle
    const toggle = $('dash-store-toggle');
    const badge = $('dash-store-state-badge');
    if (toggle) {
      toggle.checked = settings.storeOpen;
      if (badge) { badge.textContent = settings.storeOpen ? 'ABERTA' : 'FECHADA'; badge.className = `status-badge ${settings.storeOpen ? 'active' : 'inactive'}`; }
      toggle.onchange = async () => {
        await DataStore.updateSetting('storeOpen', toggle.checked);
        if (badge) { badge.textContent = toggle.checked ? 'ABERTA' : 'FECHADA'; badge.className = `status-badge ${toggle.checked ? 'active' : 'inactive'}`; }
        Utils.showToast(toggle.checked ? 'Loja aberta!' : 'Loja fechada!', 'info');
      };
    }

    // Stock alerts (qty <= 3)
    const alerts = [];
    products.filter(p => p.active).forEach(p => {
      (p.variants || []).forEach(v => {
        (v.sizes || []).forEach(s => {
          if (s.qty <= 3 && s.qty >= 0) {
            alerts.push({ product: p.name, color: v.color, size: s.size, qty: s.qty });
          }
        });
      });
    });

    const alertsCard = $('dash-stock-alerts-card');
    const alertsEl = $('dash-stock-alerts');
    if (alertsEl && alerts.length > 0) {
      alertsCard.style.display = '';
      alertsEl.innerHTML = alerts.slice(0, 12).map(a =>
        `<div class="stock-alert-card">
          <span class="stock-alert-icon">${a.qty === 0 ? '🔴' : '⚠️'}</span>
          <div class="stock-alert-info">
            <div class="stock-alert-name">${Utils.sanitize(a.product)}</div>
            <div class="stock-alert-detail">${a.color} — Tam. ${a.size}</div>
          </div>
          <span class="stock-alert-qty">${a.qty === 0 ? 'Esgotado' : `${a.qty} un`}</span>
        </div>`
      ).join('');
    } else if (alertsCard) {
      alertsCard.style.display = 'none';
    }

    // Recent orders
    const recentEl = $('dash-recent-orders');
    if (recentEl) {
      const recent = orders.slice(0, 6);
      recentEl.innerHTML = recent.length ? recent.map(o =>
        `<div class="dash-order-row">
          <span class="dash-order-id">#${o.id.slice(-6)}</span>
          <span class="dash-order-customer">${Utils.sanitize(o.customer?.name || '—')}</span>
          <span class="status-badge ${statusClass(o.status)}">${o.status}</span>
          <span class="dash-order-total">${Utils.formatCurrency(o.total)}</span>
          <span class="dash-order-time">${Utils.formatDate(o.createdAt)}</span>
        </div>`
      ).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">Nenhum pedido ainda.</p>';
    }

    const btnViewAll = $('btn-dash-view-all-orders');
    if (btnViewAll) btnViewAll.onclick = () => {
      $$('.admin-nav-item').forEach(n => n.classList.remove('active'));
      $$('.admin-nav-item[data-section="orders"]').forEach(n => n.classList.add('active'));
      navigateTo('orders');
    };
  }

  // ===== 4. PRODUCTS =====
  function renderProducts() {
    const products = DataStore.getProducts({ includeInactive: true });
    renderProductsTable(products);

    const btnNew = $('btn-new-product');
    if (btnNew) btnNew.onclick = () => openProductForm(null);

    const searchInput = $('product-search');
    if (searchInput) {
      searchInput.oninput = Utils.debounce(() => {
        const q = searchInput.value.toLowerCase();
        const filtered = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : products;
        renderProductsTable(filtered);
      }, 300);
    }
  }

  function renderProductsTable(products) {
    const tbody = $('products-tbody');
    if (!tbody) return;

    tbody.innerHTML = products.map(p => {
      const totalStock = DataStore.getProductTotalStock(p.id);
      const stockChips = buildStockChips(p);
      const finalPrice = Utils.calcDiscountedPrice(p.price, p.promotion);
      const hasPromo = p.promotion && p.promotion.active;

      return `<tr>
        <td>
          <div class="admin-product-row-image">
            ${p.image ? `<img src="${Utils.sanitize(p.image)}" alt="${Utils.sanitize(p.name)}">` : '⚡'}
          </div>
        </td>
        <td>
          <div style="font-weight:700;font-size:0.9rem;">${Utils.sanitize(p.name)}</div>
          ${p.badge ? `<span class="status-badge info" style="font-size:0.65rem;">${Utils.sanitize(p.badge)}</span>` : ''}
        </td>
        <td>${Utils.sanitize(p.category)}</td>
        <td>
          <strong>${Utils.formatCurrency(finalPrice)}</strong>
          ${hasPromo ? `<br><small style="text-decoration:line-through;color:var(--text-muted);">${Utils.formatCurrency(p.price)}</small>` : ''}
        </td>
        <td>${stockChips || `<span style="color:var(--text-muted);font-size:0.8rem;">${totalStock} un</span>`}</td>
        <td>
          <button type="button" class="btn btn-sm ${p.featured ? 'btn-primary' : 'btn-secondary'}" 
            onclick="AdminPanel.toggleFeatured('${p.id}')" 
            style="font-size:0.75rem;padding:4px 9px;border-radius:var(--radius-full);cursor:pointer;white-space:nowrap;"
            title="Alternar presença na Nova Coleção / Destaques">
            ${p.featured ? '⭐ Sim' : '☆ Não'}
          </button>
        </td>
        <td>
          <span class="status-badge ${p.active ? 'active' : 'inactive'}">${p.active ? 'Ativo' : 'Inativo'}</span>
          ${!p.inStock || totalStock === 0 ? '<br><span class="status-badge" style="background:var(--danger-bg);color:var(--danger);font-size:0.65rem;">Esgotado</span>' : ''}
        </td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="AdminPanel.editProduct('${p.id}')">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="AdminPanel.confirmDeleteProduct('${p.id}')">🗑</button>
          </div>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:40px;">Nenhum produto cadastrado.</td></tr>`;
  }

  function buildStockChips(product) {
    if (!product.variants || !product.variants.length) return '';
    const chips = [];
    product.variants.forEach(v => {
      (v.sizes || []).forEach(s => {
        if (s.qty <= 3) {
          chips.push(`<span class="stock-chip ${s.qty === 0 ? 'out' : 'low'}">${v.color} ${s.size}: ${s.qty}</span>`);
        }
      });
    });
    return chips.length ? `<div class="stock-chips">${chips.slice(0, 5).join('')}${chips.length > 5 ? `<span class="stock-chip">+${chips.length - 5}</span>` : ''}</div>` : '';
  }

  // ===== 5. PRODUCT FORM =====
  function openProductForm(productId) {
    editingProductId = productId;
    productImageData = null;
    variantList = [];

    const isEdit = !!productId;
    if ($('product-form-title')) $('product-form-title').textContent = isEdit ? 'Editar Produto' : 'Novo Produto';
    if ($('product-form')) $('product-form').reset();
    if ($('pf-image-preview')) { $('pf-image-preview').style.display = 'none'; $('pf-image-preview').src = ''; }
    if ($('pf-promo-section')) $('pf-promo-section').style.display = 'none';

    // Populate category select
    const catSel = $('pf-category');
    if (catSel) {
      const cats = DataStore.getCategories();
      catSel.innerHTML = cats.map(c => `<option value="${Utils.sanitize(c.name)}">${Utils.sanitize(c.name)}</option>`).join('');
    }

    if (isEdit) {
      const product = DataStore.getProductById(productId);
      if (!product) return;

      if ($('pf-name')) $('pf-name').value = product.name;
      if (catSel) catSel.value = product.category;
      if ($('pf-price')) $('pf-price').value = product.price;
      if ($('pf-badge')) $('pf-badge').value = product.badge || '';
      if ($('pf-description')) $('pf-description').value = product.description || '';
      if ($('pf-image-url')) $('pf-image-url').value = product.image || '';
      if ($('pf-active')) $('pf-active').checked = product.active !== false;
      if ($('pf-featured')) $('pf-featured').checked = product.featured === true;

      if (product.image) {
        if ($('pf-image-preview')) { $('pf-image-preview').src = product.image; $('pf-image-preview').style.display = 'block'; }
      }

      const promo = product.promotion || { active: false, discountPercent: 0 };
      if ($('pf-promo-active')) $('pf-promo-active').checked = promo.active;
      if ($('pf-promo-percent')) $('pf-promo-percent').value = promo.discountPercent || 10;
      if ($('pf-promo-section')) $('pf-promo-section').style.display = promo.active ? '' : 'none';

      // Load variants
      const settings = DataStore.getSettings();
      const allSizes = settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
      variantList = (product.variants || []).map(v => {
        const sizesObj = {};
        allSizes.forEach(sz => { sizesObj[sz] = 0; });
        (v.sizes || []).forEach(s => { sizesObj[s.size] = s.qty; });
        return { color: v.color, colorHex: v.colorHex || '#059669', image: v.image || '', sizes: sizesObj };
      });
    } else {
      if ($('pf-active')) $('pf-active').checked = true;
      if ($('pf-featured')) $('pf-featured').checked = false;
      variantList = [];
    }

    renderVariantBuilder();
    if ($('product-form-modal')) $('product-form-modal').classList.add('active');
  }

  function renderVariantBuilder() {
    const builder = $('variant-builder');
    if (!builder) return;
    const settings = DataStore.getSettings();
    const allSizes = settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

    if (!variantList.length) {
      builder.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:20px;">
        Clique em "+ Adicionar Cor" para cadastrar variantes com foto, cor e quantidade por tamanho.</p>`;
      return;
    }

    builder.innerHTML = variantList.map((v, idx) => `
      <div class="variant-row" data-idx="${idx}">
        <button type="button" class="btn-remove-variant" onclick="AdminPanel.removeVariant(${idx})">✕ Remover Cor</button>
        <div class="variant-row-header">
          <div class="color-picker-wrap">
            <label>Cor:</label>
            <input type="color" value="${v.colorHex}" onchange="AdminPanel.updateVariantColor(${idx}, 'hex', this.value)">
            <input type="text" value="${Utils.sanitize(v.color)}" placeholder="Nome da cor" onchange="AdminPanel.updateVariantColor(${idx}, 'name', this.value)" style="font-weight:600;">
          </div>
          <div class="variant-image-wrap">
            <div class="variant-img-preview-thumb" id="variant-thumb-${idx}">
              ${v.image ? `<img src="${Utils.sanitize(v.image)}" alt="Foto da cor">` : '📷'}
            </div>
            <div class="variant-img-input-box">
              <input type="text" class="variant-img-url-input" value="${Utils.sanitize(v.image || '')}" placeholder="URL da foto desta cor" onchange="AdminPanel.updateVariantImage(${idx}, this.value)">
              <label class="btn-variant-upload-label">
                📁 Foto
                <input type="file" accept="image/*" style="display:none;" onchange="AdminPanel.uploadVariantImage(${idx}, this)">
              </label>
              ${v.image ? `<button type="button" class="btn-variant-clear-img" onclick="AdminPanel.clearVariantImage(${idx})" title="Remover foto desta cor">✕</button>` : ''}
            </div>
          </div>
        </div>
        <div class="size-qty-grid">
          ${allSizes.map(size => `
            <div class="size-qty-item">
              <label>${size}</label>
              <input type="number" min="0" class="size-qty-input" value="${v.sizes[size] || 0}"
                onchange="AdminPanel.updateVariantSize(${idx}, '${size}', this.value)">
            </div>`).join('')}
        </div>
      </div>`).join('');
  }

  // Variant mutations
  window.AdminPanel = window.AdminPanel || {};

  window.AdminPanel.addVariant = function () {
    const settings = DataStore.getSettings();
    const allSizes = settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
    const sizesObj = {};
    allSizes.forEach(s => { sizesObj[s] = 0; });
    variantList.push({ color: `Cor ${variantList.length + 1}`, colorHex: '#059669', image: '', sizes: sizesObj });
    renderVariantBuilder();
  };

  window.AdminPanel.removeVariant = function (idx) {
    variantList.splice(idx, 1);
    renderVariantBuilder();
  };

  window.AdminPanel.updateVariantColor = function (idx, field, val) {
    if (!variantList[idx]) return;
    if (field === 'hex') variantList[idx].colorHex = val;
    else variantList[idx].color = val;
  };

  window.AdminPanel.updateVariantImage = function (idx, val) {
    if (!variantList[idx]) return;
    variantList[idx].image = val.trim();
    renderVariantBuilder();
  };

  window.AdminPanel.clearVariantImage = function (idx) {
    if (!variantList[idx]) return;
    variantList[idx].image = '';
    renderVariantBuilder();
  };

  window.AdminPanel.uploadVariantImage = async function (idx, inputEl) {
    if (!variantList[idx] || !inputEl.files || !inputEl.files[0]) return;
    const file = inputEl.files[0];
    if (file.size > 5 * 1024 * 1024) {
      Utils.showToast('Imagem muito grande! Máx. 5MB.', 'error');
      return;
    }
    try {
      Utils.showToast('Enviando foto da cor...', 'info');
      if (window.SupabaseService && window.SupabaseService.isConfigured()) {
        const url = await window.SupabaseService.uploadImage(file, 'products');
        variantList[idx].image = url;
        Utils.showToast('Foto da cor enviada com sucesso!', 'success');
        renderVariantBuilder();
      } else {
        const reader = new FileReader();
        reader.onload = e => {
          variantList[idx].image = e.target.result;
          renderVariantBuilder();
          Utils.showToast('Foto da cor carregada!', 'success');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      Utils.showToast('Erro ao enviar foto: ' + (err.message || ''), 'error');
    }
  };

  window.AdminPanel.toggleFeatured = async function (id) {
    try {
      const isFeatured = await DataStore.toggleProductFeatured(id);
      Utils.showToast(isFeatured ? '⭐ Produto adicionado à Nova Coleção!' : 'Produto removido da Nova Coleção.', 'info');
      renderProducts();
    } catch (err) {
      Utils.showToast('Erro: ' + (err.message || ''), 'error');
    }
  };

  window.AdminPanel.updateVariantSize = function (idx, size, val) {
    if (!variantList[idx]) return;
    variantList[idx].sizes[size] = Math.max(0, parseInt(val) || 0);
  };

  window.AdminPanel.editProduct = function (id) { openProductForm(id); };

  window.AdminPanel.confirmDeleteProduct = function (id) {
    showConfirm('Excluir Produto', 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.', async () => {
      try {
        await DataStore.deleteProduct(id);
        Utils.showToast('Produto excluído!', 'success');
        renderProducts();
      } catch (err) {
        Utils.showToast('Erro ao excluir: ' + (err.message || ''), 'error');
      }
    });
  };

  window.AdminPanel.setPresetSizes = function (sizes) {
    showConfirm('Aplicar Predefinição', `Isso vai substituir os tamanhos atuais por: ${sizes.join(', ')}. Continuar?`, async () => {
      await DataStore.updateSetting('availableSizes', sizes);
      renderSizes();
      Utils.showToast('Tamanhos atualizados!', 'success');
    });
  };

  function bindProductForm() {
    const form = $('product-form');
    if (!form) return;

    // Promo toggle
    const promoActive = $('pf-promo-active');
    if (promoActive) {
      promoActive.onchange = () => {
        if ($('pf-promo-section')) $('pf-promo-section').style.display = promoActive.checked ? '' : 'none';
      };
    }

    // Add variant btn
    const btnAddVariant = $('btn-add-variant');
    if (btnAddVariant) btnAddVariant.onclick = () => window.AdminPanel.addVariant();

    // Image file upload
    const fileInput = $('pf-image-file');
    if (fileInput) {
      fileInput.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { Utils.showToast('Imagem muito grande! Máx. 5MB.', 'error'); return; }

        try {
          const reader = new FileReader();
          reader.onload = evt => {
            productImageData = evt.target.result;
            if ($('pf-image-preview')) { $('pf-image-preview').src = evt.target.result; $('pf-image-preview').style.display = 'block'; }
          };
          reader.readAsDataURL(file);

          // Try to upload to Supabase Storage
          if (window.SupabaseService && window.SupabaseService.isConfigured()) {
            const url = await window.SupabaseService.uploadImage(file, 'products');
            if ($('pf-image-url')) $('pf-image-url').value = url;
            productImageData = url;
            Utils.showToast('Imagem enviada!', 'success');
          }
        } catch (err) {
          Utils.showToast('Erro ao enviar imagem: ' + (err.message || ''), 'error');
        }
      });
    }

    // Image URL preview
    const urlInput = $('pf-image-url');
    if (urlInput) {
      urlInput.onchange = () => {
        if (urlInput.value && $('pf-image-preview')) {
          $('pf-image-preview').src = urlInput.value;
          $('pf-image-preview').style.display = 'block';
        }
      };
    }

    // Drag & drop
    const uploadZone = $('img-upload-zone');
    if (uploadZone) {
      ['dragenter', 'dragover'].forEach(e => uploadZone.addEventListener(e, ev => { ev.preventDefault(); uploadZone.classList.add('dragover'); }));
      ['dragleave', 'drop'].forEach(e => uploadZone.addEventListener(e, ev => { ev.preventDefault(); uploadZone.classList.remove('dragover'); }));
      uploadZone.addEventListener('drop', e => { if (e.dataTransfer.files[0]) { fileInput.files = e.dataTransfer.files; fileInput.dispatchEvent(new Event('change')); } });
    }

    // Form submit
    form.onsubmit = async e => {
      e.preventDefault();
      const btn = $('btn-save-product');
      if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

      try {
        const name = $('pf-name').value.trim();
        const category = $('pf-category').value;
        const price = parseFloat($('pf-price').value);
        const badge = $('pf-badge').value.trim();
        const description = $('pf-description').value.trim();
        const imageUrl = $('pf-image-url') ? $('pf-image-url').value.trim() : '';
        const active = $('pf-active').checked;
        const promoActv = $('pf-promo-active').checked;
        const promoPercent = promoActv ? (parseFloat($('pf-promo-percent').value) || 0) : 0;

        if (!name || !category || isNaN(price)) {
          Utils.showToast('Preencha nome, categoria e preço!', 'error');
          return;
        }

        // Convert variantList to variants array
        const variants = variantList.map(v => ({
          color: v.color,
          colorHex: v.colorHex,
          image: v.image || '',
          sizes: Object.entries(v.sizes).map(([size, qty]) => ({ size, qty: parseInt(qty) || 0 }))
        }));

        const totalStock = variants.reduce((t, v) => t + v.sizes.reduce((s, sz) => s + sz.qty, 0), 0);
        const featured = $('pf-featured') ? $('pf-featured').checked : false;

        const product = {
          id: editingProductId || null,
          name,
          category,
          price,
          badge,
          description,
          image: typeof productImageData === 'string' && productImageData.startsWith('http') ? productImageData : (imageUrl || ''),
          active,
          featured,
          inStock: totalStock > 0,
          variants,
          promotion: { active: promoActv, discountPercent: promoPercent }
        };

        await DataStore.saveProduct(product);
        Utils.showToast(editingProductId ? 'Produto atualizado!' : 'Produto criado!', 'success');
        closeProductForm();
        renderProducts();
        if (currentSection === 'stock') renderStock();
      } catch (err) {
        Utils.showToast('Erro ao salvar produto: ' + (err.message || ''), 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Produto'; }
      }
    };

    $('btn-cancel-product').onclick = closeProductForm;
    $('btn-close-product-form').onclick = closeProductForm;
  }

  function closeProductForm() {
    if ($('product-form-modal')) $('product-form-modal').classList.remove('active');
    editingProductId = null;
    productImageData = null;
    variantList = [];
  }

  // ===== 6. STOCK MANAGER =====
  function renderStock() {
    const allProducts = DataStore.getProducts({ includeInactive: true });
    const categories = DataStore.getCategories();

    // Populate category filter
    const catFilter = $('stock-filter-cat');
    if (catFilter) {
      catFilter.innerHTML = `<option value="all">Todas as Categorias</option>` +
        categories.map(c => `<option value="${Utils.sanitize(c.name)}">${Utils.sanitize(c.name)}</option>`).join('');
      catFilter.onchange = () => renderStockList(allProducts);
    }

    const searchInput = $('stock-search');
    if (searchInput) {
      searchInput.oninput = Utils.debounce(() => renderStockList(allProducts), 300);
    }

    renderStockList(allProducts);
  }

  function renderStockList(allProducts) {
    const stockList = $('stock-list');
    if (!stockList) return;

    const catFilter = $('stock-filter-cat');
    const searchInput = $('stock-search');
    const catVal = catFilter ? catFilter.value : 'all';
    const q = searchInput ? searchInput.value.toLowerCase() : '';

    let products = allProducts;
    if (catVal !== 'all') products = products.filter(p => p.category === catVal);
    if (q) products = products.filter(p => p.name.toLowerCase().includes(q));

    if (!products.length) {
      stockList.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);">Nenhum produto encontrado.</div>`;
      return;
    }

    const settings = DataStore.getSettings();
    const allSizes = settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

    stockList.innerHTML = products.map(p => {
      const totalStock = DataStore.getProductTotalStock(p.id);
      const variants = p.variants || [];

      if (!variants.length) {
        return `<div class="admin-card" style="margin-bottom:16px;">
          <div class="admin-card-header">
            <div style="display:flex;align-items:center;gap:12px;">
              <div class="admin-product-row-image">${p.image ? `<img src="${Utils.sanitize(p.image)}" alt="">` : '⚡'}</div>
              <div>
                <strong>${Utils.sanitize(p.name)}</strong>
                <div style="font-size:0.75rem;color:var(--text-muted);">${p.category}</div>
              </div>
            </div>
            <span style="font-size:0.85rem;color:var(--text-muted);">Sem variantes cadastradas</span>
          </div>
        </div>`;
      }

      const variantsHtml = variants.map((v, vi) => {
        const sizesHtml = allSizes.filter(sz =>
          (v.sizes || []).some(s => s.size === sz)
        ).map(sz => {
          const entry = (v.sizes || []).find(s => s.size === sz);
          const qty = entry ? entry.qty : 0;
          const colorClass = qty === 0 ? 'out' : qty <= 3 ? 'low' : '';
          return `<div class="size-qty-item ${colorClass}" style="${colorClass === 'out' ? 'border-color:var(--danger-bg);' : colorClass === 'low' ? 'border-color:var(--warning-bg);' : ''}">
            <label>${sz}</label>
            <input type="number" min="0" class="size-qty-input stock-qty-input" 
              value="${qty}" 
              data-product="${p.id}" data-color="${Utils.sanitize(v.color)}" data-size="${sz}"
              style="${qty === 0 ? 'color:var(--danger);border-color:var(--danger);' : qty <= 3 ? 'color:var(--warning);border-color:var(--warning);' : ''}">
          </div>`;
        }).join('');

        return `<div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div class="color-swatch" style="background:${v.colorHex || '#ccc'};width:24px;height:24px;border-radius:50%;border:2px solid var(--border);"></div>
            <strong style="font-size:0.9rem;">${Utils.sanitize(v.color)}</strong>
          </div>
          <div class="size-qty-grid">${sizesHtml}</div>
        </div>`;
      }).join('<hr style="border:none;border-top:1px dashed var(--border);margin:16px 0;">');

      return `<div class="admin-card" style="margin-bottom:16px;" data-product-id="${p.id}">
        <div class="admin-card-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="admin-product-row-image">${p.image ? `<img src="${Utils.sanitize(p.image)}" alt="">` : '⚡'}</div>
            <div>
              <strong>${Utils.sanitize(p.name)}</strong>
              <div style="font-size:0.75rem;color:var(--text-muted);">${p.category} · ${Utils.formatCurrency(p.price)}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="status-badge ${totalStock === 0 ? 'inactive' : totalStock <= 5 ? 'pending' : 'active'}">${totalStock === 0 ? 'Esgotado' : `${totalStock} un`}</span>
            <button class="btn btn-primary btn-sm save-stock-btn" data-product="${p.id}">💾 Salvar</button>
          </div>
        </div>
        <div class="admin-card-body">${variantsHtml}</div>
      </div>`;
    }).join('');

    // Bind save buttons
    stockList.querySelectorAll('.save-stock-btn').forEach(btn => {
      btn.onclick = async () => {
        const productId = btn.dataset.product;
        const product = DataStore.getProductById(productId);
        if (!product) return;

        btn.disabled = true;
        btn.textContent = 'Salvando...';

        try {
          const card = btn.closest(`[data-product-id="${productId}"]`);
          const inputs = card.querySelectorAll('.stock-qty-input');

          const newVariants = JSON.parse(JSON.stringify(product.variants || []));
          inputs.forEach(input => {
            const color = input.dataset.color;
            const size = input.dataset.size;
            const qty = Math.max(0, parseInt(input.value) || 0);
            const variant = newVariants.find(v => v.color === color);
            if (variant) {
              const sizeEntry = (variant.sizes || []).find(s => s.size === size);
              if (sizeEntry) sizeEntry.qty = qty;
              else variant.sizes.push({ size, qty });
            }
          });

          const totalStock = newVariants.reduce((t, v) => t + (v.sizes || []).reduce((s, sz) => s + sz.qty, 0), 0);
          product.variants = newVariants;
          product.inStock = totalStock > 0;
          await DataStore.saveProduct(product);

          Utils.showToast('Estoque atualizado!', 'success');
          renderStockList(DataStore.getProducts({ includeInactive: true }));
        } catch (err) {
          Utils.showToast('Erro: ' + (err.message || ''), 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = '💾 Salvar';
        }
      };
    });
  }

  // ===== 7. CATEGORIES =====
  function renderCategories() {
    const categories = DataStore.getCategories();
    const el = $('categories-list');
    if (!el) return;

    el.innerHTML = categories.length ? `
      <table class="admin-table">
        <thead><tr><th>Ícone</th><th>Nome</th><th>Produtos</th><th>Ações</th></tr></thead>
        <tbody>
          ${categories.map(c => {
            const products = DataStore.getProducts({ includeInactive: true }).filter(p => p.category === c.name);
            return `<tr>
              <td style="font-size:1.5rem;">${c.icon || '👗'}</td>
              <td style="font-weight:700;">${Utils.sanitize(c.name)}</td>
              <td>${products.length} produto(s)</td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn btn-secondary btn-sm" onclick="AdminPanel.editCategory('${c.id}')">✏️ Editar</button>
                  <button class="btn btn-danger btn-sm" onclick="AdminPanel.confirmDeleteCategory('${c.id}')">🗑</button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>` : `<p style="color:var(--text-muted);text-align:center;padding:40px;">Nenhuma categoria cadastrada.</p>`;

    const btnNew = $('btn-new-category');
    if (btnNew) btnNew.onclick = () => openCategoryForm(null);
  }

  function openCategoryForm(id) {
    editingCategoryId = id;
    const isEdit = !!id;
    if ($('cat-form-title')) $('cat-form-title').textContent = isEdit ? 'Editar Categoria' : 'Nova Categoria';
    if ($('category-form')) $('category-form').reset();

    if (isEdit) {
      const cat = DataStore.getCategories().find(c => c.id === id);
      if (cat) {
        if ($('cf-name')) $('cf-name').value = cat.name;
        if ($('cf-icon')) $('cf-icon').value = cat.icon || '';
      }
    }
    if ($('category-form-modal')) $('category-form-modal').classList.add('active');
  }

  window.AdminPanel.editCategory = function (id) { openCategoryForm(id); };
  window.AdminPanel.confirmDeleteCategory = function (id) {
    const cat = DataStore.getCategories().find(c => c.id === id);
    const name = cat ? cat.name : '';
    const products = DataStore.getProducts({ includeInactive: true }).filter(p => p.category === name);
    if (products.length) {
      Utils.showToast(`Não é possível excluir: ${products.length} produto(s) nessa categoria!`, 'error');
      return;
    }
    showConfirm('Excluir Categoria', `Excluir "${name}"?`, async () => {
      try {
        await DataStore.deleteCategory(id);
        Utils.showToast('Categoria excluída!', 'success');
        renderCategories();
      } catch (err) {
        Utils.showToast('Erro: ' + (err.message || ''), 'error');
      }
    });
  };

  function bindCategoryForm() {
    const form = $('category-form');
    if (!form) return;
    form.onsubmit = async e => {
      e.preventDefault();
      const name = $('cf-name').value.trim();
      const icon = $('cf-icon').value.trim() || '👗';
      if (!name) { Utils.showToast('Informe o nome!', 'error'); return; }

      try {
        await DataStore.saveCategory({ id: editingCategoryId || null, name, icon });
        Utils.showToast(editingCategoryId ? 'Categoria atualizada!' : 'Categoria criada!', 'success');
        if ($('category-form-modal')) $('category-form-modal').classList.remove('active');
        renderCategories();
      } catch (err) {
        Utils.showToast('Erro: ' + (err.message || ''), 'error');
      }
    };
    $('btn-cancel-cat').onclick = () => { if ($('category-form-modal')) $('category-form-modal').classList.remove('active'); };
    $('btn-close-cat-form').onclick = () => { if ($('category-form-modal')) $('category-form-modal').classList.remove('active'); };
  }

  // ===== 8. ORDERS =====
  function renderOrders() {
    const orders = DataStore.getOrders();
    const filter = ($('orders-filter') ? $('orders-filter').value : 'all') || currentOrderFilter;
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const el = $('orders-list');
    if (!el) return;

    const ordersFilter = $('orders-filter');
    if (ordersFilter) {
      ordersFilter.value = filter;
      ordersFilter.onchange = () => renderOrders();
    }

    const exportBtn = $('btn-export-orders');
    if (exportBtn) exportBtn.onclick = exportOrdersCsv;

    if (!filtered.length) {
      el.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);">Nenhum pedido encontrado.</div>`;
      return;
    }

    el.innerHTML = filtered.map(o => `
      <div class="admin-card" style="margin-bottom:16px;">
        <div class="admin-card-header">
          <div>
            <strong>#${o.id.slice(-8)}</strong>
            <span style="margin-left:10px;font-size:0.8rem;color:var(--text-muted);">${Utils.formatDate(o.createdAt)}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <select class="order-status-select" data-id="${o.id}">
              ${['novo','confirmado','em_preparo','enviado','entregue','cancelado'].map(s =>
                `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>`
              ).join('')}
            </select>
            <button class="btn btn-secondary btn-sm" onclick="AdminPanel.viewOrder('${o.id}')">👁 Ver</button>
            <button class="btn btn-danger btn-sm" onclick="AdminPanel.confirmDeleteOrder('${o.id}')">🗑</button>
          </div>
        </div>
        <div class="admin-card-body" style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start;">
          <div>
            <strong>👤 ${Utils.sanitize(o.customer?.name || '—')}</strong>
            <div style="font-size:0.8rem;color:var(--text-muted);">📞 ${Utils.sanitize(o.customer?.phone || '—')}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${o.deliveryType === 'pickup' ? '🏬 Retirada' : `🚚 Entrega: ${Utils.sanitize(o.customer?.address || '—')}`}</div>
          </div>
          <div>
            <div style="font-size:0.8rem;color:var(--text-muted);">Itens:</div>
            ${(o.items || []).map(i => `<div style="font-size:0.82rem;">▸ ${Utils.sanitize(i.name)} ${i.color ? `(${i.color}` : ''}${i.size ? ` Tam.${i.size})` : i.color ? ')' : ''} × ${i.qty}</div>`).join('')}
          </div>
          <div style="margin-left:auto;text-align:right;">
            <div style="font-size:0.8rem;color:var(--text-muted);">💳 ${Utils.sanitize(o.paymentMethod)}</div>
            <div style="font-size:1.2rem;font-weight:700;color:var(--primary);">${Utils.formatCurrency(o.total)}</div>
          </div>
        </div>
      </div>`).join('');

    // Bind status selects
    el.querySelectorAll('.order-status-select').forEach(sel => {
      sel.onchange = async () => {
        try {
          await DataStore.updateOrderStatus(sel.dataset.id, sel.value);
          Utils.showToast('Status atualizado!', 'success');
        } catch (err) {
          Utils.showToast('Erro: ' + (err.message || ''), 'error');
        }
      };
    });
  }

  window.AdminPanel.viewOrder = function (id) {
    const order = DataStore.getOrders().find(o => o.id === id);
    if (!order) return;
    const body = $('order-detail-body');
    if (body) {
      body.innerHTML = `
        <div style="display:grid;gap:12px;">
          <div><strong>ID:</strong> ${order.id}</div>
          <div><strong>Data:</strong> ${Utils.formatDate(order.createdAt)}</div>
          <div><strong>Cliente:</strong> ${Utils.sanitize(order.customer?.name)} — ${Utils.sanitize(order.customer?.phone)}</div>
          ${order.deliveryType === 'pickup' ? '<div><strong>Tipo:</strong> Retirada na Loja</div>' : `<div><strong>Endereço:</strong> ${Utils.sanitize(order.customer?.address)}</div>`}
          <hr style="border:none;border-top:1px solid var(--border);">
          <h4>Itens:</h4>
          ${(order.items || []).map(i => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed var(--border);">
              <div>
                <strong>${Utils.sanitize(i.name)}</strong>
                ${i.color ? `<div style="font-size:0.78rem;color:var(--text-muted);">Cor: ${i.color} | Tam: ${i.size}</div>` : ''}
                <div style="font-size:0.78rem;color:var(--text-muted);">Qtd: ${i.qty}</div>
              </div>
              <strong>${Utils.formatCurrency(i.price * i.qty)}</strong>
            </div>`).join('')}
          <hr style="border:none;border-top:1px solid var(--border);">
          <div style="display:flex;justify-content:space-between;"><span>Subtotal:</span><strong>${Utils.formatCurrency(order.subtotal)}</strong></div>
          ${order.deliveryType === 'delivery' ? `<div style="display:flex;justify-content:space-between;"><span>Frete:</span><strong>${Utils.formatCurrency(order.deliveryFee)}</strong></div>` : ''}
          <div style="display:flex;justify-content:space-between;font-size:1.1rem;"><span><strong>Total:</strong></span><strong style="color:var(--primary);">${Utils.formatCurrency(order.total)}</strong></div>
          <div><strong>Pagamento:</strong> ${Utils.sanitize(order.paymentMethod)}</div>
          ${order.customer?.obs ? `<div><strong>Obs:</strong> ${Utils.sanitize(order.customer.obs)}</div>` : ''}
        </div>`;
    }
    if ($('order-detail-modal')) $('order-detail-modal').classList.add('active');
  };

  window.AdminPanel.confirmDeleteOrder = function (id) {
    showConfirm('Excluir Pedido', 'Excluir este pedido permanentemente?', async () => {
      try {
        await DataStore.deleteOrder(id);
        Utils.showToast('Pedido excluído!', 'success');
        renderOrders();
      } catch (err) {
        Utils.showToast('Erro: ' + (err.message || ''), 'error');
      }
    });
  };

  function exportOrdersCsv() {
    const orders = DataStore.getOrders();
    let csv = 'ID,Data,Cliente,Telefone,Tipo,Endereço,Itens,Subtotal,Frete,Total,Pagamento,Status\n';
    orders.forEach(o => {
      const items = (o.items || []).map(i => `${i.name}(${i.color} ${i.size}x${i.qty})`).join(' | ');
      csv += `${o.id},${o.createdAt},"${o.customer?.name || ''}","${o.customer?.phone || ''}",${o.deliveryType},"${o.customer?.address || ''}","${items}",${o.subtotal},${o.deliveryFee},${o.total},"${o.paymentMethod}",${o.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pedidos_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('CSV exportado!', 'success');
  }

  // ===== 9. DELIVERY =====
  function renderDelivery() {
    const settings = DataStore.getSettings();
    const d = settings.delivery || {};
    if ($('delivery-fee')) $('delivery-fee').value = d.deliveryFee ?? 15;
    if ($('delivery-free-threshold')) $('delivery-free-threshold').value = d.freeDeliveryThreshold ?? 250;
    if ($('delivery-time')) $('delivery-time').value = d.estimatedTime || '';
    if ($('pickup-address')) $('pickup-address').value = d.pickupAddress || '';
    if ($('delivery-enabled')) $('delivery-enabled').checked = d.deliveryEnabled !== false;
    if ($('pickup-enabled')) $('pickup-enabled').checked = d.pickupEnabled !== false;

    const btn = $('btn-save-delivery');
    if (btn) btn.onclick = async () => {
      const origText = btn.textContent;
      try {
        btn.disabled = true;
        btn.textContent = 'Salvando...';
        await DataStore.updateSetting('delivery', {
          deliveryEnabled: $('delivery-enabled').checked,
          deliveryFee: parseFloat($('delivery-fee').value) || 0,
          freeDeliveryThreshold: parseFloat($('delivery-free-threshold').value) || 0,
          estimatedTime: $('delivery-time').value.trim(),
          pickupEnabled: $('pickup-enabled').checked,
          pickupAddress: $('pickup-address').value.trim(),
          pickupEstimate: 'Pronto em até 1 hora'
        });
        Utils.showToast('Configurações de entrega salvas com sucesso!', 'success');
      } catch (err) {
        Utils.showToast('Erro ao salvar entrega: ' + (err.message || ''), 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = origText;
      }
    };
  }

  // ===== 10. PAYMENTS =====
  function renderPayments() {
    const settings = DataStore.getSettings();
    const methods = settings.paymentMethods || [];
    const pix = settings.pixDetails || {};

    // Payment methods toggles
    const el = $('payment-methods-list');
    if (el) {
      el.innerHTML = methods.map((m, i) => `
        <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);">
          <span style="font-size:1.4rem;">${m.icon}</span>
          <span style="flex:1;font-weight:600;">${m.name}</span>
          <label class="toggle-switch">
            <input type="checkbox" id="pay-toggle-${i}" ${m.active ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>`).join('');
    }

    if ($('pix-key-type')) $('pix-key-type').value = pix.keyType || 'Celular';
    if ($('pix-key')) $('pix-key').value = pix.key || '';
    if ($('pix-receiver')) $('pix-receiver').value = pix.receiverName || '';
    if ($('pix-instructions')) $('pix-instructions').value = pix.instructions || '';

    const btn = $('btn-save-payments');
    if (btn) btn.onclick = async () => {
      try {
        const updatedMethods = methods.map((m, i) => ({
          ...m,
          active: $(`pay-toggle-${i}`) ? $(`pay-toggle-${i}`).checked : m.active
        }));
        await DataStore.updateSettings({
          paymentMethods: updatedMethods,
          pixDetails: {
            key: $('pix-key').value.trim(),
            keyType: $('pix-key-type').value,
            receiverName: $('pix-receiver').value.trim(),
            instructions: $('pix-instructions').value.trim()
          }
        });
        Utils.showToast('Pagamentos salvos!', 'success');
      } catch (err) {
        Utils.showToast('Erro: ' + (err.message || ''), 'error');
      }
    };
  }

  // ===== 11. SCHEDULE =====
  function renderSchedule() {
    const settings = DataStore.getSettings();
    const hours = settings.operatingHours || {};
    const days = [
      { key: 'segunda', label: 'Segunda-feira' },
      { key: 'terca', label: 'Terça-feira' },
      { key: 'quarta', label: 'Quarta-feira' },
      { key: 'quinta', label: 'Quinta-feira' },
      { key: 'sexta', label: 'Sexta-feira' },
      { key: 'sabado', label: 'Sábado' },
      { key: 'domingo', label: 'Domingo' }
    ];

    const el = $('hours-list');
    if (el) {
      el.innerHTML = days.map(d => {
        const h = hours[d.key] || { active: false, open: '09:00', close: '18:00' };
        return `<div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);flex-wrap:wrap;">
          <label class="toggle-switch"><input type="checkbox" id="sched-${d.key}" ${h.active ? 'checked' : ''}><span class="toggle-slider"></span></label>
          <span style="min-width:130px;font-weight:600;">${d.label}</span>
          <input type="time" id="open-${d.key}" class="form-control" style="width:120px;" value="${h.open || '09:00'}" ${!h.active ? 'disabled' : ''}>
          <span style="color:var(--text-muted);">até</span>
          <input type="time" id="close-${d.key}" class="form-control" style="width:120px;" value="${h.close || '18:00'}" ${!h.active ? 'disabled' : ''}>
        </div>`;
      }).join('');

      // Toggle enables/disables time inputs
      days.forEach(d => {
        const toggle = $(`sched-${d.key}`);
        if (toggle) {
          toggle.onchange = () => {
            if ($(`open-${d.key}`)) $(`open-${d.key}`).disabled = !toggle.checked;
            if ($(`close-${d.key}`)) $(`close-${d.key}`).disabled = !toggle.checked;
          };
        }
      });
    }

    if ($('closed-message')) $('closed-message').value = settings.closedCustomMessage || '';

    const btn = $('btn-save-schedule');
    if (btn) btn.onclick = async () => {
      try {
        const newHours = {};
        days.forEach(d => {
          newHours[d.key] = {
            active: $(`sched-${d.key}`) ? $(`sched-${d.key}`).checked : false,
            open: $(`open-${d.key}`) ? $(`open-${d.key}`).value : '09:00',
            close: $(`close-${d.key}`) ? $(`close-${d.key}`).value : '18:00'
          };
        });
        await DataStore.updateSettings({
          operatingHours: newHours,
          closedCustomMessage: $('closed-message').value.trim()
        });
        Utils.showToast('Horários salvos!', 'success');
      } catch (err) {
        Utils.showToast('Erro: ' + (err.message || ''), 'error');
      }
    };
  }

  // ===== 12. VISUAL =====
  function renderVisual() {
    const s = DataStore.getSettings();
    if ($('v-store-name')) $('v-store-name').value = s.storeName || '';
    if ($('v-store-tagline')) $('v-store-tagline').value = s.storeTagline || '';
    if ($('v-logo-emoji')) $('v-logo-emoji').value = s.storeLogoEmoji || '⚡';
    if ($('v-theme-color')) $('v-theme-color').value = s.themeColor || '#059669';
    if ($('v-hero-title')) $('v-hero-title').value = (s.hero || {}).title || '';
    if ($('v-hero-subtitle')) $('v-hero-subtitle').value = (s.hero || {}).subtitle || '';
    if ($('v-hero-cta')) $('v-hero-cta').value = (s.hero || {}).ctaText || '';
    if ($('v-hero-image')) $('v-hero-image').value = (s.hero || {}).image || '';
    
    if ($('v-hero-image-upload')) {
      $('v-hero-image-upload').onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { Utils.showToast('Máx. 5MB.', 'error'); return; }
        try {
          Utils.showToast('Enviando...', 'info');
          if (window.SupabaseService && window.SupabaseService.isConfigured()) {
            const url = await window.SupabaseService.uploadImage(file, 'hero');
            if ($('v-hero-image')) $('v-hero-image').value = url;
            Utils.showToast('Enviada!', 'success');
          } else {
            const reader = new FileReader();
            reader.onload = ev => { if ($('v-hero-image')) $('v-hero-image').value = ev.target.result; };
            reader.readAsDataURL(file);
          }
        } catch (err) { Utils.showToast('Erro: ' + (err.message || ''), 'error'); }
      };
    }
    if ($('v-ann-active')) $('v-ann-active').checked = (s.announcementBar || {}).active || false;
    if ($('v-ann-text')) $('v-ann-text').value = (s.announcementBar || {}).text || '';

    // Featured Collection settings
    const f = s.featuredCollection || {};
    if ($('v-featured-active')) $('v-featured-active').checked = f.active !== false;
    if ($('v-featured-title')) $('v-featured-title').value = f.title || 'Nova Coleção 2026';
    if ($('v-featured-subtitle')) $('v-featured-subtitle').value = f.subtitle || '';

    // Instagram Feed settings
    const ig = s.instagramFeed || {};
    if ($('v-ig-active')) $('v-ig-active').checked = ig.active !== false;
    if ($('v-ig-profile')) $('v-ig-profile').value = ig.profileUrl || ig.handle || '';
    if ($('v-ig-title')) $('v-ig-title').value = ig.title || 'Siga no Instagram';
    if ($('v-ig-subtitle')) $('v-ig-subtitle').value = ig.subtitle || '';
    if ($('v-ig-handle')) $('v-ig-handle').value = ig.handle || '';
    if ($('v-ig-bio')) $('v-ig-bio').value = ig.bio || '';

    // Instagram Manager
    igPostsList = [...(ig.posts || [])];
    
    window.AdminPanel.renderIgPostsManager = function() {
      const container = $('ig-posts-manager-list');
      if (!container) return;
      if (igPostsList.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;">Nenhuma foto cadastrada. Clique em "+ Nova Foto".</p>';
        return;
      }
      container.innerHTML = igPostsList.map((post, idx) => `
        <div class="ig-manager-card" style="display:flex;gap:12px;padding:12px;border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:12px;background:var(--bg-body);">
          <div style="width:100px;height:100px;background:var(--border);border-radius:4px;overflow:hidden;flex-shrink:0;position:relative;">
            ${post.image ? `<img src="${Utils.sanitize(post.image)}" style="width:100%;height:100%;object-fit:cover;">` : '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2rem;">📷</span>'}
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="text" class="form-control" style="flex:1;padding:4px 8px;font-size:0.85rem;" placeholder="URL da Foto ou faça upload" value="${Utils.sanitize(post.image || '')}" onchange="AdminPanel.updateIgPost(${idx}, 'image', this.value)">
              <label class="btn btn-secondary btn-sm" style="cursor:pointer;padding:4px 8px;font-size:0.8rem;">
                📁 Upload
                <input type="file" accept="image/*" style="display:none;" onchange="AdminPanel.uploadIgPostImage(${idx}, this)">
              </label>
            </div>
            <input type="text" class="form-control" style="padding:4px 8px;font-size:0.85rem;" placeholder="Link para o post oficial (opcional)" value="${Utils.sanitize(post.postUrl || '')}" onchange="AdminPanel.updateIgPost(${idx}, 'postUrl', this.value)">
            <input type="text" class="form-control" style="padding:4px 8px;font-size:0.85rem;" placeholder="Legenda (opcional)" value="${Utils.sanitize(post.caption || '')}" onchange="AdminPanel.updateIgPost(${idx}, 'caption', this.value)">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <label style="font-size:0.8rem;display:flex;align-items:center;gap:6px;">
                <input type="checkbox" ${post.featured ? 'checked' : ''} onchange="AdminPanel.updateIgPost(${idx}, 'featured', this.checked)"> Destaque (maior)
              </label>
              <div style="display:flex;gap:4px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="AdminPanel.moveIgPost(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Subir">⬆️</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="AdminPanel.moveIgPost(${idx}, 1)" ${idx === igPostsList.length - 1 ? 'disabled' : ''} title="Descer">⬇️</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="AdminPanel.removeIgPost(${idx})" title="Remover">✕</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    };

    window.AdminPanel.updateIgPost = function(idx, field, val) {
      if (!igPostsList[idx]) return;
      igPostsList[idx][field] = val;
      if (field === 'image') AdminPanel.renderIgPostsManager();
    };

    window.AdminPanel.removeIgPost = function(idx) {
      igPostsList.splice(idx, 1);
      AdminPanel.renderIgPostsManager();
    };

    window.AdminPanel.moveIgPost = function(idx, dir) {
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= igPostsList.length) return;
      const temp = igPostsList[idx];
      igPostsList[idx] = igPostsList[newIdx];
      igPostsList[newIdx] = temp;
      AdminPanel.renderIgPostsManager();
    };

    window.AdminPanel.uploadIgPostImage = async function(idx, inputEl) {
      if (!igPostsList[idx] || !inputEl.files || !inputEl.files[0]) return;
      const file = inputEl.files[0];
      if (file.size > 5 * 1024 * 1024) { Utils.showToast('Máx. 5MB.', 'error'); return; }
      try {
        Utils.showToast('Enviando...', 'info');
        if (window.SupabaseService && window.SupabaseService.isConfigured()) {
          const url = await window.SupabaseService.uploadImage(file, 'instagram');
          igPostsList[idx].image = url;
          AdminPanel.renderIgPostsManager();
          Utils.showToast('Enviada!', 'success');
        } else {
          const reader = new FileReader();
          reader.onload = e => { igPostsList[idx].image = e.target.result; AdminPanel.renderIgPostsManager(); };
          reader.readAsDataURL(file);
        }
      } catch (err) { Utils.showToast('Erro: ' + (err.message || ''), 'error'); }
    };

    const btnAddIg = $('btn-add-ig-post');
    if (btnAddIg) {
      btnAddIg.onclick = () => {
        igPostsList.push({ id: 'ig_' + Date.now(), image: '', postUrl: '', caption: '', featured: false });
        AdminPanel.renderIgPostsManager();
      };
    }
    
    AdminPanel.renderIgPostsManager();

    if ($('v-whatsapp')) $('v-whatsapp').value = s.whatsappNumber || '';
    if ($('v-phone')) $('v-phone').value = s.contactPhone || '';
    if ($('v-instagram')) $('v-instagram').value = s.instagram || '';
    if ($('v-address')) $('v-address').value = s.address || '';

    const btn = $('btn-save-visual');
    if (btn) btn.onclick = async () => {
      try {
        await DataStore.updateSettings({
          storeName: $('v-store-name').value.trim(),
          storeTagline: $('v-store-tagline').value.trim(),
          storeLogoEmoji: $('v-logo-emoji').value.trim() || '⚡',
          themeColor: $('v-theme-color').value,
          hero: {
            ...(DataStore.getSettings().hero || {}),
            title: $('v-hero-title').value.trim(),
            subtitle: $('v-hero-subtitle').value.trim(),
            ctaText: $('v-hero-cta').value.trim(),
            image: $('v-hero-image') ? $('v-hero-image').value.trim() : ''
          },
          announcementBar: {
            active: $('v-ann-active').checked,
            text: $('v-ann-text').value.trim()
          },
          featuredCollection: {
            active: $('v-featured-active') ? $('v-featured-active').checked : true,
            title: $('v-featured-title') ? $('v-featured-title').value.trim() : 'Nova Coleção 2026',
            subtitle: $('v-featured-subtitle') ? $('v-featured-subtitle').value.trim() : ''
          },
          instagramFeed: {
            active: $('v-ig-active') ? $('v-ig-active').checked : true,
            handle: $('v-ig-handle') ? $('v-ig-handle').value.trim() : '',
            profileUrl: $('v-ig-profile') ? $('v-ig-profile').value.trim() : '',
            title: $('v-ig-title') ? $('v-ig-title').value.trim() : 'Siga no Instagram',
            subtitle: $('v-ig-subtitle') ? $('v-ig-subtitle').value.trim() : '',
            bio: $('v-ig-bio') ? $('v-ig-bio').value.trim() : '',
            posts: igPostsList
          },
          whatsappNumber: $('v-whatsapp').value.trim(),
          contactPhone: $('v-phone').value.trim(),
          instagram: $('v-instagram').value.trim(),
          address: $('v-address').value.trim()
        });
        Utils.showToast('Configurações visuais salvas!', 'success');
        if ($('admin-brand-title')) $('admin-brand-title').textContent = $('v-store-name').value.trim();
        if ($('admin-brand-icon')) $('admin-brand-icon').textContent = $('v-logo-emoji').value.trim();
      } catch (err) {
        Utils.showToast('Erro: ' + (err.message || ''), 'error');
      }
    };
  }

  // ===== 13. SIZES =====
  function renderSizes() {
    const settings = DataStore.getSettings();
    let sizes = settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

    function renderTags() {
      const container = $('size-tags-container');
      if (!container) return;
      container.innerHTML = sizes.map(s =>
        `<div class="size-tag">
          <span>${Utils.sanitize(s)}</span>
          <button type="button" class="size-tag-remove" onclick="AdminPanel._removeSize('${Utils.sanitize(s)}')">✕</button>
        </div>`
      ).join('');
    }

    window.AdminPanel._removeSize = function (size) {
      sizes = sizes.filter(s => s !== size);
      renderTags();
    };

    window.AdminPanel.setPresetSizes = function (preset) {
      sizes = [...preset];
      renderTags();
    };

    renderTags();

    const addBtn = $('btn-add-size');
    if (addBtn) {
      addBtn.onclick = () => {
        const input = $('new-size-input');
        const val = input ? input.value.trim().toUpperCase() : '';
        if (!val) { Utils.showToast('Digite um tamanho!', 'warning'); return; }
        if (sizes.includes(val)) { Utils.showToast('Tamanho já existe!', 'warning'); return; }
        sizes.push(val);
        if (input) input.value = '';
        renderTags();
      };
    }

    const saveBtn = $('btn-save-sizes');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        try {
          await DataStore.updateSetting('availableSizes', sizes);
          Utils.showToast('Tamanhos salvos!', 'success');
        } catch (err) {
          Utils.showToast('Erro: ' + (err.message || ''), 'error');
        }
      };
    }
  }

  // ===== 14. SECURITY =====
  function renderSecurity() {
    const savePass = $('btn-save-password');
    if (savePass) {
      savePass.onclick = async () => {
        const newPass = $('new-password').value;
        const confirm = $('confirm-password').value;
        if (!newPass || newPass.length < 6) { Utils.showToast('Mínimo 6 caracteres!', 'error'); return; }
        if (newPass !== confirm) { Utils.showToast('Senhas não coincidem!', 'error'); return; }
        try {
          const hash = await Utils.hashPassword(newPass);
          await DataStore.updateSetting('adminPassword', hash);
          $('new-password').value = '';
          $('confirm-password').value = '';
          Utils.showToast('Senha alterada com sucesso!', 'success');
        } catch (err) {
          Utils.showToast('Erro: ' + (err.message || ''), 'error');
        }
      };
    }

    const exportJson = $('btn-export-json');
    if (exportJson) {
      exportJson.onclick = () => {
        const data = {
          products: DataStore.getProducts({ includeInactive: true }),
          categories: DataStore.getCategories(),
          orders: DataStore.getOrders(),
          settings: DataStore.getSettings(),
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `backup_loja_${Date.now()}.json`; a.click();
        URL.revokeObjectURL(url);
        Utils.showToast('Backup exportado!', 'success');
      };
    }

    const exportOrdersSec = $('btn-export-orders-sec');
    if (exportOrdersSec) exportOrdersSec.onclick = exportOrdersCsv;
  }

  // ===== CONFIRM DIALOG =====
  function showConfirm(title, message, onConfirm) {
    confirmCallback = onConfirm;
    if ($('confirm-title')) $('confirm-title').textContent = title;
    if ($('confirm-message')) $('confirm-message').textContent = message;
    if ($('confirm-modal')) $('confirm-modal').classList.add('active');
  }

  function statusClass(status) {
    const map = { novo: 'info', confirmado: 'active', em_preparo: 'pending', enviado: 'pending', entregue: 'active', cancelado: 'inactive' };
    return map[status] || 'info';
  }

  // ===== GLOBAL MODAL BINDS =====
  function bindGlobalModals() {
    // Product form
    bindProductForm();
    // Category form
    bindCategoryForm();

    // Order detail modal close
    if ($('btn-close-order-detail')) $('btn-close-order-detail').onclick = () => { if ($('order-detail-modal')) $('order-detail-modal').classList.remove('active'); };
    if ($('order-detail-modal')) $('order-detail-modal').addEventListener('click', e => { if (e.target === $('order-detail-modal')) $('order-detail-modal').classList.remove('active'); });

    // Confirm modal
    if ($('btn-confirm-ok')) $('btn-confirm-ok').onclick = () => {
      if ($('confirm-modal')) $('confirm-modal').classList.remove('active');
      if (typeof confirmCallback === 'function') confirmCallback();
      confirmCallback = null;
    };
    if ($('btn-confirm-cancel')) $('btn-confirm-cancel').onclick = () => { if ($('confirm-modal')) $('confirm-modal').classList.remove('active'); confirmCallback = null; };
    if ($('btn-close-confirm')) $('btn-close-confirm').onclick = () => { if ($('confirm-modal')) $('confirm-modal').classList.remove('active'); confirmCallback = null; };

    // Product form modal click outside
    if ($('product-form-modal')) {
      $('product-form-modal').addEventListener('click', e => { if (e.target === $('product-form-modal')) closeProductForm(); });
    }

    // Category form modal click outside
    if ($('category-form-modal')) {
      $('category-form-modal').addEventListener('click', e => { if (e.target === $('category-form-modal')) $('category-form-modal').classList.remove('active'); });
    }

    // Keyboard ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        ['product-form-modal', 'category-form-modal', 'order-detail-modal', 'confirm-modal'].forEach(id => {
          if ($(id)) $(id).classList.remove('active');
        });
        closeProductForm();
      }
    });
  }

  // Expose AdminPanel extras
  window.AdminPanel = window.AdminPanel || {};

  // ===== BOOT =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
  } else {
    initLogin();
  }

})();
