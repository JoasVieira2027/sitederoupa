/**
 * admin.js - Painel Admin Completo — Loja de Roupas
 * Controle total: produtos, variantes, estoque, pedidos, categorias, configurações
 */

(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try {
        window.lucide.createIcons();
      } catch (e) {
        console.warn('[Admin] Lucide icon refresh:', e);
      }
    }
  }

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
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span>Verificando...</span>'; }

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
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<span>Entrar no Painel</span><i data-lucide="arrow-right"></i>'; refreshIcons(); }
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
    if ($('admin-brand-icon') && !$('admin-brand-icon').querySelector('svg')) $('admin-brand-icon').textContent = settings.storeName?.charAt(0) || 'F';
    if ($('admin-brand-title')) $('admin-brand-title').textContent = settings.storeName || 'Fit Vibe Activewear';

    // Mobile sidebar toggle & backdrop
    const mobileToggle = $('admin-mobile-toggle');
    const sidebar = $('admin-sidebar');
    const backdrop = $('admin-sidebar-backdrop');
    const sidebarClose = $('admin-sidebar-close');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('admin-sidebar-locked');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('admin-sidebar-locked');
    }

    if (mobileToggle) {
      mobileToggle.onclick = () => {
        if (sidebar && sidebar.classList.contains('open')) closeSidebar();
        else openSidebar();
      };
    }
    if (sidebarClose) sidebarClose.onclick = closeSidebar;
    if (backdrop) backdrop.onclick = closeSidebar;

    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) closeSidebar();
    });

    // Nav click
    $$('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        $$('.admin-nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        navigateTo(item.dataset.section);
        closeSidebar();
      });
    });

    // Global modals
    bindGlobalModals();

    // Pre-initialize configuration sections so DOM values are loaded
    renderDelivery();
    renderVisual();
    renderPayments();

    // Open dashboard
    navigateTo('dashboard');

    // Listen to real-time events from Supabase
    document.addEventListener('orders-updated', () => {
      if (currentSection === 'dashboard') renderDashboard();
      if (currentSection === 'orders') renderOrders();
    });

    document.addEventListener('settings-updated', () => {
      const s = DataStore.getSettings();
      const toggle = $('dash-store-toggle');
      const badge = $('dash-store-state-badge');
      if (toggle && toggle.checked !== (s.storeOpen !== false)) {
        toggle.checked = s.storeOpen !== false;
      }
      if (badge) {
        badge.textContent = s.storeOpen !== false ? 'ABERTA' : 'FECHADA';
        badge.className = `status-badge ${s.storeOpen !== false ? 'active' : 'inactive'}`;
      }
    });

    document.addEventListener('categories-updated', () => {
      if (currentSection === 'categories') renderCategories();
      if (currentSection === 'stock') renderStock();
    });

    document.addEventListener('products-updated', () => {
      if (currentSection === 'products') renderProducts();
      if (currentSection === 'stock') renderStock();
      if (currentSection === 'dashboard') renderDashboard();
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
    refreshIcons();
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
        <div class="stat-card"><div class="stat-card-icon"><i data-lucide="shopping-bag"></i></div><div class="stat-card-value">${orders.length}</div><div class="stat-card-label">Total de Pedidos</div></div>
        <div class="stat-card"><div class="stat-card-icon"><i data-lucide="dollar-sign"></i></div><div class="stat-card-value">${Utils.formatCurrency(totalRevenue)}</div><div class="stat-card-label">Receita Total</div></div>
        <div class="stat-card"><div class="stat-card-icon"><i data-lucide="layers"></i></div><div class="stat-card-value">${activeProducts}</div><div class="stat-card-label">Produtos Ativos</div></div>
        <div class="stat-card"><div class="stat-card-icon"><i data-lucide="bell"></i></div><div class="stat-card-value">${orders.filter(o => o.status === 'novo').length}</div><div class="stat-card-label">Pedidos Novos</div></div>`;
    }

    // Store toggle
    const toggle = $('dash-store-toggle');
    const badge = $('dash-store-state-badge');
    if (toggle) {
      const isOpen = settings.storeOpen !== false;
      toggle.checked = isOpen;
      if (badge) {
        badge.textContent = isOpen ? 'ABERTA' : 'FECHADA';
        badge.className = `status-badge ${isOpen ? 'active' : 'inactive'}`;
      }
      toggle.onchange = async () => {
        const newState = toggle.checked;
        if (badge) {
          badge.textContent = newState ? 'ABERTA' : 'FECHADA';
          badge.className = `status-badge ${newState ? 'active' : 'inactive'}`;
        }
        try {
          await DataStore.updateSetting('storeOpen', newState);
          Utils.showToast(newState ? 'Loja aberta com sucesso!' : 'Loja fechada!', 'info');
        } catch (err) {
          console.error('[Admin] Erro ao alternar loja:', err);
          Utils.showToast('Erro ao salvar status: ' + (err.message || ''), 'error');
          toggle.checked = !newState;
          if (badge) {
            badge.textContent = !newState ? 'ABERTA' : 'FECHADA';
            badge.className = `status-badge ${!newState ? 'active' : 'inactive'}`;
          }
        }
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
          <span class="stock-alert-icon"><i data-lucide="${a.qty === 0 ? 'alert-octagon' : 'alert-triangle'}" style="${a.qty === 0 ? 'color:var(--danger);' : 'color:var(--warning);'}"></i></span>
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
    refreshIcons();
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
            ${p.image ? `<img src="${Utils.sanitize(p.image)}" alt="${Utils.sanitize(p.name)}">` : '<i data-lucide="image" style="width:20px;height:20px;color:var(--text-muted);"></i>'}
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
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:0.85rem;font-weight:700;min-width:24px;text-align:center;">${p.displayOrder || 0}</span>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;line-height:1;" onclick="AdminPanel.moveProduct('${p.id}', -1)" title="Mover para frente"><i data-lucide="chevron-up" style="width:13px;height:13px;"></i></button>
              <button type="button" class="btn btn-secondary btn-sm" style="padding:2px 6px;line-height:1;" onclick="AdminPanel.moveProduct('${p.id}', 1)" title="Mover para trás"><i data-lucide="chevron-down" style="width:13px;height:13px;"></i></button>
            </div>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn-sm ${p.featured ? 'btn-primary' : 'btn-secondary'}" 
            onclick="AdminPanel.toggleFeatured('${p.id}')" 
            style="font-size:0.75rem;padding:4px 9px;border-radius:var(--radius-full);cursor:pointer;white-space:nowrap;"
            title="Alternar presença na Nova Coleção / Destaques">
            <i data-lucide="star" style="width:13px;height:13px;${p.featured ? 'fill:currentColor;' : ''}"></i><span>${p.featured ? 'Sim' : 'Não'}</span>
          </button>
        </td>
        <td>
          <span class="status-badge ${p.active ? 'active' : 'inactive'}">${p.active ? 'Ativo' : 'Inativo'}</span>
          ${!p.inStock || totalStock === 0 ? '<br><span class="status-badge" style="background:var(--danger-bg);color:var(--danger);font-size:0.65rem;">Esgotado</span>' : ''}
        </td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="AdminPanel.editProduct('${p.id}')" style="display:inline-flex;align-items:center;gap:4px;"><i data-lucide="edit-3" style="width:13px;height:13px;"></i> Editar</button>
            <button class="btn btn-danger btn-sm" onclick="AdminPanel.confirmDeleteProduct('${p.id}')" title="Excluir"><i data-lucide="trash-2" style="width:13px;height:13px;"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:40px;">Nenhum produto cadastrado.</td></tr>`;
    refreshIcons();
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
      if ($('pf-display-order')) $('pf-display-order').value = product.displayOrder || 0;

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
      if ($('pf-display-order')) $('pf-display-order').value = 0;
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
      builder.innerHTML = `
        <div class="variant-empty-state">
          <div class="variant-empty-icon"><i data-lucide="palette"></i></div>
          <h4>Nenhuma variante de cor adicionada</h4>
          <p>Adicione cores para definir fotos específicas e controlar o estoque por tamanho.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="AdminPanel.addVariant()">
            <i data-lucide="plus"></i> <span>Adicionar Primeira Cor</span>
          </button>
        </div>`;
      refreshIcons();
      return;
    }

    builder.innerHTML = variantList.map((v, idx) => {
      const variantTotal = Object.values(v.sizes || {}).reduce((s, qty) => s + (parseInt(qty) || 0), 0);

      const sizesHtml = allSizes.map(size => {
        const qty = v.sizes[size] !== undefined ? v.sizes[size] : 0;
        return `
          <div class="variant-size-pill ${qty === 0 ? 'is-zero' : ''}" data-size="${size}">
            <div class="variant-size-label">${size}</div>
            <div class="variant-stepper">
              <button type="button" class="variant-step-btn minus" onclick="AdminPanel.stepVariantSize(${idx}, '${size}', -1)" aria-label="Diminuir ${size}">
                <i data-lucide="minus"></i>
              </button>
              <input type="number" min="0" max="9999" class="variant-size-input" 
                value="${qty}" 
                inputmode="numeric"
                data-size="${size}"
                onchange="AdminPanel.updateVariantSize(${idx}, '${size}', this.value)"
                oninput="AdminPanel.updateVariantSize(${idx}, '${size}', this.value)">
              <button type="button" class="variant-step-btn plus" onclick="AdminPanel.stepVariantSize(${idx}, '${size}', 1)" aria-label="Aumentar ${size}">
                <i data-lucide="plus"></i>
              </button>
            </div>
          </div>`;
      }).join('');

      return `
        <div class="variant-editor-card" data-idx="${idx}">
          <div class="variant-card-header">
            <div class="variant-color-main">
              <label class="variant-color-picker-label" title="Clique para escolher o tom da cor">
                <span class="variant-color-dot" id="variant-color-preview-${idx}" style="background:${v.colorHex || '#1E293B'};"></span>
                <input type="color" class="variant-native-color-picker" value="${v.colorHex || '#1E293B'}" 
                  onchange="AdminPanel.updateVariantColor(${idx}, 'hex', this.value)">
              </label>
              <div class="variant-color-name-wrap">
                <input type="text" class="form-control variant-color-name-input" value="${Utils.sanitize(v.color)}" 
                  placeholder="Nome da cor (ex: Preto Ônix)" 
                  onchange="AdminPanel.updateVariantColor(${idx}, 'name', this.value)"
                  oninput="AdminPanel.updateVariantColor(${idx}, 'name', this.value)">
              </div>
            </div>

            <div class="variant-header-actions">
              <span class="variant-subtotal-badge" id="variant-subtotal-${idx}">
                <i data-lucide="boxes" style="width:12px;height:12px;"></i>
                <span class="variant-subtotal-val">${variantTotal} un.</span>
              </span>
              <button type="button" class="btn-remove-variant" onclick="AdminPanel.removeVariant(${idx})" title="Remover esta cor">
                <i data-lucide="trash-2"></i>
                <span>Excluir Cor</span>
              </button>
            </div>
          </div>

          <div class="variant-photo-card">
            <div class="variant-thumb-box" id="variant-thumb-${idx}">
              ${v.image ? `<img src="${Utils.sanitize(v.image)}" alt="Foto da cor">` : '<i data-lucide="camera" style="width:20px;height:20px;color:var(--text-muted);"></i>'}
            </div>
            <div class="variant-photo-fields">
              <input type="url" class="form-control variant-img-url-input" value="${Utils.sanitize(v.image || '')}" 
                placeholder="URL da foto desta cor ou selecione do computador..." 
                onchange="AdminPanel.updateVariantImage(${idx}, this.value)">
              <div class="variant-photo-btns">
                <label class="btn btn-secondary btn-sm btn-variant-upload">
                  <i data-lucide="upload"></i>
                  <span>Upload Foto</span>
                  <input type="file" accept="image/*" style="display:none;" onchange="AdminPanel.uploadVariantImage(${idx}, this)">
                </label>
                ${v.image ? `
                  <button type="button" class="btn btn-danger btn-sm btn-variant-clear" onclick="AdminPanel.clearVariantImage(${idx})" title="Remover foto desta cor">
                    <i data-lucide="x"></i>
                    <span>Remover</span>
                  </button>` : ''}
              </div>
            </div>
          </div>

          <div class="variant-sizes-section">
            <div class="variant-sizes-label">
              <span>Quantidade em estoque por tamanho:</span>
            </div>
            <div class="variant-sizes-grid">${sizesHtml}</div>
          </div>
        </div>`;
    }).join('');

    refreshIcons();
  }

  // Variant mutations
  window.AdminPanel = window.AdminPanel || {};

  const CURATED_VARIANT_COLORS = ['#1E293B', '#059669', '#2563EB', '#D97706', '#E11D48', '#7C3AED', '#0D9488'];

  window.AdminPanel.addVariant = function () {
    const settings = DataStore.getSettings();
    const allSizes = settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
    const sizesObj = {};
    allSizes.forEach(s => { sizesObj[s] = 0; });
    const colorHex = CURATED_VARIANT_COLORS[variantList.length % CURATED_VARIANT_COLORS.length];
    variantList.push({ color: `Cor ${variantList.length + 1}`, colorHex, image: '', sizes: sizesObj });
    renderVariantBuilder();
  };

  window.AdminPanel.removeVariant = function (idx) {
    variantList.splice(idx, 1);
    renderVariantBuilder();
  };

  window.AdminPanel.updateVariantColor = function (idx, field, val) {
    if (!variantList[idx]) return;
    if (field === 'hex') {
      variantList[idx].colorHex = val;
      const preview = $(`variant-color-preview-${idx}`);
      if (preview) preview.style.background = val;
    } else {
      variantList[idx].color = val;
    }
  };

  window.AdminPanel.updateVariantImage = function (idx, val) {
    if (!variantList[idx]) return;
    variantList[idx].image = val.trim();
    const thumb = $(`variant-thumb-${idx}`);
    if (thumb) {
      thumb.innerHTML = variantList[idx].image
        ? `<img src="${Utils.sanitize(variantList[idx].image)}" alt="Foto da cor">`
        : '<i data-lucide="camera" style="width:20px;height:20px;color:var(--text-muted);"></i>';
      refreshIcons();
    }
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

  window.AdminPanel.updateVariantSize = function (idx, size, val) {
    if (!variantList[idx]) return;
    const qty = Math.max(0, parseInt(val) || 0);
    variantList[idx].sizes[size] = qty;
    
    // Update subtotal badge
    const subtotalEl = $(`variant-subtotal-${idx}`);
    if (subtotalEl) {
      const sum = Object.values(variantList[idx].sizes).reduce((a, b) => a + (parseInt(b) || 0), 0);
      const valEl = subtotalEl.querySelector('.variant-subtotal-val');
      if (valEl) valEl.textContent = `${sum} un.`;
    }
  };

  window.AdminPanel.stepVariantSize = function (idx, size, delta) {
    if (!variantList[idx]) return;
    const current = variantList[idx].sizes[size] || 0;
    const nextVal = Math.max(0, current + delta);
    variantList[idx].sizes[size] = nextVal;
    
    // Update DOM pill
    const card = document.querySelector(`.variant-editor-card[data-idx="${idx}"]`);
    if (card) {
      const pill = card.querySelector(`.variant-size-pill[data-size="${size}"]`);
      if (pill) {
        const input = pill.querySelector('.variant-size-input');
        if (input) input.value = nextVal;
        pill.classList.toggle('is-zero', nextVal === 0);
      }
    }
    
    // Update subtotal badge
    const subtotalEl = $(`variant-subtotal-${idx}`);
    if (subtotalEl) {
      const sum = Object.values(variantList[idx].sizes).reduce((a, b) => a + (parseInt(b) || 0), 0);
      const valEl = subtotalEl.querySelector('.variant-subtotal-val');
      if (valEl) valEl.textContent = `${sum} un.`;
    }
  };

  window.AdminPanel.toggleFeatured = async function (id) {
    try {
      const isFeatured = await DataStore.toggleProductFeatured(id);
      Utils.showToast(isFeatured ? 'Produto adicionado aos destaques da Nova Coleção!' : 'Produto removido da Nova Coleção.', 'info');
      renderProducts();
    } catch (err) {
      Utils.showToast('Erro: ' + (err.message || ''), 'error');
    }
  };

  window.AdminPanel.moveProduct = async function (id, direction) {
    try {
      const allProducts = DataStore.getProducts({ includeInactive: true });
      const sorted = [...allProducts].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      const idx = sorted.findIndex(p => p.id === id);
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= sorted.length) return;

      // Swap display orders
      const currentOrder = sorted[idx].displayOrder || idx;
      const targetOrder = sorted[targetIdx].displayOrder || targetIdx;

      sorted[idx].displayOrder = targetOrder;
      sorted[targetIdx].displayOrder = currentOrder;

      // If orders were the same, assign distinct values
      if (currentOrder === targetOrder) {
        sorted.forEach((p, i) => { p.displayOrder = i; });
      }

      await Promise.all([
        DataStore.saveProduct(sorted[idx]),
        DataStore.saveProduct(sorted[targetIdx])
      ]);

      renderProducts();
    } catch (err) {
      Utils.showToast('Erro ao mover: ' + (err.message || ''), 'error');
    }
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
        const displayOrder = $('pf-display-order') ? (parseInt($('pf-display-order').value) || 0) : 0;

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
          displayOrder,
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
        if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="save"></i><span>Salvar Produto</span>'; refreshIcons(); }
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
    const categories = DataStore.getCategories();

    // Populate category filter
    const catFilter = $('stock-filter-cat');
    if (catFilter) {
      catFilter.innerHTML = `<option value="all">Todas as Categorias</option>` +
        categories.map(c => `<option value="${Utils.sanitize(c.name)}">${Utils.sanitize(c.name)}</option>`).join('');
      catFilter.onchange = () => renderStockList();
    }

    const searchInput = $('stock-search');
    if (searchInput) {
      searchInput.oninput = Utils.debounce(() => renderStockList(), 300);
    }

    renderStockList();
  }

  function renderStockList(allProducts) {
    const stockList = $('stock-list');
    if (!stockList) return;

    const catFilter = $('stock-filter-cat');
    const searchInput = $('stock-search');
    const catVal = catFilter ? catFilter.value : 'all';
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let products = allProducts || DataStore.getProducts({ includeInactive: true });
    if (catVal !== 'all') products = products.filter(p => p.category === catVal);
    if (q) products = products.filter(p => p.name.toLowerCase().includes(q));

    if (!products.length) {
      stockList.innerHTML = `
        <div class="admin-empty-card" style="text-align:center;padding:50px 20px;background:white;border-radius:var(--radius-xl);border:1px solid var(--border);">
          <i data-lucide="package-search" style="width:44px;height:44px;color:var(--text-muted);margin-bottom:12px;"></i>
          <h3 style="font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:var(--carbon);margin-bottom:6px;">Nenhum produto encontrado</h3>
          <p style="color:var(--text-muted);font-size:0.86rem;margin:0;">Tente outro termo de busca ou selecione outra categoria.</p>
        </div>`;
      refreshIcons();
      return;
    }

    const settings = DataStore.getSettings();
    const allSizes = settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

    stockList.innerHTML = products.map(p => {
      const totalStock = DataStore.getProductTotalStock(p.id);
      const variants = p.variants || [];

      if (!variants.length) {
        return `<div class="admin-card stock-product-card" data-product-id="${p.id}">
          <div class="stock-card-header">
            <div class="stock-product-meta">
              <div class="stock-product-thumb">
                ${p.image ? `<img src="${Utils.sanitize(p.image)}" alt="${Utils.sanitize(p.name)}">` : '<i data-lucide="image" style="width:20px;height:20px;color:var(--text-muted);"></i>'}
              </div>
              <div class="stock-product-titles">
                <h3 class="stock-product-title">${Utils.sanitize(p.name)}</h3>
                <div class="stock-product-badges">
                  <span class="stock-category-badge">${Utils.sanitize(p.category)}</span>
                  <span class="stock-price-tag">${Utils.formatCurrency(p.price)}</span>
                </div>
              </div>
            </div>
            <div class="stock-card-actions">
              <span class="stock-total-badge is-out">Sem variantes</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="AdminPanel.editProduct('${p.id}')">
                <i data-lucide="plus" style="width:13px;height:13px;"></i> Adicionar Variantes
              </button>
            </div>
          </div>
        </div>`;
      }

      const variantsHtml = variants.map((v, vi) => {
        const variantTotal = (v.sizes || []).reduce((sum, s) => sum + (s.qty || 0), 0);
        const sizesHtml = allSizes.filter(sz =>
          (v.sizes || []).some(s => s.size === sz)
        ).map(sz => {
          const entry = (v.sizes || []).find(s => s.size === sz);
          const qty = entry ? entry.qty : 0;
          const statusClass = qty === 0 ? 'is-out' : qty <= 3 ? 'is-low' : 'is-good';
          const statusText = qty === 0 ? 'Esgotado' : qty <= 3 ? 'Baixo' : 'Disponível';

          return `<div class="stock-size-pill ${statusClass}" data-color="${Utils.sanitize(v.color)}" data-size="${sz}">
            <div class="stock-size-label-wrap">
              <span class="stock-size-label">${sz}</span>
              <span class="stock-size-status">${statusText}</span>
            </div>
            <div class="stock-stepper">
              <button type="button" class="stock-step-btn minus" aria-label="Diminuir ${sz}" onclick="AdminPanel.stepStock(this, -1)">
                <i data-lucide="minus"></i>
              </button>
              <input type="number" min="0" max="9999" class="stock-qty-input" 
                value="${qty}" 
                inputmode="numeric"
                data-product="${p.id}" data-color="${Utils.sanitize(v.color)}" data-size="${sz}"
                oninput="AdminPanel.onStockInputChange(this)">
              <button type="button" class="stock-step-btn plus" aria-label="Aumentar ${sz}" onclick="AdminPanel.stepStock(this, 1)">
                <i data-lucide="plus"></i>
              </button>
            </div>
          </div>`;
        }).join('');

        return `<div class="stock-variant-row" data-color="${Utils.sanitize(v.color)}">
          <div class="stock-variant-header">
            <div class="stock-variant-info">
              <span class="stock-color-dot" style="background:${v.colorHex || '#1E293B'};"></span>
              <span class="stock-variant-name">${Utils.sanitize(v.color)}</span>
              ${v.image ? `<img class="stock-variant-thumb" src="${Utils.sanitize(v.image)}" alt="${Utils.sanitize(v.color)}">` : ''}
              <span class="stock-variant-subtotal" data-color-total="${Utils.sanitize(v.color)}">${variantTotal} un.</span>
            </div>
            <div class="stock-quick-actions">
              <button type="button" class="btn-stock-quick" title="+1 em todos os tamanhos desta cor" onclick="AdminPanel.adjustAllColorStock('${p.id}', '${Utils.sanitize(v.color)}', 1)">+1</button>
              <button type="button" class="btn-stock-quick" title="+5 em todos os tamanhos desta cor" onclick="AdminPanel.adjustAllColorStock('${p.id}', '${Utils.sanitize(v.color)}', 5)">+5</button>
              <button type="button" class="btn-stock-quick danger" title="Zerar estoque desta cor" onclick="AdminPanel.adjustAllColorStock('${p.id}', '${Utils.sanitize(v.color)}', -9999)">Zerar</button>
            </div>
          </div>
          <div class="stock-size-grid">${sizesHtml}</div>
        </div>`;
      }).join('');

      const totalClass = totalStock === 0 ? 'is-out' : totalStock <= 10 ? 'is-low' : 'is-good';

      return `<div class="admin-card stock-product-card" data-product-id="${p.id}">
        <div class="stock-card-header">
          <div class="stock-product-meta">
            <div class="stock-product-thumb">
              ${p.image ? `<img src="${Utils.sanitize(p.image)}" alt="${Utils.sanitize(p.name)}">` : '<i data-lucide="image" style="width:20px;height:20px;color:var(--text-muted);"></i>'}
            </div>
            <div class="stock-product-titles">
              <h3 class="stock-product-title">${Utils.sanitize(p.name)}</h3>
              <div class="stock-product-badges">
                <span class="stock-category-badge">${Utils.sanitize(p.category)}</span>
                <span class="stock-price-tag">${Utils.formatCurrency(p.price)}</span>
              </div>
            </div>
          </div>
          <div class="stock-card-actions">
            <div class="stock-total-badge ${totalClass}">
              <span class="stock-total-dot"></span>
              <span class="stock-total-text" data-product-total="${p.id}">${totalStock === 0 ? 'Esgotado' : `${totalStock} un no total`}</span>
            </div>
            <button type="button" class="btn btn-primary btn-sm save-stock-btn" data-product="${p.id}">
              <i data-lucide="save"></i>
              <span>Salvar Estoque</span>
            </button>
          </div>
        </div>
        <div class="stock-card-body">${variantsHtml}</div>
      </div>`;
    }).join('');

    refreshIcons();
    stockList.querySelectorAll('.save-stock-btn').forEach(btn => {
      btn.onclick = async () => {
        const productId = btn.dataset.product;
        const product = DataStore.getProductById(productId);
        if (!product) return;

        btn.disabled = true;
        btn.innerHTML = '<span>Salvando...</span>';

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

          Utils.showToast(`Estoque de "${product.name}" atualizado! (${totalStock} un)`, 'success');
          btn.classList.remove('has-changes');
          btn.innerHTML = '<i data-lucide="check" style="width:13px;height:13px;"></i> Salvo!';
          setTimeout(() => {
            btn.innerHTML = '<i data-lucide="save" style="width:13px;height:13px;"></i> Salvar Estoque';
            refreshIcons();
          }, 1800);
        } catch (err) {
          Utils.showToast('Erro ao salvar estoque: ' + (err.message || ''), 'error');
          btn.innerHTML = '<i data-lucide="save" style="width:13px;height:13px;"></i> Salvar Estoque';
        } finally {
          btn.disabled = false;
          refreshIcons();
        }
      };
    });
  }

  // Stock interactive stepper mutations
  window.AdminPanel.stepStock = function (btn, delta) {
    const pill = btn.closest('.stock-size-pill');
    if (!pill) return;
    const input = pill.querySelector('.stock-qty-input');
    if (!input) return;
    const currentVal = parseInt(input.value) || 0;
    const nextVal = Math.max(0, currentVal + delta);
    input.value = nextVal;
    AdminPanel.onStockInputChange(input);
  };

  window.AdminPanel.onStockInputChange = function (input) {
    const qty = Math.max(0, parseInt(input.value) || 0);
    input.value = qty;

    const pill = input.closest('.stock-size-pill');
    if (pill) {
      pill.classList.remove('is-out', 'is-low', 'is-good');
      const statusText = pill.querySelector('.stock-size-status');
      if (qty === 0) {
        pill.classList.add('is-out');
        if (statusText) statusText.textContent = 'Esgotado';
      } else if (qty <= 3) {
        pill.classList.add('is-low');
        if (statusText) statusText.textContent = 'Baixo';
      } else {
        pill.classList.add('is-good');
        if (statusText) statusText.textContent = 'Disponível';
      }
    }

    const card = input.closest('.stock-product-card');
    if (!card) return;

    // Recalculate color subtotal
    const colorRow = input.closest('.stock-variant-row');
    if (colorRow) {
      const colorInputs = colorRow.querySelectorAll('.stock-qty-input');
      const colorTotal = Array.from(colorInputs).reduce((sum, el) => sum + (parseInt(el.value) || 0), 0);
      const subtotalEl = colorRow.querySelector('.stock-variant-subtotal');
      if (subtotalEl) subtotalEl.textContent = `${colorTotal} un.`;
    }

    // Recalculate product total
    const allInputs = card.querySelectorAll('.stock-qty-input');
    const productTotal = Array.from(allInputs).reduce((sum, el) => sum + (parseInt(el.value) || 0), 0);
    const totalEl = card.querySelector('.stock-total-text');
    if (totalEl) totalEl.textContent = productTotal === 0 ? 'Esgotado' : `${productTotal} un no total`;

    const totalBadge = card.querySelector('.stock-total-badge');
    if (totalBadge) {
      totalBadge.classList.remove('is-out', 'is-low', 'is-good');
      totalBadge.classList.add(productTotal === 0 ? 'is-out' : productTotal <= 10 ? 'is-low' : 'is-good');
    }

    // Highlight save button
    const saveBtn = card.querySelector('.save-stock-btn');
    if (saveBtn) {
      saveBtn.classList.add('has-changes');
      saveBtn.innerHTML = '<i data-lucide="save" style="width:13px;height:13px;"></i> Salvar Alterações *';
      refreshIcons();
    }
  };

  window.AdminPanel.adjustAllColorStock = function (productId, colorName, delta) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;
    const colorRow = card.querySelector(`.stock-variant-row[data-color="${colorName}"]`);
    if (!colorRow) return;

    const inputs = colorRow.querySelectorAll('.stock-qty-input');
    inputs.forEach(input => {
      if (delta === -9999) {
        input.value = 0;
      } else {
        input.value = Math.max(0, (parseInt(input.value) || 0) + delta);
      }
    });

    if (inputs.length) {
      AdminPanel.onStockInputChange(inputs[0]);
    }
  };

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
              <td><div style="width:36px;height:36px;border-radius:var(--radius-sm);background:var(--bg-input);display:flex;align-items:center;justify-content:center;color:var(--primary);"><i data-lucide="${Utils.sanitize(c.icon && !c.icon.includes('/') && c.icon.length < 30 ? c.icon : 'tag')}" style="width:18px;height:18px;"></i></div></td>
              <td style="font-weight:700;">${Utils.sanitize(c.name)}</td>
              <td>${products.length} produto(s)</td>
              <td>
                <div style="display:flex;gap:6px;">
                  <button class="btn btn-secondary btn-sm" onclick="AdminPanel.editCategory('${c.id}')" style="display:inline-flex;align-items:center;gap:4px;"><i data-lucide="edit-3" style="width:13px;height:13px;"></i> Editar</button>
                  <button class="btn btn-danger btn-sm" onclick="AdminPanel.confirmDeleteCategory('${c.id}')" title="Excluir"><i data-lucide="trash-2" style="width:13px;height:13px;"></i></button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>` : `<p style="color:var(--text-muted);text-align:center;padding:40px;">Nenhuma categoria cadastrada.</p>`;

    const btnNew = $('btn-new-category');
    if (btnNew) btnNew.onclick = () => openCategoryForm(null);
    refreshIcons();
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
      const icon = $('cf-icon').value.trim() || 'tag';
      if (!name) { Utils.showToast('Informe o nome!', 'error'); return; }

      try {
        await DataStore.saveCategory({ id: editingCategoryId || null, name, icon });
        Utils.showToast(editingCategoryId ? 'Categoria atualizada!' : 'Categoria criada!', 'success');
        if ($('category-form-modal')) $('category-form-modal').classList.remove('active');
        renderCategories();
        renderStock();
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
            <button class="btn btn-secondary btn-sm" onclick="AdminPanel.viewOrder('${o.id}')" style="display:inline-flex;align-items:center;gap:4px;"><i data-lucide="eye" style="width:13px;height:13px;"></i> Ver</button>
            <button class="btn btn-danger btn-sm" onclick="AdminPanel.confirmDeleteOrder('${o.id}')" title="Excluir"><i data-lucide="trash-2" style="width:13px;height:13px;"></i></button>
          </div>
        </div>
        <div class="admin-card-body" style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start;">
          <div>
            <div style="display:flex;align-items:center;gap:6px;"><i data-lucide="user" style="width:14px;height:14px;color:var(--text-muted);"></i><strong>${Utils.sanitize(o.customer?.name || '—')}</strong></div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;display:flex;align-items:center;gap:6px;"><i data-lucide="phone" style="width:13px;height:13px;"></i>${Utils.sanitize(o.customer?.phone || '—')}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;display:flex;align-items:center;gap:6px;"><i data-lucide="${o.deliveryType === 'pickup' ? 'store' : 'truck'}" style="width:13px;height:13px;"></i>${o.deliveryType === 'pickup' ? 'Retirada na Loja' : `Entrega: ${Utils.sanitize(o.customer?.address || '—')}`}</div>
          </div>
          <div>
            <div style="font-size:0.8rem;color:var(--text-muted);">Itens:</div>
            ${(o.items || []).map(i => `<div style="font-size:0.82rem;">▸ ${Utils.sanitize(i.name)} ${i.color ? `(${i.color}` : ''}${i.size ? ` Tam.${i.size})` : i.color ? ')' : ''} × ${i.qty}</div>`).join('')}
          </div>
          <div style="margin-left:auto;text-align:right;">
            <div style="font-size:0.8rem;color:var(--text-muted);display:flex;align-items:center;justify-content:flex-end;gap:6px;"><i data-lucide="credit-card" style="width:13px;height:13px;"></i>${Utils.sanitize(o.paymentMethod)}</div>
            <div style="font-size:1.2rem;font-weight:700;color:var(--primary);">${Utils.formatCurrency(o.total)}</div>
          </div>
        </div>
      </div>`).join('');

    refreshIcons();
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
    refreshIcons();
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

    const elDeliveryEnabled = $('delivery-enabled');
    const elDeliveryFee = $('delivery-fee');
    const elDeliveryFreeThreshold = $('delivery-free-threshold');
    const elFreeDeliveryEnabled = $('free-delivery-enabled');
    const elDeliveryTime = $('delivery-time');
    const elPickupEnabled = $('pickup-enabled');
    const elPickupAddress = $('pickup-address');
    const elPickupEstimate = $('pickup-estimate');

    const isDeliveryOn = d.deliveryEnabled !== false;
    const isFreeOn = d.freeDeliveryEnabled !== false;
    const isPickupOn = d.pickupEnabled !== false;

    if (elDeliveryEnabled) {
      elDeliveryEnabled.checked = isDeliveryOn;
      const lbl = $('delivery-enabled-label');
      if (lbl) lbl.textContent = isDeliveryOn ? 'Ativo' : 'Desativado';
      elDeliveryEnabled.onchange = () => {
        if (lbl) lbl.textContent = elDeliveryEnabled.checked ? 'Ativo' : 'Desativado';
      };
    }

    if (elFreeDeliveryEnabled) {
      elFreeDeliveryEnabled.checked = isFreeOn;
      const lbl = $('free-delivery-enabled-label');
      if (lbl) lbl.textContent = isFreeOn ? 'Ativo' : 'Desativado';
      if (elDeliveryFreeThreshold) {
        elDeliveryFreeThreshold.disabled = !isFreeOn;
        elDeliveryFreeThreshold.style.opacity = isFreeOn ? '1' : '0.5';
      }
      elFreeDeliveryEnabled.onchange = () => {
        const active = elFreeDeliveryEnabled.checked;
        if (lbl) lbl.textContent = active ? 'Ativo' : 'Desativado';
        if (elDeliveryFreeThreshold) {
          elDeliveryFreeThreshold.disabled = !active;
          elDeliveryFreeThreshold.style.opacity = active ? '1' : '0.5';
        }
      };
    }

    if (elPickupEnabled) {
      elPickupEnabled.checked = isPickupOn;
      const lbl = $('pickup-enabled-label');
      if (lbl) lbl.textContent = isPickupOn ? 'Ativo' : 'Desativado';
      elPickupEnabled.onchange = () => {
        if (lbl) lbl.textContent = elPickupEnabled.checked ? 'Ativo' : 'Desativado';
      };
    }

    if (elDeliveryFee) elDeliveryFee.value = d.deliveryFee !== undefined ? d.deliveryFee : 15;
    if (elDeliveryFreeThreshold) elDeliveryFreeThreshold.value = d.freeDeliveryThreshold !== undefined ? d.freeDeliveryThreshold : 199;
    if (elDeliveryTime) elDeliveryTime.value = d.estimatedTime || '';
    if (elPickupAddress) elPickupAddress.value = d.pickupAddress || '';
    if (elPickupEstimate) elPickupEstimate.value = d.pickupEstimate || 'Pronto em até 2 horas';

    const btn = $('btn-save-delivery');
    if (btn) btn.onclick = async () => {
      const origHtml = btn.innerHTML;
      try {
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader" class="spin"></i> <span>Salvando...</span>';
        refreshIcons();

        const updatedDelivery = {
          deliveryEnabled: elDeliveryEnabled ? elDeliveryEnabled.checked : true,
          deliveryFee: elDeliveryFee ? (parseFloat(elDeliveryFee.value) || 0) : 15,
          freeDeliveryEnabled: elFreeDeliveryEnabled ? elFreeDeliveryEnabled.checked : true,
          freeDeliveryThreshold: elDeliveryFreeThreshold ? (parseFloat(elDeliveryFreeThreshold.value) || 0) : 199,
          estimatedTime: elDeliveryTime ? elDeliveryTime.value.trim() : '',
          pickupEnabled: elPickupEnabled ? elPickupEnabled.checked : true,
          pickupAddress: elPickupAddress ? elPickupAddress.value.trim() : '',
          pickupEstimate: elPickupEstimate ? elPickupEstimate.value.trim() : 'Pronto em até 2 horas'
        };

        await DataStore.updateSetting('delivery', updatedDelivery);
        Utils.showToast('Configurações de frete e entrega salvas com sucesso!', 'success');
      } catch (err) {
        Utils.showToast('Erro ao salvar entrega: ' + (err.message || ''), 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = origHtml;
        refreshIcons();
      }
    };

    refreshIcons();
  }

  // ===== 10. PAYMENTS =====
  function renderPayments() {
    const settings = DataStore.getSettings();
    const methods = settings.paymentMethods || [];
    const pix = settings.pixDetails || {};

    // Payment methods toggles
    const el = $('payment-methods-list');
    const getPaymentLucideIcon = (m) => {
      const id = ((m.id || '') + ' ' + (m.name || '')).toLowerCase();
      if (id.includes('pix')) return 'qr-code';
      if (id.includes('card') || id.includes('cartao') || id.includes('crédito') || id.includes('debito')) return 'credit-card';
      if (id.includes('dinheiro') || id.includes('cash') || id.includes('money')) return 'banknote';
      return 'wallet';
    };

    if (el) {
      el.innerHTML = methods.map((m, i) => `
        <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);">
          <div style="width:36px;height:36px;border-radius:var(--radius-sm);background:var(--bg-input);display:flex;align-items:center;justify-content:center;color:var(--primary);">
            <i data-lucide="${getPaymentLucideIcon(m)}" style="width:18px;height:18px;"></i>
          </div>
          <span style="flex:1;font-weight:600;">${Utils.sanitize(m.name)}</span>
          <label class="toggle-switch">
            <input type="checkbox" id="pay-toggle-${i}" ${m.active ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>`).join('');
      refreshIcons();
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
    if ($('v-logo-emoji')) $('v-logo-emoji').value = s.storeLogoEmoji || '';
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
            const url = await window.SupabaseService.uploadImage(file, 'products');
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
    const ann = s.announcementBar || {};
    const annActive = ann.active === true || ann.active === 'true';
    const annCheckbox = $('v-ann-active');
    const annBadge = $('v-ann-badge');
    const annText = $('v-ann-text');

    if (annCheckbox) {
      annCheckbox.checked = annActive;
      if (annBadge) {
        annBadge.textContent = annActive ? 'Ativa' : 'Desativada';
        annBadge.className = `status-badge ${annActive ? 'active' : 'inactive'}`;
      }

      annCheckbox.onchange = async () => {
        const isActive = annCheckbox.checked;
        if (annBadge) {
          annBadge.textContent = isActive ? 'Ativa' : 'Desativada';
          annBadge.className = `status-badge ${isActive ? 'active' : 'inactive'}`;
        }
        try {
          const currentSettings = DataStore.getSettings();
          const currentAnn = currentSettings.announcementBar || {};
          await DataStore.updateSetting('announcementBar', {
            ...currentAnn,
            active: isActive,
            text: (annText ? annText.value.trim() : '') || currentAnn.text || ''
          });
          Utils.showToast(isActive ? 'Barra de anúncio ativada!' : 'Barra de anúncio desativada!', 'info');
        } catch (err) {
          console.error(err);
          Utils.showToast('Erro ao atualizar barra de anúncio: ' + (err.message || ''), 'error');
          annCheckbox.checked = !isActive;
          if (annBadge) {
            annBadge.textContent = !isActive ? 'Ativa' : 'Desativada';
            annBadge.className = `status-badge ${!isActive ? 'active' : 'inactive'}`;
          }
        }
      };
    }
    if (annText) annText.value = ann.text || '';

    // Featured Collection settings
    const f = s.featuredCollection || {};
    const fActive = f.active !== false && f.active !== 'false';
    const featuredCheckbox = $('v-featured-active');
    const featuredBadge = $('v-featured-badge');

    if (featuredCheckbox) {
      featuredCheckbox.checked = fActive;
      if (featuredBadge) {
        featuredBadge.textContent = fActive ? 'Ativa' : 'Desativada';
        featuredBadge.className = `status-badge ${fActive ? 'active' : 'inactive'}`;
      }

      featuredCheckbox.onchange = async () => {
        const isActive = featuredCheckbox.checked;
        if (featuredBadge) {
          featuredBadge.textContent = isActive ? 'Ativa' : 'Desativada';
          featuredBadge.className = `status-badge ${isActive ? 'active' : 'inactive'}`;
        }
        try {
          const curSettings = DataStore.getSettings();
          const curFeatured = curSettings.featuredCollection || {};
          await DataStore.updateSetting('featuredCollection', {
            ...curFeatured,
            active: isActive,
            title: $('v-featured-title') ? $('v-featured-title').value.trim() : (curFeatured.title || 'Nova Coleção 2026'),
            subtitle: $('v-featured-subtitle') ? $('v-featured-subtitle').value.trim() : (curFeatured.subtitle || '')
          });
          Utils.showToast(isActive ? 'Nova Coleção ativada!' : 'Nova Coleção desativada!', 'info');
        } catch (err) {
          console.error(err);
          Utils.showToast('Erro ao atualizar Nova Coleção: ' + (err.message || ''), 'error');
          featuredCheckbox.checked = !isActive;
          if (featuredBadge) {
            featuredBadge.textContent = !isActive ? 'Ativa' : 'Desativada';
            featuredBadge.className = `status-badge ${!isActive ? 'active' : 'inactive'}`;
          }
        }
      };
    }
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
            ${post.image ? `<img src="${Utils.sanitize(post.image)}" style="width:100%;height:100%;object-fit:cover;">` : '<i data-lucide="camera" style="width:24px;height:24px;color:var(--text-muted);"></i>'}
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="text" class="form-control" style="flex:1;padding:4px 8px;font-size:0.85rem;" placeholder="URL da Foto ou faça upload" value="${Utils.sanitize(post.image || '')}" onchange="AdminPanel.updateIgPost(${idx}, 'image', this.value)">
              <label class="btn btn-secondary btn-sm" style="cursor:pointer;padding:4px 8px;font-size:0.8rem;display:inline-flex;align-items:center;gap:4px;">
                <i data-lucide="upload" style="width:13px;height:13px;"></i> Upload
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
                <button type="button" class="btn btn-secondary btn-sm" onclick="AdminPanel.moveIgPost(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Subir"><i data-lucide="chevron-up" style="width:13px;height:13px;"></i></button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="AdminPanel.moveIgPost(${idx}, 1)" ${idx === igPostsList.length - 1 ? 'disabled' : ''} title="Descer"><i data-lucide="chevron-down" style="width:13px;height:13px;"></i></button>
                <button type="button" class="btn btn-danger btn-sm" onclick="AdminPanel.removeIgPost(${idx})" title="Remover"><i data-lucide="x" style="width:13px;height:13px;"></i></button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      refreshIcons();
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
          const url = await window.SupabaseService.uploadImage(file, 'products');
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
      const origText = btn.textContent;
      try {
        btn.disabled = true;
        btn.textContent = 'Salvando...';
        await DataStore.updateSettings({
          storeName: $('v-store-name').value.trim(),
          storeTagline: $('v-store-tagline').value.trim(),
          storeLogoEmoji: $('v-logo-emoji') ? $('v-logo-emoji').value.trim() : '',
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
      } finally {
        btn.disabled = false;
        btn.textContent = origText;
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
      refreshIcons();
      container.innerHTML = sizes.map(s =>
        `<div class="size-tag">
          <span>${Utils.sanitize(s)}</span>
          <button type="button" class="size-tag-remove" onclick="AdminPanel._removeSize('${Utils.sanitize(s)}')"><i data-lucide="x" style="width:12px;height:12px;"></i></button>
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
