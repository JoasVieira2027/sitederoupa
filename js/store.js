/**
 * store.js - Loja Pública de Roupas
 * Exibe produtos com seleção de cor e tamanho, controla carrinho e checkout via WhatsApp.
 */

(function () {
  'use strict';

  // ===== REFS DOM =====
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // Hero & branding
  const siteTitle = $('site-title');
  const navbarLogoIcon = $('navbar-logo-icon');
  const navbarBrandName = $('navbar-brand-name');
  const navbarBrandTagline = $('navbar-brand-tagline');
  const announcementBar = $('announcement-bar');
  const announcementText = $('announcement-text');
  const heroBg = $('hero-bg');
  const heroTitle = $('hero-title');
  const heroSubtitle = $('hero-subtitle');
  const heroCta = $('hero-cta');
  const heroBadgeText = $('hero-badge-text');
  const heroWhatsappBtn = $('hero-whatsapp-btn');

  // About
  const aboutSection = $('about-section');
  const aboutTagline = $('about-tagline');
  const aboutTitle = $('about-title');
  const aboutText = $('about-text');
  const aboutFeatures = $('about-features');

  // Navbar & status
  const navbar = $('navbar');
  const storeStatus = $('store-status');
  const storeStatusText = $('store-status-text');
  const cartCountEl = $('cart-count');
  const btnOpenCart = $('btn-open-cart');

  // Closed banner
  const closedBanner = $('store-closed-banner');
  const closedMessage = $('store-closed-message');

  // Products
  const categoriesFilter = $('categories-filter');
  const productsGrid = $('products-grid');
  const emptyProducts = $('empty-products');

  // Cart
  const cartOverlay = $('cart-overlay');
  const cartSidebar = $('cart-sidebar');
  const cartItemsContainer = $('cart-items');
  const cartEmpty = $('cart-empty');
  const cartFooter = $('cart-footer');
  const cartTotalEl = $('cart-total');
  const btnCloseCart = $('btn-close-cart');
  const btnCheckout = $('btn-checkout');

  // Mobile bar
  const mobileCartBar = $('mobile-cart-bar');
  const mobileCartInfo = $('mobile-cart-info');
  const mobileCartBadge = $('mobile-cart-badge');
  const mobileCartCount = $('mobile-cart-count');
  const mobileCartTotal = $('mobile-cart-total');
  const btnMobileCheckout = $('btn-mobile-checkout');

  // Checkout
  const checkoutModal = $('checkout-modal');
  const checkoutItemsEl = $('checkout-items');
  const checkoutSubtotal = $('checkout-subtotal');
  const checkoutDeliveryFee = $('checkout-delivery-fee');
  const checkoutDeliveryRow = $('checkout-delivery-row');
  const checkoutTotal = $('checkout-total');
  const checkoutForm = $('checkout-form');
  const btnCloseCheckout = $('btn-close-checkout');
  const paymentOptions = $('payment-options');

  // Product modal
  const productDetailsModal = $('product-details-modal');
  const modalProductName = $('modal-product-name');
  const modalProductCategory = $('modal-product-category');
  const modalProductBadge = $('modal-product-badge');
  const modalProductImage = $('modal-product-image');
  const modalProductPlaceholder = $('modal-product-placeholder');
  const modalProductPrice = $('modal-product-price');
  const modalProductOriginalPrice = $('modal-product-original-price');
  const modalProductDiscount = $('modal-product-discount');
  const modalStockIndicator = $('modal-stock-indicator');
  const modalStockText = $('modal-stock-text');
  const modalProductDescription = $('modal-product-description');
  const modalColorSelector = $('modal-color-selector');
  const modalSelectedColorName = $('modal-selected-color-name');
  const modalSizeSelector = $('modal-size-selector');
  const modalSelectedSize = $('modal-selected-size');
  const modalProductQty = $('modal-product-qty');
  const btnModalQtyMinus = $('btn-modal-qty-minus');
  const btnModalQtyPlus = $('btn-modal-qty-plus');
  const btnModalAddCart = $('btn-modal-add-cart');

  // Footer
  const footerBrand = $('footer-brand');
  const footerTagline = $('footer-tagline');
  const footerAddress = $('footer-address');
  const footerPhone = $('footer-phone');
  const footerWhatsapp = $('footer-whatsapp');
  const footerInstagram = $('footer-instagram');
  const footerCopyright = $('footer-copyright');

  // ===== STATE =====
  let cart = []; // [{id, name, price, color, colorHex, size, qty, image, category}]
  let currentCategory = 'all';
  let currentProduct = null;
  let modalSelectedColor = null;
  let modalSelectedSizeVal = null;
  let modalQty = 1;
  let settings = null;
  let deliveryType = 'delivery'; // 'delivery' | 'pickup'
  let selectedPayment = null;

  // ===== INIT =====
  async function init() {
    // enableRealtime: false para loja pública poupa conexões e limites do Supabase
    await DataStore.init({ enableRealtime: false, isAdmin: false });
    settings = DataStore.getSettings();

    applyBranding();
    applyStoreStatus();
    renderCategories();
    renderFeaturedCollection();
    renderProducts();
    renderAbout();
    renderInstagramFeed();
    renderFooter();
    bindEvents();
    loadCart();
    updateCartUI();
  }

  // ===== BRANDING =====
  function applyBranding() {
    if (!settings) return;

    document.title = `${settings.storeName} | ${settings.storeTagline}`;
    if (siteTitle) siteTitle.textContent = `${settings.storeName} | ${settings.storeTagline}`;

    // Theme color
    if (settings.themeColor) {
      document.documentElement.style.setProperty('--primary', settings.themeColor);
    }

    // Logo
    const logoSrc = settings.storeLogoImage;
    if (logoSrc && navbarLogoIcon) {
      navbarLogoIcon.innerHTML = `<img src="${logoSrc}" alt="${settings.storeName}" class="logo-img" onerror="this.parentElement.textContent='${settings.storeLogoEmoji || '👗'}'">`;
    } else if (navbarLogoIcon) {
      navbarLogoIcon.textContent = settings.storeLogoEmoji || '👗';
    }

    if (navbarBrandName) navbarBrandName.textContent = settings.storeName;
    if (navbarBrandTagline) navbarBrandTagline.textContent = settings.storeTagline;

    // Announcement
    const ann = settings.announcementBar;
    if (ann && ann.active && ann.text && announcementBar) {
      if (announcementText) announcementText.textContent = ann.text;
      announcementBar.classList.remove('hidden');
    }

    // Hero
    const hero = settings.hero || {};
    if (heroTitle) heroTitle.innerHTML = hero.title || 'Moda que te faz <em>brilhar</em>';
    if (heroSubtitle) heroSubtitle.textContent = hero.subtitle || '';
    if (heroCta) heroCta.textContent = hero.ctaText || '✨ Ver Coleção';
    if (heroBadgeText) heroBadgeText.textContent = hero.badgeText || 'Coleção Nova';
    if (heroBg) {
      heroBg.style.backgroundImage = `url('assets/images/hero_fashion.jpg')`;
    }

    // WhatsApp button in hero
    const wa = settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : '#';
    if (heroWhatsappBtn) heroWhatsappBtn.href = wa;
    if (footerWhatsapp) footerWhatsapp.href = wa;
  }

  // ===== STORE STATUS =====
  function applyStoreStatus() {
    if (!settings) return;
    const open = DataStore.isStoreOpen();

    if (storeStatus) {
      storeStatus.className = 'navbar-status' + (open ? '' : ' closed');
    }
    if (storeStatusText) storeStatusText.textContent = open ? 'Aberta' : 'Fechada';

    if (!open && closedBanner) {
      if (closedMessage) closedMessage.textContent = settings.closedCustomMessage || 'Estamos fechados no momento.';
      closedBanner.classList.remove('hidden');
    } else if (closedBanner) {
      closedBanner.classList.add('hidden');
    }
  }

  // ===== CATEGORIES =====
  function renderCategories() {
    if (!categoriesFilter) return;
    const categories = DataStore.getCategories();
    const products = DataStore.getProducts();

    // Only show categories that have active products
    const usedCats = new Set(products.map(p => p.category));

    let html = `<button class="category-btn active" data-cat="all" id="cat-btn-all">
      <span class="category-icon">✨</span> Todos
    </button>`;

    categories.filter(c => usedCats.has(c.name)).forEach(cat => {
      html += `<button class="category-btn" data-cat="${Utils.sanitize(cat.name)}" id="cat-btn-${cat.id}">
        <span class="category-icon">${cat.icon || '👗'}</span> ${Utils.sanitize(cat.name)}
      </button>`;
    });

    categoriesFilter.innerHTML = html;

    categoriesFilter.addEventListener('click', e => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      $$('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderProducts();
    });
  }

  // ===== PRODUCTS =====
  function renderProducts() {
    if (!productsGrid) return;
    let products = DataStore.getProducts();

    if (currentCategory !== 'all') {
      products = products.filter(p => p.category === currentCategory);
    }

    if (!products.length) {
      productsGrid.innerHTML = '';
      if (emptyProducts) emptyProducts.classList.remove('hidden');
      return;
    }

    if (emptyProducts) emptyProducts.classList.add('hidden');

    productsGrid.innerHTML = products.map((p, i) => renderProductCard(p, i)).join('');

    // Bind card clicks & mini swatches
    productsGrid.querySelectorAll('.product-card').forEach(card => {
      const id = card.dataset.id;

      card.addEventListener('click', e => {
        if (e.target.closest('.btn-add-cart') || e.target.closest('.color-swatch-mini')) return;
        openProductModal(id);
      });

      card.querySelectorAll('.color-swatch-mini').forEach(swatch => {
        swatch.addEventListener('click', e => {
          e.stopPropagation();
          const color = swatch.dataset.color;
          openProductModal(id, color);
        });
        swatch.addEventListener('mouseenter', () => {
          const img = swatch.dataset.image;
          const cardImg = card.querySelector('img');
          if (cardImg && img) {
            cardImg.dataset.origSrc = cardImg.dataset.origSrc || cardImg.src;
            cardImg.src = img;
          }
        });
        swatch.addEventListener('mouseleave', () => {
          const cardImg = card.querySelector('img');
          if (cardImg && cardImg.dataset.origSrc) {
            cardImg.src = cardImg.dataset.origSrc;
          }
        });
      });
    });

    productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openProductModal(id);
      });
    });
  }

  function renderProductCard(p, index) {
    const finalPrice = Utils.calcDiscountedPrice(p.price, p.promotion);
    const hasPromo = p.promotion && p.promotion.active && p.promotion.discountPercent > 0;
    const totalStock = DataStore.getProductTotalStock(p.id);
    const isOut = !p.inStock || totalStock === 0;

    const imageHtml = p.image
      ? `<img src="${Utils.sanitize(p.image)}" alt="${Utils.sanitize(p.name)}" loading="lazy">`
      : `<div class="product-no-image">⚡<span>${Utils.sanitize(p.category)}</span></div>`;

    // Badge
    let badgeHtml = '';
    if (isOut) {
      badgeHtml = `<span class="product-badge badge-esgotado">Esgotado</span>`;
    } else if (hasPromo) {
      badgeHtml = `<span class="product-badge badge-promo">-${p.promotion.discountPercent}%</span>`;
    } else if (p.badge) {
      badgeHtml = `<span class="product-badge">${Utils.sanitize(p.badge)}</span>`;
    }

    // Color swatches preview
    const colors = (p.variants || []).slice(0, 5);
    const colorSwatches = colors.map(v =>
      `<span class="color-swatch-mini" style="background:${v.colorHex || '#ccc'}" title="${Utils.sanitize(v.color)}" data-color="${Utils.sanitize(v.color)}" data-image="${Utils.sanitize(v.image || '')}"></span>`
    ).join('');

    // Stock info
    let stockInfo = '';
    if (isOut) {
      stockInfo = `<span class="stock-out">● Esgotado</span>`;
    } else if (totalStock <= 5) {
      stockInfo = `<span class="stock-low">● Últimas unidades (${totalStock})</span>`;
    } else {
      stockInfo = `<span class="stock-ok">● Disponível</span>`;
    }

    // Price block
    let priceHtml = '';
    if (hasPromo) {
      priceHtml = `
        <div class="product-price-block">
          <span class="product-price">${Utils.formatCurrency(finalPrice)}</span>
          <span class="product-price-original">${Utils.formatCurrency(p.price)}</span>
          <span class="product-price-discount">-${p.promotion.discountPercent}% OFF</span>
        </div>`;
    } else {
      priceHtml = `<div class="product-price-block"><span class="product-price">${Utils.formatCurrency(p.price)}</span></div>`;
    }

    return `
      <div class="product-card ${isOut ? 'out-of-stock' : ''}" data-id="${p.id}" style="animation-delay:${index * 60}ms">
        <div class="product-card-image-wrapper">
          ${imageHtml}
          ${badgeHtml}
          ${colorSwatches ? `<div class="product-colors-preview">${colorSwatches}</div>` : ''}
          <div class="product-card-quick-view">Ver Detalhes</div>
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${Utils.sanitize(p.category)}</span>
          <div class="product-card-name">${Utils.sanitize(p.name)}</div>
          <div class="product-card-stock-info">${stockInfo}</div>
          <div class="product-card-footer">
            ${priceHtml}
            <button class="btn-add-cart" data-id="${p.id}" ${isOut ? 'disabled' : ''} aria-label="Selecionar opções">🛒</button>
          </div>
        </div>
      </div>`;
  }

  // ===== FEATURED / NOVA COLEÇÃO =====
  function renderFeaturedCollection() {
    const featuredSection = $('featured-section');
    const featuredGrid = $('featured-grid');
    if (!featuredSection || !featuredGrid) return;

    const s = DataStore.getSettings();
    const fc = s.featuredCollection || {};
    if (fc.active === false) {
      featuredSection.classList.add('hidden');
      return;
    }

    const featuredProducts = DataStore.getFeaturedProducts();
    if (!featuredProducts || !featuredProducts.length) {
      featuredSection.classList.add('hidden');
      return;
    }

    featuredSection.classList.remove('hidden');
    if ($('featured-title')) $('featured-title').textContent = fc.title || 'Nova Coleção 2026';
    if ($('featured-subtitle')) $('featured-subtitle').textContent = fc.subtitle || 'Peças exclusivas com modelagem anatômica e zero transparência';

    featuredGrid.innerHTML = featuredProducts.map((p, i) => renderFeaturedCard(p, i)).join('');

    // Bind card and buy clicks & swatches
    featuredGrid.querySelectorAll('.product-card').forEach(card => {
      const id = card.dataset.id;
      card.addEventListener('click', e => {
        if (e.target.closest('.btn-buy-featured') || e.target.closest('.color-swatch-mini')) return;
        openProductModal(id);
      });

      card.querySelectorAll('.color-swatch-mini').forEach(swatch => {
        swatch.addEventListener('click', e => {
          e.stopPropagation();
          const color = swatch.dataset.color;
          openProductModal(id, color);
        });
        swatch.addEventListener('mouseenter', () => {
          const img = swatch.dataset.image;
          const cardImg = card.querySelector('img');
          if (cardImg && img) {
            cardImg.dataset.origSrc = cardImg.dataset.origSrc || cardImg.src;
            cardImg.src = img;
          }
        });
        swatch.addEventListener('mouseleave', () => {
          const cardImg = card.querySelector('img');
          if (cardImg && cardImg.dataset.origSrc) {
            cardImg.src = cardImg.dataset.origSrc;
          }
        });
      });
    });

    featuredGrid.querySelectorAll('.btn-buy-featured').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openProductModal(id);
      });
    });
  }

  function renderFeaturedCard(p, index) {
    const finalPrice = Utils.calcDiscountedPrice(p.price, p.promotion);
    const hasPromo = p.promotion && p.promotion.active && p.promotion.discountPercent > 0;
    const totalStock = DataStore.getProductTotalStock(p.id);
    const isOut = !p.inStock || totalStock === 0;

    const imageHtml = p.image
      ? `<img src="${Utils.sanitize(p.image)}" alt="${Utils.sanitize(p.name)}" loading="lazy" class="featured-card-img">`
      : `<div class="product-no-image">⚡<span>${Utils.sanitize(p.category)}</span></div>`;

    const colors = (p.variants || []).slice(0, 5);
    const colorSwatches = colors.map(v =>
      `<span class="color-swatch-mini" style="background:${v.colorHex || '#ccc'}" title="${Utils.sanitize(v.color)}" data-color="${Utils.sanitize(v.color)}" data-image="${Utils.sanitize(v.image || '')}"></span>`
    ).join('');

    let badgeHtml = `<span class="product-badge badge-destaque">⭐ Destaque</span>`;
    if (isOut) {
      badgeHtml = `<span class="product-badge badge-esgotado">Esgotado</span>`;
    } else if (hasPromo) {
      badgeHtml = `<span class="product-badge badge-promo">-${p.promotion.discountPercent}% OFF</span>`;
    } else if (p.badge) {
      badgeHtml = `<span class="product-badge">${Utils.sanitize(p.badge)}</span>`;
    }

    let priceHtml = '';
    if (hasPromo) {
      priceHtml = `
        <div class="product-price-block">
          <span class="product-price">${Utils.formatCurrency(finalPrice)}</span>
          <span class="product-price-original">${Utils.formatCurrency(p.price)}</span>
        </div>`;
    } else {
      priceHtml = `<div class="product-price-block"><span class="product-price">${Utils.formatCurrency(p.price)}</span></div>`;
    }

    return `
      <div class="product-card featured-product-card ${isOut ? 'out-of-stock' : ''}" data-id="${p.id}" style="animation-delay:${index * 70}ms">
        <div class="product-card-image-wrapper">
          ${imageHtml}
          ${badgeHtml}
          ${colorSwatches ? `<div class="product-colors-preview">${colorSwatches}</div>` : ''}
          <div class="product-card-quick-view">⚡ Escolher Cor & Tamanho</div>
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${Utils.sanitize(p.category)}</span>
          <div class="product-card-name">${Utils.sanitize(p.name)}</div>
          <div class="product-card-footer" style="margin-top:8px;">
            ${priceHtml}
          </div>
          <button type="button" class="btn-buy-featured" data-id="${p.id}" ${isOut ? 'disabled' : ''}>
            ${isOut ? 'Esgotado' : '⚡ Comprar Agora'}
          </button>
        </div>
      </div>`;
  }

  // ===== PRODUCT MODAL =====
  function openProductModal(id, preselectedColor = null) {
    const product = DataStore.getProductById(id);
    if (!product || !product.active) return;

    currentProduct = product;
    modalSelectedColor = null;
    modalSelectedSizeVal = null;
    modalQty = 1;
    if (modalProductQty) modalProductQty.textContent = 1;

    const finalPrice = Utils.calcDiscountedPrice(product.price, product.promotion);
    const hasPromo = product.promotion && product.promotion.active && product.promotion.discountPercent > 0;

    // Populate modal
    if (modalProductName) modalProductName.textContent = product.name;
    if (modalProductCategory) modalProductCategory.textContent = product.category;
    if (modalProductPrice) modalProductPrice.textContent = Utils.formatCurrency(finalPrice);

    if (hasPromo) {
      if (modalProductOriginalPrice) { modalProductOriginalPrice.textContent = Utils.formatCurrency(product.price); modalProductOriginalPrice.style.display = ''; }
      if (modalProductDiscount) { modalProductDiscount.textContent = `-${product.promotion.discountPercent}% OFF`; modalProductDiscount.style.display = ''; }
    } else {
      if (modalProductOriginalPrice) modalProductOriginalPrice.style.display = 'none';
      if (modalProductDiscount) modalProductDiscount.style.display = 'none';
    }

    // Badge
    if (modalProductBadge) {
      if (product.badge) { modalProductBadge.textContent = product.badge; modalProductBadge.style.display = ''; }
      else modalProductBadge.style.display = 'none';
    }

    // Image (base product image)
    if (product.image) {
      if (modalProductImage) { modalProductImage.src = product.image; modalProductImage.alt = product.name; modalProductImage.style.display = 'block'; }
      if (modalProductPlaceholder) modalProductPlaceholder.style.display = 'none';
    } else {
      if (modalProductImage) modalProductImage.style.display = 'none';
      if (modalProductPlaceholder) { modalProductPlaceholder.textContent = '⚡'; modalProductPlaceholder.style.display = 'flex'; }
    }

    // Description
    if (modalProductDescription) modalProductDescription.textContent = product.description || '';

    // Color selector with preselected color support
    renderColorSelector(product, preselectedColor);

    // Stock summary
    updateModalStockIndicator();

    // Open modal
    if (productDetailsModal) productDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function renderColorSelector(product, preselectedColor = null) {
    if (!modalColorSelector) return;
    const variants = product.variants || [];

    if (!variants.length) {
      $('modal-color-section') && ($('modal-color-section').style.display = 'none');
      $('modal-size-section') && ($('modal-size-section').style.display = 'none');
      // No variants — allow add without selection
      if (btnModalAddCart) btnModalAddCart.disabled = false;
      return;
    }

    $('modal-color-section') && ($('modal-color-section').style.display = '');
    $('modal-size-section') && ($('modal-size-section').style.display = '');

    modalColorSelector.innerHTML = variants.map(v => {
      const totalQty = (v.sizes || []).reduce((s, sz) => s + sz.qty, 0);
      const isOut = totalQty === 0;
      return `<div class="color-option ${isOut ? 'out-of-stock' : ''}" data-color="${Utils.sanitize(v.color)}" data-hex="${v.colorHex || '#ccc'}" title="${Utils.sanitize(v.color)}">
        <div class="color-swatch" style="background:${v.colorHex || '#ccc'};"></div>
        <span class="color-option-name">${Utils.sanitize(v.color)}</span>
      </div>`;
    }).join('');

    function selectColor(colorName) {
      modalColorSelector.querySelectorAll('.color-option').forEach(o => {
        if (o.dataset.color === colorName) o.classList.add('selected');
        else o.classList.remove('selected');
      });
      modalSelectedColor = colorName;
      if (modalSelectedColorName) modalSelectedColorName.textContent = colorName;

      // Troca imagem para a foto da cor escolhida se cadastrada
      const variant = (product.variants || []).find(v => v.color === modalSelectedColor);
      const targetImg = (variant && variant.image) ? variant.image : product.image;
      if (modalProductImage && targetImg) {
        modalProductImage.style.transition = 'opacity 0.15s ease';
        modalProductImage.style.opacity = '0.35';
        setTimeout(() => {
          modalProductImage.src = targetImg;
          modalProductImage.style.opacity = '1';
        }, 120);
      }

      modalSelectedSizeVal = null;
      renderSizeSelector(product, modalSelectedColor);
      updateModalStockIndicator();
      updateModalAddCartBtn();
    }

    modalColorSelector.querySelectorAll('.color-option:not(.out-of-stock)').forEach(opt => {
      opt.addEventListener('click', () => {
        selectColor(opt.dataset.color);
      });
    });

    // Auto-select preselectedColor OR first available in-stock color
    let colorToSelect = null;
    if (preselectedColor && variants.some(v => v.color === preselectedColor)) {
      colorToSelect = preselectedColor;
    } else {
      const firstInStock = variants.find(v => (v.sizes || []).reduce((s, sz) => s + sz.qty, 0) > 0);
      if (firstInStock) colorToSelect = firstInStock.color;
      else if (variants.length) colorToSelect = variants[0].color;
    }

    if (colorToSelect) {
      selectColor(colorToSelect);
    } else {
      if (modalSizeSelector) modalSizeSelector.innerHTML = '<span style="font-size:0.8rem;color:var(--text-muted);">Selecione uma cor primeiro</span>';
      if (modalSelectedSize) modalSelectedSize.textContent = '—';
      updateModalAddCartBtn();
    }
  }

  function renderSizeSelector(product, selectedColor) {
    if (!modalSizeSelector) return;
    const variant = (product.variants || []).find(v => v.color === selectedColor);
    if (!variant) { modalSizeSelector.innerHTML = ''; return; }

    const storeSettings = DataStore.getSettings();
    const allSizes = storeSettings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'];

    // Show all store sizes; mark as out if qty=0
    const sizeMap = {};
    (variant.sizes || []).forEach(s => { sizeMap[s.size] = s.qty; });

    // Filter to sizes defined in the product (only sizes that appear in variant)
    const productSizes = (variant.sizes || []).map(s => s.size);
    const sizesToShow = allSizes.filter(s => productSizes.includes(s));

    if (!sizesToShow.length) {
      modalSizeSelector.innerHTML = '<span style="font-size:0.8rem;color:var(--text-muted);">Nenhum tamanho cadastrado</span>';
      return;
    }

    modalSizeSelector.innerHTML = sizesToShow.map(size => {
      const qty = sizeMap[size] || 0;
      const isOut = qty === 0;
      return `<button type="button" class="size-btn ${isOut ? 'out-of-stock' : ''}" 
        data-size="${size}" data-qty="${qty}" ${isOut ? 'disabled' : ''}>
        ${size}
        <span class="size-qty">${qty > 0 ? `${qty} un` : 'Esgotado'}</span>
      </button>`;
    }).join('');

    modalSizeSelector.querySelectorAll('.size-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.size-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modalSelectedSizeVal = btn.dataset.size;
        if (modalSelectedSize) modalSelectedSize.textContent = btn.dataset.size;
        // Reset qty to 1 but limit to available
        const maxQty = parseInt(btn.dataset.qty) || 1;
        modalQty = 1;
        if (modalProductQty) modalProductQty.textContent = 1;
        if (btnModalQtyPlus) btnModalQtyPlus.disabled = maxQty <= 1;
        updateModalStockIndicator();
        updateModalAddCartBtn();
      });
    });
  }

  function updateModalStockIndicator() {
    if (!modalStockIndicator || !currentProduct) return;
    const hasVariants = (currentProduct.variants || []).length > 0;
    let qty = 0;

    if (hasVariants && modalSelectedColor && modalSelectedSizeVal) {
      qty = DataStore.getVariantStock(currentProduct.id, modalSelectedColor, modalSelectedSizeVal);
    } else if (!hasVariants) {
      qty = DataStore.getProductTotalStock(currentProduct.id);
    } else {
      // Just show total
      qty = DataStore.getProductTotalStock(currentProduct.id);
    }

    modalStockIndicator.className = 'stock-indicator';
    if (qty === 0) {
      modalStockIndicator.classList.add('out');
      if (modalStockText) modalStockText.textContent = 'Esgotado';
    } else if (qty <= 3) {
      modalStockIndicator.classList.add('low');
      if (modalStockText) modalStockText.textContent = `Últimas ${qty} unidade(s)!`;
    } else {
      modalStockIndicator.classList.add('ok');
      if (modalStockText) modalStockText.textContent = `${qty} unidade(s) disponível`;
    }
  }

  function updateModalAddCartBtn() {
    if (!btnModalAddCart) return;
    const hasVariants = (currentProduct.variants || []).length > 0;

    if (!hasVariants) {
      btnModalAddCart.disabled = false;
      btnModalAddCart.textContent = '🛒 Adicionar ao Carrinho';
      return;
    }

    if (!modalSelectedColor) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.textContent = '← Selecione uma cor';
      return;
    }

    if (!modalSelectedSizeVal) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.textContent = '← Selecione um tamanho';
      return;
    }

    const qty = DataStore.getVariantStock(currentProduct.id, modalSelectedColor, modalSelectedSizeVal);
    if (qty === 0) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.textContent = 'Esgotado';
      return;
    }

    btnModalAddCart.disabled = false;
    btnModalAddCart.textContent = '🛒 Adicionar ao Carrinho';
  }

  function closeProductModal() {
    if (productDetailsModal) productDetailsModal.classList.remove('active');
    document.body.style.overflow = '';
    currentProduct = null;
  }

  // ===== ABOUT =====
  function renderAbout() {
    if (!settings || !settings.about) return;
    const about = settings.about;
    if (!about.active) { if (aboutSection) aboutSection.classList.add('hidden'); return; }
    if (aboutSection) aboutSection.classList.remove('hidden');
    if (aboutTagline) aboutTagline.textContent = about.subtitle || '';
    if (aboutTitle) aboutTitle.textContent = about.title || '';
    if (aboutText) aboutText.textContent = about.text || '';
    if (aboutFeatures && about.features) {
      aboutFeatures.innerHTML = about.features.map(f =>
        `<div class="about-feature">
          <span class="about-feature-icon">${f.icon || '✨'}</span>
          <h4>${Utils.sanitize(f.title)}</h4>
          <p>${Utils.sanitize(f.desc)}</p>
        </div>`
      ).join('');
    }
  }

  // ===== INSTAGRAM FEED (META GRAPH API) =====
  let igFeedLoaded = false;
  function renderInstagramFeed() {
    const section = $('instagram-section');
    const grid = $('instagram-grid');
    const fallback = $('instagram-fallback');
    if (!section || !grid) return;

    const s = DataStore.getSettings();
    const ig = s.instagramFeed || {};

    if (ig.active === false) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    if ($('instagram-title')) $('instagram-title').textContent = ig.title || 'Siga no Instagram';
    if ($('instagram-subtitle')) $('instagram-subtitle').textContent = ig.subtitle || 'Acompanhe novidades, treinos e bastidores';

    const profileUrl = ig.profileUrl
      ? (ig.profileUrl.startsWith('http') ? ig.profileUrl : `https://instagram.com/${ig.profileUrl.replace('@', '')}`)
      : (s.instagram ? `https://instagram.com/${s.instagram.replace('@', '')}` : 'https://instagram.com');

    const profileBtn = $('btn-instagram-profile');
    if (profileBtn) profileBtn.href = profileUrl;

    const limit = Math.max(1, Math.min(ig.postsLimit || 6, 12));
    const cacheMinutes = ig.cacheMinutes || 60;

    // Se já carregou na sessão atual, não refaz
    if (igFeedLoaded && grid.children.length > 0) return;

    // Exibir skeletons enquanto carrega
    grid.innerHTML = Array(limit).fill(0).map(() => '<div class="instagram-skeleton"></div>').join('');
    if (fallback) fallback.classList.add('hidden');

    // Usar sessionStorage para cache do cliente (10 min) evitando chamadas na navegação
    const clientCacheKey = `fitvibe_ig_posts_${limit}`;
    try {
      const cached = sessionStorage.getItem(clientCacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000 && parsed.posts?.length > 0) {
          renderInstagramPosts(parsed.posts);
          igFeedLoaded = true;
          return;
        }
      }
    } catch (e) {}

    // Carregamento otimizado usando IntersectionObserver
    function fetchPosts() {
      fetch(`/api/instagram?limit=${limit}&cacheMinutes=${cacheMinutes}`)
        .then(res => res.json())
        .then(data => {
          igFeedLoaded = true;
          if (data && data.ok && Array.isArray(data.posts) && data.posts.length > 0) {
            renderInstagramPosts(data.posts);
            try {
              sessionStorage.setItem(clientCacheKey, JSON.stringify({ timestamp: Date.now(), posts: data.posts }));
            } catch (e) {}
          } else {
            showInstagramFallback(profileUrl, ig.handle || s.instagram || '@fitvibe');
          }
        })
        .catch(err => {
          console.warn('[Instagram] Erro ao carregar feed:', err);
          showInstagramFallback(profileUrl, ig.handle || s.instagram || '@fitvibe');
        });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            obs.disconnect();
            fetchPosts();
          }
        });
      }, { rootMargin: '200px' });
      observer.observe(section);
    } else {
      setTimeout(fetchPosts, 300);
    }
  }

  function renderInstagramPosts(posts) {
    const grid = $('instagram-grid');
    const fallback = $('instagram-fallback');
    if (!grid) return;
    if (fallback) fallback.classList.add('hidden');

    grid.innerHTML = posts.map(post => `
      <a href="${Utils.sanitize(post.permalink)}" target="_blank" rel="noopener noreferrer" 
         class="instagram-post-card" title="${Utils.sanitize(post.caption || 'Ver publicação no Instagram')}">
        <img src="${Utils.sanitize(post.mediaUrl)}" alt="${Utils.sanitize(post.caption || 'Foto Instagram')}" loading="lazy">
        ${post.mediaType === 'VIDEO' ? '<span class="instagram-video-badge" title="Vídeo">▶</span>' : ''}
        <div class="instagram-post-overlay">
          ${post.caption ? `<div class="instagram-post-caption">${Utils.sanitize(post.caption)}</div>` : ''}
          <span class="instagram-post-action">Ver no Instagram ↗</span>
        </div>
      </a>
    `).join('');
  }

  function showInstagramFallback(profileUrl, handle) {
    const grid = $('instagram-grid');
    const fallback = $('instagram-fallback');
    if (grid) grid.innerHTML = '';
    if (fallback) {
      fallback.classList.remove('hidden');
      fallback.innerHTML = `
        <span class="instagram-fallback-icon">📸</span>
        <h3>Acompanhe nossa Comunidade no Instagram</h3>
        <p>Confira novidades diárias, lançamentos fitness, bastidores e clientes reais usando nossas peças em <strong>${Utils.sanitize(handle)}</strong>.</p>
        <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" class="btn-instagram-profile" style="margin-top:4px;">
          Seguir ${Utils.sanitize(handle)} no Instagram ↗
        </a>
      `;
    }
  }

  // ===== FOOTER =====
  function renderFooter() {
    if (!settings) return;
    if (footerBrand) footerBrand.textContent = `${settings.storeLogoEmoji || '⚡'} ${settings.storeName}`;
    if (footerTagline) footerTagline.textContent = settings.storeTagline || '';
    if (footerAddress) footerAddress.textContent = settings.address || '';
    if (footerPhone) footerPhone.textContent = settings.contactPhone || '';
    const wa = `https://wa.me/${settings.whatsappNumber}`;
    if (footerWhatsapp) footerWhatsapp.href = wa;
    if (settings.instagram && footerInstagram) {
      footerInstagram.href = `https://instagram.com/${settings.instagram.replace('@', '')}`;
      footerInstagram.textContent = settings.instagram;
      footerInstagram.classList.remove('hidden');
    }
    if (footerCopyright) footerCopyright.textContent = settings.footerCopyright || '';
  }

  // ===== CART =====
  function loadCart() {
    try {
      const saved = localStorage.getItem('fashion_cart');
      cart = saved ? JSON.parse(saved) : [];
    } catch { cart = []; }
  }

  function saveCart() {
    try { localStorage.setItem('fashion_cart', JSON.stringify(cart)); } catch {}
  }

  function getCartTotal() {
    return cart.reduce((s, item) => s + item.price * item.qty, 0);
  }

  function getCartCount() {
    return cart.reduce((s, item) => s + item.qty, 0);
  }

  function addToCart(product, color, colorHex, size, qty = 1) {
    // Check stock
    const hasVariants = (product.variants || []).length > 0;
    if (hasVariants) {
      const available = DataStore.getVariantStock(product.id, color, size);
      // Check already in cart
      const existing = cart.find(i => i.id === product.id && i.color === color && i.size === size);
      const alreadyInCart = existing ? existing.qty : 0;
      if (alreadyInCart + qty > available) {
        Utils.showToast(`Estoque insuficiente! Disponível: ${available} un.`, 'warning');
        return false;
      }
    }

    const finalPrice = Utils.calcDiscountedPrice(product.price, product.promotion);

    const key = `${product.id}|${color || ''}|${size || ''}`;
    const existing = cart.find(i => `${i.id}|${i.color || ''}|${i.size || ''}` === key);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: finalPrice,
        originalPrice: product.price,
        color: color || '',
        colorHex: colorHex || '',
        size: size || '',
        qty,
        image: product.image || '',
        category: product.category
      });
    }

    saveCart();
    updateCartUI();
    Utils.showToast(`${product.name} adicionado ao carrinho!`, 'success');
    return true;
  }

  function removeFromCart(id, color, size) {
    const key = `${id}|${color || ''}|${size || ''}`;
    cart = cart.filter(i => `${i.id}|${i.color || ''}|${i.size || ''}` !== key);
    saveCart();
    updateCartUI();
    renderCartItems();
  }

  function updateCartItemQty(id, color, size, delta) {
    const key = `${id}|${color || ''}|${size || ''}`;
    const item = cart.find(i => `${i.id}|${i.color || ''}|${i.size || ''}` === key);
    if (!item) return;

    if (delta > 0) {
      // Check stock
      const available = DataStore.getVariantStock(id, color, size);
      if (available > 0 && item.qty >= available) {
        Utils.showToast('Quantidade máxima em estoque!', 'warning');
        return;
      }
    }

    item.qty = Math.max(0, item.qty + delta);
    if (item.qty === 0) {
      removeFromCart(id, color, size);
      return;
    }
    saveCart();
    updateCartUI();
    renderCartItems();
  }

  function updateCartUI() {
    const count = getCartCount();
    const total = getCartTotal();

    // Navbar badge
    if (cartCountEl) {
      if (count > 0) { cartCountEl.textContent = count; cartCountEl.style.display = ''; }
      else cartCountEl.style.display = 'none';
    }

    // Cart total
    if (cartTotalEl) cartTotalEl.textContent = Utils.formatCurrency(total);

    // Cart footer
    if (cartFooter) cartFooter.style.display = count > 0 ? 'block' : 'none';
    if (cartEmpty) cartEmpty.style.display = count === 0 ? 'flex' : 'none';

    // Mobile bar
    if (mobileCartBar) {
      if (count > 0) mobileCartBar.classList.remove('hidden');
      else mobileCartBar.classList.add('hidden');
    }
    if (mobileCartBadge) mobileCartBadge.textContent = count;
    if (mobileCartCount) mobileCartCount.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
    if (mobileCartTotal) mobileCartTotal.textContent = Utils.formatCurrency(total);
  }

  function renderCartItems() {
    if (!cartItemsContainer) return;

    // Remove existing items (keep cart-empty div)
    const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
    existingItems.forEach(el => el.remove());

    if (cart.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'flex';
      return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';

    const fragment = document.createDocumentFragment();
    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      const colorDot = item.colorHex ? `<span class="cart-item-color-dot" style="background:${item.colorHex}"></span>` : '';
      const variantInfo = [colorDot ? `${colorDot} ${item.color}` : (item.color || ''), item.size ? `Tam. ${item.size}` : ''].filter(Boolean).join(' · ');

      el.innerHTML = `
        <div class="cart-item-image">
          ${item.image ? `<img src="${Utils.sanitize(item.image)}" alt="${Utils.sanitize(item.name)}">` : '⚡'}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${Utils.sanitize(item.name)}</div>
          ${variantInfo ? `<div class="cart-item-variant">${variantInfo}</div>` : ''}
          <div class="cart-item-footer">
            <span class="cart-item-price">${Utils.formatCurrency(item.price * item.qty)}</span>
            <div class="cart-item-qty">
              <button class="qty-btn-sm" data-id="${item.id}" data-color="${item.color || ''}" data-size="${item.size || ''}" data-delta="-1">−</button>
              <span class="qty-value-sm">${item.qty}</span>
              <button class="qty-btn-sm" data-id="${item.id}" data-color="${item.color || ''}" data-size="${item.size || ''}" data-delta="1">+</button>
            </div>
            <button class="btn-remove-item" data-id="${item.id}" data-color="${item.color || ''}" data-size="${item.size || ''}">🗑</button>
          </div>
        </div>`;
      fragment.appendChild(el);
    });

    cartItemsContainer.appendChild(fragment);

    // Bind qty buttons
    cartItemsContainer.querySelectorAll('.qty-btn-sm').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        updateCartItemQty(btn.dataset.id, btn.dataset.color, btn.dataset.size, parseInt(btn.dataset.delta));
      });
    });

    cartItemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        removeFromCart(btn.dataset.id, btn.dataset.color, btn.dataset.size);
      });
    });
  }

  function openCart() {
    renderCartItems();
    if (cartSidebar) cartSidebar.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ===== CHECKOUT =====
  function openCheckout() {
    if (cart.length === 0) { Utils.showToast('Adicione produtos ao carrinho!', 'warning'); return; }
    closeCart();

    // Determine delivery type based on what is enabled in Admin settings
    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const deliveryOn = d.deliveryEnabled !== false;
    const pickupOn   = d.pickupEnabled  !== false;

    // Set initial delivery type strictly respecting disabled settings
    if (deliveryOn) {
      deliveryType = 'delivery';
    } else if (pickupOn) {
      deliveryType = 'pickup';
    } else {
      deliveryType = 'pickup'; // fallback
    }

    updateDeliveryUI();
    renderPaymentOptions();

    if (checkoutModal) checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    if (checkoutModal) checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCheckoutSummary() {
    const s = DataStore.getSettings();
    const delivery = s.delivery || {};
    const subtotal = getCartTotal();
    const fee = deliveryType === 'delivery' && delivery.deliveryEnabled
      ? (subtotal >= (delivery.freeDeliveryThreshold || 999999) ? 0 : (delivery.deliveryFee || 0))
      : 0;
    const total = subtotal + fee;

    if (checkoutItemsEl) {
      checkoutItemsEl.innerHTML = cart.map(item => {
        const colorDot = item.colorHex ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.colorHex};margin-right:4px;vertical-align:middle;border:1px solid #ddd;"></span>` : '';
        const variant = [item.color ? `${colorDot}${item.color}` : '', item.size ? `Tam. ${item.size}` : ''].filter(Boolean).join(' · ');
        return `<div class="checkout-item">
          <div>
            <div class="checkout-item-name">${Utils.sanitize(item.name)} × ${item.qty}</div>
            ${variant ? `<div class="checkout-item-variant">${variant}</div>` : ''}
          </div>
          <span class="checkout-item-price">${Utils.formatCurrency(item.price * item.qty)}</span>
        </div>`;
      }).join('');
    }

    if (checkoutSubtotal) checkoutSubtotal.textContent = Utils.formatCurrency(subtotal);
    if (checkoutDeliveryFee) checkoutDeliveryFee.textContent = fee === 0 && deliveryType === 'delivery' ? 'Grátis 🎉' : Utils.formatCurrency(fee);
    if (checkoutDeliveryRow) checkoutDeliveryRow.style.display = deliveryType === 'delivery' ? '' : 'none';
    if (checkoutTotal) checkoutTotal.textContent = Utils.formatCurrency(total);

    // Pickup info
    const pickupBox = $('pickup-info-box');
    const deliveryGroup = $('group-delivery-address');
    const addrInput = $('customer-address');

    if (deliveryType === 'pickup') {
      if (pickupBox) pickupBox.classList.remove('hidden');
      if (deliveryGroup) deliveryGroup.classList.add('hidden');
      if (addrInput) addrInput.required = false;
      if ($('pickup-store-address')) $('pickup-store-address').textContent = delivery.pickupAddress || '';
      if ($('pickup-store-time')) $('pickup-store-time').textContent = `⏱️ ${delivery.pickupEstimate || ''}`;
    } else {
      if (pickupBox) pickupBox.classList.add('hidden');
      if (deliveryGroup) deliveryGroup.classList.remove('hidden');
      if (addrInput) addrInput.required = true;
    }

    // Delivery tab info
    if ($('tab-delivery-info')) $('tab-delivery-info').textContent = delivery.estimatedTime || 'A domicílio';
    if ($('tab-pickup-info')) $('tab-pickup-info').textContent = delivery.pickupEnabled ? 'Na loja' : 'Indisponível';
  }

  function renderPaymentOptions() {
    if (!paymentOptions || !settings) return;
    const methods = (settings.paymentMethods || []).filter(m => m.active);
    paymentOptions.innerHTML = methods.map(m => `
      <label class="payment-option" for="pay-${m.id}">
        <input type="radio" name="payment" id="pay-${m.id}" value="${m.id}">
        <span class="pay-icon">${m.icon}</span>
        <span class="pay-label">${m.name}</span>
      </label>`).join('');

    paymentOptions.querySelectorAll('input[type=radio]').forEach(inp => {
      inp.addEventListener('change', () => {
        $$('.payment-option').forEach(o => o.classList.remove('selected'));
        inp.closest('.payment-option').classList.add('selected');
        selectedPayment = inp.value;
        handlePaymentSelect(inp.value);
      });
    });
  }

  function handlePaymentSelect(method) {
    const pixBox = $('pix-checkout-box');
    const cashBox = $('cash-change-box');

    if (pixBox) pixBox.classList.add('hidden');
    if (cashBox) cashBox.classList.add('hidden');

    if (method === 'pix' && pixBox && settings.pixDetails) {
      const pix = settings.pixDetails;
      if ($('pix-key-val')) $('pix-key-val').value = pix.key || '';
      if ($('pix-key-type')) $('pix-key-type').textContent = pix.keyType || '';
      if ($('pix-receiver-name')) $('pix-receiver-name').textContent = pix.receiverName || '';
      if ($('pix-instructions-text')) $('pix-instructions-text').textContent = pix.instructions || '';
      pixBox.classList.remove('hidden');
    }

    if (method === 'dinheiro' && cashBox) {
      cashBox.classList.remove('hidden');
    }
  }

  function updateDeliveryUI() {
    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const deliveryOn = d.deliveryEnabled !== false;
    const pickupOn   = d.pickupEnabled  !== false;

    // Strict guard: if delivery is disabled, force pickup!
    if (!deliveryOn && deliveryType === 'delivery') {
      deliveryType = 'pickup';
    } else if (!pickupOn && deliveryType === 'pickup' && deliveryOn) {
      deliveryType = 'delivery';
    }

    const tabD = $('tab-delivery');
    const tabP = $('tab-pickup');
    if (tabD) {
      tabD.style.display = deliveryOn ? '' : 'none';
      tabD.classList.toggle('active', deliveryType === 'delivery');
    }
    if (tabP) {
      tabP.style.display = pickupOn ? '' : 'none';
      tabP.classList.toggle('active', deliveryType === 'pickup');
    }

    const tabsContainer = document.querySelector('.delivery-tabs-container');
    if (tabsContainer) {
      if (!deliveryOn && !pickupOn) {
        tabsContainer.style.display = 'none';
      } else {
        tabsContainer.style.display = '';
        const titleLabel = tabsContainer.querySelector('label');
        if (titleLabel) {
          if (!deliveryOn && pickupOn) titleLabel.textContent = 'Modalidade: Retirada no Local';
          else if (deliveryOn && !pickupOn) titleLabel.textContent = 'Modalidade: Entrega a Domicílio';
          else titleLabel.textContent = 'Como deseja receber seu pedido?';
        }
      }
    }

    renderCheckoutSummary();
  }

  // ===== WHATSAPP ORDER =====
  function buildWhatsAppMessage(customerData) {
    const s = DataStore.getSettings();
    const delivery = s.delivery || {};
    const subtotal = getCartTotal();
    const fee = deliveryType === 'delivery' && delivery.deliveryEnabled
      ? (subtotal >= (delivery.freeDeliveryThreshold || 999999) ? 0 : (delivery.deliveryFee || 0))
      : 0;
    const total = subtotal + fee;

    let msg = `🛍️ *NOVO PEDIDO — ${s.storeName}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *Cliente:* ${customerData.name}\n`;
    msg += `📞 *Telefone:* ${customerData.phone}\n`;
    msg += `\n📦 *ITENS DO PEDIDO:*\n`;

    cart.forEach(item => {
      msg += `▸ ${item.name}`;
      if (item.color) msg += `\n   Cor: ${item.color}`;
      if (item.size) msg += ` | Tam: ${item.size}`;
      msg += `\n   Qtd: ${item.qty} × ${Utils.formatCurrency(item.price)} = *${Utils.formatCurrency(item.price * item.qty)}*\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *Subtotal:* ${Utils.formatCurrency(subtotal)}\n`;

    if (deliveryType === 'delivery') {
      msg += `🚚 *Tipo:* Entrega\n`;
      msg += `📍 *Endereço:* ${customerData.address}\n`;
      msg += `🚀 *Frete:* ${fee === 0 ? 'Grátis 🎉' : Utils.formatCurrency(fee)}\n`;
    } else {
      msg += `🏬 *Tipo:* Retirada na Loja\n`;
    }

    msg += `💳 *Pagamento:* ${customerData.payment}\n`;
    if (customerData.troco) msg += `💵 *Troco para:* ${customerData.troco}\n`;
    msg += `\n💵 *TOTAL: ${Utils.formatCurrency(total)}*\n`;

    if (customerData.obs) {
      msg += `\n📝 *Observações:* ${customerData.obs}\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `✅ Pedido gerado pelo site ${s.storeName}`;

    return msg;
  }

  async function submitOrder(e) {
    e.preventDefault();

    const name = $('customer-name') ? $('customer-name').value.trim() : '';
    const phone = $('customer-phone') ? $('customer-phone').value.trim() : '';
    const address = deliveryType === 'delivery' ? ($('customer-address') ? $('customer-address').value.trim() : '') : '';
    const obs = $('customer-obs') ? $('customer-obs').value.trim() : '';
    const troco = $('customer-troco') ? $('customer-troco').value.trim() : '';

    if (!name || !phone) {
      Utils.showToast('Preencha seu nome e telefone!', 'error');
      return;
    }

    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const deliveryOn = d.deliveryEnabled !== false;

    if (deliveryType === 'delivery' && deliveryOn && !address) {
      Utils.showToast('Informe seu endereço de entrega!', 'error');
      return;
    }

    if (!selectedPayment) {
      Utils.showToast('Selecione uma forma de pagamento!', 'error');
      return;
    }

    // Validate stock for all items
    for (const item of cart) {
      if (item.color && item.size) {
        const available = DataStore.getVariantStock(item.id, item.color, item.size);
        if (available < item.qty) {
          Utils.showToast(`Estoque insuficiente para "${item.name} (${item.color} - ${item.size})". Disponível: ${available} un.`, 'error');
          return;
        }
      }
    }

    const delivery = d;
    const subtotal = getCartTotal();
    const fee = deliveryType === 'delivery' && delivery.deliveryEnabled
      ? (subtotal >= (delivery.freeDeliveryThreshold || 999999) ? 0 : (delivery.deliveryFee || 0))
      : 0;
    const total = subtotal + fee;

    const payLabel = (s.paymentMethods || []).find(m => m.id === selectedPayment)?.name || selectedPayment;

    const customerData = { name, phone, address, obs, troco, payment: payLabel };

    // Deduct stock for each variant in DB
    for (const item of cart) {
      if (item.color && item.size) {
        try {
          await DataStore.decrementStock(item.id, item.color, item.size, item.qty);
        } catch (stockErr) {
          console.warn('[Store] Erro ao debitar estoque:', stockErr);
        }
      }
    }

    // Save order to DB
    try {
      await DataStore.saveOrder({
        customer: { name, phone, address, obs },
        deliveryType,
        deliveryFee: fee,
        items: cart.map(i => ({ ...i })),
        subtotal,
        total,
        paymentMethod: selectedPayment,
        status: 'novo'
      });
    } catch (err) {
      console.warn('[Store] Erro ao salvar pedido:', err);
    }

    // Build WhatsApp URL
    const msg = buildWhatsAppMessage(customerData);
    const waNumber = s.whatsappNumber || '';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

    // Re-render products to show updated stock counts immediately
    renderProducts();

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckout();

    Utils.showToast('Redirecionando para o WhatsApp...', 'success');
    setTimeout(() => window.open(waUrl, '_blank'), 500);
  }

  // ===== EVENTS =====
  function bindEvents() {
    // Cart open
    if (btnOpenCart) btnOpenCart.addEventListener('click', openCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
    if (btnCheckout) btnCheckout.addEventListener('click', openCheckout);

    // Mobile cart
    if (btnMobileCheckout) btnMobileCheckout.addEventListener('click', openCheckout);
    if (mobileCartInfo) mobileCartInfo.addEventListener('click', openCart);
    if (mobileCartInfo) mobileCartInfo.addEventListener('keydown', e => { if (e.key === 'Enter') openCart(); });

    // Checkout
    if (btnCloseCheckout) btnCloseCheckout.addEventListener('click', closeCheckout);
    if (checkoutForm) checkoutForm.addEventListener('submit', submitOrder);

    // Checkout overlay (click outside)
    if (checkoutModal) checkoutModal.addEventListener('click', e => {
      if (e.target === checkoutModal) closeCheckout();
    });

    // Delivery tabs
    const tabDelivery = $('tab-delivery');
    const tabPickup   = $('tab-pickup');
    if (tabDelivery) {
      tabDelivery.addEventListener('click', () => {
        const s = DataStore.getSettings();
        if ((s.delivery || {}).deliveryEnabled !== false) {
          deliveryType = 'delivery';
          updateDeliveryUI();
        }
      });
    }
    if (tabPickup) {
      tabPickup.addEventListener('click', () => {
        const s = DataStore.getSettings();
        if ((s.delivery || {}).pickupEnabled !== false) {
          deliveryType = 'pickup';
          updateDeliveryUI();
        }
      });
    }

    // Copy Pix
    const btnCopyPix = $('btn-copy-pix');
    if (btnCopyPix) {
      btnCopyPix.addEventListener('click', () => {
        const key = $('pix-key-val');
        if (key && key.value) {
          navigator.clipboard.writeText(key.value).then(() => {
            Utils.showToast('Chave Pix copiada!', 'success');
            btnCopyPix.textContent = '✓ Copiado!';
            setTimeout(() => { btnCopyPix.textContent = 'Copiar Chave'; }, 2000);
          });
        }
      });
    }

    // Product modal close
    if (productDetailsModal) {
      productDetailsModal.addEventListener('click', e => { if (e.target === productDetailsModal) closeProductModal(); });
    }
    if ($('btn-close-product-modal')) $('btn-close-product-modal').addEventListener('click', closeProductModal);

    // Modal qty
    if (btnModalQtyMinus) {
      btnModalQtyMinus.addEventListener('click', () => {
        if (modalQty > 1) {
          modalQty--;
          if (modalProductQty) modalProductQty.textContent = modalQty;
          if (btnModalQtyPlus) btnModalQtyPlus.disabled = false;
        }
        btnModalQtyMinus.disabled = modalQty <= 1;
      });
    }

    if (btnModalQtyPlus) {
      btnModalQtyPlus.addEventListener('click', () => {
        if (!currentProduct) return;
        const maxQty = (currentProduct.variants || []).length > 0 && modalSelectedColor && modalSelectedSizeVal
          ? DataStore.getVariantStock(currentProduct.id, modalSelectedColor, modalSelectedSizeVal)
          : 99;
        if (modalQty < maxQty) {
          modalQty++;
          if (modalProductQty) modalProductQty.textContent = modalQty;
        }
        btnModalQtyPlus.disabled = modalQty >= maxQty;
        if (btnModalQtyMinus) btnModalQtyMinus.disabled = false;
      });
    }

    // Add to cart from modal
    if (btnModalAddCart) {
      btnModalAddCart.addEventListener('click', () => {
        if (!currentProduct) return;
        const hasVariants = (currentProduct.variants || []).length > 0;

        if (hasVariants && (!modalSelectedColor || !modalSelectedSizeVal)) {
          Utils.showToast('Selecione a cor e o tamanho!', 'warning');
          return;
        }

        const variant = hasVariants
          ? (currentProduct.variants || []).find(v => v.color === modalSelectedColor)
          : null;
        const colorHex = variant ? variant.colorHex : '';

        const added = addToCart(currentProduct, modalSelectedColor, colorHex, modalSelectedSizeVal, modalQty);
        if (added) {
          closeProductModal();
          openCart();
        }
      });
    }

    // Keyboard ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeProductModal();
        closeCheckout();
        closeCart();
      }
    });

    // High-performance RAF scroll handler (navbar + GPU accelerated parallax)
    let isScrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!isScrollTicking) {
        window.requestAnimationFrame(() => {
          const sy = window.scrollY;
          if (navbar) navbar.classList.toggle('scrolled', sy > 40);
          if (heroBg && sy < 800) {
            heroBg.style.transform = `translate3d(0, ${(sy * 0.35).toFixed(1)}px, 0)`;
          }
          isScrollTicking = false;
        });
        isScrollTicking = true;
      }
    }, { passive: true });
  }

  // ===== START =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
