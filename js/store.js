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
  const cartShippingBanner = $('cart-shipping-progress') || $('cart-shipping-banner');
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
  const btnModalBuyNow = $('btn-modal-buy-now');
  const modalGalleryThumbs = $('modal-gallery-thumbs');
  const btnZoomImage = $('btn-zoom-image');
  const productZoomModal = $('product-zoom-modal');
  const zoomModalImage = $('zoom-modal-image');
  const btnCloseZoom = $('btn-close-zoom');
  const btnOpenSizeGuide = $('btn-open-size-guide');
  const productModalStickyBar = $('product-modal-sticky-bar');
  const modalStickyPrice = $('modal-sticky-price');
  const modalStickyVariant = $('modal-sticky-variant');
  const btnStickyAddCart = $('btn-sticky-add-cart');

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
  let selectedNeighborhoodId = null;

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
    // 1. Renderização Instantânea Inicial (0ms a partir de cache/defaults seguros)
    settings = DataStore.getSettings();
    applyBranding();
    applyStoreStatus();
    renderAnnouncementBar();
    renderBenefitsBar();
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

    // 2. Sincronização em Segundo Plano (Supabase / Servidor)
    try {
      await DataStore.init({ enableRealtime: true, isAdmin: false });
      settings = DataStore.getSettings();
      applyBranding();
      applyStoreStatus();
      renderAnnouncementBar();
      renderBenefitsBar();
      renderCategories();
      renderFeaturedCollection();
      renderProducts();
      renderAbout();
      renderInstagramFeed();
      renderFooter();
      updateCartUI();
      refreshIcons();
    } catch (err) {
      console.warn('[Store] DataStore init background fallback:', err);
    }

    // Listen to real-time sync events from Supabase / Admin changes
    document.addEventListener('settings-updated', () => {
      settings = DataStore.getSettings();
      applyBranding();
      applyStoreStatus();
      renderAnnouncementBar();
      renderBenefitsBar();
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
      const stripEmoji = (str) => (str || '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '').trim();

      const rawTitle = stripEmoji(settings.hero.title);
      const cleanTitle = (!rawTitle || rawTitle.includes('Treine com Estilo')) ? 'Performance que acompanha seu ritmo.' : rawTitle;
      if (heroTitle) heroTitle.innerHTML = cleanTitle;

      const rawSub = stripEmoji(settings.hero.subtitle);
      const cleanSub = (!rawSub || rawSub.length < 10) ? 'Roupas fitness desenvolvidas para oferecer conforto, sustentação e liberdade em cada movimento.' : rawSub;
      if (heroSubtitle) heroSubtitle.textContent = cleanSub;

      const rawBadge = stripEmoji(settings.hero.badgeText);
      if (heroBadgeText) heroBadgeText.textContent = rawBadge || 'Coleção Activewear';

      const rawCta = stripEmoji(settings.hero.ctaText);
      const cleanCta = (!rawCta || rawCta.includes('Coleção Fitness')) ? 'Ver coleção' : rawCta;
      if (heroCta) {
        const ctaSpan = heroCta.querySelector('span');
        if (ctaSpan) ctaSpan.textContent = cleanCta;
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

  // ===== BENEFITS BAR =====
  function renderBenefitsBar() {
    const grid = $('benefits-grid');
    if (!grid) return;
    const bList = (settings && Array.isArray(settings.benefitsBar) && settings.benefitsBar.length > 0)
      ? settings.benefitsBar
      : [
          { icon: 'truck', title: 'Frete grátis acima de R$199', desc: 'Entrega rápida e segura para todo o Brasil' },
          { icon: 'shield-check', title: 'Pagamento seguro', desc: 'Ambiente protegido com confirmação imediata' },
          { icon: 'refresh-cw', title: 'Troca facilitada', desc: 'Primeira troca sem custo e sem burocracia' },
          { icon: 'zap', title: 'Envio rápido', desc: 'Despacho ágil com código de rastreamento' }
        ];

    grid.innerHTML = bList.map(b => `
      <div class="benefit-card">
        <div class="benefit-icon-wrapper">
          <i data-lucide="${b.icon || 'check-circle'}"></i>
        </div>
        <div class="benefit-content">
          <h3>${Utils.sanitize(b.title)}</h3>
          <p>${Utils.sanitize(b.desc)}</p>
        </div>
      </div>
    `).join('');
    refreshIcons();
  }

  // ===== FOOTER RENDERING =====
  function renderFooter() {
    if (!settings) return;

    const copyrightEl = $('footer-copyright');
    if (copyrightEl) {
      const year = new Date().getFullYear();
      copyrightEl.textContent = `© ${year} ${settings.storeName || 'Fit Vibe Activewear'}. Todos os direitos reservados.`;
    }

    // Phone / Contact
    const phoneEl = $('footer-phone');
    if (phoneEl) {
      if (settings.contactPhone && !settings.contactPhone.includes('99999-9999')) {
        phoneEl.textContent = settings.contactPhone;
        phoneEl.closest('.footer-contact-item') && (phoneEl.closest('.footer-contact-item').style.display = '');
      } else {
        phoneEl.closest('.footer-contact-item') && (phoneEl.closest('.footer-contact-item').style.display = 'none');
      }
    }

    // Address
    const addressEl = $('footer-address');
    if (addressEl) {
      if (settings.address && !settings.address.toLowerCase().includes('rua do fitness')) {
        addressEl.textContent = settings.address;
        addressEl.closest('.footer-contact-item') && (addressEl.closest('.footer-contact-item').style.display = '');
      } else {
        addressEl.closest('.footer-contact-item') && (addressEl.closest('.footer-contact-item').style.display = 'none');
      }
    }

    // WhatsApp Link
    const waEl = $('footer-whatsapp');
    if (waEl) {
      if (settings.whatsappNumber && !settings.whatsappNumber.includes('999999999')) {
        waEl.href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de falar com o atendimento.')}`;
        waEl.closest('.footer-contact-item') && (waEl.closest('.footer-contact-item').style.display = '');
      } else {
        waEl.closest('.footer-contact-item') && (waEl.closest('.footer-contact-item').style.display = 'none');
      }
    }

    // Instagram
    const igEl = $('footer-instagram');
    if (igEl) {
      const handle = settings.instagram || (settings.instagramFeed && settings.instagramFeed.handle) || '';
      if (handle) {
        igEl.textContent = handle.startsWith('@') ? handle : `@${handle}`;
        igEl.href = `https://instagram.com/${handle.replace('@', '')}`;
      }
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
    const currentNorm = Utils.normalizeCategory(currentCategory);

    let html = `
      <button type="button" class="category-btn ${currentNorm === 'all' || !currentNorm ? 'active' : ''}" data-cat="all" id="cat-btn-all">
        <i data-lucide="layers" class="cat-icon-svg"></i>
        <span>Todas as Peças</span>
      </button>
    `;

    categories.forEach(cat => {
      const catNorm = Utils.normalizeCategory(cat.name);
      const isSel = currentNorm === catNorm;
      const iconKey = catNorm;
      const lucideIcon = CATEGORY_ICON_MAP[iconKey] || 'tag';
      const displayName = Utils.decodeHtml(cat.name);

      html += `
        <button type="button" class="category-btn ${isSel ? 'active' : ''}" data-cat="${Utils.sanitize(cat.name)}" id="cat-btn-${cat.id}">
          <i data-lucide="${lucideIcon}" class="cat-icon-svg"></i>
          <span>${Utils.sanitize(displayName)}</span>
        </button>
      `;
    });

    categoriesFilter.innerHTML = html;
    
    // Bind click events directly on buttons to avoid HTML encoding issues
    categoriesFilter.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat || 'all';
        selectCategory(cat);
      });
    });

    refreshIcons();
  }

  // ===== SELECT CATEGORY =====
  function selectCategory(catName) {
    currentCategory = catName || 'all';
    const currentNorm = Utils.normalizeCategory(currentCategory);

    // Update active state on category buttons & desktop nav links
    $$('.category-btn').forEach(btn => {
      const btnCat = btn.dataset.cat || 'all';
      const btnNorm = Utils.normalizeCategory(btnCat);
      if (btnNorm === currentNorm || (currentNorm === 'all' && btnNorm === 'all')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    $$('.nav-cat-link').forEach(link => {
      const linkCat = link.dataset.cat || 'all';
      const linkNorm = Utils.normalizeCategory(linkCat);
      if (linkNorm === currentNorm || (currentNorm === 'all' && linkNorm === 'all')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
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

  // ===== SCHEMA.ORG JSON-LD (SEO Dinâmico Estilo JoyModa) =====
  function updateSchemaStructuredData(products) {
    try {
      const el = $('schema-structured-data');
      if (!el || !Array.isArray(products) || !products.length) return;
      const storeName = (settings && settings.storeName) || 'Fit Vibe Activewear';
      const items = products.slice(0, 30).map((p, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": p.name || 'Produto',
        "url": `${window.location.origin}${window.location.pathname}#product-${p.id}`
      }));
      const schema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "OnlineStore",
            "@id": "#store",
            "name": storeName,
            "description": "Roupas fitness femininas de alta performance. Modelagem anatômica e zero transparência.",
            "currenciesAccepted": "BRL"
          },
          {
            "@type": "CollectionPage",
            "@id": "#collection",
            "name": "Catálogo de Peças",
            "isPartOf": { "@id": "#store" },
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": products.length,
              "itemListElement": items
            }
          }
        ]
      };
      el.textContent = JSON.stringify(schema, null, 2);
    } catch (e) {
      // Ignora silenciosamente se houver restrição
    }
  }

  // ===== PRODUCTS CATALOG RENDERING =====
  function renderProducts() {
    if (!productsGrid) return;

    // 1. Load active products from DataStore
    let allLoaded = DataStore.getProducts({ includeInactive: false });
    // Filter only active products
    let products = allLoaded.filter(p => p && p.active !== false && p.active !== 'false');

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
    const currentNorm = Utils.normalizeCategory(currentCategory);
    if (currentNorm && currentNorm !== 'all') {
      products = products.filter(p => {
        if (!p.category) return false;
        const catNorm = Utils.normalizeCategory(p.category);
        return catNorm === currentNorm || catNorm.includes(currentNorm) || currentNorm.includes(catNorm);
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
      const q = searchQuery.toLowerCase().trim();
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
      } else if (currentNorm && currentNorm !== 'all') {
        productsSectionTitle.textContent = Utils.decodeHtml(currentCategory);
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
        if (currentCategory !== 'all') labels.push(`Categoria: ${Utils.decodeHtml(currentCategory)}`);
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
            emptyTitle.textContent = `Nenhum resultado para "${searchQuery}"`;
          } else if (currentColorFilter) {
            emptyTitle.textContent = `Nenhuma peça na cor "${currentColorFilter}" no momento`;
          } else if (currentCategory !== 'all') {
            emptyTitle.textContent = `Nenhuma peça na categoria "${Utils.decodeHtml(currentCategory)}" no momento`;
          } else {
            emptyTitle.textContent = 'Coleção em atualização';
          }
        }
        if (emptyDesc) {
          if (searchQuery || currentColorFilter || currentCategory !== 'all') {
            emptyDesc.textContent = 'Experimente limpar os filtros ou selecionar outra categoria para ver todas as opções disponíveis.';
          } else {
            emptyDesc.textContent = 'Nossas peças exclusivas com modelagem anatômica e tecnologia zero transparência estão sendo preparadas. Fale conosco no WhatsApp para conferir a disponibilidade antecipada!';
          }
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
    updateSchemaStructuredData(products);

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

    // Calculate installments based on admin settings
    const instCfg = (settings && settings.installmentsConfig) || (DataStore.getSettings()?.installmentsConfig) || { enabled: true, maxInstallments: 3, minInstallmentValue: 0 };
    const installmentText = Utils.getInstallmentSummary(finalPrice, instCfg);

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
    const colors = (p.variants || []).slice(0, 6);
    const colorSwatches = colors.map(v =>
      `<span class="color-swatch-mini" style="background:${v.colorHex || '#333'}" title="${Utils.sanitize(v.color)}" data-color="${Utils.sanitize(v.color)}" data-image="${Utils.sanitize(v.image || '')}"></span>`
    ).join('');

    // Available Sizes Chips
    const sizesSet = [];
    (p.variants || []).forEach(v => {
      (v.sizes || []).forEach(s => {
        if (s.qty > 0 && !sizesSet.includes(s.size)) sizesSet.push(s.size);
      });
    });
    const sizesHtml = sizesSet.length > 0
      ? `<div class="product-sizes-chips">${sizesSet.map(sz => `<span class="product-size-pill">${sz}</span>`).join('')}</div>`
      : '';

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
      <article class="product-card ${isOut ? 'out-of-stock' : ''}" data-id="${p.id}" style="animation-delay:${index * 40}ms">
        <div class="product-card-image-wrapper">
          ${imageHtml}
          ${badgeHtml}
          ${colorSwatches ? `<div class="product-colors-preview">${colorSwatches}</div>` : ''}
          <div class="product-card-quick-view">
            <i data-lucide="eye"></i>
            <span>Ver Detalhes</span>
          </div>
        </div>

        <div class="product-card-body">
          <div class="product-card-meta">
            <span class="product-card-category">${Utils.sanitize(Utils.decodeHtml(p.category || 'Fitness'))}</span>
            ${sizesHtml}
          </div>

          <h3 class="product-card-name" title="${Utils.sanitize(p.name)}">${Utils.sanitize(p.name)}</h3>

          <div class="product-card-pricing">
            ${priceHtml}
            ${installmentText ? `<span class="product-card-installment">${installmentText}</span>` : ''}
          </div>

          <div class="product-card-footer">
            <button type="button" class="btn-add-cart" data-id="${p.id}" ${(isOut || isClosed) ? 'disabled' : ''} aria-label="Adicionar ${Utils.sanitize(p.name)} ao carrinho">
              <i data-lucide="shopping-bag"></i>
              <span>${isClosed ? 'Loja Fechada' : (isOut ? 'Esgotado' : 'Adicionar à Sacola')}</span>
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
        modalProductCategory.textContent = product.category || 'Fitness Activewear';
      }
    }

    if (modalProductName) modalProductName.textContent = product.name;
    if (modalProductPrice) modalProductPrice.textContent = Utils.formatCurrency(finalPrice);
    if (modalStickyPrice) modalStickyPrice.textContent = Utils.formatCurrency(finalPrice);

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
      const instCfg = (settings && settings.installmentsConfig) || (DataStore.getSettings()?.installmentsConfig) || { enabled: true, maxInstallments: 3, minInstallmentValue: 0 };
      const summary = Utils.getInstallmentSummary(finalPrice, instCfg);
      modalProductInstallments.textContent = summary || `em até 3x sem juros de ${Utils.formatCurrency(finalPrice / 3)}`;
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

    // Main Image
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

    // Description in accordion
    if (modalProductDescription) {
      modalProductDescription.textContent = product.description || 'Activewear de alta compressão e toque suave para o seu melhor treino com tecnologia zero transparência.';
    }

    // Render Gallery Thumbnails (Main photo + each color variant image)
    renderGalleryThumbs(product, preselectedColor);

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

  function renderGalleryThumbs(product, activeColor = null) {
    if (!modalGalleryThumbs) return;
    const thumbs = [];

    // Base product image
    if (product.image) {
      thumbs.push({
        url: product.image,
        color: null,
        title: product.name
      });
    }

    // Collect all variant images
    (product.variants || []).forEach(v => {
      if (v.image && !thumbs.some(t => t.url === v.image)) {
        thumbs.push({
          url: v.image,
          color: v.color,
          title: v.color
        });
      }
    });

    if (thumbs.length <= 1) {
      modalGalleryThumbs.style.display = 'none';
      return;
    }

    modalGalleryThumbs.style.display = 'flex';
    modalGalleryThumbs.innerHTML = thumbs.map((t, idx) => {
      const isSelected = activeColor ? (t.color === activeColor) : (idx === 0);
      return `
        <div class="gallery-thumb ${isSelected ? 'active' : ''}" data-url="${t.url}" data-color="${t.color || ''}" title="${Utils.sanitize(t.title || '')}">
          <img src="${t.url}" alt="${Utils.sanitize(t.title || '')}" loading="lazy">
          ${t.color ? `<span class="gallery-thumb-color-tag">${Utils.sanitize(t.color)}</span>` : ''}
        </div>
      `;
    }).join('');

    modalGalleryThumbs.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const url = thumb.dataset.url;
        const color = thumb.dataset.color;

        modalGalleryThumbs.querySelectorAll('.gallery-thumb').forEach(th => th.classList.remove('active'));
        thumb.classList.add('active');

        if (modalProductImage && url) {
          modalProductImage.style.opacity = '0.35';
          setTimeout(() => {
            modalProductImage.src = url;
            modalProductImage.style.opacity = '1';
          }, 100);
        }

        // If thumb corresponds to a color option, select that color
        if (color && modalSelectedColor !== color) {
          const colorOpt = modalColorSelector?.querySelector(`[data-color="${color}"]`);
          if (colorOpt && !colorOpt.classList.contains('out-of-stock')) {
            colorOpt.click();
          }
        }
      });
    });
  }

  function renderColorSelector(product, preselectedColor = null) {
    if (!modalColorSelector) return;
    const variants = product.variants || [];

    if (!variants.length) {
      $('modal-color-section') && ($('modal-color-section').style.display = 'none');
      $('modal-size-section') && ($('modal-size-section').style.display = 'none');
      if (modalStickyVariant) modalStickyVariant.textContent = 'Pronto para entrega';
      if (btnModalAddCart) btnModalAddCart.disabled = false;
      if (btnModalBuyNow) btnModalBuyNow.disabled = false;
      if (btnStickyAddCart) btnStickyAddCart.disabled = false;
      return;
    }

    $('modal-color-section') && ($('modal-color-section').style.display = '');
    $('modal-size-section') && ($('modal-size-section').style.display = '');

    modalColorSelector.innerHTML = variants.map(v => {
      const totalQty = (v.sizes || []).reduce((s, sz) => s + sz.qty, 0);
      const isOut = totalQty === 0;
      return `
        <div class="color-option ${isOut ? 'out-of-stock' : ''}" data-color="${Utils.sanitize(v.color)}" data-hex="${v.colorHex || '#333'}" title="${Utils.sanitize(v.color)} ${isOut ? '(Esgotado)' : ''}">
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
      if (modalStickyVariant) modalStickyVariant.textContent = `${colorName} • Selecione tamanho`;

      // Switch to variant image if available
      const variant = (product.variants || []).find(v => v.color === modalSelectedColor);
      const targetImg = (variant && variant.image) ? variant.image : product.image;
      if (modalProductImage && targetImg) {
        modalProductImage.style.transition = 'opacity 0.15s ease';
        modalProductImage.style.opacity = '0.35';
        setTimeout(() => {
          modalProductImage.src = targetImg;
          modalProductImage.style.opacity = '1';
        }, 100);
      }

      // Update gallery thumb selection
      if (modalGalleryThumbs) {
        modalGalleryThumbs.querySelectorAll('.gallery-thumb').forEach(th => {
          if (th.dataset.color === colorName) th.classList.add('active');
          else th.classList.remove('active');
        });
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
      if (modalStickyVariant) modalStickyVariant.textContent = 'Selecione uma cor';
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
      modalSizeSelector.innerHTML = '<span class="empty-hint">Nenhum tamanho disponível para esta cor</span>';
      return;
    }

    modalSizeSelector.innerHTML = sizesToShow.map(size => {
      const qty = sizeMap[size] || 0;
      const isOut = qty === 0;
      return `
        <button type="button" class="size-btn ${isOut ? 'out-of-stock' : ''}" data-size="${size}" data-qty="${qty}" ${isOut ? 'disabled' : ''} title="${size} ${isOut ? '(Esgotado)' : `(${qty} disponíveis)`}">
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
        if (modalStickyVariant) modalStickyVariant.textContent = `${modalSelectedColor || ''} / ${btn.dataset.size}`;

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
      if (modalStockText) modalStockText.textContent = `Apenas ${qty} unidades em estoque!`;
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
      if (btnModalBuyNow) { btnModalBuyNow.disabled = true; btnModalBuyNow.innerHTML = '<span>Loja Fechada</span>'; }
      if (btnStickyAddCart) { btnStickyAddCart.disabled = true; btnStickyAddCart.innerHTML = '<span>Fechada</span>'; }
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
      return '<i data-lucide="shopping-bag"></i> <span>Adicionar à Sacola</span>';
    }

    const hasVariants = (currentProduct.variants || []).length > 0;
    if (!hasVariants) {
      btnModalAddCart.disabled = false;
      btnModalAddCart.innerHTML = getAddBtnContent();
      if (btnModalBuyNow) {
        btnModalBuyNow.disabled = false;
        btnModalBuyNow.innerHTML = '<i data-lucide="zap"></i> <span>Comprar Agora</span>';
      }
      if (btnStickyAddCart) {
        btnStickyAddCart.disabled = false;
        btnStickyAddCart.innerHTML = '<i data-lucide="shopping-bag"></i> <span>Adicionar</span>';
      }
      refreshIcons();
      return;
    }

    if (!modalSelectedColor) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.innerHTML = '<span>Selecione uma cor</span>';
      if (btnModalBuyNow) { btnModalBuyNow.disabled = true; btnModalBuyNow.innerHTML = '<i data-lucide="zap"></i> <span>Comprar Agora</span>'; }
      return;
    }

    if (!modalSelectedSizeVal) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.innerHTML = '<span>Selecione um tamanho</span>';
      if (btnModalBuyNow) { btnModalBuyNow.disabled = true; btnModalBuyNow.innerHTML = '<i data-lucide="zap"></i> <span>Comprar Agora</span>'; }
      return;
    }

    const qty = DataStore.getVariantStock(currentProduct.id, modalSelectedColor, modalSelectedSizeVal);
    if (qty === 0) {
      btnModalAddCart.disabled = true;
      btnModalAddCart.innerHTML = '<span>Esgotado</span>';
      if (btnModalBuyNow) { btnModalBuyNow.disabled = true; btnModalBuyNow.innerHTML = '<span>Esgotado</span>'; }
      return;
    }

    btnModalAddCart.disabled = false;
    btnModalAddCart.innerHTML = getAddBtnContent();
    if (btnModalBuyNow) {
      btnModalBuyNow.disabled = false;
      btnModalBuyNow.innerHTML = '<i data-lucide="zap"></i> <span>Comprar Agora</span>';
    }
    if (btnStickyAddCart) {
      btnStickyAddCart.disabled = false;
      btnStickyAddCart.innerHTML = '<i data-lucide="shopping-bag"></i> <span>Adicionar</span>';
    }
    refreshIcons();
  }

  function closeProductModal(isUserCancel = false) {
    if (productDetailsModal) productDetailsModal.classList.remove('active');
    if (productZoomModal) productZoomModal.classList.remove('active');
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

    const btnChkLabel = $('btn-checkout-label');
    if (btnChkLabel) {
      btnChkLabel.textContent = count > 0 ? `Finalizar Pedido • ${Utils.formatCurrency(total)}` : 'Finalizar Pedido';
    }

    // Installments note in cart footer
    const cartInstBadge = $('cart-installments-badge');
    const cartInstText = $('cart-installments-text');
    const instCfg = (settings && settings.installmentsConfig) || (DataStore.getSettings()?.installmentsConfig) || { enabled: true, maxInstallments: 3, minInstallmentValue: 0 };
    if (cartInstBadge && cartInstText) {
      if (count > 0 && instCfg.enabled !== false) {
        const summary = Utils.getInstallmentSummary(total, instCfg);
        if (summary) {
          cartInstText.textContent = summary;
          cartInstBadge.style.display = 'flex';
        } else {
          cartInstBadge.style.display = 'none';
        }
      } else {
        cartInstBadge.style.display = 'none';
      }
    }

    // Free Shipping Bar
    const d = (settings && settings.delivery) || (DataStore.getSettings()?.delivery) || {};
    const isDeliveryOn = d.deliveryEnabled !== false;
    const isFreeShippingActive = isDeliveryOn && (d.freeDeliveryEnabled !== false);
    const threshold = parseFloat(d.freeDeliveryThreshold) || 199;
    const banner = $('cart-shipping-progress') || cartShippingBanner;
    const fill = $('shipping-progress-fill') || cartShippingFill;
    const txt = $('shipping-progress-text') || cartShippingText;

    if (banner) {
      if (!isFreeShippingActive) {
        banner.style.display = 'none';
      } else {
        banner.style.display = '';
        if (fill && txt) {
          if (count === 0) {
            fill.style.width = '0%';
            fill.classList.remove('completed');
            txt.innerHTML = `Faltam <strong>${Utils.formatCurrency(threshold)}</strong> para <strong>FRETE GRÁTIS!</strong>`;
          } else if (total >= threshold) {
            fill.style.width = '100%';
            fill.classList.add('completed');
            txt.innerHTML = `<strong>Parabéns!</strong> Você ganhou <strong>FRETE GRÁTIS!</strong>`;
          } else {
            const remaining = threshold - total;
            const pct = Math.min(100, Math.max(6, Math.round((total / threshold) * 100)));
            fill.style.width = `${pct}%`;
            fill.classList.remove('completed');
            txt.innerHTML = `Faltam <strong>${Utils.formatCurrency(remaining)}</strong> para <strong>FRETE GRÁTIS!</strong>`;
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
      const colorLabel = item.color ? `<span class="cart-item-tag">Cor: ${Utils.sanitize(item.color)}</span>` : '';
      const sizeLabel = item.size ? `<span class="cart-item-tag tag-size">Tam: ${Utils.sanitize(item.size)}</span>` : '';
      const unitNote = item.qty > 1 ? `<span class="cart-item-unit-note" style="font-size:0.72rem;color:var(--text-muted);font-weight:normal;display:block;">(${item.qty}x ${Utils.formatCurrency(item.price)})</span>` : '';
      const imgHtml = item.image
        ? `<img src="${Utils.sanitize(item.image)}" alt="${Utils.sanitize(item.name)}" loading="lazy">`
        : `<div class="cart-item-noimg"><i data-lucide="sparkles"></i></div>`;

      return `
        <div class="cart-item">
          <div class="cart-item-img-wrap">
            ${imgHtml}
          </div>
          <div class="cart-item-info">
            <h4 class="cart-item-name" title="${Utils.sanitize(item.name)}">${Utils.sanitize(item.name)}</h4>
            <div class="cart-item-tags">
              ${colorLabel}
              ${sizeLabel}
            </div>
            <div class="cart-item-price-row">
              <div class="cart-item-price-col">
                <span class="cart-item-price">${Utils.formatCurrency(item.price * item.qty)}</span>
                ${unitNote}
              </div>
              <div class="cart-item-qty-control">
                <button type="button" class="btn-qty-sm" onclick="window.StoreApp?.updateCartQty('${item.id}', '${Utils.sanitize(item.color)}', '${Utils.sanitize(item.size)}', -1)" aria-label="Diminuir">−</button>
                <span class="qty-sm-val">${item.qty}</span>
                <button type="button" class="btn-qty-sm" onclick="window.StoreApp?.updateCartQty('${item.id}', '${Utils.sanitize(item.color)}', '${Utils.sanitize(item.size)}', 1)" aria-label="Aumentar">+</button>
              </div>
            </div>
          </div>
          <button type="button" class="btn-remove-item" onclick="window.StoreApp?.removeCartItem('${item.id}', '${Utils.sanitize(item.color)}', '${Utils.sanitize(item.size)}')" aria-label="Remover item" title="Remover da sacola">
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
    populateNeighborhoodSelect();
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
    const cardInstBox = $('card-installments-box');
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

    if (paymentId === 'credito') {
      if (cardInstBox) {
        cardInstBox.classList.remove('hidden');
        updateCheckoutInstallmentOptions();
      }
    } else if (cardInstBox) {
      cardInstBox.classList.add('hidden');
    }
  }

  function updateCheckoutInstallmentOptions() {
    const select = $('checkout-card-installments');
    if (!select) return;

    const subtotal = getCartTotal();
    const fee = calculateDeliveryFee(subtotal) || 0;
    const total = subtotal + fee;
    const s = DataStore.getSettings();
    const instCfg = s.installmentsConfig || { enabled: true, maxInstallments: 3, minInstallmentValue: 0, interestFree: true };

    const list = Utils.calculateInstallments(total, instCfg);
    select.innerHTML = list.map(opt => `
      <option value="${opt.count}">${opt.text}</option>
    `).join('');

    const hint = $('card-installments-hint');
    if (hint) {
      if (instCfg.enabled === false || list.length <= 1) {
        hint.textContent = 'Pagamento em 1x no cartão (à vista). Processado com segurança.';
      } else {
        const top = list[list.length - 1];
        hint.textContent = `Parcelamento em até ${top.count}x sem juros no cartão de crédito.`;
      }
    }
  }

  // ===== NEIGHBORHOOD RATES & DELIVERY CALCULATION =====
  function populateNeighborhoodSelect() {
    const sel = $('customer-neighborhood');
    if (!sel) return;

    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const neighborhoods = (d.neighborhoods || []).filter(n => n.active !== false);

    if (!neighborhoods.length) {
      sel.innerHTML = '<option value="">Entrega geral (sem seleção de bairro)</option>';
      const alertBox = $('neighborhood-alert-box');
      if (alertBox) alertBox.style.display = 'none';
      return;
    }

    sel.innerHTML = `
      <option value="">Selecione seu bairro para calcular o frete...</option>
      ${neighborhoods.map(n => `
        <option value="${n.id}" ${selectedNeighborhoodId === n.id ? 'selected' : ''}>
          ${Utils.sanitize(n.name)} — ${Utils.formatCurrency(n.fee || 0)} (${Utils.sanitize(n.estimate || '30 a 50 min')})
        </option>
      `).join('')}
    `;

    if (selectedNeighborhoodId) {
      sel.value = selectedNeighborhoodId;
      updateNeighborhoodAlert();
    }
  }

  function onSelectNeighborhood(id) {
    selectedNeighborhoodId = id || null;
    const sel = $('customer-neighborhood');
    if (sel) {
      sel.style.borderColor = '';
      if (sel.value !== (id || '')) {
        sel.value = id || '';
      }
    }

    updateNeighborhoodAlert();
    renderCheckoutSummary();

    const modal = $('neighborhood-rates-modal');
    if (modal && modal.classList.contains('active')) {
      const searchInput = $('neighborhood-search-input');
      renderNeighborhoodModalList(searchInput ? searchInput.value : '');
    }
  }

  function updateNeighborhoodAlert() {
    const alertBox = $('neighborhood-alert-box');
    if (!alertBox) return;

    if (!selectedNeighborhoodId) {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
      return;
    }

    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const n = (d.neighborhoods || []).find(x => x.id === selectedNeighborhoodId);
    if (!n) {
      alertBox.style.display = 'none';
      return;
    }

    const subtotal = getCartTotal();
    alertBox.style.display = 'block';

    if (n.minOrder && n.minOrder > 0 && subtotal < n.minOrder) {
      const remaining = n.minOrder - subtotal;
      alertBox.className = 'neighborhood-alert warning';
      alertBox.innerHTML = `
        <i data-lucide="alert-triangle" style="width:16px;height:16px;flex-shrink:0;"></i>
        <span>Pedido mínimo para <strong>${Utils.sanitize(n.name)}</strong>: <strong>${Utils.formatCurrency(n.minOrder)}</strong>. Faltam <strong>${Utils.formatCurrency(remaining)}</strong>.</span>
      `;
      refreshIcons();
      return;
    }

    const isFreeByGeneral = (d.freeDeliveryEnabled !== false) && (subtotal >= (parseFloat(d.freeDeliveryThreshold) || 199));
    const isFreeByNeigh = (n.freeAbove && n.freeAbove > 0 && subtotal >= n.freeAbove);

    if (isFreeByGeneral || isFreeByNeigh) {
      alertBox.className = 'neighborhood-alert success';
      alertBox.innerHTML = `
        <i data-lucide="check-circle" style="width:16px;height:16px;flex-shrink:0;"></i>
        <span>Parabéns! Você ganhou <strong>Frete Grátis</strong> para <strong>${Utils.sanitize(n.name)}</strong>!</span>
      `;
      refreshIcons();
      return;
    }

    alertBox.className = 'neighborhood-alert info';
    alertBox.innerHTML = `
      <i data-lucide="clock" style="width:16px;height:16px;flex-shrink:0;"></i>
      <span>Entrega em <strong>${Utils.sanitize(n.name)}</strong>: <strong>${Utils.formatCurrency(n.fee || 0)}</strong> &middot; Prazo estimado: <strong>${Utils.sanitize(n.estimate || '30 a 50 min')}</strong></span>
    `;
    refreshIcons();
  }

  function openNeighborhoodModal() {
    const modal = $('neighborhood-rates-modal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const input = $('neighborhood-search-input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 150);
    }

    renderNeighborhoodModalList('');
    refreshIcons();
  }

  function closeNeighborhoodModal() {
    const modal = $('neighborhood-rates-modal');
    if (!modal) return;
    modal.classList.remove('active');
    if (!checkoutModal || !checkoutModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }

  function renderNeighborhoodModalList(query = '') {
    const listEl = $('neighborhood-rates-list');
    if (!listEl) return;

    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const all = (d.neighborhoods || []).filter(n => n.active !== false);

    const q = (query || '').toLowerCase().trim();
    const filtered = q
      ? all.filter(n => (n.name || '').toLowerCase().includes(q))
      : all;

    if (!filtered.length) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:32px 16px;color:var(--text-muted);font-size:0.88rem;">
          <i data-lucide="map-pin-off" style="width:32px;height:32px;margin:0 auto 10px;display:block;opacity:0.4;"></i>
          Nenhum bairro encontrado para "${Utils.sanitize(query)}".<br>
          <small style="margin-top:6px;display:block;">Consulte nossa equipe pelo WhatsApp para entregas nessa região.</small>
        </div>
      `;
      refreshIcons();
      return;
    }

    listEl.innerHTML = filtered.map(n => {
      const isSel = selectedNeighborhoodId === n.id;
      return `
        <div class="neighborhood-card-item ${isSel ? 'selected' : ''}" onclick="window.StoreApp?.selectNeighborhoodFromModal('${n.id}')">
          <div class="neighborhood-card-info">
            <span class="neighborhood-card-name">${Utils.sanitize(n.name)}</span>
            <span class="neighborhood-card-time">
              <i data-lucide="clock"></i>
              <span>${Utils.sanitize(n.estimate || '30 a 50 min')}</span>
            </span>
            ${n.minOrder && n.minOrder > 0 ? `
              <div class="neighborhood-card-badge-row">
                <span style="font-size:0.7rem;color:#B45309;background:#FEF3C7;padding:1px 6px;border-radius:4px;font-weight:600;">Mín. ${Utils.formatCurrency(n.minOrder)}</span>
              </div>
            ` : ''}
          </div>
          <div class="neighborhood-card-price-wrap">
            <span class="neighborhood-card-price">${Utils.formatCurrency(n.fee || 0)}</span>
            ${isSel ? '<i data-lucide="check" class="neighborhood-card-check"></i>' : ''}
          </div>
        </div>
      `;
    }).join('');

    refreshIcons();
  }

  function selectNeighborhoodFromModal(id) {
    onSelectNeighborhood(id);
    closeNeighborhoodModal();

    const s = DataStore.getSettings();
    const n = (s.delivery?.neighborhoods || []).find(x => x.id === id);
    if (n) {
      Utils.showToast(`Bairro selecionado: ${n.name} (${Utils.formatCurrency(n.fee || 0)})`, 'success');
    }
  }

  function calculateDeliveryFee(subtotal) {
    const s = DataStore.getSettings();
    const d = s.delivery || {};
    if (deliveryType !== 'delivery' || d.deliveryEnabled === false) return 0;

    const isFreeActive = d.freeDeliveryEnabled !== false;
    const freeAt = isFreeActive ? (d.freeDeliveryThreshold !== undefined ? d.freeDeliveryThreshold : 199) : Infinity;
    if (subtotal >= freeAt) return 0;

    const activeNeighs = (d.neighborhoods || []).filter(n => n.active !== false);

    if (selectedNeighborhoodId) {
      const n = activeNeighs.find(x => x.id === selectedNeighborhoodId);
      if (n) {
        if (n.freeAbove && n.freeAbove > 0 && subtotal >= n.freeAbove) {
          return 0;
        }
        return parseFloat(n.fee) || 0;
      }
    }

    // Se a loja tem bairros cadastrados, o frete só é calculado após selecionar o bairro
    if (activeNeighs.length > 0) {
      return null;
    }

    return parseFloat(d.deliveryFee) || 0;
  }

  function renderCheckoutSummary() {
    const subtotal = getCartTotal();
    const fee = calculateDeliveryFee(subtotal);
    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const activeNeighs = (d.neighborhoods || []).filter(n => n.active !== false);
    const isPendingNeighborhood = (deliveryType === 'delivery' && activeNeighs.length > 0 && !selectedNeighborhoodId);

    if (checkoutSubtotal) checkoutSubtotal.textContent = Utils.formatCurrency(subtotal);

    if (checkoutDeliveryFee) {
      if (deliveryType === 'pickup') {
        checkoutDeliveryFee.innerHTML = '<span style="color:#059669;font-weight:700;">Grátis (Retirada)</span>';
      } else if (isPendingNeighborhood) {
        const isFreeActive = d.freeDeliveryEnabled !== false;
        const freeAt = isFreeActive ? (d.freeDeliveryThreshold !== undefined ? d.freeDeliveryThreshold : 199) : Infinity;
        if (subtotal >= freeAt) {
          checkoutDeliveryFee.innerHTML = '<span style="color:#059669;font-weight:700;">Grátis</span> <small style="color:var(--text-muted);">(Campanha)</small>';
        } else {
          checkoutDeliveryFee.innerHTML = '<span style="color:#d97706;font-weight:700;font-size:0.85rem;">Selecione o bairro</span>';
        }
      } else if (fee === 0) {
        checkoutDeliveryFee.innerHTML = '<span style="color:#059669;font-weight:700;">Grátis</span>';
      } else {
        const n = selectedNeighborhoodId ? activeNeighs.find(x => x.id === selectedNeighborhoodId) : null;
        checkoutDeliveryFee.innerHTML = n 
          ? `<strong>${Utils.formatCurrency(fee)}</strong> <small style="color:var(--text-muted);font-weight:normal;">(${n.name})</small>` 
          : `<strong>${Utils.formatCurrency(fee)}</strong>`;
      }
    }

    const total = subtotal + (fee || 0);
    if (checkoutTotal) {
      if (isPendingNeighborhood && fee === null) {
        checkoutTotal.innerHTML = `${Utils.formatCurrency(subtotal)} <small style="color:var(--text-muted);font-size:0.75rem;font-weight:normal;">(+ frete)</small>`;
      } else {
        checkoutTotal.textContent = Utils.formatCurrency(total);
      }
    }

    const btnSendText = $('btn-send-whatsapp-text');
    if (btnSendText) {
      if (isPendingNeighborhood && fee === null) {
        btnSendText.textContent = `Finalizar Pedido pelo WhatsApp • ${Utils.formatCurrency(subtotal)} (+ frete)`;
      } else {
        btnSendText.textContent = `Finalizar Pedido pelo WhatsApp • ${Utils.formatCurrency(total)}`;
      }
    }

    if (checkoutItemsEl) {
      checkoutItemsEl.innerHTML = cart.map(item => `
        <div class="checkout-item-line">
          <span class="chk-item-title">${item.qty}x ${Utils.sanitize(item.name)} ${item.color ? `(${item.color}${item.size ? ` - ${item.size}` : ''})` : ''}</span>
          <span class="chk-item-val">${Utils.formatCurrency(item.price * item.qty)}</span>
        </div>
      `).join('');
    }

    if (selectedPayment === 'credito') {
      updateCheckoutInstallmentOptions();
    }
  }

  // ===== WHATSAPP ORDER SUBMISSION =====
  function buildWhatsAppMessage(customerData, orderNumber) {
    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const subtotal = getCartTotal();
    const fee = calculateDeliveryFee(subtotal);
    const total = subtotal + (fee || 0);
    const orderNum = orderNumber || `FV-${Math.floor(1000 + Math.random() * 9000)}`;

    let msg = `🛍️ *NOVO PEDIDO #${orderNum}* — ${s.storeName}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *Cliente:* ${customerData.name}\n`;
    msg += `📱 *Telefone:* ${customerData.phone}\n\n`;
    msg += `📦 *ITENS DO PEDIDO:*\n`;

    cart.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.name}*\n`;
      const details = [];
      if (item.color) details.push(`Cor: ${item.color}`);
      if (item.size) details.push(`Tam: ${item.size}`);
      if (details.length) msg += `   ▫ ${details.join(' | ')}\n`;
      msg += `   ▫ ${item.qty}x ${Utils.formatCurrency(item.price)} = *${Utils.formatCurrency(item.price * item.qty)}*\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *Subtotal:* ${Utils.formatCurrency(subtotal)}\n`;

    if (deliveryType === 'delivery') {
      msg += `🚚 *Modalidade:* Entrega a Domicílio\n`;
      if (customerData.neighborhood) {
        msg += `📍 *Bairro:* ${customerData.neighborhood}\n`;
      }
      msg += `🏠 *Endereço:* ${customerData.address}\n`;
      let feeText = fee === 0 ? 'Grátis' : Utils.formatCurrency(fee);
      if (selectedNeighborhoodId) {
        const n = (d.neighborhoods || []).find(x => x.id === selectedNeighborhoodId);
        if (n && n.estimate) {
          feeText += ` (Prazo: ${n.estimate})`;
        }
      }
      msg += `🛵 *Frete:* ${feeText}\n`;
    } else {
      msg += `🏬 *Modalidade:* Retirada no Local\n`;
      const addr = d.pickupAddress || s.address;
      if (addr) msg += `📍 *Ponto de Retirada:* ${addr}\n`;
      msg += `🛵 *Frete:* Grátis (Retirada)\n`;
    }

    msg += `💳 *Forma de Pagamento:* ${customerData.payment}\n`;
    if (customerData.installment) {
      msg += `💳 *Parcelamento:* ${customerData.installment}\n`;
    }
    if (customerData.troco) {
      msg += `💵 *Troco para:* ${customerData.troco}\n`;
    }
    msg += `\n*TOTAL A PAGAR: ${Utils.formatCurrency(total)}*\n`;

    if (customerData.obs) {
      msg += `\n📝 *Observação:* ${customerData.obs}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Aguardando confirmação do pedido!`;

    return msg;
  }

  async function submitOrder(e) {
    e.preventDefault();

    const name = $('customer-name') ? $('customer-name').value.trim() : '';
    const phone = $('customer-phone') ? $('customer-phone').value.trim() : '';
    const rawAddress = $('customer-address') ? $('customer-address').value.trim() : '';
    const obs = $('customer-obs') ? $('customer-obs').value.trim() : '';
    const troco = $('customer-troco') ? $('customer-troco').value.trim() : '';

    if (!name || !phone) {
      Utils.showToast('Por favor, informe seu nome completo e telefone!', 'error');
      return;
    }

    const s = DataStore.getSettings();
    const d = s.delivery || {};
    const subtotal = getCartTotal();

    let finalAddress = rawAddress;
    let neighborhoodName = '';

    if (deliveryType === 'delivery' && d.deliveryEnabled !== false) {
      const activeNeighs = (d.neighborhoods || []).filter(n => n.active !== false);

      if (activeNeighs.length > 0 && !selectedNeighborhoodId) {
        Utils.showToast('Por favor, selecione seu bairro de entrega!', 'error');
        const sel = $('customer-neighborhood');
        if (sel) sel.focus();
        return;
      }

      if (selectedNeighborhoodId) {
        const n = activeNeighs.find(x => x.id === selectedNeighborhoodId);
        if (n) {
          neighborhoodName = n.name;
          finalAddress = `${rawAddress} (Bairro: ${n.name})`;
          if (n.minOrder && n.minOrder > 0 && subtotal < n.minOrder) {
            Utils.showToast(`O pedido mínimo para entrega em ${n.name} é de ${Utils.formatCurrency(n.minOrder)}. Faltam ${Utils.formatCurrency(n.minOrder - subtotal)}.`, 'error');
            return;
          }
        }
      }

      if (!rawAddress) {
        Utils.showToast('Informe a rua, número e complemento do endereço de entrega!', 'error');
        $('customer-address')?.focus();
        return;
      }
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

    const fee = calculateDeliveryFee(subtotal);
    const total = subtotal + (fee || 0);
    const payLabel = (s.paymentMethods || []).find(m => m.id === selectedPayment)?.name || selectedPayment;

    let installmentText = '';
    if (selectedPayment === 'credito') {
      const select = $('checkout-card-installments');
      if (select && select.selectedOptions && select.selectedOptions[0]) {
        installmentText = select.selectedOptions[0].textContent;
      }
    }

    const customerData = { name, phone, address: finalAddress, neighborhood: neighborhoodName, obs, troco, payment: payLabel, installment: installmentText };
    const orderNumber = `FV-${Math.floor(1000 + Math.random() * 9000)}`;

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
        id: `ord_${orderNumber}_${Date.now()}`,
        orderNumber,
        customer: { name, phone, address: finalAddress, neighborhood: neighborhoodName, obs, installment: installmentText },
        deliveryType,
        deliveryFee: fee,
        items: cart.map(i => ({ ...i })),
        subtotal,
        total,
        paymentMethod: selectedPayment,
        paymentInstallment: installmentText,
        status: 'novo'
      });
    } catch (err) {
      console.warn('[Store] Erro ao registrar pedido:', err);
    }

    // Redirect to WhatsApp
    const msg = buildWhatsAppMessage(customerData, orderNumber);
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

    // Neighborhood Rates Modal
    const neighModal = $('neighborhood-rates-modal');
    const btnCloseNeighRates = $('btn-close-neighborhood-rates');
    const btnFooterCloseNeigh = $('btn-footer-close-neighborhood');
    const neighSearchInput = $('neighborhood-search-input');

    if (btnCloseNeighRates) btnCloseNeighRates.addEventListener('click', closeNeighborhoodModal);
    if (btnFooterCloseNeigh) btnFooterCloseNeigh.addEventListener('click', closeNeighborhoodModal);
    if (neighModal) {
      neighModal.addEventListener('click', e => {
        if (e.target === neighModal) closeNeighborhoodModal();
      });
    }

    if (neighSearchInput) {
      neighSearchInput.addEventListener('input', e => {
        renderNeighborhoodModalList(e.target.value);
      });
    }

    // ESC key closes modal safely
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (productZoomModal && productZoomModal.classList.contains('active')) {
          productZoomModal.classList.remove('active');
          return;
        }
        if (productDetailsModal && productDetailsModal.classList.contains('active')) {
          closeProductModal(true);
        }
        if (neighModal && neighModal.classList.contains('active')) {
          closeNeighborhoodModal();
        }
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

    // Modal "Comprar Agora" (Direct to Checkout)
    if (btnModalBuyNow) {
      btnModalBuyNow.addEventListener('click', () => {
        if (!currentProduct) return;
        const color = modalSelectedColor || '';
        const size = modalSelectedSizeVal || '';
        const variant = (currentProduct.variants || []).find(v => v.color === color);
        const hex = variant ? variant.colorHex : '';

        const success = addToCart(currentProduct, color, hex, size, modalQty);
        if (success) {
          closeProductModal();
          openCheckout();
        }
      });
    }

    // Mobile Sticky Bar Add Button (mirrors primary add button)
    if (btnStickyAddCart) {
      btnStickyAddCart.addEventListener('click', () => {
        if (btnModalAddCart) btnModalAddCart.click();
      });
    }

    // Product Image Zoom Lightbox
    if (btnZoomImage) {
      btnZoomImage.addEventListener('click', () => {
        if (!modalProductImage || !modalProductImage.src) return;
        if (zoomModalImage) {
          zoomModalImage.src = modalProductImage.src;
          zoomModalImage.alt = currentProduct?.name || 'Foto ampliada';
        }
        if (productZoomModal) productZoomModal.classList.add('active');
      });
    }

    if (btnCloseZoom) {
      btnCloseZoom.addEventListener('click', () => {
        if (productZoomModal) productZoomModal.classList.remove('active');
      });
    }

    if (productZoomModal) {
      productZoomModal.addEventListener('click', e => {
        if (e.target === productZoomModal) {
          productZoomModal.classList.remove('active');
        }
      });
    }

    // Open Size Guide Accordion smoothly
    if (btnOpenSizeGuide) {
      btnOpenSizeGuide.addEventListener('click', () => {
        const sizeAccordion = $('accordion-size-guide');
        if (sizeAccordion) {
          sizeAccordion.open = true;
          sizeAccordion.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    // Cross-tab sync: settings, products, and categories changed in admin panel
    window.addEventListener('storage', e => {
      if (e.key === 'fashion_settings' || e.key === 'fitvibe_settings') {
        settings = DataStore.getSettings();
        updateCartUI();
        applyBranding();
        renderBenefitsBar();
        renderFooter();
        if (checkoutModal && checkoutModal.classList.contains('active')) {
          renderCheckoutSummary();
        }
      } else if (e.key === 'fashion_products') {
        // Products changed in another tab (Admin) — reload and refresh vitrine
        DataStore.forceRefresh().then(() => {
          renderFeaturedCollection();
          renderProducts();
          refreshIcons();
        }).catch(() => {
          renderProducts();
          refreshIcons();
        });
      } else if (e.key === 'fashion_categories') {
        // Categories changed in another tab (Admin) — refresh category bar
        DataStore.forceRefresh().then(() => {
          renderCategories();
          renderProducts();
          refreshIcons();
        }).catch(() => {
          renderCategories();
          refreshIcons();
        });
      }
    });


    // Direct product link support via hash (e.g. #product-123)
    if (window.location.hash && window.location.hash.startsWith('#product-')) {
      const prodId = window.location.hash.replace('#product-', '');
      if (prodId) {
        setTimeout(() => openProductModal(prodId), 250);
      }
    }
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
    openNeighborhoodModal,
    closeNeighborhoodModal,
    selectNeighborhoodFromModal,
    onSelectNeighborhood,
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
