/**
 * store.js - Storefront Logic
 * Handles product display, categories, cart interactions, checkout, and WhatsApp integration
 */

(function() {
  'use strict';

  // ===== DOM REFERENCES =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Branding & Hero
  const siteTitle = $('#site-title');
  const navbarLogoIcon = $('#navbar-logo-icon');
  const navbarBrandName = $('#navbar-brand-name');
  const navbarBrandTagline = $('#navbar-brand-tagline');
  const announcementBar = $('#announcement-bar');
  const announcementText = $('#announcement-text');
  const heroEmoji = $('#hero-emoji');
  const heroTitle = $('#hero-title');
  const heroSubtitle = $('#hero-subtitle');
  const heroCta = $('#hero-cta');

  // About Section
  const aboutSection = $('#about-section');
  const aboutTagline = $('#about-tagline');
  const aboutTitle = $('#about-title');
  const aboutText = $('#about-text');
  const aboutFeatures = $('#about-features');

  // Navbar & Status
  const navbar = $('#navbar');
  const storeStatus = $('#store-status');
  const storeStatusText = $('#store-status-text');
  const cartCountEl = $('#cart-count');
  const btnOpenCart = $('#btn-open-cart');

  // Store closed banner
  const closedBanner = $('#store-closed-banner');
  const closedMessage = $('#store-closed-message');

  // Products & Categories
  const categoriesFilter = $('#categories-filter');
  const productsGrid = $('#products-grid');
  const emptyProducts = $('#empty-products');

  // Cart
  const cartOverlay = $('#cart-overlay');
  const cartSidebar = $('#cart-sidebar');
  const cartItemsContainer = $('#cart-items');
  const cartEmpty = $('#cart-empty');
  const cartFooter = $('#cart-footer');
  const cartTotalEl = $('#cart-total');
  const btnCloseCart = $('#btn-close-cart');
  const btnCheckout = $('#btn-checkout');

  // Checkout
  const checkoutModal = $('#checkout-modal');
  const checkoutSummary = $('#checkout-items');
  const checkoutSubtotal = $('#checkout-subtotal');
  const checkoutDeliveryFee = $('#checkout-delivery-fee');
  const checkoutDeliveryRow = $('#checkout-delivery-row');
  const checkoutTotal = $('#checkout-total');
  const checkoutForm = $('#checkout-form');
  const btnCloseCheckout = $('#btn-close-checkout');
  const paymentOptions = $('#payment-options');

  // Delivery & Pickup tabs
  const tabDelivery = $('#tab-delivery');
  const tabPickup = $('#tab-pickup');
  const tabDeliveryInfo = $('#tab-delivery-info');
  const tabPickupInfo = $('#tab-pickup-info');
  const groupDeliveryAddress = $('#group-delivery-address');
  const customerAddressInput = $('#customer-address');
  const pickupInfoBox = $('#pickup-info-box');
  const pickupStoreAddress = $('#pickup-store-address');
  const pickupStoreTime = $('#pickup-store-time');

  // Pix & Cash Boxes
  const pixCheckoutBox = $('#pix-checkout-box');
  const pixKeyVal = $('#pix-key-val');
  const pixKeyType = $('#pix-key-type');
  const pixReceiverName = $('#pix-receiver-name');
  const pixInstructionsText = $('#pix-instructions-text');
  const btnCopyPix = $('#btn-copy-pix');
  const cashChangeBox = $('#cash-change-box');
  const customerTroco = $('#customer-troco');

  // Footer
  const footerBrand = $('#footer-brand');
  const footerTagline = $('#footer-tagline');
  const footerAddress = $('#footer-address');
  const footerPhone = $('#footer-phone');
  const footerWhatsApp = $('#footer-whatsapp');
  const footerInstagram = $('#footer-instagram');
  const footerCopyright = $('#footer-copyright');

  // State
  let currentCategory = 'all';
  let selectedPayment = null;
  let currentDeliveryType = 'delivery'; // 'delivery' or 'pickup'
  let storeIsOpen = true;

  // ===== INITIALIZATION =====
  async function init() {
    await DataStore.init();
    renderStoreBranding();
    updateStoreStatus();
    renderCategories();
    renderProducts();
    renderAboutSection();
    updateCartUI();
    setupEventListeners();
    setupScrollEffect();
    setupPhoneMask();

    // Subscribe to instant Realtime updates from Supabase!
    DataStore.subscribeToChanges(() => {
      renderStoreBranding();
      updateStoreStatus();
      renderCategories();
      renderProducts();
      renderAboutSection();
      updateDeliveryTabsUI();
    });
  }

  // ===== RENDER STORE BRANDING & VISUALS =====
  function renderStoreBranding() {
    const settings = DataStore.getSettings();

    // Theme color
    if (settings.themeColor) {
      DataStore.applyTheme(settings.themeColor);
    }

    // Title & Navbar
    if (siteTitle) siteTitle.textContent = `${settings.storeName} | ${settings.storeTagline || 'Bolos Artesanais'}`;
    if (navbarBrandName) navbarBrandName.textContent = settings.storeName;
    if (navbarBrandTagline) navbarBrandTagline.textContent = settings.storeTagline;
    if (navbarLogoIcon) {
      if (settings.storeLogoImage) {
        navbarLogoIcon.innerHTML = `<img src="${settings.storeLogoImage}" alt="${settings.storeName}" style="width:36px; height:36px; object-fit:contain; border-radius:50%;">`;
      } else {
        navbarLogoIcon.textContent = settings.storeLogoEmoji || '🎂';
      }
    }

    // Announcement bar
    if (settings.announcementBar && settings.announcementBar.active && settings.announcementBar.text) {
      announcementBar.classList.remove('hidden');
      announcementText.textContent = settings.announcementBar.text;
    } else {
      announcementBar.classList.add('hidden');
    }

    // Hero Section
    if (settings.hero) {
      if (heroEmoji) heroEmoji.textContent = settings.hero.emoji || '🎂';
      if (heroTitle) heroTitle.textContent = settings.hero.title || 'Bolos Artesanais Feitos com Amor';
      if (heroSubtitle) heroSubtitle.textContent = settings.hero.subtitle || '';
      if (heroCta) heroCta.textContent = settings.hero.ctaText || '✨ Ver Cardápio';
    }

    // Delivery Tabs & Options
    updateDeliveryTabsUI();

    // Footer
    if (footerBrand) footerBrand.textContent = `${settings.storeLogoEmoji || '🎂'} ${settings.storeName}`;
    if (footerTagline) footerTagline.textContent = settings.storeTagline || '';
    if (footerAddress) footerAddress.textContent = settings.address || '';
    if (footerPhone) footerPhone.textContent = settings.contactPhone || '';
    if (footerCopyright) footerCopyright.textContent = settings.footerCopyright || `© ${new Date().getFullYear()} ${settings.storeName}.`;

    if (footerWhatsApp) {
      const cleanPhone = (settings.whatsappNumber || '').replace(/\D/g, '');
      footerWhatsApp.href = `https://wa.me/${cleanPhone}`;
    }

    if (footerInstagram) {
      if (settings.instagram) {
        const handle = settings.instagram.replace('@', '');
        footerInstagram.href = `https://instagram.com/${handle}`;
        footerInstagram.textContent = `Instagram ${settings.instagram}`;
        footerInstagram.classList.remove('hidden');
      } else {
        footerInstagram.classList.add('hidden');
      }
    }
  }

  // ===== ABOUT US SECTION =====
  function renderAboutSection() {
    const settings = DataStore.getSettings();
    if (!settings.about || !settings.about.active) {
      if (aboutSection) aboutSection.classList.add('hidden');
      return;
    }

    if (aboutSection) aboutSection.classList.remove('hidden');
    if (aboutTagline) aboutTagline.textContent = settings.about.subtitle || 'Nossa Confeitaria';
    if (aboutTitle) aboutTitle.textContent = settings.about.title || 'Nossa Paixão por Confeitaria';
    if (aboutText) aboutText.textContent = settings.about.text || '';

    if (aboutFeatures && settings.about.features && settings.about.features.length > 0) {
      aboutFeatures.innerHTML = settings.about.features.map(f => `
        <div class="about-feature-item">
          <div class="feature-icon">${f.icon || '✨'}</div>
          <div class="feature-content">
            <h4>${f.title}</h4>
            <p>${f.desc}</p>
          </div>
        </div>
      `).join('');
    }
  }

  // ===== STORE STATUS =====
  function updateStoreStatus() {
    storeIsOpen = DataStore.isStoreOpen();
    const message = DataStore.getStoreStatusMessage();

    if (storeIsOpen) {
      storeStatus.className = 'navbar-status open';
      storeStatusText.textContent = '🟢 Aberto';
      closedBanner.classList.add('hidden');
    } else {
      storeStatus.className = 'navbar-status closed';
      storeStatusText.textContent = '🔴 Fechado';
      closedBanner.classList.remove('hidden');
      closedMessage.textContent = message;
    }
  }

  // ===== CATEGORIES =====
  function renderCategories() {
    const categories = DataStore.getCategories();

    let html = `<button class="category-btn active" data-category="all">🍰 Todos</button>`;

    categories.forEach(cat => {
      const name = cat.name || cat;
      const icon = cat.icon || '🎂';
      html += `<button class="category-btn" data-category="${name}">${icon} ${name}</button>`;
    });

    categoriesFilter.innerHTML = html;

    // Bind events
    categoriesFilter.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        categoriesFilter.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderProducts();
      });
    });
  }

  // ===== PRODUCTS =====
  function renderProducts() {
    let products = DataStore.getProducts().filter(p => p.active);

    if (currentCategory !== 'all') {
      products = products.filter(p => p.category === currentCategory);
    }

    if (products.length === 0) {
      productsGrid.innerHTML = '';
      emptyProducts.classList.remove('hidden');
      return;
    }

    emptyProducts.classList.add('hidden');

    productsGrid.innerHTML = products.map((product, index) => {
      const hasPromo = product.promotion && product.promotion.active;
      const promoPrice = hasPromo
        ? product.price * (1 - product.promotion.discountPercent / 100)
        : product.price;
      const isOutOfStock = !product.inStock;

      let badgesHtml = '';
      if (isOutOfStock) {
        badgesHtml += '<span class="product-badge badge-sold-out">Esgotado</span>';
      } else {
        if (hasPromo) {
          badgesHtml += `<span class="product-badge badge-promo">-${product.promotion.discountPercent}%</span>`;
        }
        if (product.badge) {
          badgesHtml += `<span class="product-badge badge-custom">${product.badge}</span>`;
        }
      }

      return `
        <article class="product-card" style="animation-delay: ${index * 0.06}s" data-product-id="${product.id}">
          <div class="product-card-image">
            ${badgesHtml}
            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='assets/images/cake_chocolate.jpg'">
          </div>
          <div class="product-card-body">
            <div class="product-card-category">${product.category}</div>
            <h3 class="product-card-name">${product.name}</h3>
            <p class="product-card-description">${product.description || ''}</p>
            <div class="product-card-footer">
              <div class="product-price">
                ${hasPromo ? `<span class="original-price">${Utils.formatCurrency(product.price)}</span>` : ''}
                <span class="current-price ${hasPromo ? 'promo-price' : ''}">${Utils.formatCurrency(hasPromo ? promoPrice : product.price)}</span>
              </div>
              <button class="btn-add-cart" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                ${isOutOfStock ? '😔 Esgotado' : '🛒 Adicionar'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Bind add to cart buttons
    productsGrid.querySelectorAll('.btn-add-cart:not([disabled])').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(btn.dataset.id);
      });
    });
  }

  // ===== CART =====
  function addToCart(productId) {
    if (!storeIsOpen) {
      Utils.showToast('A loja está fechada no momento. Volte nos nossos horários de atendimento!', 'warning');
      return;
    }

    Cart.addItem(productId);
    const product = DataStore.getProductById(productId);
    Utils.showToast(`${product ? product.name : 'Produto'} adicionado ao carrinho!`, 'success');
    updateCartUI();

    // Animate cart count
    cartCountEl.classList.add('animate');
    setTimeout(() => cartCountEl.classList.remove('animate'), 400);
  }

  function updateCartUI() {
    const count = Cart.getCount();
    const subtotal = Cart.getSubtotal();
    const items = Cart.getDetailedItems();

    if (count > 0) {
      cartCountEl.style.display = 'flex';
      cartCountEl.textContent = count;
    } else {
      cartCountEl.style.display = 'none';
    }

    if (items.length === 0) {
      cartEmpty.style.display = 'flex';
      cartFooter.style.display = 'none';
      renderCartItems([]);
    } else {
      cartEmpty.style.display = 'none';
      cartFooter.style.display = 'block';
      renderCartItems(items);
      cartTotalEl.textContent = Utils.formatCurrency(subtotal);
    }
  }

  function renderCartItems(items) {
    cartItemsContainer.querySelectorAll('.cart-item').forEach(el => el.remove());

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.product.image}" alt="${item.product.name}" onerror="this.src='assets/images/cake_chocolate.jpg'">
        </div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.product.name}</span>
          <span class="cart-item-price">${Utils.formatCurrency(item.finalPrice)}</span>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="decrease" data-id="${item.productId}">−</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.productId}">+</button>
            <button class="btn-remove-item" data-id="${item.productId}" aria-label="Remover item">🗑️</button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(div);
    });

    // Quantity controls
    cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const items = Cart.getItems();
        const item = items.find(i => i.productId === id);
        if (item) {
          if (action === 'increase') {
            Cart.updateQty(id, item.qty + 1);
          } else if (action === 'decrease') {
            if (item.qty <= 1) {
              Cart.removeItem(id);
            } else {
              Cart.updateQty(id, item.qty - 1);
            }
          }
          updateCartUI();
        }
      });
    });

    // Remove buttons
    cartItemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        Cart.removeItem(btn.dataset.id);
        updateCartUI();
        Utils.showToast('Item removido do carrinho', 'info');
      });
    });
  }

  function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ===== CHECKOUT & DELIVERY LOGIC =====
  function setDeliveryType(type) {
    const settings = DataStore.getSettings();
    const delivery = settings.delivery || { deliveryEnabled: true, pickupEnabled: true };
    const canDeliver = delivery.deliveryEnabled !== false;
    const canPickup = delivery.pickupEnabled !== false;

    // Strict validation
    if (type === 'delivery' && !canDeliver) {
      if (canPickup) type = 'pickup';
      else return;
    }
    if (type === 'pickup' && !canPickup) {
      if (canDeliver) type = 'delivery';
      else return;
    }

    currentDeliveryType = type;

    if (currentDeliveryType === 'delivery') {
      tabDelivery.classList.add('active');
      tabPickup.classList.remove('active');
      groupDeliveryAddress.classList.remove('hidden');
      customerAddressInput.required = true;
      pickupInfoBox.classList.add('hidden');
      checkoutDeliveryRow.classList.remove('hidden');
    } else {
      tabPickup.classList.add('active');
      tabDelivery.classList.remove('active');
      groupDeliveryAddress.classList.add('hidden');
      customerAddressInput.required = false;
      pickupInfoBox.classList.remove('hidden');
      checkoutDeliveryRow.classList.add('hidden');
    }
    updateCheckoutTotals();
  }

  function updateDeliveryTabsUI() {
    const settings = DataStore.getSettings();
    const delivery = settings.delivery || { deliveryEnabled: true, pickupEnabled: true };
    const canDeliver = delivery.deliveryEnabled !== false;
    const canPickup = delivery.pickupEnabled !== false;

    const tabsContainer = document.querySelector('.delivery-tabs-container');
    const tabsWrapper = document.querySelector('.delivery-tabs');
    const tabsLabel = tabsContainer ? tabsContainer.querySelector('label') : null;

    if (tabDeliveryInfo) {
      const feeText = delivery.deliveryFee === 0 ? 'Grátis' : Utils.formatCurrency(delivery.deliveryFee);
      tabDeliveryInfo.textContent = `${delivery.estimatedTime || '40-60 min'} (${feeText})`;
    }
    if (tabPickupInfo) {
      tabPickupInfo.textContent = delivery.pickupEstimate || 'Pronto em 30 min';
    }
    if (pickupStoreAddress) {
      pickupStoreAddress.textContent = delivery.pickupAddress || 'Endereço da Confeitaria';
    }
    if (pickupStoreTime) {
      pickupStoreTime.textContent = `⏱️ ${delivery.pickupEstimate || 'Pronto em 30 min após confirmação'}`;
    }

    if (!canDeliver && canPickup) {
      // ONLY PICKUP AVAILABLE
      tabDelivery.style.display = 'none';
      tabPickup.style.display = 'flex';
      if (tabsWrapper) tabsWrapper.style.gridTemplateColumns = '1fr';
      if (tabsLabel) tabsLabel.textContent = 'Modo de Recebimento: Apenas Retirada no Local';
      setDeliveryType('pickup');
    } else if (canDeliver && !canPickup) {
      // ONLY DELIVERY AVAILABLE
      tabDelivery.style.display = 'flex';
      tabPickup.style.display = 'none';
      if (tabsWrapper) tabsWrapper.style.gridTemplateColumns = '1fr';
      if (tabsLabel) tabsLabel.textContent = 'Modo de Recebimento: Apenas Entrega em Domicílio';
      setDeliveryType('delivery');
    } else if (canDeliver && canPickup) {
      // BOTH AVAILABLE
      tabDelivery.style.display = 'flex';
      tabPickup.style.display = 'flex';
      if (tabsWrapper) tabsWrapper.style.gridTemplateColumns = '1fr 1fr';
      if (tabsLabel) tabsLabel.textContent = 'Como deseja receber seu pedido?';
      setDeliveryType(currentDeliveryType || 'delivery');
    } else {
      // NEITHER AVAILABLE
      tabDelivery.style.display = 'none';
      tabPickup.style.display = 'none';
      if (tabsLabel) tabsLabel.textContent = 'Modo de Recebimento: Retirada no Local';
      setDeliveryType('pickup');
    }
  }

  function updateCheckoutTotals() {
    const subtotal = Cart.getSubtotal();
    const deliveryFee = Cart.getDeliveryFee(currentDeliveryType);
    const grandTotal = Cart.getGrandTotal(currentDeliveryType);

    checkoutSubtotal.textContent = Utils.formatCurrency(subtotal);
    if (deliveryFee === 0) {
      checkoutDeliveryFee.textContent = 'GRÁTIS';
      checkoutDeliveryFee.style.color = 'var(--success)';
    } else {
      checkoutDeliveryFee.textContent = Utils.formatCurrency(deliveryFee);
      checkoutDeliveryFee.style.color = 'inherit';
    }
    checkoutTotal.textContent = Utils.formatCurrency(grandTotal);
  }

  function openCheckout() {
    if (Cart.getCount() === 0) return;
    closeCart();

    const settings = DataStore.getSettings();

    // Render items summary
    const items = Cart.getDetailedItems();
    checkoutSummary.innerHTML = items.map(item => `
      <div class="checkout-item">
        <span>${item.qty}x ${item.product.name}</span>
        <span>${Utils.formatCurrency(item.subtotal)}</span>
      </div>
    `).join('');

    // Setup delivery type dynamically based on settings
    updateDeliveryTabsUI();

    // Render payment methods
    const activeMethods = settings.paymentMethods.filter(m => m.active);
    paymentOptions.innerHTML = activeMethods.map(method => `
      <label class="payment-option" data-method-id="${method.id}" data-method-name="${method.name}">
        <input type="radio" name="payment" value="${method.name}" required>
        <span class="payment-icon">${method.icon}</span>
        <span class="payment-label">${method.name}</span>
      </label>
    `).join('');

    // Reset payment selection & boxes
    selectedPayment = null;
    pixCheckoutBox.classList.add('hidden');
    cashChangeBox.classList.add('hidden');

    // Bind payment options selection
    paymentOptions.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', () => {
        paymentOptions.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const radio = opt.querySelector('input');
        radio.checked = true;
        selectedPayment = radio.value;
        const methodId = opt.dataset.methodId;

        // Pix toggle
        if (methodId === 'pix' || selectedPayment.toLowerCase().includes('pix')) {
          pixCheckoutBox.classList.remove('hidden');
          const pix = settings.pixDetails || {};
          pixKeyVal.value = pix.key || '';
          pixKeyType.textContent = pix.keyType || 'Chave Pix';
          pixReceiverName.textContent = pix.receiverName || settings.storeName;
          if (pix.instructions) pixInstructionsText.textContent = pix.instructions;
        } else {
          pixCheckoutBox.classList.add('hidden');
        }

        // Cash change toggle
        if (methodId === 'dinheiro' || selectedPayment.toLowerCase().includes('dinheiro')) {
          cashChangeBox.classList.remove('hidden');
        } else {
          cashChangeBox.classList.add('hidden');
        }
      });
    });

    // Copy Pix Button
    btnCopyPix.onclick = () => {
      if (pixKeyVal.value) {
        navigator.clipboard.writeText(pixKeyVal.value).then(() => {
          btnCopyPix.textContent = 'Copiado! ✓';
          btnCopyPix.style.background = 'var(--success)';
          setTimeout(() => {
            btnCopyPix.textContent = 'Copiar Chave';
            btnCopyPix.style.background = '';
          }, 2000);
          Utils.showToast('Chave Pix copiada para a área de transferência!', 'success');
        }).catch(() => {
          pixKeyVal.select();
          document.execCommand('copy');
          Utils.showToast('Chave Pix copiada!', 'success');
        });
      }
    };

    // Show modal
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = $('#customer-name').value.trim();
    const phone = $('#customer-phone').value.trim();
    const address = currentDeliveryType === 'delivery' ? customerAddressInput.value.trim() : '';
    const obs = $('#customer-obs').value.trim();
    const troco = customerTroco ? customerTroco.value.trim() : '';

    const settings = DataStore.getSettings();
    const delivery = settings.delivery || { deliveryEnabled: true, pickupEnabled: true };
    const canDeliver = delivery.deliveryEnabled !== false;
    const canPickup = delivery.pickupEnabled !== false;

    if (!name || !phone) {
      Utils.showToast('Por favor, informe seu nome e telefone.', 'warning');
      return;
    }

    if (currentDeliveryType === 'delivery') {
      if (!canDeliver) {
        Utils.showToast('A entrega a domicílio foi desativada pela confeitaria. Por favor, escolha retirada.', 'warning');
        updateDeliveryTabsUI();
        return;
      }
      if (!address) {
        Utils.showToast('Por favor, informe seu endereço de entrega.', 'warning');
        customerAddressInput.focus();
        return;
      }
    }

    if (currentDeliveryType === 'pickup' && !canPickup) {
      Utils.showToast('A retirada no local está desativada no momento.', 'warning');
      updateDeliveryTabsUI();
      return;
    }

    if (!selectedPayment) {
      Utils.showToast('Selecione a forma de pagamento.', 'warning');
      return;
    }

    // Build order object
    const cartItems = Cart.getDetailedItems();
    const subtotal = Cart.getSubtotal();
    const deliveryFee = Cart.getDeliveryFee(currentDeliveryType);
    const grandTotal = Cart.getGrandTotal(currentDeliveryType);

    const order = {
      customer: {
        name,
        phone,
        address: currentDeliveryType === 'delivery' ? address : 'Retirada na Loja',
        observations: obs,
        trocoPara: troco
      },
      deliveryType: currentDeliveryType,
      deliveryFee,
      items: cartItems.map(i => ({
        productId: i.productId,
        name: i.product.name,
        qty: i.qty,
        unitPrice: i.finalPrice,
        subtotal: i.subtotal
      })),
      subtotal,
      total: grandTotal,
      paymentMethod: selectedPayment
    };

    // Save order to Supabase
    const savedOrder = await DataStore.saveOrder(order);

    // Build and send WhatsApp message to the store owner
    const message = Utils.buildWhatsAppMessage(savedOrder);
    Utils.sendToWhatsApp(message);

    // Clear cart and close
    Cart.clear();
    updateCartUI();
    closeCheckout();
    checkoutForm.reset();

    Utils.showToast('Pedido gerado! Enviando para o WhatsApp... 🎉', 'success');
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Delivery tabs with real-time validation
    tabDelivery.addEventListener('click', () => {
      const settings = DataStore.getSettings();
      const canDeliver = settings.delivery && settings.delivery.deliveryEnabled !== false;
      if (!canDeliver) {
        Utils.showToast('A entrega a domicílio está temporariamente desativada pela confeitaria.', 'warning');
        setDeliveryType('pickup');
        return;
      }
      setDeliveryType('delivery');
    });

    tabPickup.addEventListener('click', () => {
      const settings = DataStore.getSettings();
      const canPickup = settings.delivery && settings.delivery.pickupEnabled !== false;
      if (!canPickup) {
        Utils.showToast('A retirada no local está desativada no momento.', 'warning');
        setDeliveryType('delivery');
        return;
      }
      setDeliveryType('pickup');
    });

    // Auto-sync settings changes across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === DB_KEYS.SETTINGS) {
        renderStoreBranding();
        updateStoreStatus();
        updateDeliveryTabsUI();
      }
    });

    // Cart open/close
    btnOpenCart.addEventListener('click', openCart);
    btnCloseCart.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Checkout open/close
    btnCheckout.addEventListener('click', openCheckout);
    btnCloseCheckout.addEventListener('click', closeCheckout);
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) closeCheckout();
    });

    // Checkout form submit
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Keyboard ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCart();
        closeCheckout();
      }
    });
  }

  // ===== SCROLL EFFECT =====
  function setupScrollEffect() {
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScrollY = scrollY;
    }, { passive: true });
  }

  // ===== PHONE MASK =====
  function setupPhoneMask() {
    const phoneInput = $('#customer-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 6) {
          value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
          value = `(${value.slice(0,2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
          value = `(${value}`;
        }
        e.target.value = value;
      });
    }
  }

  // ===== START =====
  document.addEventListener('DOMContentLoaded', init);

})();
