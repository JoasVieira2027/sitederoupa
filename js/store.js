/**
 * store.js - Fit Vibe Activewear
 * E-commerce moderno de alta performance para moda fitness feminina.
 * Sem emojis, com Lucide Icons / SVG, navegação por categorias, compra por cor,
 * monte seu look, carrinho lateral e checkout via WhatsApp.
 */

(function () {
  'use strict';

  // ===== REFS DOM =====
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // Branding & Announcement
  const siteTitle = $('site-title');
  const navbarLogoIcon = $('navbar-logo-icon');
  const navbarBrandName = $('navbar-brand-name');
  const navbarBrandTagline = $('navbar-brand-tagline');
  const announcementBar = $('announcement-bar');
  const announcementText = $('announcement-text');

  // Hero
  const heroBg = $('hero-bg');
  const heroTitle = $('hero-title');
  const heroSubtitle = $('hero-subtitle');
  const heroCta = $('hero-cta');
  const heroBadgeText = $('hero-badge-text');
  const heroWhatsappBtn = $('hero-whatsapp-btn');

  // Header & Status
  const navbar = $('navbar');
  const storeStatus = $('store-status');
  const storeStatusText = $('store-status-text');
  const cartCountEl = $('cart-count');
  const btnOpenCart = $('btn-open-cart');
  const navbarWhatsappBtn = $('navbar-whatsapp-btn');
  const btnMobileMenu = $('btn-mobile-menu');

  // Mobile Drawer
  const mobileDrawer = $('mobile-drawer');
  const mobileDrawerOverlay = $('mobile-drawer-overlay');
  const btnCloseDrawer = $('btn-close-drawer');
  const drawerWhatsappBtn = $('drawer-whatsapp-btn');

  // Closed Banner
  const closedBanner = $('store-closed-banner');
  const closedMessage = $('store-closed-message');

  // Catalog & Filters
  const categoriesFilter = $('categories-filter');
  const productsGrid = $('products-grid');
  const emptyProducts = $('empty-products');
  const productsSectionTitle = $('products-section-title');
  const productsSectionSubtitle = $('products-section-subtitle');
  const activeFilterChips = $('active-filter-chips');
  const filterChipLabel = $('filter-chip-label');
  const btnClearActiveFilter = $('btn-clear-active-filter');
  const quickSearchInput = $('quick-search-input');
  const mobileSearchInput = $('mobile-search-input');
  const btnClearSearch = $('btn-clear-search');

  // Color Shop
  const colorShopPalette = $('color-shop-palette');
  const colorShopClearWrap = $('color-shop-clear-wrap');

  // Featured Collection
  const featuredSection = $('featured-section');
  const featuredGrid = $('featured-grid');
  const featuredTitle = $('featured-title');
  const featuredSubtitle = $('featured-subtitle');

  // About Section
  const aboutSection = $('about-section');
  const aboutTagline = $('about-tagline');
  const aboutTitle = $('about-title');
  const aboutText = $('about-text');
  const aboutFeatures = $('about-features');

  // Instagram
  const instagramSection = $('instagram-section');
  const instagramGrid = $('instagram-grid');
  const instagramTitle = $('instagram-title');
  const instagramSubtitle = $('instagram-subtitle');
  const btnInstagramProfile = $('btn-instagram-profile');

  // Cart
  const cartOverlay = $('cart-overlay');
  const cartSidebar = $('cart-sidebar');
  const cartItemsContainer = $('cart-items');
  const cartEmpty = $('cart-empty');
  const cartFooter = $('cart-footer');
  const cartTotalEl = $('cart-total');
  const btnCloseCart = $('btn-close-cart');
  const btnCheckout = $('btn-checkout');
  const cartShippingBanner = $('cart-shipping-banner');
  const cartShippingFill = $('shipping-progress-fill');
  const cartShippingText = $('shipping-progress-text');

  // Mobile Bar
  const mobileCartBar = $('mobile-cart-bar');
  const mobileCartInfo = $('mobile-cart-info');
  const mobileCartBadge = $('mobile-cart-badge');
  const mobileCartCount = $('mobile-cart-count');
  const mobileCartTotal = $('mobile-cart-total');
  const btnMobileCheckout = $('btn-mobile-checkout');

  // Checkout Modal
  const checkoutModal = $('checkout-modal');
  const checkoutItemsEl = $('checkout-items');
  const checkoutSubtotal = $('checkout-subtotal');
  const checkoutDeliveryFee = $('checkout-delivery-fee');
  const checkoutDeliveryRow = $('checkout-delivery-row');
  const checkoutTotal = $('checkout-total');
  const checkoutForm = $('checkout-form');
  const btnCloseCheckout = $('btn-close-checkout');
  const paymentOptions = $('payment-options');

  // Product Details Modal
  const productDetailsModal = $('product-details-modal');
  const modalProductName = $('modal-product-name');
  const modalProductCategory = $('modal-product-category');
  const modalProductBadge = $('modal-product-badge');
  const modalProductImage = $('modal-product-image');
  const modalProductPlaceholder = $('modal-product-placeholder');
  const modalProductPrice = $('modal-product-price');
  const modalProductOriginalPrice = $('modal-product-original-price');
  const modalProductDiscount = $('modal-product-discount');
  const modalProductInstallments = $('modal-product-installments');
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
  let cart = []; // [{id, name, price, originalPrice, color, colorHex, size, qty, image, category}]
  let currentCategory = 'all';
  let currentColorFilter = null;
  let searchQuery = '';
  let currentProduct = null;
  let modalSelectedColor = null;
  let modalSelectedSizeVal = null;
  let modalQty = 1;
  let settings = null;
  let deliveryType = 'delivery'; // 'delivery' | 'pickup'
  let selectedPayment = null;

  // Icon mapping for clean Lucide icons per category
  const CATEGORY_ICON_MAP = {
    'all': 'layers',
    'conjuntos': 'sparkles',
    'leggings': 'activity',
    'tops & croppeds': 'shield',
    'tops': 'shield',
    'shorts & bermudas': 'scissors',
    'shorts': 'scissors',
    'macacões': 'sparkles',
    'acessórios': 'package'
  };

  // Helper to re-render Lucide icons safely
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // ===== INIT =====
  async function init() {
    try {
      await DataStore.init({ enableRealtime: true, isAdmin: false });
    } catch (err) {
      console.warn('[Store] DataStore init fallback:', err);
    }
    settings = DataStore.getSettings();

    applyBranding();
    applyStoreStatus();
    renderAnnouncementBar();
    renderCategories();
    renderFeaturedCollection();
    renderProducts();
    renderAbout();
    renderInstagramFeed();
    renderFooter();
    bindEvents();
    initHeroParallax();
    loadCart();
    updateCartUI();
    refreshIcons();

    // Listen to real-time sync events from Supabase / Admin changes
    document.addEventListener('settings-updated', () => {
      settings = DataStore.getSettings();
      applyBranding();
      applyStoreStatus();
      renderAnnouncementBar();
      renderFeaturedCollection();
      renderAbout();
      renderInstagramFeed();
      renderFooter();
      renderProducts();
      updateCartUI();
      refreshIcons();
    });

    document.addEventListener('categories-updated', () => {
      renderCategories();
      refreshIcons();
    });

    document.addEventListener('products-updated', () => {
      renderFeaturedCollection();
      renderProducts();
      renderCategories();
      refreshIcons();
    });
  }

  // ===== BRANDING & ANNOUNCEMENT =====
  function applyBranding() {
    if (!settings) return;

    const brandTitle = `${settings.storeName || 'Fit Vibe Activewear'} | ${settings.storeTagline || 'Roupas Fitness de Alta Performance'}`;
    document.title = brandTitle;
    if (siteTitle) siteTitle.textContent = brandTitle;

    if (navbarBrandName) navbarBrandName.textContent = settings.storeName ? settings.storeName.toUpperCase() : 'FIT VIBE';
    if (navbarBrandTagline) navbarBrandTagline.textContent = settings.storeTagline ? settings.storeTagline.toUpperCase() : 'ACTIVEWEAR';

    // Theme color override
    if (settings.themeColor) {
      document.documentElement.style.setProperty('--primary', settings.themeColor);
    }

    // Logo image if configured in admin
    const logoSrc = settings.storeLogoImage;
    if (logoSrc && navbarLogoIcon) {
      navbarLogoIcon.innerHTML = `<img src="${logoSrc}" alt="${settings.storeName}" class="logo-img" onerror="this.style.display='none'">`;
    }

    // Hero content from settings
    if (settings.hero) {
      if (settings.hero.title && heroTitle) heroTitle.innerHTML = settings.hero.title;
      if (settings.hero.subtitle && heroSubtitle) heroSubtitle.textContent = settings.hero.subtitle;
      if (settings.hero.badgeText && heroBadgeText) heroBadgeText.textContent = settings.hero.badgeText;
      if (settings.hero.ctaText && heroCta) {
        heroCta.querySelector('span') && (heroCta.querySelector('span').textContent = settings.hero.ctaText);
      }
      if (settings.hero.image && heroBg) {
        heroBg.style.backgroundImage = `url('${settings.hero.image}')`;
      }
    }

    // WhatsApp links
    const wa = settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de tirar dúvidas sobre as peças da Fit Vibe.')}` : '#';
    if (heroWhatsappBtn) heroWhatsappBtn.href = wa;
    if (navbarWhatsappBtn) navbarWhatsappBtn.href = wa;
    if (drawerWhatsappBtn) drawerWhatsappBtn.href = wa;
    if (footerWhatsapp) footerWhatsapp.href = wa;
  }

  function renderAnnouncementBar() {
    if (!announcementBar || !settings) return;
    const ann = settings.announcementBar || {};
    const isActive = ann.active !== false && ann.active !== 'false';

    if (!isActive) {
      announcementBar.style.display = 'none';
      return;
    }

    announcementBar.style.display = '';
    if (announcementText && ann.text) {
      // Remove any leftover emojis from text
      const cleanText = ann.text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      announcementText.textContent = cleanText;
    }
  }

  // ===== STORE STATUS =====
  function applyStoreStatus() {
    if (!settings) return;
    const open = DataStore.isStoreOpen();

    if (storeStatus) {
      storeStatus.className = 'navbar-status' + (open ? '' : ' closed');
    }
    if (storeStatusText) storeStatusText.textContent = open ? 'Loja Aberta' : 'Loja Fechada';

    if (!open && closedBanner) {
      if (closedMessage) closedMessage.textContent = settings.closedCustomMessage || 'Estamos fora do horário de atendimento. Deixe sua mensagem no WhatsApp que responderemos assim que abrirmos!';
      closedBanner.classList.remove('hidden');
    } else if (closedBanner) {
      closedBanner.classList.add('hidden');
    }

    if (!open) {
      if (btnCheckout) {
        btnCheckout.disabled = true;
        btnCheckout.innerHTML = '<span>Loja Fechada</span>';
      }
      if (btnMobileCheckout) {
        btnMobileCheckout.disabled = true;
        btnMobileCheckout.innerHTML = '<span>Loja Fechada</span>';
      }
    } else {
      if (btnCheckout) {
        btnCheckout.disabled = false;
        btnCheckout.innerHTML = '<span>Finalizar Pedido</span><i data-lucide="arrow-right"></i>';
      }
      if (btnMobileCheckout) {
        btnMobileCheckout.disabled = false;
        btnMobileCheckout.innerHTML = '<span>Finalizar Pedido</span><i data-lucide="arrow-right"></i>';
      }
    }
  }

  // ===== HERO PARALLAX / ZOOM EFFECT =====
  function initHeroParallax() {
    if (!heroBg) return;

    // Respect user's accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (scrollY < 900) {
            // Subtle, elegant zoom and slight vertical depth
            const scale = 1 + scrollY * 0.00025;
            const translateY = scrollY * 0.12;
            heroBg.style.transform = `scale(${scale}) translateY(${translateY}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ===== CATEGORIES =====
  function renderCategories() {
    if (!categoriesFilter) return;
    const categories = DataStore.getCategories();

    let html = `
      <button type="button" class="category-btn ${currentCategory === 'all' ? 'active' : ''}" data-cat="all" id="cat-btn-all" onclick="window.StoreApp?.selectCategory('all')">
        <i data-lucide="layers" class="cat-icon-svg"></i>
        <span>Todas as Peças</span>
      </button>
    `;

    categories.forEach(cat => {
      const isSel = currentCategory.trim().toLowerCase() === cat.name.trim().toLowerCase();
      const safeCatName = Utils.sanitize(cat.name);
      const iconKey = cat.name.trim().toLowerCase();
      const lucideIcon = CATEGORY_ICON_MAP[iconKey] || 'tag';

      html += `
        <button type="button" class="category-btn ${isSel ? 'active' : ''}" data-cat="${safeCatName}" id="cat-btn-${cat.id}" onclick="window.StoreApp?.selectCategory('${safeCatName.replace(/'/g, "\\'")}')">
          <i data-lucide="${lucideIcon}" class="cat-icon-svg"></i>
          <span>${safeCatName}</span>
        </button>
      `;
    });

    categoriesFilter.innerHTML = html;
    refreshIcons();
  }

  // ===== SELECT CATEGORY =====
  function selectCategory(catName) {
    currentCategory = catName || 'all';

    // Update active state on category buttons
    $$('.category-btn').forEach(btn => {
      const btnCat = btn.dataset.cat || 'all';
      if (btnCat.trim().toLowerCase() === currentCategory.trim().toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Clear color filter when switching categories to avoid confusion
    if (currentColorFilter) {
      clearColorFilter(false);
    }

    renderProducts();

    // Smooth scroll down to products section
    const prodSection = $('products');
    if (prodSection) {
      prodSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ===== FILTER BY COLOR =====
  function filterByColor(colorName) {
    currentColorFilter = colorName;

    // Update active state on color buttons in palette
    if (colorShopPalette) {
      colorShopPalette.querySelectorAll('.color-shop-btn').forEach(btn => {
        if (btn.dataset.color && btn.dataset.color.toLowerCase() === colorName.toLowerCase()) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    if (colorShopClearWrap) {
      colorShopClearWrap.classList.remove('hidden');
    }

    renderProducts();

    // Scroll to products
    const prodSection = $('products');
    if (prodSection) {
      prodSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function clearColorFilter(shouldRerender = true) {
    currentColorFilter = null;

    if (colorShopPalette) {
      colorShopPalette.querySelectorAll('.color-shop-btn').forEach(btn => btn.classList.remove('active'));
    }

    if (colorShopClearWrap) {
      colorShopClearWrap.classList.add('hidden');
    }

    if (shouldRerender) {
      renderProducts();
    }
  }

  // ===== PRODUCTS CATALOG RENDERING =====
  function renderProducts() {
    if (!productsGrid) return;

    // 1. Load active products from DataStore with robust fallback
    let products = DataStore.getProducts();
    if (!products || !products.length) {
      // Automatic fallback so catalog never breaks on initial render
      const local = DataStore.getProducts({ includeInactive: true });
      products = local.length ? local.filter(p => p.active) : [];
    }

    // 2. Control visibility of Featured Collection
    if (featuredSection) {
      const fc = (settings && settings.featuredCollection) || {};
      const isFcActive = fc.active !== false && fc.active !== 'false';
      if (currentCategory !== 'all' || currentColorFilter || searchQuery || !isFcActive) {
        featuredSection.classList.add('hidden');
        featuredSection.style.display = 'none';
      } else {
        featuredSection.classList.remove('hidden');
        featuredSection.style.display = '';
      }
    }

    // 3. Apply category filter
    if (currentCategory !== 'all') {
      products = products.filter(p => {
        if (!p.category) return false;
        const catA = p.category.trim().toLowerCase();
        const catB = currentCategory.trim().toLowerCase();
        return catA === catB || catA.includes(catB) || catB.includes(catA);
      });
    }

    // 4. Apply color filter (Shop by Color)
    if (currentColorFilter) {
      products = products.filter(p => {
        if (!p.variants || !p.variants.length) return false;
        return p.variants.some(v => v.color && v.color.toLowerCase().includes(currentColorFilter.toLowerCase()));
      });
    }

    // 5. Apply live search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const catMatch = p.category && p.category.toLowerCase().includes(q);
        const descMatch = p.description && p.description.toLowerCase().includes(q);
        return nameMatch || catMatch || descMatch;
      });
    }

    // 6. Update Section Header dynamically
    if (productsSectionTitle) {
      if (searchQuery) {
        productsSectionTitle.textContent = `Resultados para "${searchQuery}"`;
      } else if (currentColorFilter) {
        productsSectionTitle.textContent = `Peças na Cor: ${currentColorFilter}`;
      } else if (currentCategory !== 'all') {
        productsSectionTitle.textContent = currentCategory;
      } else {
        productsSectionTitle.textContent = 'Todas as Peças';
      }
    }

    if (productsSectionSubtitle) {
      if (products.length > 0) {
        productsSectionSubtitle.textContent = `Exibindo ${products.length} ${products.length === 1 ? 'peça de alta performance' : 'peças de alta performance'}`;
      } else {
        productsSectionSubtitle.textContent = 'Explore outras categorias ou limpe os filtros para ver mais peças';
      }
    }

    // Update active filter chip indicator
    if (activeFilterChips && filterChipLabel) {
      if (currentCategory !== 'all' || currentColorFilter || searchQuery) {
        activeFilterChips.classList.remove('hidden');
        const labels = [];
        if (currentCategory !== 'all') labels.push(`Categoria: ${currentCategory}`);
        if (currentColorFilter) labels.push(`Cor: ${currentColorFilter}`);
        if (searchQuery) labels.push(`Busca: "${searchQuery}"`);
        filterChipLabel.textContent = labels.join(' • ');
      } else {
        activeFilterChips.classList.add('hidden');
      }
    }

    // 7. Handle Empty State
    if (!products.length) {
      productsGrid.innerHTML = '';
      if (emptyProducts) {
        emptyProducts.classList.remove('hidden');
        const emptyTitle = $('empty-state-title');
        const emptyDesc = $('empty-state-desc');
        if (emptyTitle) {
          if (searchQuery) {
            emptyTitle.textContent = `Nenhum produto encontrado para "${searchQuery}"`;
          } else if (currentColorFilter) {
            emptyTitle.textContent = `Nenhuma peça na cor "${currentColorFilter}" no momento`;
          } else if (currentCategory !== 'all') {
            emptyTitle.textContent = `Nenhuma peça na categoria "${currentCategory}" no momento`;
          } else {
            emptyTitle.textContent = 'Nenhum produto cadastrado no catálogo';
          }
        }
        if (emptyDesc) {
          emptyDesc.textContent = 'Novidades exclusivas da coleção fitness chegando em breve! Confira todas as nossas peças disponíveis.';
        }
      }
      refreshIcons();
      return;
    }

    if (emptyProducts) {
      emptyProducts.classList.add('hidden');
    }

    // 8. Render Product Cards
    productsGrid.innerHTML = products.map((p, i) => renderProductCard(p, i)).join('');
    refreshIcons();

    // 9. Bind Card Click & Quick Selection
    productsGrid.querySelectorAll('.product-card').forEach(card => {
      const id = card.dataset.id;

      // Click on card body opens details modal
      card.addEventListener('click', e => {
        if (e.target.closest('.btn-add-cart') || e.target.closest('.color-swatch-mini')) return;
        openProductModal(id);
      });

      // Quick hover/click on color swatches
      card.querySelectorAll('.color-swatch-mini').forEach(swatch => {
        swatch.addEventListener('click', e => {
          e.stopPropagation();
          const color = swatch.dataset.color;
          openProductModal(id, color);
        });

        swatch.addEventListener('mouseenter', () => {
          const img = swatch.dataset.image;
          const cardImg = card.querySelector('.product-card-image-wrapper img');
          if (cardImg && img) {
            cardImg.dataset.origSrc = cardImg.dataset.origSrc || cardImg.src;
            cardImg.src = img;
          }
        });

        swatch.addEventListener('mouseleave', () => {
          const cardImg = card.querySelector('.product-card-image-wrapper img');
          if (cardImg && cardImg.dataset.origSrc) {
            cardImg.src = cardImg.dataset.origSrc;
          }
        });
      });
    });

    // Add to cart buttons
    productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openProductModal(id);
      });
    });
  }

  // ===== PRODUCT CARD TEMPLATE (SEM EMOJIS) =====
  function renderProductCard(p, index) {
    const finalPrice = Utils.calcDiscountedPrice(p.price, p.promotion);
    const hasPromo = p.promotion && p.promotion.active && p.promotion.discountPercent > 0;
    const totalStock = DataStore.getProductTotalStock(p.id);
    const isClosed = !DataStore.isStoreOpen();
    const isOut = !p.inStock || totalStock === 0;

    // Calculate installment in 3x
    const installmentVal = finalPrice / 3;

    // Main image
    const imageHtml = p.image
      ? `<img src="${Utils.sanitize(p.image)}" alt="${Utils.sanitize(p.name)}" loading="lazy">`
      : `<div class="product-no-image"><i data-lucide="sparkles"></i><span>${Utils.sanitize(p.category || 'Activewear')}</span></div>`;

    // Badges (clean SVG / text)
    let badgeHtml = '';
    if (isOut) {
      badgeHtml = `<span class="product-badge badge-esgotado">Esgotado</span>`;
    } else if (hasPromo) {
      badgeHtml = `<span class="product-badge badge-promo">-${p.promotion.discountPercent}% OFF</span>`;
    } else if (p.badge) {
      badgeHtml = `<span class="product-badge badge-custom">${Utils.sanitize(p.badge)}</span>`;
    }

    // Color Swatches
    const colors = (p.variants || []).slice(0, 5);
    const colorSwatches = colors.map(v =>
      `<span class="color-swatch-mini" style="background:${v.colorHex || '#333'}" title="${Utils.sanitize(v.color)}" data-color="${Utils.sanitize(v.color)}" data-image="${Utils.sanitize(v.image || '')}"></span>`
    ).join('');

    // Stock Status
    let stockHtml = '';
    if (isOut) {
      stockHtml = `<span class="stock-status out"><span class="stock-dot"></span> Esgotado</span>`;
    } else if (totalStock <= 4) {
      stockHtml = `<span class="stock-status low"><span class="stock-dot"></span> Últimas ${totalStock} unidades</span>`;
    } else {
      stockHtml = `<span class="stock-status ok"><span class="stock-dot"></span> Em estoque</span>`;
    }

    // Price block with 3x installments
    let priceHtml = '';
    if (hasPromo) {
      priceHtml = `
        <div class="product-price-block">
          <span class="product-price">${Utils.formatCurrency(finalPrice)}</span>
          <span class="product-price-original">${Utils.formatCurrency(p.price)}</span>
        </div>
      `;
    } else {
      priceHtml = `
        <div class="product-price-block">
          <span class="product-price">${Utils.formatCurrency(p.price)}</span>
        </div>
      `;
    }

    return `
      <article class="product-card ${isOut ? 'out-of-stock' : ''}" data-id="${p.id}" style="animation-delay:${index * 50}ms">
        <div class="product-card-image-wrapper">
          ${imageHtml}
          ${badgeHtml}
          ${colorSwatches ? `<div class="product-colors-preview">${colorSwatches}</div>` : ''}
          <div class="product-card-quick-view">
            <i data-lucide="eye"></i>
            <span>Ver Opções</span>
          </div>
        </div>

        <div class="product-card-body">
          <div class="product-card-meta">
            <span class="product-card-category">${Utils.sanitize(p.category || 'Fitness')}</span>
            ${stockHtml}
          </div>

          <h3 class="product-card-name" title="${Utils.sanitize(p.name)}">${Utils.sanitize(p.name)}</h3>

          <div class="product-card-pricing">
            ${priceHtml}
            <span class="product-card-installment">3x de ${Utils.formatCurrency(installmentVal)} sem juros</span>
          </div>

          <div class="product-card-footer">
            <button type="button" class="btn-add-cart" data-id="${p.id}" ${(isOut || isClosed) ? 'disabled' : ''} aria-label="Adicionar ${Utils.sanitize(p.name)} ao carrinho">
              <i data-lucide="shopping-bag"></i>
              <span>${isClosed ? 'Loja Fechada' : (isOut ? 'Esgotado' : 'Adicionar')}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // ===== FEATURED / NOVA COLEÇÃO SECTION =====
  function renderFeaturedCollection() {
    if (!featuredSection || !featuredGrid) return;

    const s = DataStore.getSettings();
    const fc = s.featuredCollection || {};
    const isFcActive = fc.active !== false && fc.active !== 'false';

    if (!isFcActive) {
      featuredSection.classList.add('hidden');
      featuredSection.style.display = 'none';
      return;
    }

    const featuredProducts = DataStore.getFeaturedProducts();
    if (!featuredProducts || !featuredProducts.length) {
      featuredSection.classList.add('hidden');
      featuredSection.style.display = 'none';
      return;
    }

    featuredSection.classList.remove('hidden');
    featuredSection.style.display = '';

    if (featuredTitle && fc.title) featuredTitle.textContent = fc.title;
    if (featuredSubtitle && fc.subtitle) featuredSubtitle.textContent = fc.subtitle;

    featuredGrid.innerHTML = featuredProducts.map((p, i) => renderProductCard(p, i)).join('');
    refreshIcons();

    // Bind card clicks in featured grid
    featuredGrid.querySelectorAll('.product-card').forEach(card => {
      const id = card.dataset.id;
      card.addEventListener('click', e => {
        if (e.target.closest('.btn-add-cart') || e.target.closest('.color-swatch-mini')) return;
        openProductModal(id);
      });
      card.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          openProductModal(id);
        });
      });
    });
  }

  // ===== COMPLETE LOOKS ("Monte seu Look") =====
  let lookQueue = []; // Queue of product IDs to add as a look
  let lookName = '';

  function addLookToCart(lookId) {
    if (!DataStore.isStoreOpen()) {
      Utils.showToast('A loja está fechada no momento.', 'error');
      return;
    }

    let prodId1 = '';
    let prodId2 = '';

    if (lookId === 'look_sculpt') {
      prodId1 = 'prod_top_cross';
      prodId2 = 'prod_legging_sculpt';
      lookName = 'Look Sculpt Power';
    } else if (lookId === 'look_biker') {
      prodId1 = 'prod_top_cross';
      prodId2 = 'prod_short_biker';
      lookName = 'Look Biker Active';
    }

    const p1 = DataStore.getProductById(prodId1);
    const p2 = DataStore.getProductById(prodId2);

    if (!p1 || !p2) {
      Utils.showToast('Não foi possível carregar as peças deste look.', 'error');
      return;
    }

    // Queue: open product modal for the first piece, then second
    lookQueue = [prodId2]; // Second piece queued
    Utils.showToast(`Escolha cor e tamanho para a 1ª peça: ${p1.name}`, 'info');
    openProductModal(prodId1, null, true); // true = isLookMode
  }

  // ===== PRODUCT DETAILS MODAL =====
  let isLookModeActive = false;

  function openProductModal(id, preselectedColor = null, isLookMode = false) {
    const product = DataStore.getProductById(id);
    if (!product || !product.active) return;

    currentProduct = product;
    modalSelectedColor = null;
    modalSelectedSizeVal = null;
    modalQty = 1;
    isLookModeActive = isLookMode;
    if (modalProductQty) modalProductQty.textContent = 1;

    const finalPrice = Utils.calcDiscountedPrice(product.price, product.promotion);
    const hasPromo = product.promotion && product.promotion.active && product.promotion.discountPercent > 0;

    // Show look step indicator in category label
    if (modalProductCategory) {
      if (isLookMode && lookQueue.length > 0) {
        modalProductCategory.textContent = `${lookName} — Peça 1 de 2`;
      } else if (isLookMode && lookQueue.length === 0) {
        modalProductCategory.textContent = `${lookName} — Peça 2 de 2`;
      } else {
        modalProductCategory.textContent = product.category || 'Fitness';
      }
    }

    if (modalProductName) modalProductName.textContent = product.name;
    if (modalProductPrice) modalProductPrice.textContent = Utils.formatCurrency(finalPrice);

    if (hasPromo) {
      if (modalProductOriginalPrice) {
        modalProductOriginalPrice.textContent = Utils.formatCurrency(product.price);
        modalProductOriginalPrice.style.display = '';
      }
      if (modalProductDiscount) {
        modalProductDiscount.textContent = `-${product.promotion.discountPercent}% OFF`;
        modalProductDiscount.style.display = '';
      }
    } else {
      if (modalProductOriginalPrice) modalProductOriginalPrice.style.display = 'none';
      if (modalProductDiscount) modalProductDiscount.style.display = 'none';
    }

    // Installments line in modal
    if (modalProductInstallments) {
      modalProductInstallments.textContent = `em até 3x de ${Utils.formatCurrency(finalPrice / 3)} sem juros`;
    }

    // Badge
    if (modalProductBadge) {
      if (isLookMode) {
        modalProductBadge.textContent = lookQueue.length > 0 ? 'Peça 1 de 2 (Look)' : 'Peça 2 de 2 (Look)';
        modalProductBadge.style.display = '';
      } else if (product.badge) {
        modalProductBadge.textContent = product.badge;
        modalProductBadge.style.display = '';
      } else {
        modalProductBadge.style.display = 'none';
      }
    }

    // Image
    if (product.image) {
      if (modalProductImage) {
        modalProductImage.src = product.image;
        modalProductImage.alt = product.name;
        modalProductImage.style.display = 'block';
      }
      if (modalProductPlaceholder) modalProductPlaceholder.style.display = 'none';
    } else {
      if (modalProductImage) modalProductImage.style.display = 'none';
      if (modalProductPlaceholder) modalProductPlaceholder.style.display = 'flex';
    }

    // Description
    if (modalProductDescription) {
      modalProductDescription.textContent = product.description || 'Activewear de alta compressão e toque suave para o seu melhor treino.';
    }

    // Color Selector
    renderColorSelector(product, preselectedColor);

    // Stock Indicator
    updateModalStockIndicator();

    // Look Mode: hide qty selector since each piece is selected individually as 1 unit
    const qtyBox = $('.product-modal-qty-box');
    if (qtyBox) {
      qtyBox.style.display = isLookMode ? 'none' : 'flex';
    }

    // Open Modal
    if (productDetailsModal) productDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    refreshIcons();
  }

  function renderColorSelector(product, preselectedColor = null) {
    if (!modalColorSelector) return;
    const variants = product.variants || [];

    if (!variants.length) {
      $('modal-color-section') && ($('modal-color-section').style.display = 'none');
      $('modal-size-section') && ($('modal-size-section').style.display = 'none');
      if (btnModalAddCart) btnModalAddCart.disabled = false;
      return;
    }

    $('modal-color-section') && ($('modal-color-section').style.display = '');
    $('modal-size-section') && ($('modal-size-section').style.display = '');

    modalColorSelector.innerHTML = variants.map(v => {
      const totalQty = (v.sizes || []).reduce((s, sz) => s + sz.qty, 0);
      const isOut = totalQty === 0;
      return `
        <div class="color-option ${isOut ? 'out-of-stock' : ''}" data-color="${Utils.sanitize(v.color)}" data-hex="${v.colorHex || '#333'}" title="${Utils.sanitize(v.color)}">
          <div class="color-swatch" style="background:${v.colorHex || '#333'};"></div>
          <span class="color-option-name">${Utils.sanitize(v.color)}</span>
        </div>
      `;
    }).join('');

    function selectColor(colorName) {
      modalColorSelector.querySelectorAll('.color-option').forEach(o => {
        if (o.dataset.color === colorName) o.classList.add('selected');
        else o.classList.remove('selected');
      });
      modalSelectedColor = colorName;
      if (modalSelectedColorName) modalSelectedColorName.textContent = colorName;

      // Switch to variant image if available
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
      if (modalSizeSelector) modalSizeSelector.innerHTML = '<span class="empty-hint">Selecione uma cor primeiro</span>';
      if (modalSelectedSize) modalSelectedSize.textContent = '—';
      updateModalAddCartBtn();
    }
  }

  function renderSizeSelector(product, selectedColor) {
    if (!modalSizeSelector) return;
    const variant = (product.variants || []).find(v => v.color === selectedColor);
    if (!variant) { modalSizeSelector.innerHTML = ''; return; }

    const storeSettings = DataStore.getSettings();
    const allSizes = storeSettings.availableSizes || ['PP', 'P', 'M', 'G', 'GG'];

    const sizeMap = {};
    (variant.sizes || []).forEach(s => { sizeMap[s.size] = s.qty; });

    const productSizes = (variant.sizes || []).map(s => s.size);
    const sizesToShow = allSizes.filter(s => productSizes.includes(s));

    if (!sizesToShow.length) {
      modalSizeSelector.innerHTML = '<span class="empty-hint">Nenhum tamanho disponível</span>';
      return;
    }

    modalSizeSelector.innerHTML = sizesToShow.map(size => {
      const qty = sizeMap[size] || 0;
      const isOut = qty === 0;
      return `
        <button type="button" class="size-btn ${isOut ? 'out-of-stock' : ''}" data-size="${size}" data-qty="${qty}" ${isOut ? 'disabled' : ''}>
          <span class="size-btn-label">${size}</span>
          <span class="size-btn-qty">${qty > 0 ? `${qty} un` : 'Esgotado'}</span>
        </button>
      `;
    }).join('');

    modalSizeSelector.querySelectorAll('.size-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.size-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modalSelectedSizeVal = btn.dataset.size;
        if (modalSelectedSize) modalSelectedSize.textContent = btn.dataset.size;

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
    } else {
      qty = DataStore.getProductTotalStock(currentProduct.id);
    }

    modalStockIndicator.className = 'stock-indicator';
    if (qty === 0) {
      modalStockIndicator.classList.add('out');
      if (modalStockText) modalStockText.textContent = 'Esgotado nesta opção';
    } else if (qty <= 3) {
      modalStockIndicator.classList.add('low');
      if (modalStockText) modalStockText.textContent = `Últimas ${qty} unidades disponíveis!`;
    } else {
      modalStockIndicator.classList.add('ok');
      if (modalStockText) modalStockText.textContent = `Em estoque (${qty} unidades disponíveis)`;
    }
  }

  function updateModalAddCartBtn() {
    if (!btnModalAddCart) return;

    const isClosed = !DataStore.isStoreOpen();
    if (isClosed) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.innerHTML = '<span>Loja Fechada</span>';
      return;
    }

    function getAddBtnContent() {
      if (isLookModeActive) {
        if (lookQueue.length > 0) {
          return '<i data-lucide="arrow-right"></i> <span>Avançar para 2ª Peça</span>';
        } else {
          return '<i data-lucide="check"></i> <span>Finalizar Look</span>';
        }
      }
      return '<i data-lucide="shopping-bag"></i> <span>Adicionar ao Carrinho</span>';
    }

    const hasVariants = (currentProduct.variants || []).length > 0;
    if (!hasVariants) {
      btnModalAddCart.disabled = false;
      btnModalAddCart.innerHTML = getAddBtnContent();
      refreshIcons();
      return;
    }

    if (!modalSelectedColor) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.innerHTML = '<span>Selecione uma cor</span>';
      return;
    }

    if (!modalSelectedSizeVal) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.innerHTML = '<span>Selecione um tamanho</span>';
      return;
    }

    const qty = DataStore.getVariantStock(currentProduct.id, modalSelectedColor, modalSelectedSizeVal);
    if (qty === 0) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.innerHTML = '<span>Esgotado</span>';
      return;
    }

    btnModalAddCart.disabled = false;
    btnModalAddCart.innerHTML = getAddBtnContent();
    refreshIcons();
  }

  function closeProductModal(isUserCancel = false) {
    if (productDetailsModal) productDetailsModal.classList.remove('active');
    document.body.style.overflow = '';
    currentProduct = null;
    const qtyBox = $('.product-modal-qty-box');
    if (qtyBox) qtyBox.style.display = 'flex';
    if (isUserCancel && isLookModeActive) {
      isLookModeActive = false;
      lookQueue = [];
      lookName = '';
    }
  }

  // ===== ABOUT SECTION =====
  function renderAbout() {
    if (!settings || !settings.about) return;
    const about = settings.about;

    if (!about.active) {
      if (aboutSection) aboutSection.classList.add('hidden');
      return;
    }

    if (aboutSection) aboutSection.classList.remove('hidden');
    if (aboutTagline) aboutTagline.textContent = about.subtitle || 'Tecnologia, Conforto & Performance';
    if (aboutTitle) aboutTitle.textContent = about.title || 'Feito para o Seu Melhor Movimento';
    if (aboutText) aboutText.textContent = about.text || '';

    if (aboutFeatures && about.features && about.features.length) {
      aboutFeatures.innerHTML = about.features.map(f => {
        let iconName = 'sparkles';
        if (f.icon === 'shield-check' || f.title.toLowerCase().includes('transparência')) iconName = 'shield-check';
        else if (f.icon === 'wind' || f.title.toLowerCase().includes('dry')) iconName = 'wind';
        else if (f.icon === 'activity' || f.title.toLowerCase().includes('compressão')) iconName = 'activity';
        else if (f.icon === 'refresh-cw' || f.title.toLowerCase().includes('troca')) iconName = 'refresh-cw';

        return `
          <div class="about-feature">
            <div class="about-feature-icon-wrap">
              <i data-lucide="${iconName}"></i>
            </div>
            <h4>${Utils.sanitize(f.title)}</h4>
            <p>${Utils.sanitize(f.desc)}</p>
          </div>
        `;
      }).join('');
      refreshIcons();
    }
  }

  // ===== INSTAGRAM FEED EDITORIAL =====
  function renderInstagramFeed() {
    if (!instagramSection || !instagramGrid) return;

    const s = DataStore.getSettings();
    const ig = s.instagramFeed || {};

    if (ig.active === false) {
      instagramSection.classList.add('hidden');
      return;
    }

    instagramSection.classList.remove('hidden');
    if (instagramTitle) instagramTitle.textContent = ig.title || 'Siga @fitvibe.activewear';
    if (instagramSubtitle) instagramSubtitle.textContent = ig.subtitle || 'Confira nossos treinos, novidades diárias e bastidores exclusivos';

    const profileUrl = ig.profileUrl || 'https://instagram.com';
    if (btnInstagramProfile) btnInstagramProfile.href = profileUrl;

    const posts = ig.posts || [];
    if (posts.length > 0) {
      instagramGrid.innerHTML = posts.map(post => {
        const href = post.postUrl || profileUrl;
        return `
          <a href="${Utils.sanitize(href)}" target="_blank" rel="noopener noreferrer" class="instagram-post-card" title="${Utils.sanitize(post.caption || 'Fit Vibe Activewear')}">
            <img src="${Utils.sanitize(post.image)}" alt="${Utils.sanitize(post.caption || 'Foto Fit Vibe')}" loading="lazy">
            <div class="instagram-post-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="ig-card-icon">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Ver no Instagram</span>
            </div>
          </a>
        `;
      }).join('');
    }
  }

  // ===== FOOTER =====
  function renderFooter() {
    if (!settings) return;
    if (footerTagline) footerTagline.textContent = settings.storeTagline || 'Roupas fitness femininas de alta performance.';
    if (footerAddress) footerAddress.textContent = settings.address || 'São Paulo - SP';
    if (footerPhone) footerPhone.textContent = settings.contactPhone || '(11) 99999-9999';
    if (footerCopyright) footerCopyright.textContent = settings.footerCopyright || '© 2026 Fit Vibe Activewear. Todos os direitos reservados.';

    const wa = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de falar com o atendimento da Fit Vibe.')}`;
    if (footerWhatsapp) footerWhatsapp.href = wa;

    if (settings.instagram && footerInstagram) {
      footerInstagram.href = `https://instagram.com/${settings.instagram.replace('@', '')}`;
    }
  }

  // ===== CART MANAGEMENT =====
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
    if (!DataStore.isStoreOpen()) {
      Utils.showToast('A loja está fechada no momento.', 'error');
      return false;
    }

    const hasVariants = (product.variants || []).length > 0;
    if (hasVariants) {
      const available = DataStore.getVariantStock(product.id, color, size);
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

    // Badges
    if (cartCountEl) {
      if (count > 0) {
        cartCountEl.textContent = count;
        cartCountEl.style.display = 'flex';
      } else {
        cartCountEl.style.display = 'none';
      }
    }

    if (cartTotalEl) cartTotalEl.textContent = Utils.formatCurrency(total);
    if (cartFooter) cartFooter.style.display = count > 0 ? 'block' : 'none';
    if (cartEmpty) cartEmpty.style.display = count === 0 ? 'flex' : 'none';

    // Free Shipping Bar
    const d = (settings && settings.delivery) || {};
    const isDeliveryOn = d.deliveryEnabled !== false;
    const isFreeShippingActive = isDeliveryOn && (d.freeDeliveryEnabled !== false);
    const threshold = d.freeDeliveryThreshold !== undefined ? d.freeDeliveryThreshold : 199;

    if (cartShippingBanner) {
      if (!isFreeShippingActive) {
        cartShippingBanner.style.display = 'none';
      } else {
        cartShippingBanner.style.display = '';
        if (cartShippingFill && cartShippingText) {
          if (count === 0) {
            cartShippingFill.style.width = '0%';
            cartShippingFill.classList.remove('completed');
            cartShippingText.innerHTML = `Faltam <strong>${Utils.formatCurrency(threshold)}</strong> para <strong>FRETE GRÁTIS!</strong>`;
          } else if (total >= threshold) {
            cartShippingFill.style.width = '100%';
            cartShippingFill.classList.add('completed');
            cartShippingText.innerHTML = `<strong>Parabéns!</strong> Você ganhou <strong>FRETE GRÁTIS!</strong>`;
          } else {
            const remaining = threshold - total;
            const pct = Math.min(100, Math.round((total / threshold) * 100));
            cartShippingFill.style.width = `${pct}%`;
            cartShippingFill.classList.remove('completed');
            cartShippingText.innerHTML = `Faltam <strong>${Utils.formatCurrency(remaining)}</strong> para <strong>FRETE GRÁTIS!</strong>`;
          }
        }
      }
    }

    // Mobile Cart Bar
    if (mobileCartBar) {
      if (count > 0) {
        mobileCartBar.classList.remove('hidden');
        if (mobileCartBadge) mobileCartBadge.textContent = count;
        if (mobileCartCount) mobileCartCount.textContent = `${count} ${count === 1 ? 'peça' : 'peças'}`;
        if (mobileCartTotal) mobileCartTotal.textContent = Utils.formatCurrency(total);
      } else {
        mobileCartBar.classList.add('hidden');
      }
    }

    renderCartItems();
    refreshIcons();
  }

  function renderCartItems() {
    if (!cartItemsContainer) return;
    const items = cart.filter(Boolean);

    if (!items.length) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty" id="cart-empty">
          <div class="cart-empty-icon">
            <i data-lucide="shopping-bag"></i>
          </div>
          <p class="empty-title">Seu carrinho está vazio</p>
          <p class="empty-sub">Explore nossas novidades e adicione suas peças fitness favoritas!</p>
          <button type="button" class="btn-empty-shop" onclick="window.StoreApp?.openCart(false); document.getElementById('products')?.scrollIntoView({behavior:'smooth'});">
            Ver Coleção
          </button>
        </div>
      `;
      refreshIcons();
      return;
    }

    cartItemsContainer.innerHTML = items.map(item => {
      const colorLabel = item.color ? `<span class="cart-item-tag">${Utils.sanitize(item.color)}</span>` : '';
      const sizeLabel = item.size ? `<span class="cart-item-tag tag-size">Tam: ${Utils.sanitize(item.size)}</span>` : '';
      const imgHtml = item.image
        ? `<img src="${Utils.sanitize(item.image)}" alt="${Utils.sanitize(item.name)}">`
        : `<div class="cart-item-noimg"><i data-lucide="sparkles"></i></div>`;

      return `
        <div class="cart-item">
          <div class="cart-item-img-wrap">
            ${imgHtml}
          </div>
          <div class="cart-item-info">
            <h4 class="cart-item-name">${Utils.sanitize(item.name)}</h4>
            <div class="cart-item-tags">
              ${colorLabel}
              ${sizeLabel}
            </div>
            <div class="cart-item-price-row">
              <span class="cart-item-price">${Utils.formatCurrency(item.price * item.qty)}</span>
              <div class="cart-item-qty-control">
                <button type="button" class="btn-qty-sm" onclick="window.StoreApp?.updateCartQty('${item.id}', '${Utils.sanitize(item.color)}', '${Utils.sanitize(item.size)}', -1)" aria-label="Diminuir">−</button>
                <span class="qty-sm-val">${item.qty}</span>
                <button type="button" class="btn-qty-sm" onclick="window.StoreApp?.updateCartQty('${item.id}', '${Utils.sanitize(item.color)}', '${Utils.sanitize(item.size)}', 1)" aria-label="Aumentar">+</button>
              </div>
            </div>
          </div>
          <button type="button" class="btn-remove-item" onclick="window.StoreApp?.removeCartItem('${item.id}', '${Utils.sanitize(item.color)}', '${Utils.sanitize(item.size)}')" aria-label="Remover item">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
    }).join('');
    refreshIcons();
  }

  function openCart(open = true) {
    if (open) {
      if (cartSidebar) cartSidebar.classList.add('active');
      if (cartOverlay) cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateCartUI();
    } else {
      if (cartSidebar) cartSidebar.classList.remove('active');
      if (cartOverlay) cartOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function closeCart() {
    openCart(false);
  }

  // ===== CHECKOUT MODAL =====
  function openCheckout() {
    if (!cart.length) {
      Utils.showToast('Adicione produtos ao carrinho primeiro!', 'warning');
      return;
    }
    if (!DataStore.isStoreOpen()) {
      Utils.showToast('A loja está fechada no momento.', 'error');
      return;
    }

    closeCart();
    if (checkoutModal) checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderDeliveryTabs();
    renderPaymentOptions();
    renderCheckoutSummary();
    refreshIcons();
  }

  function closeCheckout() {
    if (checkoutModal) checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderDeliveryTabs() {
    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const deliveryOn = d.deliveryEnabled !== false;
    const pickupOn = d.pickupEnabled !== false;

    const tabDel = $('tab-delivery');
    const tabPic = $('tab-pickup');

    if (tabDel) tabDel.style.display = deliveryOn ? 'flex' : 'none';
    if (tabPic) tabPic.style.display = pickupOn ? 'flex' : 'none';

    if (!deliveryOn && pickupOn) {
      setDeliveryType('pickup');
    } else {
      setDeliveryType('delivery');
    }
  }

  function setDeliveryType(type) {
    deliveryType = type;

    $$('.delivery-tab-btn').forEach(btn => {
      if (btn.dataset.type === type) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    const addrGroup = $('group-delivery-address');
    const pickupBox = $('pickup-info-box');
    const s = DataStore.getSettings();
    const d = s.delivery || {};

    if (type === 'delivery') {
      if (addrGroup) addrGroup.style.display = '';
      if (pickupBox) pickupBox.classList.add('hidden');
    } else {
      if (addrGroup) addrGroup.style.display = 'none';
      if (pickupBox) {
        pickupBox.classList.remove('hidden');
        const addrEl = $('pickup-store-address');
        const timeEl = $('pickup-store-time');
        if (addrEl) addrEl.textContent = d.pickupAddress || s.address || 'Consulte o endereço pelo WhatsApp';
        if (timeEl) timeEl.textContent = d.pickupEstimate || 'Pronto em até 2 horas';
      }
    }

    renderCheckoutSummary();
  }

  function renderPaymentOptions() {
    if (!paymentOptions) return;
    const s = DataStore.getSettings();
    const methods = (s.paymentMethods || []).filter(m => m.active !== false);

    if (!methods.length) {
      paymentOptions.innerHTML = '<span class="empty-hint">Consulte as opções pelo WhatsApp</span>';
      return;
    }

    paymentOptions.innerHTML = methods.map((m, idx) => {
      const isSel = idx === 0;
      if (isSel) selectedPayment = m.id;
      let iconName = 'credit-card';
      if (m.id === 'pix') iconName = 'qr-code';
      else if (m.id === 'dinheiro') iconName = 'banknote';

      return `
        <label class="payment-option-label ${isSel ? 'selected' : ''}">
          <input type="radio" name="payment_method" value="${m.id}" ${isSel ? 'checked' : ''}>
          <div class="payment-option-card">
            <i data-lucide="${iconName}"></i>
            <span>${Utils.sanitize(m.name)}</span>
          </div>
        </label>
      `;
    }).join('');

    paymentOptions.querySelectorAll('input[name="payment_method"]').forEach(radio => {
      radio.addEventListener('change', e => {
        selectedPayment = e.target.value;
        paymentOptions.querySelectorAll('.payment-option-label').forEach(lbl => lbl.classList.remove('selected'));
        e.target.closest('.payment-option-label')?.classList.add('selected');
        handlePaymentChange(selectedPayment);
      });
    });

    handlePaymentChange(selectedPayment);
    refreshIcons();
  }

  function handlePaymentChange(paymentId) {
    const pixBox = $('pix-checkout-box');
    const cashBox = $('cash-change-box');
    const s = DataStore.getSettings();

    if (paymentId === 'pix') {
      if (pixBox) {
        pixBox.classList.remove('hidden');
        const pixDet = s.pixDetails || {};
        if ($('pix-key-val')) $('pix-key-val').value = pixDet.key || s.contactPhone || '';
        if ($('pix-key-type')) $('pix-key-type').textContent = pixDet.keyType || 'Chave Pix';
        if ($('pix-receiver-name')) $('pix-receiver-name').textContent = pixDet.receiverName || s.storeName;
        if ($('pix-instructions-text')) $('pix-instructions-text').textContent = pixDet.instructions || 'Faça o Pix e envie o comprovante pelo WhatsApp para envio imediato!';
      }
    } else if (pixBox) {
      pixBox.classList.add('hidden');
    }

    if (paymentId === 'dinheiro' && cashBox) {
      cashBox.classList.remove('hidden');
    } else if (cashBox) {
      cashBox.classList.add('hidden');
    }
  }

  function calculateDeliveryFee(subtotal) {
    const s = DataStore.getSettings();
    const d = s.delivery || {};
    if (deliveryType !== 'delivery' || d.deliveryEnabled === false) return 0;
    const isFreeActive = d.freeDeliveryEnabled !== false;
    const freeAt = isFreeActive ? (d.freeDeliveryThreshold !== undefined ? d.freeDeliveryThreshold : 199) : Infinity;
    return subtotal >= freeAt ? 0 : (parseFloat(d.deliveryFee) || 0);
  }

  function renderCheckoutSummary() {
    const subtotal = getCartTotal();
    const fee = calculateDeliveryFee(subtotal);
    const total = subtotal + fee;

    if (checkoutSubtotal) checkoutSubtotal.textContent = Utils.formatCurrency(subtotal);
    if (checkoutDeliveryFee) checkoutDeliveryFee.textContent = fee === 0 ? 'Grátis' : Utils.formatCurrency(fee);
    if (checkoutTotal) checkoutTotal.textContent = Utils.formatCurrency(total);

    if (checkoutItemsEl) {
      checkoutItemsEl.innerHTML = cart.map(item => `
        <div class="checkout-item-line">
          <span class="chk-item-title">${item.qty}x ${Utils.sanitize(item.name)} ${item.color ? `(${item.color}${item.size ? ` - ${item.size}` : ''})` : ''}</span>
          <span class="chk-item-val">${Utils.formatCurrency(item.price * item.qty)}</span>
        </div>
      `).join('');
    }
  }

  // ===== WHATSAPP ORDER SUBMISSION =====
  function buildWhatsAppMessage(customerData) {
    const s = DataStore.getSettings();
    const subtotal = getCartTotal();
    const fee = calculateDeliveryFee(subtotal);
    const total = subtotal + fee;

    let msg = `[NOVO PEDIDO] — ${s.storeName}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Cliente: ${customerData.name}\n`;
    msg += `Telefone: ${customerData.phone}\n`;
    msg += `\nITENS DO PEDIDO:\n`;

    cart.forEach(item => {
      msg += `• ${item.name}`;
      if (item.color) msg += `\n  Cor: ${item.color}`;
      if (item.size) msg += ` | Tam: ${item.size}`;
      msg += `\n  Qtd: ${item.qty} × ${Utils.formatCurrency(item.price)} = ${Utils.formatCurrency(item.price * item.qty)}\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Subtotal: ${Utils.formatCurrency(subtotal)}\n`;

    if (deliveryType === 'delivery') {
      msg += `Modalidade: Entrega a Domicílio\n`;
      msg += `Endereço: ${customerData.address}\n`;
      msg += `Frete: ${fee === 0 ? 'Grátis' : Utils.formatCurrency(fee)}\n`;
    } else {
      msg += `Modalidade: Retirada no Local\n`;
    }

    msg += `Pagamento: ${customerData.payment}\n`;
    if (customerData.troco) msg += `Troco para: ${customerData.troco}\n`;
    msg += `\nTOTAL A PAGAR: ${Utils.formatCurrency(total)}\n`;

    if (customerData.obs) {
      msg += `\nObservações: ${customerData.obs}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Pedido gerado pelo site oficial ${s.storeName}`;

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
      Utils.showToast('Por favor, informe seu nome completo e telefone!', 'error');
      return;
    }

    const s = DataStore.getSettings();
    const d = s.delivery || {};

    if (deliveryType === 'delivery' && d.deliveryEnabled !== false && !address) {
      Utils.showToast('Informe o endereço de entrega!', 'error');
      return;
    }

    if (!selectedPayment) {
      Utils.showToast('Selecione uma forma de pagamento!', 'error');
      return;
    }

    // Validate stock
    for (const item of cart) {
      if (item.color && item.size) {
        const available = DataStore.getVariantStock(item.id, item.color, item.size);
        if (available < item.qty) {
          Utils.showToast(`Estoque esgotado para "${item.name} (${item.color} - ${item.size})".`, 'error');
          return;
        }
      }
    }

    const subtotal = getCartTotal();
    const fee = calculateDeliveryFee(subtotal);
    const total = subtotal + fee;
    const payLabel = (s.paymentMethods || []).find(m => m.id === selectedPayment)?.name || selectedPayment;

    const customerData = { name, phone, address, obs, troco, payment: payLabel };

    // Decrement stock in DB
    for (const item of cart) {
      if (item.color && item.size) {
        try {
          await DataStore.decrementStock(item.id, item.color, item.size, item.qty);
        } catch (stockErr) {
          console.warn('[Store] Erro ao debitar estoque:', stockErr);
        }
      }
    }

    // Save order
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
      console.warn('[Store] Erro ao registrar pedido:', err);
    }

    // Redirect to WhatsApp
    const msg = buildWhatsAppMessage(customerData);
    const waNumber = s.whatsappNumber || '';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

    renderProducts();
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckout();

    Utils.showToast('Redirecionando para o WhatsApp...', 'success');
    setTimeout(() => window.open(waUrl, '_blank'), 500);
  }

  // ===== EVENT BINDINGS =====
  function bindEvents() {
    // Cart triggers
    if (btnOpenCart) btnOpenCart.addEventListener('click', () => openCart(true));
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
    if (btnCheckout) btnCheckout.addEventListener('click', openCheckout);

    // Mobile cart bar
    if (btnMobileCheckout) btnMobileCheckout.addEventListener('click', openCheckout);
    if (mobileCartInfo) mobileCartInfo.addEventListener('click', () => openCart(true));

    // Mobile drawer menu
    if (btnMobileMenu) {
      btnMobileMenu.addEventListener('click', () => {
        if (mobileDrawer) mobileDrawer.classList.add('active');
        if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    function closeMobileMenu() {
      if (mobileDrawer) mobileDrawer.classList.remove('active');
      if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeMobileMenu);
    if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeMobileMenu);

    $$('[data-close-drawer]').forEach(el => {
      el.addEventListener('click', closeMobileMenu);
    });

    // Checkout Modal
    if (btnCloseCheckout) btnCloseCheckout.addEventListener('click', closeCheckout);
    if (checkoutForm) checkoutForm.addEventListener('submit', submitOrder);
    if (checkoutModal) {
      checkoutModal.addEventListener('click', e => {
        if (e.target === checkoutModal) closeCheckout();
      });
    }

    // Delivery tabs
    const tabDel = $('tab-delivery');
    const tabPic = $('tab-pickup');
    if (tabDel) tabDel.addEventListener('click', () => setDeliveryType('delivery'));
    if (tabPic) tabPic.addEventListener('click', () => setDeliveryType('pickup'));

    // Pix key copy button
    const btnCopyPix = $('btn-copy-pix');
    if (btnCopyPix) {
      btnCopyPix.addEventListener('click', () => {
        const val = $('pix-key-val') ? $('pix-key-val').value : '';
        if (val) {
          navigator.clipboard.writeText(val).then(() => {
            Utils.showToast('Chave Pix copiada com sucesso!', 'success');
          }).catch(() => {
            Utils.showToast('Selecione e copie a chave manualmente.', 'info');
          });
        }
      });
    }

    // Product Modal
    if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', () => closeProductModal(true));
    if (productDetailsModal) {
      productDetailsModal.addEventListener('click', e => {
        if (e.target === productDetailsModal) closeProductModal(true);
      });
    }

    // ESC key closes modal safely
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && productDetailsModal && productDetailsModal.classList.contains('active')) {
        closeProductModal(true);
      }
    });

    // Modal Qty buttons
    if (btnModalQtyMinus) {
      btnModalQtyMinus.addEventListener('click', () => {
        if (modalQty > 1) {
          modalQty--;
          if (modalProductQty) modalProductQty.textContent = modalQty;
        }
      });
    }

    if (btnModalQtyPlus) {
      btnModalQtyPlus.addEventListener('click', () => {
        if (!currentProduct) return;
        let max = 99;
        if (modalSelectedColor && modalSelectedSizeVal) {
          max = DataStore.getVariantStock(currentProduct.id, modalSelectedColor, modalSelectedSizeVal);
        }
        if (modalQty < max) {
          modalQty++;
          if (modalProductQty) modalProductQty.textContent = modalQty;
        } else {
          Utils.showToast('Quantidade máxima disponível em estoque atingida!', 'warning');
        }
      });
    }

    // Modal Add to Cart
    if (btnModalAddCart) {
      btnModalAddCart.addEventListener('click', () => {
        if (!currentProduct) return;
        const color = modalSelectedColor || '';
        const size = modalSelectedSizeVal || '';
        const variant = (currentProduct.variants || []).find(v => v.color === color);
        const hex = variant ? variant.colorHex : '';

        const success = addToCart(currentProduct, color, hex, size, modalQty);
        if (success) {
          closeProductModal();

          // If in look mode, process the next product in the queue
          if (isLookModeActive && lookQueue.length > 0) {
            const nextProdId = lookQueue.shift();
            const nextProduct = DataStore.getProductById(nextProdId);
            if (nextProduct) {
              Utils.showToast(`Agora escolha cor e tamanho para a 2ª peça: ${nextProduct.name}`, 'info');
              setTimeout(() => {
                openProductModal(nextProdId, null, true);
              }, 300);
            }
          } else if (isLookModeActive && lookQueue.length === 0) {
            // Look complete - both pieces added
            isLookModeActive = false;
            Utils.showToast(`${lookName} completo no seu carrinho!`, 'success');
            openCart(true);
          } else {
            openCart(true);
          }
        }
      });
    }

    // Live Search Handlers
    const handleSearch = Utils.debounce(val => {
      searchQuery = val.trim();
      if (btnClearSearch) {
        if (searchQuery) btnClearSearch.classList.remove('hidden');
        else btnClearSearch.classList.add('hidden');
      }
      renderProducts();
    }, 200);

    if (quickSearchInput) {
      quickSearchInput.addEventListener('input', e => handleSearch(e.target.value));
    }

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('input', e => {
        handleSearch(e.target.value);
        if (e.target.value.length > 2) {
          closeMobileMenu();
          const prodSection = $('products');
          if (prodSection) prodSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        if (quickSearchInput) quickSearchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        searchQuery = '';
        btnClearSearch.classList.add('hidden');
        renderProducts();
      });
    }

    // Clear active filter chip
    if (btnClearActiveFilter) {
      btnClearActiveFilter.addEventListener('click', () => {
        currentCategory = 'all';
        currentColorFilter = null;
        searchQuery = '';
        if (quickSearchInput) quickSearchInput.value = '';
        clearColorFilter(false);
        renderCategories();
        renderProducts();
      });
    }

    // Sticky header shadow on scroll
    let isHeaderTicking = false;
    window.addEventListener('scroll', () => {
      if (!isHeaderTicking) {
        window.requestAnimationFrame(() => {
          if (navbar) {
            if (window.scrollY > 20) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
          }
          isHeaderTicking = false;
        });
        isHeaderTicking = true;
      }
    }, { passive: true });

    // Cross-tab settings sync (e.g., shipping changes made in admin panel)
    window.addEventListener('storage', e => {
      if (e.key === 'fitvibe_settings') {
        settings = DataStore.getSettings();
        updateCartUI();
        if (checkoutModal && checkoutModal.classList.contains('active')) {
          renderCheckoutSummary();
        }
      }
    });
  }

  // Ref close product modal button selector
  const btnCloseProductModal = $('btn-close-product-modal');

  // ===== EXPOSE STORE API =====
  window.StoreApp = {
    selectCategory,
    filterByColor,
    clearColorFilter,
    addLookToCart,
    openProductModal,
    openCart,
    updateCartQty: updateCartItemQty,
    removeCartItem: removeFromCart,
    closeMobileMenu: () => {
      if (mobileDrawer) mobileDrawer.classList.remove('active');
      if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
