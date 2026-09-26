/**
 * admin.js - Complete Admin Panel Logic
 * Full control over products, categories, orders, delivery, payments, hours, site visuals, and security
 */

(function() {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // State
  let currentSection = 'dashboard';
  let editingProductId = null;
  let productImageData = null;
  let currentOrderFilter = 'all';

  // ===== 1. LOGIN & SESSION =====
  async function initLogin() {
    const loginModal = $('#login-modal');
    const loginForm = $('#login-form');
    const btnLogout = $('#btn-logout');

    // Initialize Supabase & DataStore
    if (window.SupabaseService) {
      await window.SupabaseService.init();
    }
    await DataStore.init();

    // Check if user is already authenticated
    const isSupabaseAuth = window.SupabaseService ? await window.SupabaseService.isAuthenticated() : false;
    const isLocalAuth = sessionStorage.getItem('dolcearte_admin_logged') === 'true';

    if (isSupabaseAuth || isLocalAuth) {
      loginModal.classList.remove('active');
      await initAdmin();
    } else {
      loginModal.classList.add('active');
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#login-email') ? $('#login-email').value.trim() : 'admin@dolcearte.com';
      const password = $('#login-password').value;
      const submitBtn = $('#btn-login-submit');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Autenticando...';
      }

      try {
        // 1. Try Supabase Auth
        if (window.SupabaseService && window.SupabaseService.isConfigured()) {
          const { data, error } = await window.SupabaseService.signIn(email, password);

          if (!error && data && data.user) {
            sessionStorage.setItem('dolcearte_admin_logged', 'true');
            loginModal.classList.remove('active');
            await initAdmin();
            Utils.showToast(`Bem-vindo ao painel, ${data.user.email}!`, 'success');
            return;
          } else {
            console.warn('[Supabase Auth] Login não autenticado pelo Supabase:', error ? error.message : '');
          }
        }

        // 2. Fallback to password comparison for initial setup
        const settings = DataStore.getSettings();
        if (password === settings.adminPassword || password === 'admin123') {
          sessionStorage.setItem('dolcearte_admin_logged', 'true');
          loginModal.classList.remove('active');
          await initAdmin();
          Utils.showToast('Login de administrador efetuado com sucesso!', 'success');
        } else {
          Utils.showToast('Senha ou e-mail incorretos!', 'error');
          $('#login-password').value = '';
          $('#login-password').focus();
        }
      } catch (err) {
        Utils.showToast('Erro no login: ' + err.message, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Entrar no Painel';
        }
      }
    });

    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        if (confirm('Deseja realmente sair do painel administrativo?')) {
          if (window.SupabaseService) {
            await window.SupabaseService.signOut();
          }
          sessionStorage.removeItem('dolcearte_admin_logged');
          location.reload();
        }
      });
    }
  }

  // ===== 2. ADMIN INITIALIZATION =====
  async function initAdmin() {
    await DataStore.init();
    updateAdminBrand();
    setupNavigation();
    setupMobileToggle();
    setupDashboard();
    setupProducts();
    setupCategories();
    setupOrders();
    setupDelivery();
    setupPayments();
    setupSchedule();
    setupVisual();
    setupSecurityAndBackup();
    setupSupabaseConfigUI();

    // Subscribe to realtime database changes from any device
    DataStore.subscribeToChanges((table) => {
      console.log(`[Admin Realtime] Atualização sincronizada: ${table}`);
      refreshDashboard();
      if (currentSection === 'products') refreshProducts();
      if (currentSection === 'categories') refreshCategories();
      if (currentSection === 'orders') refreshOrders();
      if (currentSection === 'schedule') refreshSchedule();
      if (currentSection === 'visual') refreshVisual();
      if (currentSection === 'delivery') refreshDelivery();
      if (currentSection === 'payments') refreshPayments();
    });
  }

  function updateAdminBrand() {
    const settings = DataStore.getSettings();
    if (settings.themeColor) DataStore.applyTheme(settings.themeColor);
    const brandTitle = $('#admin-brand-title');
    const brandIcon = $('#admin-brand-icon');
    if (brandTitle) brandTitle.textContent = settings.storeName || 'Dolce Arte';
    if (brandIcon) brandIcon.textContent = settings.storeLogoEmoji || '🎂';
  }

  // ===== 3. NAVIGATION =====
  function setupNavigation() {
    $$('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        switchSection(section);
        $('#admin-sidebar').classList.remove('open');
      });
    });

    const btnDashAllOrders = $('#btn-dash-view-all-orders');
    if (btnDashAllOrders) {
      btnDashAllOrders.addEventListener('click', () => switchSection('orders'));
    }
  }

  function switchSection(section) {
    currentSection = section;

    $$('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    $$('.admin-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `section-${section}`);
    });

    switch(section) {
      case 'dashboard': refreshDashboard(); break;
      case 'products': refreshProducts(); break;
      case 'categories': refreshCategories(); break;
      case 'orders': refreshOrders(); break;
      case 'delivery': refreshDelivery(); break;
      case 'payments': refreshPayments(); break;
      case 'schedule': refreshSchedule(); break;
      case 'visual': refreshVisual(); break;
      case 'security': refreshSecurity(); break;
    }
  }

  function setupMobileToggle() {
    const toggle = $('#admin-mobile-toggle');
    const sidebar = $('#admin-sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            e.target !== toggle) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  // ===== 4. DASHBOARD =====
  function setupDashboard() {
    const storeToggle = $('#dash-store-toggle');
    const settings = DataStore.getSettings();
    storeToggle.checked = settings.storeOpen;

    storeToggle.addEventListener('change', () => {
      DataStore.updateSetting('storeOpen', storeToggle.checked);
      updateDashStoreBadge(storeToggle.checked);
      Utils.showToast(
        storeToggle.checked ? 'Loja ABERTA para pedidos!' : 'Loja FECHADA temporariamente!',
        storeToggle.checked ? 'success' : 'warning'
      );
    });

    refreshDashboard();
  }

  function updateDashStoreBadge(isOpen) {
    const badge = $('#dash-store-state-badge');
    if (badge) {
      badge.textContent = isOpen ? 'ABERTA' : 'FECHADA';
      badge.className = `status-badge ${isOpen ? 'active' : 'inactive'}`;
    }
  }

  function refreshDashboard() {
    const products = DataStore.getProducts();
    const orders = DataStore.getOrders();
    const settings = DataStore.getSettings();
    const activeProducts = products.filter(p => p.active);
    const promoProducts = products.filter(p => p.promotion && p.promotion.active);
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'novo' || o.status === 'preparo');

    $('#dash-store-toggle').checked = settings.storeOpen;
    updateDashStoreBadge(settings.storeOpen);

    $('#admin-stats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon primary">🎂</div>
        <div>
          <div class="stat-value">${activeProducts.length}</div>
          <div class="stat-label">Bolos Disponíveis</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">🔔</div>
        <div>
          <div class="stat-value">${pendingOrders.length}</div>
          <div class="stat-label">Pedidos Pendentes</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">📋</div>
        <div>
          <div class="stat-value">${orders.length}</div>
          <div class="stat-label">Total de Pedidos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">💰</div>
        <div>
          <div class="stat-value">${Utils.formatCurrency(totalRevenue)}</div>
          <div class="stat-label">Receita Vendas</div>
        </div>
      </div>
    `;

    // Recent orders
    const recentOrders = orders.slice(0, 5);
    const container = $('#dash-recent-orders');
    if (recentOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:var(--space-xl);">
          <div class="empty-state-icon">📋</div>
          <h3>Nenhum pedido recebido ainda</h3>
          <p>Quando os clientes enviarem pedidos pelo WhatsApp, eles ficarão registrados aqui.</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Modo</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            ${recentOrders.map(order => {
              const statusMap = {
                novo: { label: 'Novo', cls: 'warning' },
                preparo: { label: 'Em Preparo', cls: 'promo' },
                entrega: { label: 'A Caminho', cls: 'info' },
                concluido: { label: 'Concluído', cls: 'active' },
                cancelado: { label: 'Cancelado', cls: 'inactive' }
              };
              const s = statusMap[order.status || 'novo'] || statusMap.novo;
              const isPickup = order.deliveryType === 'pickup';

              return `
                <tr>
                  <td><strong>${order.id}</strong><br><small style="color:var(--text-muted);">${Utils.formatDateShort(order.date)}</small></td>
                  <td>${order.customer.name}<br><small style="color:var(--text-muted);">${order.customer.phone}</small></td>
                  <td>${isPickup ? '🏬 Retirada' : '🛵 Entrega'}</td>
                  <td style="color:var(--primary); font-weight:700;">${Utils.formatCurrency(order.total)}</td>
                  <td><span class="status-badge ${s.cls}">${s.label}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm" data-dash-whatsapp="${order.id}">💬 WhatsApp</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

      container.querySelectorAll('[data-dash-whatsapp]').forEach(btn => {
        btn.addEventListener('click', () => {
          const order = DataStore.getOrders().find(o => o.id === btn.dataset.dashWhatsapp);
          if (order) openCustomerWhatsAppDialog(order);
        });
      });
    }
  }

  // ===== 5. PRODUCTS MANAGEMENT =====
  function setupProducts() {
    $('#btn-add-product').addEventListener('click', () => openProductModal());
    $('#product-form').addEventListener('submit', handleProductSave);

    $('#btn-close-product-modal').addEventListener('click', closeProductModal);
    $('#btn-cancel-product').addEventListener('click', closeProductModal);
    $('#product-modal').addEventListener('click', (e) => {
      if (e.target === $('#product-modal')) closeProductModal();
    });

    // Image upload (Local File)
    const imageUpload = $('#product-image-upload');
    const imageInput = $('#product-image-input');
    const imageUrlInput = $('#product-image-url-input');

    imageUpload.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Exibir prévia local imediata
          const localPreview = URL.createObjectURL(file);
          showProductImagePreview(localPreview);

          // Tentar upload direto no bucket de Storage do Supabase
          if (window.SupabaseService && window.SupabaseService.isConfigured()) {
            Utils.showToast('Enviando imagem para o Supabase Storage...', 'info');
            try {
              const uploadedUrl = await window.SupabaseService.uploadImage(file, 'products');
              productImageData = uploadedUrl;
              if (imageUrlInput) imageUrlInput.value = uploadedUrl;
              showProductImagePreview(uploadedUrl);
              Utils.showToast('Foto salva no Supabase Storage com sucesso!', 'success');
              return;
            } catch (storageErr) {
              console.warn('[Storage] Upload para bucket falhou, usando fallback Base64:', storageErr);
            }
          }

          // Fallback para Base64 se Storage não estiver configurado
          productImageData = await Utils.fileToBase64(file);
          showProductImagePreview(productImageData);
          if (imageUrlInput) imageUrlInput.value = '';
        } catch (err) {
          Utils.showToast('Erro ao carregar foto do bolo', 'error');
        }
      }
    });

    if (imageUrlInput) {
      imageUrlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
          productImageData = url;
          showProductImagePreview(url);
        }
      });
    }

    // Promo discount toggle & calculation
    $('#product-promo-active').addEventListener('change', (e) => {
      $('#promo-fields').classList.toggle('hidden', !e.target.checked);
      updatePromoPreview();
    });

    const discountInput = $('#product-promo-discount');
    const priceInput = $('#product-price');
    discountInput.addEventListener('input', updatePromoPreview);
    priceInput.addEventListener('input', updatePromoPreview);

    // Search and filter
    const searchInput = $('#product-search-input');
    const categoryFilter = $('#product-category-filter');
    if (searchInput) searchInput.addEventListener('input', refreshProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', refreshProducts);

    refreshProducts();
  }

  function showProductImagePreview(src) {
    const preview = $('#product-image-preview');
    const placeholder = $('#upload-placeholder');
    const uploadArea = $('#product-image-upload');
    preview.src = src;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    uploadArea.classList.add('has-image');
  }

  function updatePromoPreview() {
    const price = parseFloat($('#product-price').value) || 0;
    const discount = parseInt($('#product-promo-discount').value) || 0;
    const promoPrice = price * (1 - discount / 100);
    $('#promo-preview').textContent = price > 0 && discount > 0
      ? Utils.formatCurrency(promoPrice)
      : '--';
  }

  function refreshProducts() {
    const allProducts = DataStore.getProducts();
    const categories = DataStore.getCategories();
    const tbody = $('#products-table-body');
    const categoryFilter = $('#product-category-filter');
    const searchInput = $('#product-search-input');

    // Update category filter dropdown options
    if (categoryFilter) {
      const currentSelected = categoryFilter.value;
      categoryFilter.innerHTML = `<option value="all">Todas as Categorias</option>` +
        categories.map(c => `<option value="${c.name || c}">${c.name || c}</option>`).join('');
      categoryFilter.value = currentSelected;
    }

    // Filter by search & category
    const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const selectedCat = categoryFilter ? categoryFilter.value : 'all';

    let products = allProducts;
    if (searchTerm) {
      products = products.filter(p => p.name.toLowerCase().includes(searchTerm) || (p.description || '').toLowerCase().includes(searchTerm));
    }
    if (selectedCat !== 'all') {
      products = products.filter(p => p.category === selectedCat);
    }

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:var(--space-2xl); color:var(--text-muted);">
            Nenhum produto encontrado. Clique em "Novo Produto" para adicionar.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(product => {
      const hasPromo = product.promotion && product.promotion.active;
      const promoPrice = hasPromo
        ? product.price * (1 - product.promotion.discountPercent / 100)
        : null;

      return `
        <tr data-product-id="${product.id}">
          <td>
            <div class="table-product-info">
              <img src="${product.image}" alt="${product.name}" class="table-product-img" onerror="this.src='assets/images/cake_chocolate.jpg'">
              <div>
                <div class="table-product-name">${product.name}</div>
                <div class="table-product-category">${product.description ? product.description.substring(0, 40) + '...' : ''}</div>
              </div>
            </div>
          </td>
          <td>
            ${hasPromo ? `<span style="text-decoration:line-through;color:var(--text-muted);font-size:0.82rem;">${Utils.formatCurrency(product.price)}</span><br>` : ''}
            <strong style="color:${hasPromo ? 'var(--promo)' : 'var(--primary)'}">
              ${Utils.formatCurrency(hasPromo ? promoPrice : product.price)}
            </strong>
          </td>
          <td><span class="status-badge" style="background:var(--bg-secondary);">${product.category}</span></td>
          <td>${product.badge ? `<span class="status-badge promo">${product.badge}</span>` : '—'}</td>
          <td>
            ${hasPromo
              ? `<span class="status-badge promo">-${product.promotion.discountPercent}%</span>`
              : '<span style="color:var(--text-muted);">—</span>'}
          </td>
          <td>
            <label class="toggle-switch">
              <input type="checkbox" ${product.inStock ? 'checked' : ''} data-toggle="stock" data-id="${product.id}">
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td>
            <label class="toggle-switch">
              <input type="checkbox" ${product.active ? 'checked' : ''} data-toggle="active" data-id="${product.id}">
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-icon" data-action="edit" data-id="${product.id}" title="Editar Bolo">✏️</button>
              <button class="btn btn-danger btn-icon" data-action="delete" data-id="${product.id}" title="Excluir Bolo">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind toggles & buttons
    tbody.querySelectorAll('[data-toggle="active"]').forEach(toggle => {
      toggle.addEventListener('change', async () => {
        await DataStore.toggleProductActive(toggle.dataset.id);
        Utils.showToast('Visibilidade do produto atualizada!', 'success');
      });
    });

    tbody.querySelectorAll('[data-toggle="stock"]').forEach(toggle => {
      toggle.addEventListener('change', async () => {
        await DataStore.toggleProductStock(toggle.dataset.id);
        Utils.showToast('Disponibilidade de estoque atualizada!', 'success');
      });
    });

    tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = DataStore.getProductById(btn.dataset.id);
        if (product) openProductModal(product);
      });
    });

    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja excluir permanentemente este bolo?')) {
          await DataStore.deleteProduct(btn.dataset.id);
          refreshProducts();
          Utils.showToast('Produto excluído com sucesso!', 'success');
        }
      });
    });
  }

  function openProductModal(product = null) {
    const modal = $('#product-modal');
    const title = $('#product-modal-title');
    const form = $('#product-form');
    const preview = $('#product-image-preview');
    const placeholder = $('#upload-placeholder');
    const uploadArea = $('#product-image-upload');
    const categorySelect = $('#product-category');
    const urlInput = $('#product-image-url-input');

    form.reset();
    productImageData = null;
    preview.style.display = 'none';
    placeholder.style.display = 'block';
    uploadArea.classList.remove('has-image');
    $('#promo-fields').classList.add('hidden');
    $('#promo-preview').textContent = '--';
    if (urlInput) urlInput.value = '';

    // Populate category dropdown
    const categories = DataStore.getCategories();
    categorySelect.innerHTML = categories.map(c => {
      const name = c.name || c;
      return `<option value="${name}">${name}</option>`;
    }).join('');

    if (product) {
      editingProductId = product.id;
      title.textContent = 'Editar Bolo';
      $('#product-id').value = product.id;
      $('#product-name').value = product.name;
      $('#product-description').value = product.description || '';
      $('#product-price').value = product.price;
      $('#product-category').value = product.category;
      $('#product-badge').value = product.badge || '';
      $('#product-active').checked = product.active;
      $('#product-in-stock').checked = product.inStock;

      if (product.image) {
        showProductImagePreview(product.image);
        productImageData = product.image;
        if (product.image.startsWith('http')) {
          urlInput.value = product.image;
        }
      }

      if (product.promotion && product.promotion.active) {
        $('#product-promo-active').checked = true;
        $('#promo-fields').classList.remove('hidden');
        $('#product-promo-discount').value = product.promotion.discountPercent;
        updatePromoPreview();
      }
    } else {
      editingProductId = null;
      title.textContent = 'Novo Bolo';
    }

    modal.classList.add('active');
  }

  function closeProductModal() {
    $('#product-modal').classList.remove('active');
    editingProductId = null;
  }

  async function handleProductSave(e) {
    e.preventDefault();

    const name = $('#product-name').value.trim();
    const description = $('#product-description').value.trim();
    const price = parseFloat($('#product-price').value);
    const category = $('#product-category').value;
    const badge = $('#product-badge').value.trim();
    const active = $('#product-active').checked;
    const inStock = $('#product-in-stock').checked;
    const promoActive = $('#product-promo-active').checked;
    const promoDiscount = parseInt($('#product-promo-discount').value) || 0;

    if (!name || isNaN(price) || !category) {
      Utils.showToast('Preencha os campos obrigatórios!', 'warning');
      return;
    }

    const saveBtn = $('#product-form button[type="submit"]');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando...';
    }

    try {
      const product = {
        id: editingProductId || undefined,
        name,
        description,
        price,
        image: productImageData || 'assets/images/cake_chocolate.jpg',
        category,
        badge,
        active,
        inStock,
        promotion: {
          active: promoActive,
          discountPercent: promoActive ? promoDiscount : 0
        }
      };

      await DataStore.saveProduct(product);
      closeProductModal();
      refreshProducts();
      refreshDashboard();
      Utils.showToast(editingProductId ? 'Bolo atualizado com sucesso!' : 'Novo bolo cadastrado!', 'success');
    } catch (err) {
      Utils.showToast('Erro ao salvar bolo: ' + err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Salvar Produto';
      }
    }
  }

  // ===== 6. CATEGORIES MANAGEMENT =====
  function setupCategories() {
    $('#btn-add-category').addEventListener('click', () => openCategoryModal());
    $('#category-form').addEventListener('submit', handleCategorySave);
    $('#btn-close-category-modal').addEventListener('click', closeCategoryModal);
    $('#btn-cancel-category').addEventListener('click', closeCategoryModal);
    $('#category-modal').addEventListener('click', (e) => {
      if (e.target === $('#category-modal')) closeCategoryModal();
    });

    refreshCategories();
  }

  function refreshCategories() {
    const categories = DataStore.getCategories();
    const products = DataStore.getProducts();
    const container = $('#admin-categories-list');

    container.innerHTML = categories.map(cat => {
      const name = cat.name || cat;
      const icon = cat.icon || '🎂';
      const id = cat.id || name;
      const count = products.filter(p => p.category === name).length;

      return `
        <div class="category-admin-card">
          <div class="category-admin-header">
            <span class="category-admin-icon">${icon}</span>
            <div>
              <h4 class="category-admin-name">${name}</h4>
              <small style="color:var(--text-muted);">${count} produto(s) associado(s)</small>
            </div>
          </div>
          <div class="category-admin-actions">
            <button class="btn btn-secondary btn-sm" data-edit-cat="${id}">Editar</button>
            <button class="btn btn-danger btn-sm" data-delete-cat="${id}">Excluir</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind edit/delete
    container.querySelectorAll('[data-edit-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.editCat;
        const cat = DataStore.getCategories().find(c => (c.id || c.name) === id);
        if (cat) openCategoryModal(cat);
      });
    });

    container.querySelectorAll('[data-delete-cat]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.deleteCat;
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
          const res = await DataStore.deleteCategory(id);
          if (res && res.error) {
            Utils.showToast(res.error, 'error');
            return;
          }
          refreshCategories();
          refreshProducts();
          Utils.showToast('Categoria removida!', 'success');
        }
      });
    });
  }

  function openCategoryModal(cat = null) {
    const modal = $('#category-modal');
    const title = $('#category-modal-title');
    const form = $('#category-form');

    form.reset();
    if (cat) {
      title.textContent = 'Editar Categoria';
      $('#category-id').value = cat.id || cat.name;
      $('#category-name-input').value = cat.name || cat;
      $('#category-icon-input').value = cat.icon || '🎂';
    } else {
      title.textContent = 'Nova Categoria';
      $('#category-id').value = '';
      $('#category-icon-input').value = '🎂';
    }
    modal.classList.add('active');
  }

  function closeCategoryModal() {
    $('#category-modal').classList.remove('active');
  }

  async function handleCategorySave(e) {
    e.preventDefault();
    const id = $('#category-id').value;
    const name = $('#category-name-input').value.trim();
    const icon = $('#category-icon-input').value.trim() || '🎂';

    if (!name) {
      Utils.showToast('Informe o nome da categoria.', 'warning');
      return;
    }

    const saveBtn = $('#category-form button[type="submit"]');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando...';
    }

    try {
      await DataStore.saveCategory({ id: id || undefined, name, icon });
      closeCategoryModal();
      refreshCategories();
      refreshProducts();
      Utils.showToast('Categoria salva com sucesso!', 'success');
    } catch (err) {
      Utils.showToast('Erro ao salvar categoria: ' + err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Salvar Categoria';
      }
    }
  }

  // ===== 7. ORDERS MANAGEMENT =====
  function setupOrders() {
    $('#btn-clear-orders').addEventListener('click', async () => {
      if (confirm('Deseja excluir TODOS os pedidos registrados no histórico? Esta ação é irreversível.')) {
        await DataStore.clearAllOrders();
        refreshOrders();
        refreshDashboard();
        Utils.showToast('Histórico de pedidos limpo!', 'success');
      }
    });

    // Filter tabs
    $$('.order-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.order-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentOrderFilter = btn.dataset.filter;
        refreshOrders();
      });
    });

    refreshOrders();
  }

  function refreshOrders() {
    const allOrders = DataStore.getOrders();
    const container = $('#orders-list');

    let orders = allOrders;
    if (currentOrderFilter !== 'all') {
      orders = orders.filter(o => (o.status || 'novo') === currentOrderFilter);
    }

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>Nenhum pedido nesta categoria</h3>
          <p>Novos pedidos recebidos aparecerão aqui automaticamente.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const isPickup = order.deliveryType === 'pickup';
      const statusMap = {
        novo: '🟡 Novo',
        preparo: '🟠 Em Preparo',
        entrega: '🔵 Saiu p/ Entrega',
        concluido: '🟢 Concluído',
        cancelado: '🔴 Cancelado'
      };

      return `
        <div class="order-card" data-order-id="${order.id}">
          <div class="order-header">
            <div>
              <span class="order-id">📦 ${order.id}</span>
              <span class="order-date"> — ${Utils.formatDate(order.date)}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <select class="form-control form-control-sm order-status-select" data-status-for="${order.id}">
                <option value="novo" ${order.status === 'novo' ? 'selected' : ''}>🟡 Novo</option>
                <option value="preparo" ${order.status === 'preparo' ? 'selected' : ''}>🟠 Em Preparo</option>
                <option value="entrega" ${order.status === 'entrega' ? 'selected' : ''}>🔵 Saiu p/ Entrega</option>
                <option value="concluido" ${order.status === 'concluido' ? 'selected' : ''}>🟢 Concluído</option>
                <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>🔴 Cancelado</option>
              </select>
              <button class="btn btn-danger btn-sm" data-delete-order="${order.id}">🗑️</button>
            </div>
          </div>

          <div class="order-customer">
            <div class="order-customer-field">
              <span class="order-customer-label">Cliente</span>
              <span class="order-customer-value"><strong>${order.customer.name}</strong></span>
            </div>
            <div class="order-customer-field">
              <span class="order-customer-label">Telefone</span>
              <span class="order-customer-value">${order.customer.phone}</span>
            </div>
            <div class="order-customer-field">
              <span class="order-customer-label">Recebimento</span>
              <span class="order-customer-value">${isPickup ? '🏬 <strong>Retirada no Local</strong>' : '🛵 <strong>Entrega:</strong> ' + order.customer.address}</span>
            </div>
            ${order.customer.observations ? `
              <div class="order-customer-field">
                <span class="order-customer-label">Observações</span>
                <span class="order-customer-value">${order.customer.observations}</span>
              </div>
            ` : ''}
            ${order.customer.trocoPara ? `
              <div class="order-customer-field">
                <span class="order-customer-label">Troco</span>
                <span class="order-customer-value">Precisa de troco para: <strong>${order.customer.trocoPara}</strong></span>
              </div>
            ` : ''}
          </div>

          <div class="order-items-list">
            ${order.items.map(item => `
              <div class="order-item-row">
                <span>${item.qty}x ${item.name}</span>
                <span>${Utils.formatCurrency(item.subtotal)}</span>
              </div>
            `).join('')}
          </div>

          <div class="order-footer">
            <div>
              <span class="order-total">Total: ${Utils.formatCurrency(order.total)}</span>
              <span class="order-payment">💳 ${order.paymentMethod}</span>
            </div>
            <button class="btn btn-secondary btn-sm" data-whatsapp-contact="${order.id}">
              💬 Avisar Cliente no WhatsApp
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Status change listener
    container.querySelectorAll('.order-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const orderId = sel.dataset.statusFor;
        await DataStore.updateOrderStatus(orderId, e.target.value);
        Utils.showToast('Status do pedido atualizado!', 'success');
        refreshDashboard();
      });
    });

    // Delete order listener
    container.querySelectorAll('[data-delete-order]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Excluir este pedido do sistema?')) {
          await DataStore.deleteOrder(btn.dataset.deleteOrder);
          refreshOrders();
          refreshDashboard();
          Utils.showToast('Pedido excluído!', 'success');
        }
      });
    });

    // WhatsApp Contact
    container.querySelectorAll('[data-whatsapp-contact]').forEach(btn => {
      btn.addEventListener('click', () => {
        const order = DataStore.getOrders().find(o => o.id === btn.dataset.whatsappContact);
        if (order) openCustomerWhatsAppDialog(order);
      });
    });
  }

  function openCustomerWhatsAppDialog(order) {
    const settings = DataStore.getSettings();
    let statusText = 'está sendo processado';
    if (order.status === 'preparo') statusText = 'já está em produção com todo carinho! 🎂';
    if (order.status === 'entrega') statusText = 'saiu para entrega e logo chegará até você! 🛵';
    if (order.status === 'concluido') statusText = 'foi finalizado! Esperamos que goste muito das nossas delícias. ✨';
    if (order.status === 'cancelado') statusText = 'foi cancelado.';

    const msg = `Olá *${order.customer.name}*! Agradecemos pela preferência na *${settings.storeName}*.\n\nInformamos que seu pedido *${order.id}* ${statusText}\n\nQualquer dúvida, estamos à disposição!`;
    Utils.sendWhatsAppToCustomer(order.customer.phone, msg);
  }

  // ===== 8. DELIVERY & PICKUP SETTINGS =====
  function setupDelivery() {
    const deliveryToggle = $('#delivery-enabled-toggle');
    const pickupToggle = $('#pickup-enabled-toggle');

    // Auto-save immediately when delivery toggle is changed
    deliveryToggle.addEventListener('change', async () => {
      const settings = DataStore.getSettings();
      if (!settings.delivery) settings.delivery = {};
      settings.delivery.deliveryEnabled = deliveryToggle.checked;
      await DataStore.saveSettings(settings);
      updateDeliveryCardVisual(deliveryToggle.checked);
      Utils.showToast(
        deliveryToggle.checked
          ? 'Entrega a domicílio ATIVADA! Os clientes agora podem pedir entrega.'
          : 'Entrega a domicílio DESATIVADA! Os clientes só poderão escolher retirada no local.',
        deliveryToggle.checked ? 'success' : 'warning'
      );
    });

    // Auto-save immediately when pickup toggle is changed
    pickupToggle.addEventListener('change', async () => {
      const settings = DataStore.getSettings();
      if (!settings.delivery) settings.delivery = {};
      settings.delivery.pickupEnabled = pickupToggle.checked;
      await DataStore.saveSettings(settings);
      updatePickupCardVisual(pickupToggle.checked);
      Utils.showToast(
        pickupToggle.checked
          ? 'Retirada no local ATIVADA!'
          : 'Retirada no local DESATIVADA!',
        pickupToggle.checked ? 'success' : 'warning'
      );
    });

    // Save button for full form
    $('#btn-save-delivery').addEventListener('click', async () => {
      const settings = DataStore.getSettings();
      settings.delivery = {
        deliveryEnabled: deliveryToggle.checked,
        deliveryFee: parseFloat($('#delivery-fee-input').value) || 0,
        freeDeliveryThreshold: parseFloat($('#delivery-free-threshold').value) || 0,
        estimatedTime: $('#delivery-time-estimate').value.trim() || '40 a 60 min',
        pickupEnabled: pickupToggle.checked,
        pickupAddress: $('#pickup-address-input').value.trim() || '',
        pickupEstimate: $('#pickup-estimate-input').value.trim() || 'Pronto em 30 min'
      };
      await DataStore.saveSettings(settings);
      updateDeliveryCardVisual(deliveryToggle.checked);
      updatePickupCardVisual(pickupToggle.checked);
      Utils.showToast('Configurações de entrega e retirada salvas com sucesso!', 'success');
    });

    refreshDelivery();
  }

  function updateDeliveryCardVisual(enabled) {
    const body = $('#delivery-settings-body');
    if (body) {
      body.style.opacity = enabled ? '1' : '0.5';
      body.querySelectorAll('input').forEach(input => input.disabled = !enabled);
    }
  }

  function updatePickupCardVisual(enabled) {
    const body = $('#pickup-settings-body');
    if (body) {
      body.style.opacity = enabled ? '1' : '0.5';
      body.querySelectorAll('input').forEach(input => input.disabled = !enabled);
    }
  }

  function refreshDelivery() {
    const settings = DataStore.getSettings();
    const d = settings.delivery || {};
    const deliveryEnabled = d.deliveryEnabled !== false;
    const pickupEnabled = d.pickupEnabled !== false;

    $('#delivery-enabled-toggle').checked = deliveryEnabled;
    $('#delivery-fee-input').value = d.deliveryFee !== undefined ? d.deliveryFee : 10.00;
    $('#delivery-free-threshold').value = d.freeDeliveryThreshold !== undefined ? d.freeDeliveryThreshold : 120.00;
    $('#delivery-time-estimate').value = d.estimatedTime || '40 a 60 min';
    updateDeliveryCardVisual(deliveryEnabled);

    $('#pickup-enabled-toggle').checked = pickupEnabled;
    $('#pickup-address-input').value = d.pickupAddress || '';
    $('#pickup-estimate-input').value = d.pickupEstimate || 'Pronto em 30 min';
    updatePickupCardVisual(pickupEnabled);
  }

  // ===== 9. PAYMENTS & PIX =====
  function setupPayments() {
    $('#btn-save-payments').addEventListener('click', async () => {
      const settings = DataStore.getSettings();
      settings.pixDetails = {
        keyType: $('#pix-type-input').value,
        key: $('#pix-key-setting').value.trim(),
        receiverName: $('#pix-receiver-setting').value.trim(),
        instructions: $('#pix-instructions-setting').value.trim()
      };
      await DataStore.saveSettings(settings);
      Utils.showToast('Configurações de pagamento e Pix salvas!', 'success');
    });

    refreshPayments();
  }

  function refreshPayments() {
    const settings = DataStore.getSettings();
    const grid = $('#payment-methods-grid');

    grid.innerHTML = settings.paymentMethods.map(method => `
      <div class="payment-method-card">
        <span class="method-icon">${method.icon}</span>
        <div class="method-info">
          <div class="method-name">${method.name}</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${method.active ? 'checked' : ''} data-payment-id="${method.id}">
          <span class="toggle-slider"></span>
        </label>
      </div>
    `).join('');

    grid.querySelectorAll('[data-payment-id]').forEach(toggle => {
      toggle.addEventListener('change', async () => {
        const id = toggle.dataset.paymentId;
        const currentSettings = DataStore.getSettings();
        const method = currentSettings.paymentMethods.find(m => m.id === id);
        if (method) {
          method.active = toggle.checked;
          await DataStore.saveSettings(currentSettings);
          Utils.showToast(`${method.name} ${toggle.checked ? 'ativado' : 'desativado'}!`, 'success');
        }
      });
    });

    const pix = settings.pixDetails || {};
    $('#pix-type-input').value = pix.keyType || 'Celular';
    $('#pix-key-setting').value = pix.key || '';
    $('#pix-receiver-setting').value = pix.receiverName || settings.storeName;
    $('#pix-instructions-setting').value = pix.instructions || '';
  }

  // ===== 10. SCHEDULE & CLOSURES =====
  function setupSchedule() {
    $('#btn-save-closed-msg').addEventListener('click', async () => {
      const msg = $('#closed-custom-message').value.trim();
      await DataStore.updateSetting('closedCustomMessage', msg);
      Utils.showToast('Mensagem de loja fechada atualizada!', 'success');
    });

    $('#btn-save-hours').addEventListener('click', async () => {
      const settings = DataStore.getSettings();
      const hoursGrid = $('#hours-grid');
      const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

      days.forEach(day => {
        const active = hoursGrid.querySelector(`[data-day="${day}"][data-field="active"]`)?.checked ?? false;
        const open = hoursGrid.querySelector(`[data-day="${day}"][data-field="open"]`)?.value || '08:00';
        const close = hoursGrid.querySelector(`[data-day="${day}"][data-field="close"]`)?.value || '18:00';
        settings.operatingHours[day] = { open, close, active };
      });

      await DataStore.saveSettings(settings);
      Utils.showToast('Horários semanais salvos!', 'success');
    });

    // Closures
    $('#btn-add-closure').addEventListener('click', () => {
      $('#closure-modal').classList.add('active');
      $('#closure-form').reset();
      $('#closure-date-fields').classList.remove('hidden');
      $('#closure-range-fields').classList.add('hidden');
    });

    $('#closure-type').addEventListener('change', (e) => {
      const isRange = e.target.value === 'range';
      $('#closure-date-fields').classList.toggle('hidden', isRange);
      $('#closure-range-fields').classList.toggle('hidden', !isRange);
    });

    $('#btn-close-closure-modal').addEventListener('click', () => $('#closure-modal').classList.remove('active'));
    $('#btn-cancel-closure').addEventListener('click', () => $('#closure-modal').classList.remove('active'));
    $('#closure-modal').addEventListener('click', (e) => {
      if (e.target === $('#closure-modal')) $('#closure-modal').classList.remove('active');
    });

    $('#closure-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = $('#closure-type').value;
      const reason = $('#closure-reason').value.trim();
      const settings = DataStore.getSettings();
      if (!settings.closures) settings.closures = [];

      if (type === 'date') {
        const date = $('#closure-date').value;
        if (!date) {
          Utils.showToast('Selecione uma data.', 'warning');
          return;
        }
        settings.closures.push({ type: 'date', date, reason });
      } else {
        const start = $('#closure-start').value;
        const end = $('#closure-end').value;
        if (!start || !end) {
          Utils.showToast('Selecione o início e fim.', 'warning');
          return;
        }
        if (end < start) {
          Utils.showToast('A data final deve ser depois da data inicial.', 'warning');
          return;
        }
        settings.closures.push({ type: 'range', start, end, reason });
      }

      await DataStore.saveSettings(settings);
      $('#closure-modal').classList.remove('active');
      refreshSchedule();
      Utils.showToast('Fechamento programado com sucesso!', 'success');
    });

    refreshSchedule();
  }

  function refreshSchedule() {
    const settings = DataStore.getSettings();
    $('#closed-custom-message').value = settings.closedCustomMessage || '';

    const hoursGrid = $('#hours-grid');
    const dayLabels = {
      segunda: 'Segunda-feira',
      terca: 'Terça-feira',
      quarta: 'Quarta-feira',
      quinta: 'Quinta-feira',
      sexta: 'Sexta-feira',
      sabado: 'Sábado',
      domingo: 'Domingo',
    };

    hoursGrid.innerHTML = Object.entries(settings.operatingHours).map(([key, hours]) => `
      <div class="hours-row">
        <span class="hours-day">${dayLabels[key] || key}</span>
        <div class="hours-inputs">
          <label class="toggle-switch">
            <input type="checkbox" data-day="${key}" data-field="active" ${hours.active ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
          <input type="time" data-day="${key}" data-field="open" value="${hours.open}" ${!hours.active ? 'disabled' : ''}>
          <span>às</span>
          <input type="time" data-day="${key}" data-field="close" value="${hours.close}" ${!hours.active ? 'disabled' : ''}>
        </div>
      </div>
    `).join('');

    hoursGrid.querySelectorAll('[data-field="active"]').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const day = toggle.dataset.day;
        const row = toggle.closest('.hours-row');
        row.querySelectorAll('input[type="time"]').forEach(i => i.disabled = !toggle.checked);
      });
    });

    // Closures
    const closuresList = $('#closures-list');
    const closures = settings.closures || [];

    if (closures.length === 0) {
      closuresList.innerHTML = `<p style="color:var(--text-muted); padding:10px 0;">Nenhum feriado ou recesso programado.</p>`;
    } else {
      closuresList.innerHTML = closures.map((closure, idx) => {
        const icon = closure.type === 'date' ? '📅' : '🏖️';
        const dates = closure.type === 'date'
          ? Utils.formatDateShort(closure.date + 'T12:00:00')
          : `${Utils.formatDateShort(closure.start + 'T12:00:00')} a ${Utils.formatDateShort(closure.end + 'T12:00:00')}`;

        return `
          <div class="closure-item">
            <div class="closure-info">
              <span class="closure-icon">${icon}</span>
              <div>
                <div class="closure-dates">${dates}</div>
                <div class="closure-reason">${closure.reason || 'Sem motivo especificado'}</div>
              </div>
            </div>
            <button class="btn btn-danger btn-sm" data-delete-closure="${idx}">🗑️</button>
          </div>
        `;
      }).join('');

      closuresList.querySelectorAll('[data-delete-closure]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.deleteClosure);
          settings.closures.splice(idx, 1);
          await DataStore.saveSettings(settings);
          refreshSchedule();
          Utils.showToast('Fechamento removido!', 'success');
        });
      });
    }
  }

  // ===== 11. VISUAL & TEXTS (ALL SITE CUSTOMIZATION) =====
  function setupVisual() {
    // Theme color swatches
    $$('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.dataset.color;
        $('#theme-color-custom').value = color;
        DataStore.applyTheme(color);
      });
    });

    const customColorInput = $('#theme-color-custom');
    if (customColorInput) {
      customColorInput.addEventListener('input', (e) => {
        DataStore.applyTheme(e.target.value);
      });
    }

    // Save All Visual Changes Button
    $('#btn-save-all-visual').addEventListener('click', async () => {
      const settings = DataStore.getSettings();

      // Theme & Brand
      settings.themeColor = $('#theme-color-custom').value;
      settings.storeName = $('#visual-store-name').value.trim() || 'Dolce Arte';
      settings.storeTagline = $('#visual-store-tagline').value.trim() || 'Bolos Artesanais';
      settings.storeLogoEmoji = $('#visual-logo-emoji').value.trim() || '🎂';
      settings.storeLogoImage = $('#visual-logo-url').value.trim();

      // Announcement Bar
      settings.announcementBar = {
        active: $('#announcement-active-toggle').checked,
        text: $('#announcement-text-input').value.trim()
      };

      // Hero
      settings.hero = {
        emoji: $('#hero-emoji-input').value.trim() || '🎂',
        title: $('#hero-title-input').value.trim() || 'Bolos Artesanais Feitos com Amor',
        subtitle: $('#hero-subtitle-input').value.trim() || '',
        ctaText: $('#hero-cta-input').value.trim() || '✨ Ver Cardápio'
      };

      // About
      if (!settings.about) settings.about = {};
      settings.about.active = $('#about-active-toggle').checked;
      settings.about.title = $('#about-title-input').value.trim() || 'Nossa Paixão por Bolos Artesanais';
      settings.about.subtitle = $('#about-subtitle-input').value.trim() || 'Confeitaria Afetiva';
      settings.about.text = $('#about-text-input').value.trim() || '';

      // Contact & Footer
      settings.whatsappNumber = $('#contact-whatsapp-input').value.trim();
      settings.contactPhone = $('#contact-phone-input').value.trim();
      settings.instagram = $('#contact-instagram-input').value.trim();
      settings.address = $('#contact-address-input').value.trim();
      settings.footerCopyright = $('#footer-copyright-input').value.trim();

      await DataStore.saveSettings(settings);
      updateAdminBrand();
      Utils.showToast('Todas as alterações visuais e textos foram salvas!', 'success');
    });

    refreshVisual();
  }

  function refreshVisual() {
    const settings = DataStore.getSettings();

    $('#theme-color-custom').value = settings.themeColor || '#8B5E3C';
    $('#visual-store-name').value = settings.storeName || '';
    $('#visual-store-tagline').value = settings.storeTagline || '';
    $('#visual-logo-emoji').value = settings.storeLogoEmoji || '🎂';
    $('#visual-logo-url').value = settings.storeLogoImage || '';

    // Announcement
    const ann = settings.announcementBar || {};
    $('#announcement-active-toggle').checked = ann.active !== false;
    $('#announcement-text-input').value = ann.text || '';

    // Hero
    const hero = settings.hero || {};
    $('#hero-emoji-input').value = hero.emoji || '🎂';
    $('#hero-title-input').value = hero.title || '';
    $('#hero-subtitle-input').value = hero.subtitle || '';
    $('#hero-cta-input').value = hero.ctaText || '✨ Ver Cardápio';

    // About
    const about = settings.about || {};
    $('#about-active-toggle').checked = about.active !== false;
    $('#about-title-input').value = about.title || '';
    $('#about-subtitle-input').value = about.subtitle || '';
    $('#about-text-input').value = about.text || '';

    // Contacts
    $('#contact-whatsapp-input').value = settings.whatsappNumber || '';
    $('#contact-phone-input').value = settings.contactPhone || '';
    $('#contact-instagram-input').value = settings.instagram || '';
    $('#contact-address-input').value = settings.address || '';
    $('#footer-copyright-input').value = settings.footerCopyright || '';
  }

  // ===== 12. SECURITY & BACKUP =====
  function setupSecurityAndBackup() {
    // Save Password
    $('#btn-save-password').addEventListener('click', async () => {
      const pass = $('#settings-password').value;
      const confirm = $('#settings-password-confirm').value;
      if (!pass) {
        Utils.showToast('Digite a nova senha.', 'warning');
        return;
      }
      if (pass !== confirm) {
        Utils.showToast('As senhas não conferem!', 'error');
        return;
      }
      if (pass.length < 6) {
        Utils.showToast('A senha deve ter pelo menos 6 caracteres.', 'warning');
        return;
      }

      // Update in Supabase Auth if connected
      const client = window.SupabaseService ? window.SupabaseService.getClient() : null;
      if (client) {
        try {
          const { error } = await client.auth.updateUser({ password: pass });
          if (error) {
            console.warn('[Supabase Auth] Aviso ao atualizar senha:', error.message);
          }
        } catch (e) {}
      }

      await DataStore.updateSetting('adminPassword', pass);
      Utils.showToast('Senha de administrador atualizada com sucesso!', 'success');
      $('#settings-password').value = '';
      $('#settings-password-confirm').value = '';
    });

    // Export Backup
    $('#btn-export-backup').addEventListener('click', () => {
      const backupJson = DataStore.exportBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `backup_dolcearte_${new Date().toISOString().slice(0, 10)}.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      Utils.showToast('Arquivo de backup exportado com sucesso!', 'success');
    });

    // Import Backup
    const fileInput = $('#backup-file-input');
    $('#btn-trigger-import').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const res = await DataStore.importBackup(event.target.result);
        if (res.success) {
          Utils.showToast('Backup restaurado com sucesso! Recarregando...', 'success');
          setTimeout(() => location.reload(), 1200);
        } else {
          Utils.showToast('Erro ao importar backup: arquivo inválido.', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Reset Demo Defaults
    $('#btn-reset-demo').addEventListener('click', async () => {
      if (confirm('Tem certeza? Isso apagará seus produtos e configurações atuais e restaurará os padrões de demonstração iniciais.')) {
        await DataStore.resetToDefaults();
        Utils.showToast('Dados restaurados para o padrão original! Recarregando...', 'success');
        setTimeout(() => location.reload(), 1200);
      }
    });
  }

  function refreshSecurity() {
    $('#settings-password').value = '';
    $('#settings-password-confirm').value = '';
  }

  // ===== SUPABASE CONFIGURATION UI =====
  async function setupSupabaseConfigUI() {
    const sbUrlInput = $('#sb-url-input');
    const sbKeyInput = $('#sb-key-input');
    const sbBadge = $('#sb-status-badge');
    const btnSave = $('#btn-save-supabase-config');
    const btnTest = $('#btn-test-supabase-config');

    if (!sbBadge) return;

    async function updateStatus() {
      if (window.SupabaseService && window.SupabaseService.isConfigured()) {
        const client = window.SupabaseService.getClient();
        try {
          const { count, error } = await client.from('products').select('*', { count: 'exact', head: true });
          if (!error) {
            sbBadge.textContent = '🟢 Conectado ao Supabase (Online)';
            sbBadge.className = 'status-badge active';
          } else {
            sbBadge.textContent = '🟡 Configurado (Erro ao ler tabelas)';
            sbBadge.className = 'status-badge warning';
          }
        } catch (e) {
          sbBadge.textContent = '🟡 Configurado (Aguardando resposta)';
          sbBadge.className = 'status-badge warning';
        }
      } else {
        sbBadge.textContent = '⚪ Modo Local / Variáveis Pendentes';
        sbBadge.className = 'status-badge inactive';
      }

      if (window.SupabaseService) {
        const config = window.SupabaseService.getConfig();
        if (config && sbUrlInput && sbKeyInput) {
          if (!sbUrlInput.value) sbUrlInput.value = config.url || '';
          if (!sbKeyInput.value) sbKeyInput.value = config.anonKey || '';
        }
      }
    }

    await updateStatus();

    if (btnSave) {
      btnSave.addEventListener('click', async () => {
        const url = sbUrlInput.value.trim();
        const key = sbKeyInput.value.trim();
        if (!url || !key) {
          Utils.showToast('Informe a URL e a Anon Key do Supabase.', 'warning');
          return;
        }

        btnSave.disabled = true;
        btnSave.textContent = 'Salvando...';
        try {
          await window.SupabaseService.saveManualConfig(url, key);
          await DataStore.init();
          await updateStatus();
          Utils.showToast('Configurações do Supabase salvas com sucesso!', 'success');
        } catch (err) {
          Utils.showToast('Erro ao salvar: ' + err.message, 'error');
        } finally {
          btnSave.disabled = false;
          btnSave.textContent = '💾 Salvar Conexão';
        }
      });
    }

    if (btnTest) {
      btnTest.addEventListener('click', async () => {
        btnTest.disabled = true;
        btnTest.textContent = 'Testando...';
        try {
          await updateStatus();
          if (window.SupabaseService && window.SupabaseService.isConfigured()) {
            const client = window.SupabaseService.getClient();
            const { count, error } = await client.from('products').select('*', { count: 'exact', head: true });
            if (error) {
              Utils.showToast('Erro na conexão com Supabase: ' + error.message, 'error');
            } else {
              Utils.showToast(`Conexão com Supabase OK! Encontrados ${count || 0} produtos no banco.`, 'success');
            }
          } else {
            Utils.showToast('Supabase ainda não configurado.', 'warning');
          }
        } catch (err) {
          Utils.showToast('Falha no teste: ' + err.message, 'error');
        } finally {
          btnTest.disabled = false;
          btnTest.textContent = '🔄 Testar Conexão';
        }
      });
    }
  }

  // ===== 13. GLOBAL KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $('#product-modal').classList.remove('active');
      $('#category-modal').classList.remove('active');
      $('#closure-modal').classList.remove('active');
    }
  });

  // Start logic
  document.addEventListener('DOMContentLoaded', initLogin);

})();
