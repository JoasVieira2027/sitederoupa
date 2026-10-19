/**
 * data.js - Camada de Dados para Loja de Roupas
 * Suporte completo a variantes: cor, tamanho e quantidade por SKU.
 * Persistência no Supabase com fallback em localStorage.
 */

const DB_KEYS = {
  PRODUCTS: 'fashion_products',
  ORDERS: 'fashion_orders',
  SETTINGS: 'fashion_settings',
  CATEGORIES: 'fashion_categories',
  CACHE_META: 'fashion_cache_meta',
  LOYALTY_ACCOUNTS: 'fashion_loyalty_accounts',
  LOYALTY_TRANSACTIONS: 'fashion_loyalty_transactions',
  LOYALTY_REWARDS: 'fashion_loyalty_rewards',
  LOYALTY_COUPONS: 'fashion_loyalty_coupons',
  LOYALTY_MISSIONS: 'fashion_loyalty_missions',
  PRODUCT_REVIEWS: 'fashion_product_reviews',
  STORE_FOLLOWS: 'fashion_store_follows'
};

// Cache TTL de 10 minutos para visitantes públicos
const CACHE_TTL_MS = 10 * 60 * 1000;

// ===== DEFAULT PRODUCTS (FITNESS) =====
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_legging_sculpt',
    name: 'Legging Sculpt Sem Costura Cós Alto',
    category: 'Leggings',
    price: 139.90,
    badge: 'Zero Transparência',
    description: 'Legging com tecnologia seamless (sem costura lateral), compressão ideal que modela e empina o bumbum sem apertar. Cós alto duplo anatômico que não enrola durante o agachamento ou corrida. Tecido respirável e 100% à prova de agachamento.',
    image: 'assets/images/legging_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Grafite Mescla', colorHex: '#4A4A4A', image: 'assets/images/legging_fitness.jpg', sizes: [{ size: 'PP', qty: 4 }, { size: 'P', qty: 8 }, { size: 'M', qty: 10 }, { size: 'G', qty: 6 }, { size: 'GG', qty: 3 }] },
      { color: 'Preto Ônix', colorHex: '#1E1E1E', image: 'assets/images/legging_fitness.jpg', sizes: [{ size: 'PP', qty: 5 }, { size: 'P', qty: 12 }, { size: 'M', qty: 14 }, { size: 'G', qty: 8 }, { size: 'GG', qty: 4 }] },
      { color: 'Verde Militar', colorHex: '#3A4D39', image: 'assets/images/legging_fitness.jpg', sizes: [{ size: 'P', qty: 6 }, { size: 'M', qty: 8 }, { size: 'G', qty: 5 }] }
    ],
    promotion: { active: true, discountPercent: 10 }
  },
  {
    id: 'prod_top_cross',
    name: 'Top Fitness Alta Sustentação Alças Cruzadas',
    category: 'Tops & Croppeds',
    price: 79.90,
    badge: 'Alta Sustentação',
    description: 'Top fitness projetado para treinos de médio e alto impacto. Costas com alças cruzadas que distribuem o peso e garantem total mobilidade para membros superiores. Acompanha bojo removível e forro interno antibacteriano.',
    image: 'assets/images/top_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Grafite Mescla', colorHex: '#4A4A4A', image: 'assets/images/top_fitness.jpg', sizes: [{ size: 'PP', qty: 5 }, { size: 'P', qty: 10 }, { size: 'M', qty: 9 }, { size: 'G', qty: 5 }, { size: 'GG', qty: 2 }] },
      { color: 'Preto Ônix', colorHex: '#1E1E1E', image: 'assets/images/top_fitness.jpg', sizes: [{ size: 'P', qty: 8 }, { size: 'M', qty: 10 }, { size: 'G', qty: 6 }] },
      { color: 'Vinho Borgonha', colorHex: '#5A1827', image: 'assets/images/top_fitness.jpg', sizes: [{ size: 'P', qty: 4 }, { size: 'M', qty: 6 }, { size: 'G', qty: 3 }] }
    ],
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_conjunto_active',
    name: 'Conjunto Activewear Seamless Wave (Top + Biker)',
    category: 'Conjuntos',
    price: 189.90,
    badge: 'Mais Vendido',
    description: 'Conjunto fitness completo com top estruturado e short biker de alta compressão. Confeccionado em poliamida premium com elastano, toque gelado, secagem rápida e proteção UV50+. Combinação perfeita de estilo e praticidade para o treino.',
    image: 'assets/images/conjunto_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Verde Oliva', colorHex: '#556B2F', image: 'assets/images/conjunto_fitness.jpg', sizes: [{ size: 'P', qty: 6 }, { size: 'M', qty: 9 }, { size: 'G', qty: 5 }, { size: 'GG', qty: 2 }] },
      { color: 'Preto Carbono', colorHex: '#1A1A1A', image: 'assets/images/conjunto_fitness.jpg', sizes: [{ size: 'P', qty: 7 }, { size: 'M', qty: 8 }, { size: 'G', qty: 4 }] },
      { color: 'Terracota', colorHex: '#A0522D', image: 'assets/images/conjunto_fitness.jpg', sizes: [{ size: 'P', qty: 3 }, { size: 'M', qty: 5 }, { size: 'G', qty: 2 }] }
    ],
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_short_biker',
    name: 'Short Biker Compressão com Bolso Lateral para Celular',
    category: 'Shorts & Bermudas',
    price: 99.90,
    badge: 'Com Bolso',
    description: 'Bermuda ciclista fitness com bolso lateral profundo perfeito para celular, chave ou documentos. Comprimento meia coxa que não sobe ao caminhar, correr ou pedalar. Costuras reforçadas planas (flatlock) que não marcam a pele.',
    image: 'assets/images/short_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Preto Ônix', colorHex: '#1E1E1E', image: 'assets/images/short_fitness.jpg', sizes: [{ size: 'PP', qty: 4 }, { size: 'P', qty: 10 }, { size: 'M', qty: 12 }, { size: 'G', qty: 8 }, { size: 'GG', qty: 4 }] },
      { color: 'Azul Marinho', colorHex: '#1B263B', image: 'assets/images/short_fitness.jpg', sizes: [{ size: 'P', qty: 5 }, { size: 'M', qty: 6 }, { size: 'G', qty: 4 }] },
      { color: 'Chumbo', colorHex: '#3D3D3D', image: 'assets/images/short_fitness.jpg', sizes: [{ size: 'P', qty: 4 }, { size: 'M', qty: 5 }, { size: 'G', qty: 3 }] }
    ],
    promotion: { active: true, discountPercent: 15 }
  },
  {
    id: 'prod_macacao_sculpt',
    name: 'Macacão Fitness Seamless Costas Nuas',
    category: 'Macacões',
    price: 169.90,
    badge: 'Destaque',
    description: 'Macacão fitness de alta performance em malha tecnológica sem costura. Efeito modelador que valoriza o corpo com decote costas abertas e suporte firme no busto. Tecido encorpado que não fica transparente.',
    image: 'assets/images/hero_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Preto Ônix', colorHex: '#1E1E1E', image: 'assets/images/hero_fitness.jpg', sizes: [{ size: 'P', qty: 5 }, { size: 'M', qty: 8 }, { size: 'G', qty: 4 }] },
      { color: 'Verde Militar', colorHex: '#3A4D39', image: 'assets/images/hero_fitness.jpg', sizes: [{ size: 'P', qty: 4 }, { size: 'M', qty: 6 }, { size: 'G', qty: 3 }] }
    ],
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_garrafa_matte',
    name: 'Garrafa Térmica Donna Inox Matte 750ml',
    category: 'Acessórios',
    price: 69.90,
    badge: 'Acessório',
    description: 'Garrafa térmica esportiva em aço inoxidável com acabamento fosco aveludado antiderrapante. Conserva líquidos gelados por até 24 horas e quentes por 12 horas. Tampa antivazamento com bico articulado e alça de transporte.',
    image: 'assets/images/conjunto_fitness.jpg',
    active: true,
    inStock: true,
    featured: false,
    variants: [
      { color: 'Preto Fosco', colorHex: '#1E1E1E', image: 'assets/images/conjunto_fitness.jpg', sizes: [{ size: 'Único', qty: 15 }] },
      { color: 'Verde Esmeralda', colorHex: '#059669', image: 'assets/images/conjunto_fitness.jpg', sizes: [{ size: 'Único', qty: 10 }] }
    ],
    promotion: { active: false, discountPercent: 0 }
  }
];

// ===== DEFAULT CATEGORIES & IMAGES (FITNESS) =====
const DEFAULT_CATEGORY_IMAGES = {
  'Leggings': 'assets/images/legging_fitness.jpg',
  'Tops & Croppeds': 'assets/images/top_fitness.jpg',
  'Conjuntos': 'assets/images/conjunto_fitness.jpg',
  'Shorts & Bermudas': 'assets/images/short_fitness.jpg',
  'Macacões': 'assets/images/hero_fitness.jpg',
  'Acessórios': 'assets/images/conjunto_fitness.jpg'
};

const DEFAULT_CATEGORIES = [
  { id: 'cat_leggings', name: 'Leggings', icon: 'layers', image: 'assets/images/legging_fitness.jpg', active: true, order: 1, description: 'Modelagem anatômica, cós duplo e zero transparência' },
  { id: 'cat_tops', name: 'Tops & Croppeds', icon: 'shield', image: 'assets/images/top_fitness.jpg', active: true, order: 2, description: 'Alta sustentação, costas cruzadas e bojo removível' },
  { id: 'cat_conjuntos', name: 'Conjuntos', icon: 'sparkles', image: 'assets/images/conjunto_fitness.jpg', active: true, order: 3, description: 'Looks completos coordenados em poliamida nobre' },
  { id: 'cat_shorts', name: 'Shorts & Bermudas', icon: 'activity', image: 'assets/images/short_fitness.jpg', active: true, order: 4, description: 'Bikers de compressão com bolso lateral para celular' },
  { id: 'cat_macacoes', name: 'Macacões', icon: 'zap', image: 'assets/images/hero_fitness.jpg', active: true, order: 5, description: 'Peças únicas sem costura com ajuste perfeito ao corpo' },
  { id: 'cat_acessorios', name: 'Acessórios', icon: 'package', image: 'assets/images/conjunto_fitness.jpg', active: true, order: 6, description: 'Garrafas térmicas, faixas e itens essenciais de treino' }
];

// ===== DEFAULT SETTINGS (FITNESS) =====
const DEFAULT_SETTINGS = {
  storeName: 'Donna Fitness PE',
  storeTagline: 'Moda Fitness Feminina & Alta Performance',
  storeLogoEmoji: '',
  storeLogoImage: '',
  themeColor: '#059669',
  announcementBar: { active: true, text: 'FRETE GRÁTIS nas compras acima de R$ 199 • Até 3x sem juros • Zero Transparência' },
  featuredCollection: {
    active: true,
    title: 'Nova Coleção',
    subtitle: 'Lançamentos e peças exclusivas com tecnologia seamless e alta compressão'
  },
  benefitsBar: [
    { id: 'b_security', icon: 'shield-check', title: 'Compra segura', desc: 'Ambiente criptografado com proteção SSL' },
    { id: 'b_motoboy', icon: 'truck', title: 'Motoboy p/ região metropolitana', desc: 'Entrega expressa ou frete grátis acima de R$ 199' },
    { id: 'b_exchange', icon: 'refresh-cw', title: 'Troca facilitada', desc: '1ª troca sem burocracia em até 7 dias' },
    { id: 'b_wa', icon: 'message-circle', title: 'Atendimento humanizado', desc: 'Suporte exclusivo no WhatsApp' }
  ],
  banners: [
    {
      id: 'banner_1',
      title: 'MODA FITNESS CHIC',
      subtitle: 'Leve, confortável e cheia de estilo para todos os seus momentos.',
      badge: 'NOVA COLEÇÃO',
      image: 'assets/images/hero_fitness.jpg',
      mobileImage: 'assets/images/hero_fitness.jpg',
      ctaText: 'Ver Coleção',
      ctaLink: '#products',
      active: true,
      order: 1
    },
    {
      id: 'banner_2',
      title: 'ZERO TRANSPARÊNCIA',
      subtitle: 'Activewear premium com modelagem anatômica e sustentação máxima.',
      badge: 'DESTAQUES',
      image: 'assets/images/legging_fitness.jpg',
      mobileImage: 'assets/images/legging_fitness.jpg',
      ctaText: 'Ver Leggings',
      ctaLink: '#products',
      active: true,
      order: 2
    }
  ],
  hero: {
    emoji: '',
    title: 'Performance que acompanha seu ritmo.',
    subtitle: 'Roupas fitness desenvolvidas para oferecer conforto, sustentação e liberdade em cada movimento.',
    ctaText: 'Ver coleção',
    badgeText: 'Alta Performance'
  },
  about: {
    active: true,
    title: 'Tecnologia, Conforto & Performance',
    subtitle: 'Criado para mover o seu melhor',
    text: 'A Donna Fitness PE desenvolve peças esportivas com tecidos nobres e tecnologia têxtil de ponta. Modelagens exclusivas que valorizam a silhueta, oferecem sustentação máxima e acompanham cada movimento do seu dia com total segurança.',
    features: [
      { icon: 'shield-check', title: 'Zero Transparência', desc: 'Gramatura reforçada para agachamentos com total segurança' },
      { icon: 'wind', title: 'Tecnologia Dry-Fit', desc: 'Respirabilidade máxima que evapora o suor rapidamente' },
      { icon: 'activity', title: 'Alta Compressão', desc: 'Cós anatômico duplo que não enrola durante o treino' },
      { icon: 'refresh-cw', title: 'Troca Fácil', desc: 'Primeira troca 100% grátis e sem burocracia' }
    ]
  },
  delivery: {
    deliveryEnabled: true,
    deliveryFee: 15.00,
    freeDeliveryEnabled: true,
    freeDeliveryThreshold: 199.00,
    estimatedTime: '2 a 5 dias úteis',
    pickupEnabled: true,
    pickupAddress: 'Consulte o ponto de retirada pelo WhatsApp',
    pickupEstimate: 'Pronto em até 2 horas',
    neighborhoodsEnabled: true,
    neighborhoods: [
      { id: 'b_1', name: 'Águas Compridas', fee: 5.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_2', name: 'Aguazinha', fee: 6.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_3', name: 'Mirueira', fee: 7.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_4', name: 'Porto da Madeira', fee: 6.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_5', name: 'Córrego do Abacaxi', fee: 7.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_6', name: 'Alto Nova Olinda', fee: 5.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_7', name: 'Nova Olinda', fee: 5.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_8', name: 'Alto da Bondade', fee: 7.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_9', name: 'Alto da Conquista', fee: 7.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_10', name: 'Casa Caiada', fee: 12.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_11', name: 'Caixa D\'água', fee: 7.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_12', name: 'Passarinho', fee: 7.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' },
      { id: 'b_13', name: 'Sítio Novo', fee: 8.00, minOrder: 0, freeAbove: 0, active: true, estimate: '30 a 50 min' }
    ]
  },
  instagramFeed: {
    active: true,
    title: 'Siga nosso Instagram',
    subtitle: 'Confira nossos treinos, novidades e bastidores exclusivos',
    handle: '@fitvibe.activewear',
    profileUrl: 'https://instagram.com/fitvibe.activewear',
    bio: 'Activewear premium com modelagem anatômica e zero transparência',
    posts: [
      {
        id: 'ig_post_1',
        image: 'assets/images/legging_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Legging Seamless Compressão Máxima. Zero transparência no agachamento.',
        featured: true
      },
      {
        id: 'ig_post_2',
        image: 'assets/images/top_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Top Nadador com sustentação reforçada e tecido tecnológico dry-fit.',
        featured: false
      },
      {
        id: 'ig_post_3',
        image: 'assets/images/conjunto_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Conjunto Verde Oliva: conforto e elegância em cada treino.',
        featured: false
      },
      {
        id: 'ig_post_4',
        image: 'assets/images/short_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Short Runner com cós duplo anatômico que não enrola.',
        featured: false
      },
      {
        id: 'ig_post_5',
        image: 'assets/images/hero_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Nova Coleção: tecnologia têxtil para acompanhar sua melhor performance.',
        featured: false
      }
    ]
  },
  whatsappNumber: '5511999999999',
  contactPhone: '(11) 99999-9999',
  instagram: '@fitvibe.activewear',
  address: 'Rua do Fitness, 120 - São Paulo, SP',
  footerCopyright: '© 2026 Donna Fitness PE. Todos os direitos reservados.',
  paymentMethods: [
    { id: 'pix', name: 'Pix (Aprovação Imediata)', icon: 'qr-code', active: true },
    { id: 'credito', name: 'Cartão de Crédito', icon: 'credit-card', active: true },
    { id: 'debito', name: 'Cartão de Débito', icon: 'credit-card', active: true },
    { id: 'dinheiro', name: 'Dinheiro na Entrega', icon: 'banknote', active: true }
  ],
  installmentsConfig: {
    enabled: true,
    maxInstallments: 3,
    minInstallmentValue: 0,
    interestFree: true
  },
  pixDetails: { key: '', keyType: 'Celular', receiverName: 'Donna Fitness PE', instructions: 'Faça o Pix e envie o comprovante pelo WhatsApp para envio imediato!' },
  storeOpen: true,
  closedCustomMessage: 'Estamos fora do horário de atendimento. Deixe sua mensagem no WhatsApp que responderemos rapidinho!',
  operatingHours: {
    segunda: { active: true, open: '08:00', close: '20:00' },
    terca: { active: true, open: '08:00', close: '20:00' },
    quarta: { active: true, open: '08:00', close: '20:00' },
    quinta: { active: true, open: '08:00', close: '20:00' },
    sexta: { active: true, open: '08:00', close: '20:00' },
    sabado: { active: true, open: '08:00', close: '18:00' },
    domingo: { active: false, open: '00:00', close: '00:00' }
  },
  closures: [],
  availableSizes: ['PP', 'P', 'M', 'G', 'GG'],
  loyalty: {
    enabled: true,
    pointsPerReal: 1,
    pointsPerReview: 30,
    pointsPerReviewWithPhoto: 50,
    pointsForFollowStore: 50,
    checkinStreakPoints: [10, 15, 20, 25, 30, 35, 40],
    expirationEnabled: false,
    expirationDays: 365
  },
  lowStockConfig: {
    active: true,
    threshold: 5,
    text: 'Últimas peças'
  },
  recommendedConfig: {
    active: true,
    title: 'Recomendados para Você',
    productIds: [],
    maxItems: 4
  },
  floatingContactConfig: {
    active: true,
    whatsappNumber: '',
    message: 'Olá! Estou no site da Donna Fitness PE e gostaria de tirar uma dúvida.',
    label: 'Fale Conosco',
    position: 'bottom-right'
  },
  shareConfig: {
    active: true,
    title: 'Donna Fitness PE | Moda Fitness de Alta Performance',
    text: 'Conheça as melhores peças fitness com compressão e zero transparência!',
    url: ''
  },
  adminPassword: 'admin123',
  adminAccessKey: 'fitvibe@2026'
};

// ===== DEFAULT LOYALTY REWARDS & MISSIONS =====
const DEFAULT_LOYALTY_REWARDS = [
  { id: 'rew_5_pct', title: '5% OFF', description: 'Em qualquer pedido da loja', reward_type: 'percent', discount_value: 5, points_cost: 300, min_order_value: 0, max_discount: 50, validity_days: 30, active: true, order_num: 1 },
  { id: 'rew_5_brl', title: 'R$ 5 OFF', description: 'Desconto direto no checkout', reward_type: 'fixed', discount_value: 5, points_cost: 300, min_order_value: 40, max_discount: 5, validity_days: 30, active: true, order_num: 2 },
  { id: 'rew_10_pct', title: '10% OFF', description: 'Válido em qualquer pedido', reward_type: 'percent', discount_value: 10, points_cost: 700, min_order_value: 60, max_discount: 100, validity_days: 30, active: true, order_num: 3 },
  { id: 'rew_10_brl', title: 'R$ 10 OFF', description: 'Desconto direto no checkout', reward_type: 'fixed', discount_value: 10, points_cost: 700, min_order_value: 80, max_discount: 10, validity_days: 30, active: true, order_num: 4 },
  { id: 'rew_free_shipping', title: 'Frete Grátis', description: 'Frete grátis em 1 pedido', reward_type: 'free_shipping', discount_value: 0, points_cost: 1000, min_order_value: 50, max_discount: 35, validity_days: 30, active: true, order_num: 5 },
  { id: 'rew_20_brl', title: 'R$ 20 OFF', description: 'Em compras acima de R$ 120', reward_type: 'fixed', discount_value: 20, points_cost: 1400, min_order_value: 120, max_discount: 20, validity_days: 30, active: true, order_num: 6 }
];

const DEFAULT_LOYALTY_MISSIONS = [
  {
    id: 'mission_unlock_bonus',
    title: 'Desbloqueie seu bônus',
    description: 'Complete as 3 ações: check-in, avaliar compra e comprar novamente',
    reward_points: 300,
    mission_type: 'composite',
    target_count: 3,
    steps: [
      { id: 'step_checkin', label: 'Faça check-in' },
      { id: 'step_review', label: 'Avalie uma compra' },
      { id: 'step_purchase', label: 'Compre novamente' }
    ],
    active: true,
    order_num: 1
  },
  {
    id: 'mission_loyal_buyer',
    title: 'Comprador fiel',
    description: 'Compre 3 vezes na loja e ganhe 500 pontos',
    reward_points: 500,
    mission_type: 'purchase_count',
    target_count: 3,
    steps: [
      { id: 'step_buy_1', label: 'Primeira compra' },
      { id: 'step_buy_2', label: 'Mais 2 compras' }
    ],
    active: true,
    order_num: 2
  },
  {
    id: 'mission_first_purchase',
    title: 'Primeira Compra',
    description: 'Faça seu primeiro pedido e ganhe 100 pontos',
    reward_points: 100,
    mission_type: 'purchase_count',
    target_count: 1,
    steps: [
      { id: 'step_first_order', label: 'Faça 1 pedido' }
    ],
    active: true,
    order_num: 3
  },
  {
    id: 'mission_reviewer',
    title: 'Avaliador Oficial',
    description: 'Envie avaliações de 3 peças e ganhe 150 pontos',
    reward_points: 150,
    mission_type: 'review_count',
    target_count: 3,
    steps: [
      { id: 'step_rev_3', label: 'Envie 3 avaliações' }
    ],
    active: true,
    order_num: 4
  }
];

// ============================================================
//  DataStore — Singleton
// ============================================================
const DataStore = (function () {
  'use strict';

  let _products = (function () {
    try {
      const r = localStorage.getItem(DB_KEYS.PRODUCTS);
      const parsed = r ? JSON.parse(r) : null;
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {}
    return [...DEFAULT_PRODUCTS];
  })();

  let _categories = (function () {
    try {
      const r = localStorage.getItem(DB_KEYS.CATEGORIES);
      const parsed = r ? JSON.parse(r) : null;
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {}
    return [...DEFAULT_CATEGORIES];
  })();
  let _orders = [];
  let _settings = (function () {
    try {
      const r = localStorage.getItem(DB_KEYS.SETTINGS);
      const parsed = r ? JSON.parse(r) : null;
      if (parsed && typeof parsed === 'object') return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {}
    return { ...DEFAULT_SETTINGS };
  })();
  let _initialized = false;
  let _supabase = null;
  let _isAdmin = false;
  let _realtimeChannel = null;

  // ===== CACHE HELPERS =====
  function _getCacheMeta() {
    try { return JSON.parse(localStorage.getItem(DB_KEYS.CACHE_META) || '{}'); } catch { return {}; }
  }

  function _setCacheMeta(key, ts) {
    const meta = _getCacheMeta();
    meta[key] = ts;
    try { localStorage.setItem(DB_KEYS.CACHE_META, JSON.stringify(meta)); } catch {}
  }

  function _isCacheValid(key) {
    if (_isAdmin) return false;
    const meta = _getCacheMeta();
    return meta[key] && (Date.now() - meta[key]) < CACHE_TTL_MS;
  }

  function _saveLocal(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); _setCacheMeta(key, Date.now()); } catch {}
  }

  function _loadLocal(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
  }

  // ===== MAPPERS: Supabase → JS (snake_case → camelCase) =====
  function _mapProduct(row) {
    if (!row) return null;
    let v = row.variants;
    if (typeof v === 'string') {
      try { v = JSON.parse(v); } catch { v = []; }
    }
    if (!v || !Array.isArray(v)) v = [];

    let promo = row.promotion;
    if (typeof promo === 'string') {
      try { promo = JSON.parse(promo); } catch { promo = { active: false, discountPercent: 0 }; }
    }

    return {
      id: row.id,
      name: row.name || 'Produto sem nome',
      description: row.description || '',
      price: parseFloat(row.price) || 0,
      image: row.image || '',
      category: (row.category || '').trim(),
      badge: row.badge || '',
      active: row.active !== false && row.active !== 'false',
      inStock: row.in_stock !== false && row.in_stock !== 'false',
      featured: row.featured === true || Boolean(row.badge && row.badge.toLowerCase().includes('destaque')),
      variants: v.map(item => ({
        color: (item.color || '').trim(),
        colorHex: item.colorHex || '#1E293B',
        image: item.image || '',
        sizes: Array.isArray(item.sizes) ? item.sizes : []
      })),
      promotion: promo || { active: false, discountPercent: 0 },
      displayOrder: row.display_order || 0,
      relevance: row.relevance !== undefined ? parseInt(row.relevance, 10) : (row.display_order ? 100 - row.display_order : 0),
      isBestSeller: row.is_best_seller === true || Boolean(row.badge && row.badge.toLowerCase().includes('mais vendido')),
      isNew: row.is_new === true || Boolean(row.badge && row.badge.toLowerCase().includes('novidade')),
      isRecommended: row.is_recommended === true,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  function _mapSettings(row) {
    if (!row) return { ...DEFAULT_SETTINGS };
    const parseJsonField = (val, def) => {
      if (val && typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : def; } catch { return def; }
    };
    return {
      storeName: row.store_name || DEFAULT_SETTINGS.storeName,
      storeTagline: row.store_tagline || DEFAULT_SETTINGS.storeTagline,
      storeLogoEmoji: row.store_logo_emoji || DEFAULT_SETTINGS.storeLogoEmoji,
      storeLogoImage: row.store_logo_image || '',
      themeColor: row.theme_color || DEFAULT_SETTINGS.themeColor,
      announcementBar: parseJsonField(row.announcement_bar, DEFAULT_SETTINGS.announcementBar),
      featuredCollection: (function () {
        const parsedHero = parseJsonField(row.hero, {});
        if (parsedHero && parsedHero._featuredCollection !== undefined) {
          return parsedHero._featuredCollection;
        }
        if (row.featured_collection !== undefined) {
          return parseJsonField(row.featured_collection, DEFAULT_SETTINGS.featuredCollection);
        }
        return DEFAULT_SETTINGS.featuredCollection;
      })(),
      benefitsBar: (function () {
        const parsedHero = parseJsonField(row.hero, {});
        if (parsedHero && parsedHero._benefitsBar !== undefined) {
          return parsedHero._benefitsBar;
        }
        if (row.benefits_bar !== undefined) {
          return parseJsonField(row.benefits_bar, DEFAULT_SETTINGS.benefitsBar);
        }
        return DEFAULT_SETTINGS.benefitsBar;
      })(),
      hero: parseJsonField(row.hero, DEFAULT_SETTINGS.hero),
      about: parseJsonField(row.about, DEFAULT_SETTINGS.about),
      delivery: (function () {
        const d = parseJsonField(row.delivery, DEFAULT_SETTINGS.delivery);
        return {
          ...DEFAULT_SETTINGS.delivery,
          ...(d || {}),
          neighborhoods: (d && Array.isArray(d.neighborhoods)) ? d.neighborhoods : DEFAULT_SETTINGS.delivery.neighborhoods,
          neighborhoodsEnabled: d && d.neighborhoodsEnabled !== undefined ? d.neighborhoodsEnabled : true
        };
      })(),
      instagramFeed: (function () {
        const parsedHero = parseJsonField(row.hero, {});
        if (parsedHero && parsedHero._instagramFeed !== undefined) {
          return parsedHero._instagramFeed;
        }
        const parsed = parseJsonField(row.instagram_feed, DEFAULT_SETTINGS.instagramFeed);
        if (parsed && Array.isArray(parsed.posts)) {
          return { ...DEFAULT_SETTINGS.instagramFeed, ...(parsed || {}), posts: DEFAULT_SETTINGS.instagramFeed.posts };
        }
        return parsed || DEFAULT_SETTINGS.instagramFeed;
      })(),
      whatsappNumber: row.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
      contactPhone: row.contact_phone || DEFAULT_SETTINGS.contactPhone,
      instagram: row.instagram || '',
      address: row.address || DEFAULT_SETTINGS.address,
      footerCopyright: row.footer_copyright || DEFAULT_SETTINGS.footerCopyright,
      paymentMethods: parseJsonField(row.payment_methods, DEFAULT_SETTINGS.paymentMethods),
      installmentsConfig: (function () {
        const parsedHero = parseJsonField(row.hero, {});
        if (parsedHero && parsedHero._installmentsConfig !== undefined) {
          return { ...DEFAULT_SETTINGS.installmentsConfig, ...parsedHero._installmentsConfig };
        }
        if (row.installments_config !== undefined) {
          return { ...DEFAULT_SETTINGS.installmentsConfig, ...parseJsonField(row.installments_config, {}) };
        }
        return DEFAULT_SETTINGS.installmentsConfig;
      })(),
      pixDetails: parseJsonField(row.pix_details, DEFAULT_SETTINGS.pixDetails),
      banners: (function () {
        const parsedHero = parseJsonField(row.hero, {});
        if (parsedHero && Array.isArray(parsedHero._banners) && parsedHero._banners.length > 0) {
          return parsedHero._banners;
        }
        if (row.banners !== undefined) {
          const b = parseJsonField(row.banners, null);
          if (Array.isArray(b) && b.length > 0) return b;
        }
        return DEFAULT_SETTINGS.banners;
      })(),
      storeOpen: row.store_open !== false,
      closedCustomMessage: row.closed_custom_message || DEFAULT_SETTINGS.closedCustomMessage,
      operatingHours: parseJsonField(row.operating_hours, DEFAULT_SETTINGS.operatingHours),
      closures: parseJsonField(row.closures, []),
      availableSizes: parseJsonField(row.available_sizes, DEFAULT_SETTINGS.availableSizes),
      loyalty: parseJsonField(row.loyalty, DEFAULT_SETTINGS.loyalty),
      lowStockConfig: parseJsonField(row.low_stock_config, DEFAULT_SETTINGS.lowStockConfig),
      recommendedConfig: parseJsonField(row.recommended_config, DEFAULT_SETTINGS.recommendedConfig),
      floatingContactConfig: parseJsonField(row.floating_contact_config, DEFAULT_SETTINGS.floatingContactConfig),
      shareConfig: parseJsonField(row.share_config, DEFAULT_SETTINGS.shareConfig),
      adminPassword: DEFAULT_SETTINGS.adminPassword
    };
  }

  function _mapOrder(row) {
    return {
      id: row.id,
      userId: row.user_id || (row.customer && row.customer.userId) || null,
      customer: row.customer || {},
      deliveryType: row.delivery_type || 'delivery',
      deliveryFee: parseFloat(row.delivery_fee) || 0,
      items: row.items || [],
      subtotal: parseFloat(row.subtotal) || 0,
      total: parseFloat(row.total) || 0,
      paymentMethod: row.payment_method || '',
      status: row.status || 'novo',
      createdAt: row.created_at
    };
  }

  // ===== INIT =====
  async function init({ enableRealtime = false, isAdmin = false } = {}) {
    if (_initialized && !isAdmin) return;
    _isAdmin = isAdmin;

    // Init Supabase
    if (window.SupabaseService) {
      _supabase = await window.SupabaseService.init();
    }

    // Load all data in parallel
    await Promise.all([
      _loadCategories(),
      _loadProducts(),
      _loadSettings()
    ]);

    if (isAdmin) {
      await _loadOrders();
    }

    if (enableRealtime && _supabase) {
      _setupRealtime();
    }

    _initialized = true;
    console.log('[DataStore] Initialized. Products:', _products.length, '| Settings:', _settings.storeName);
  }

  // ===== LOAD FUNCTIONS =====
  function _mapCategory(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      icon: row.icon || 'tag',
      image: row.image || DEFAULT_CATEGORY_IMAGES[row.name] || 'assets/images/conjunto_fitness.jpg',
      active: row.active !== false && row.active !== 'false',
      order: row.order !== undefined && row.order !== null ? parseInt(row.order, 10) : (row.order_num !== undefined ? parseInt(row.order_num, 10) : 0)
    };
  }

  async function _loadCategories() {
    // 1. Initial fast local load
    const local = _loadLocal(DB_KEYS.CATEGORIES);
    if (local && local.length) {
      _categories = local.map(_mapCategory).filter(Boolean);
      DEFAULT_CATEGORIES.forEach(dc => {
        const found = _categories.find(c => c.name.toLowerCase() === dc.name.toLowerCase());
        if (!found) {
          _categories.push({ ...dc });
        } else {
          if (!found.image) found.image = dc.image;
          if (!found.description) found.description = dc.description;
          if (found.order === undefined) found.order = dc.order;
        }
      });
    } else {
      _categories = [...DEFAULT_CATEGORIES];
    }
    _categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    // 2. Fresh sync from Supabase
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('categories').select('*');
        if (!error && data && data.length) {
          _categories = data.map(_mapCategory).filter(Boolean).sort((a, b) => (a.order || 0) - (b.order || 0));
          _saveLocal(DB_KEYS.CATEGORIES, _categories);
          return;
        }
      } catch (e) { console.warn('[DataStore] categories fetch error:', e); }
    }
  }

  async function _loadProducts() {
    // 1. Initial fast local load
    const local = _loadLocal(DB_KEYS.PRODUCTS);
    if (local && Array.isArray(local) && local.length) {
      _products = local;
      DEFAULT_PRODUCTS.forEach(dp => {
        if (!_products.some(p => p.id === dp.id)) {
          _products.push(dp);
        }
      });
    } else {
      _products = [...DEFAULT_PRODUCTS];
    }
    _products.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // 2. Fresh sync from Supabase
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('products').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          _products = data.map(_mapProduct).filter(Boolean).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          _saveLocal(DB_KEYS.PRODUCTS, _products);
          return;
        } else if (error) {
          console.warn('[DataStore] products fetch error from Supabase:', error);
        }
      } catch (e) { console.warn('[DataStore] products fetch error:', e); }
    }
  }

  async function _loadSettings() {
    // 1. Initial fast local load
    const local = _loadLocal(DB_KEYS.SETTINGS);
    if (local && local.storeName) {
      _settings = local;
    } else {
      _settings = { ...DEFAULT_SETTINGS };
    }

    // 2. Fresh sync from Supabase
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('settings').select('*').eq('id', 'main').single();
        if (!error && data) {
          _settings = _mapSettings(data);
          _saveLocal(DB_KEYS.SETTINGS, _settings);
          return;
        }
      } catch (e) { console.warn('[DataStore] settings fetch error:', e); }
    }
  }

  async function _loadOrders() {
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) { _orders = data.map(_mapOrder); return; }
      } catch (e) { console.warn('[DataStore] orders fetch error:', e); }
    }
    _orders = _loadLocal(DB_KEYS.ORDERS) || [];
  }

  // ===== REALTIME =====
  function _setupRealtime() {
    if (!_supabase) return;
    if (_realtimeChannel) { _supabase.removeChannel(_realtimeChannel); }
    _realtimeChannel = _supabase
      .channel('fashion-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        await _loadProducts();
        document.dispatchEvent(new CustomEvent('products-updated'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        await _loadCategories();
        document.dispatchEvent(new CustomEvent('categories-updated'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
        await _loadSettings();
        document.dispatchEvent(new CustomEvent('settings-updated'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        await _loadOrders();
        document.dispatchEvent(new CustomEvent('orders-updated'));
      })
      .subscribe();
  }

  // ===== GETTERS =====
  function getProducts({ includeInactive = false } = {}) {
    if (includeInactive) return [..._products];
    return _products.filter(p => p.active);
  }

  function getProductById(id) {
    return _products.find(p => p.id === id) || null;
  }

  function getCategories() {
    return [..._categories];
  }

  function getSettings() {
    return { ..._settings };
  }

  function getOrders() {
    return [..._orders];
  }

  // ===== STOCK HELPERS =====
  /**
   * Retorna o total de unidades em estoque de um produto (todas as cores + tamanhos)
   */
  function getProductTotalStock(productId) {
    const p = getProductById(productId);
    if (!p) return 0;
    if (!p.variants || !p.variants.length) {
      // Produto sem variantes cadastradas: se inStock for true, consideramos estoque ativo
      return p.inStock ? 50 : 0;
    }
    const total = p.variants.reduce((acc, variant) => {
      const sizes = variant.sizes || [];
      if (!sizes.length) return acc + (variant.qty !== undefined ? (variant.qty || 0) : 10);
      return acc + sizes.reduce((s, sz) => s + (sz.qty || 0), 0);
    }, 0);

    // Se variantes existem mas não definiram tamanhos/quantidades explicitamente
    if (total === 0 && p.inStock) {
      const hasAnySizeDefined = p.variants.some(v => Array.isArray(v.sizes) && v.sizes.length > 0);
      if (!hasAnySizeDefined) return 25;
    }
    return total;
  }

  /**
   * Retorna o estoque de uma variante específica (cor + tamanho)
   */
  function getVariantStock(productId, color, size) {
    const p = getProductById(productId);
    if (!p || !p.variants) return 0;
    const variant = p.variants.find(v => (v.color || '').toLowerCase() === (color || '').toLowerCase());
    if (!variant) return 0;
    if (!variant.sizes || !variant.sizes.length) return variant.qty !== undefined ? (variant.qty || 0) : 10;
    const sizeEntry = (variant.sizes || []).find(s => s.size === size);
    return sizeEntry ? (sizeEntry.qty || 0) : 0;
  }

  /**
   * Retorna todos os tamanhos disponíveis para uma cor específica (qty > 0)
   */
  function getAvailableSizesForColor(productId, color) {
    const p = getProductById(productId);
    if (!p || !p.variants) return [];
    const variant = p.variants.find(v => (v.color || '').toLowerCase() === (color || '').toLowerCase());
    if (!variant) return [];
    if (!variant.sizes || !variant.sizes.length) return (p.variants[0] && p.variants[0].sizes && p.variants[0].sizes.length) ? p.variants[0].sizes.map(s => s.size) : ['P', 'M', 'G'];
    return (variant.sizes || []).filter(s => s.qty > 0).map(s => s.size);
  }

  /**
   * Todas as cores disponíveis (com pelo menos 1 item em estoque)
   */
  function getAvailableColors(productId) {
    const p = getProductById(productId);
    if (!p || !p.variants || !p.variants.length) return [];
    return p.variants.filter(v => {
      if (!v.sizes || !v.sizes.length) return true;
      return (v.sizes || []).some(s => s.qty > 0);
    });
  }

  // ===== PRODUCT MUTATIONS =====
  async function saveProduct(product) {
    const isNew = !product.id;
    if (isNew) {
      product.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    product.updatedAt = new Date().toISOString();
    if (!product.createdAt) product.createdAt = product.updatedAt;

    if (_supabase) {
      const row = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || '',
        category: product.category,
        badge: product.badge || '',
        active: product.active !== false && product.active !== 'false',
        in_stock: product.inStock !== false && product.inStock !== 'false',
        variants: product.variants || [],
        promotion: product.promotion || { active: false, discountPercent: 0 },
        updated_at: product.updatedAt
      };
      if (isNew) row.created_at = product.createdAt;

      try {
        const rowWithFeatured = { ...row, featured: product.featured === true };
        const { error: fErr } = isNew
          ? await _supabase.from('products').insert([rowWithFeatured])
          : await _supabase.from('products').update(rowWithFeatured).eq('id', product.id);
        if (fErr) {
          const { error } = isNew
            ? await _supabase.from('products').insert([row])
            : await _supabase.from('products').update(row).eq('id', product.id);
          if (error) console.warn('[DataStore] Erro ao persistir produto no Supabase:', error);
        }
      } catch (err) {
        console.warn('[DataStore] Exceção ao salvar produto no Supabase:', err);
      }
    }

    const idx = _products.findIndex(p => p.id === product.id);
    if (idx >= 0) _products[idx] = { ..._products[idx], ...product };
    else _products.unshift(product);

    _saveLocal(DB_KEYS.PRODUCTS, _products);
    document.dispatchEvent(new CustomEvent('products-updated'));
    return product;
  }

  function getFeaturedProducts() {
    const s = getSettings();
    const f = s.featuredCollection || {};
    if (f.active === false) return [];

    let featured = _products.filter(p => p.active && (p.featured || (p.badge && p.badge.toLowerCase().includes('destaque'))));
    if (!featured.length) {
      featured = _products.filter(p => p.active).slice(0, 4);
    }
    return featured;
  }

  async function toggleProductFeatured(id) {
    const p = getProductById(id);
    if (!p) return false;
    p.featured = !p.featured;
    await saveProduct(p);
    return p.featured;
  }

  async function deleteProduct(id) {
    if (_supabase) {
      const { error } = await _supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    }
    _products = _products.filter(p => p.id !== id);
    _saveLocal(DB_KEYS.PRODUCTS, _products);
    document.dispatchEvent(new CustomEvent('products-updated'));
  }

  /**
   * Decrement stock for a given product/color/size after order
   */
  async function decrementStock(productId, color, size, qty = 1) {
    const product = getProductById(productId);
    if (!product || !product.variants) return;

    const variants = JSON.parse(JSON.stringify(product.variants));
    const variant = variants.find(v => v.color === color);
    if (!variant) return;
    const sizeEntry = (variant.sizes || []).find(s => s.size === size);
    if (!sizeEntry) return;
    sizeEntry.qty = Math.max(0, (sizeEntry.qty || 0) - qty);

    product.variants = variants;
    // Check if any size has stock
    const totalStock = variants.reduce((t, v) => t + (v.sizes || []).reduce((s, sz) => s + sz.qty, 0), 0);
    product.inStock = totalStock > 0;

    await saveProduct(product);
  }

  // ===== CATEGORY MUTATIONS =====
  async function saveCategory(cat) {
    const isNew = !cat.id;
    if (isNew) cat.id = 'cat_' + Date.now();
    const catImage = cat.image !== undefined ? cat.image : (DEFAULT_CATEGORY_IMAGES[cat.name] || '');
    const active = cat.active !== false && cat.active !== 'false';
    const order = cat.order !== undefined && cat.order !== null ? parseInt(cat.order, 10) : 0;
    const description = cat.description || '';

    if (_supabase) {
      const row = {
        id: cat.id,
        name: cat.name,
        icon: cat.icon || 'tag',
        image: catImage,
        description,
        active,
        order
      };
      try {
        const { error } = isNew
          ? await _supabase.from('categories').insert([row])
          : await _supabase.from('categories').update(row).eq('id', cat.id);
        if (error) {
          // Fallback gracioso se colunas adicionais não existirem no Supabase
          const fallbackRow = { id: cat.id, name: cat.name, icon: cat.icon || 'tag', image: catImage };
          const { error: fErr } = isNew
            ? await _supabase.from('categories').insert([fallbackRow])
            : await _supabase.from('categories').update(fallbackRow).eq('id', cat.id);
          if (fErr) console.warn('[DataStore] Erro ao salvar categoria no Supabase:', fErr);
        }
      } catch (err) {
        console.warn('[DataStore] Exceção ao salvar categoria:', err);
      }
    }

    const item = { ...cat, image: catImage, active, order, description };
    const idx = _categories.findIndex(c => c.id === cat.id);
    if (idx >= 0) _categories[idx] = item;
    else _categories.push(item);

    _categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    _saveLocal(DB_KEYS.CATEGORIES, _categories);
    document.dispatchEvent(new CustomEvent('categories-updated'));
    return item;
  }

  async function deleteCategory(id) {
    if (_supabase) {
      const { error } = await _supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.error('[DataStore] Erro ao deletar categoria no Supabase:', error);
        throw error;
      }
    }
    _categories = _categories.filter(c => c.id !== id);
    _saveLocal(DB_KEYS.CATEGORIES, _categories);
    document.dispatchEvent(new CustomEvent('categories-updated'));
  }

  // ===== SETTINGS MUTATIONS =====
  async function updateSettings(newSettings) {
    _settings = { ..._settings, ...newSettings };

    if (_supabase) {
      const heroWithExtras = {
        ...(_settings.hero || {}),
        _featuredCollection: _settings.featuredCollection,
        _instagramFeed: _settings.instagramFeed,
        _benefitsBar: _settings.benefitsBar,
        _installmentsConfig: _settings.installmentsConfig,
        _banners: _settings.banners
      };

      const row = {
        id: 'main',
        store_name: _settings.storeName,
        store_tagline: _settings.storeTagline,
        store_logo_emoji: _settings.storeLogoEmoji,
        store_logo_image: _settings.storeLogoImage || '',
        theme_color: _settings.themeColor,
        announcement_bar: _settings.announcementBar,
        hero: heroWithExtras,
        about: _settings.about,
        delivery: _settings.delivery,
        whatsapp_number: _settings.whatsappNumber,
        contact_phone: _settings.contactPhone,
        instagram: _settings.instagram || '',
        address: _settings.address,
        footer_copyright: _settings.footerCopyright,
        payment_methods: _settings.paymentMethods,
        pix_details: _settings.pixDetails,
        store_open: _settings.storeOpen !== false,
        closed_custom_message: _settings.closedCustomMessage,
        operating_hours: _settings.operatingHours,
        closures: _settings.closures || [],
        available_sizes: _settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
        loyalty: _settings.loyalty,
        updated_at: new Date().toISOString()
      };

      try {
        const rowWithExtras = {
          ...row,
          featured_collection: _settings.featuredCollection,
          instagram_feed: _settings.instagramFeed,
          banners: _settings.banners,
          loyalty: _settings.loyalty
        };
        const { error: fErr } = await _supabase.from('settings').upsert([rowWithExtras]);
        if (fErr) {
          const { error } = await _supabase.from('settings').upsert([row]);
          if (error) throw error;
        }
      } catch (err) {
        const { error } = await _supabase.from('settings').upsert([row]);
        if (error) throw error;
      }
    }

    _saveLocal(DB_KEYS.SETTINGS, _settings);
    document.dispatchEvent(new CustomEvent('settings-updated'));
  }

  async function updateSetting(key, value) {
    await updateSettings({ [key]: value });
  }

  // ===== ORDERS =====
  async function saveOrder(order) {
    const userId = order.userId || order.user_id || (order.customer && order.customer.userId) || null;
    if (!userId) {
      throw new Error('Autenticação obrigatória para criar pedidos. Faça login para continuar.');
    }

    if (!order.id) order.id = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    if (!order.createdAt) order.createdAt = new Date().toISOString();
    order.status = order.status || 'novo';
    order.userId = userId;

    if (_supabase) {
      const row = {
        id: order.id,
        user_id: userId,
        customer: order.customer,
        delivery_type: order.deliveryType || 'delivery',
        delivery_fee: order.deliveryFee || 0,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        payment_method: order.paymentMethod,
        status: order.status,
        created_at: order.createdAt
      };

      const { error } = await _supabase.from('orders').insert([row]);
      if (error) {
        console.error('[DataStore] Erro ao registrar pedido no Supabase:', error.message);
        throw error;
      }
    } else {
      throw new Error('Banco de dados Supabase não conectado. Não é possível registrar o pedido.');
    }

    _orders.unshift(order);
    return order;
  }

  async function getCustomerOrders(userId) {
    if (!userId) return [];
    if (_supabase) {
      try {
        const { data, error } = await _supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map(_mapOrder);
        }
      } catch (e) {
        console.warn('[DataStore] Erro ao carregar pedidos do usuário:', e);
      }
    }
    return [];
  }

  async function updateOrderStatus(id, status) {
    if (_supabase) {
      const { error } = await _supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    }
    const order = _orders.find(o => o.id === id);
    if (order) order.status = status;
    _saveLocal(DB_KEYS.ORDERS, _orders);
  }

  async function deleteOrder(id) {
    if (_supabase) {
      const { error } = await _supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    }
    _orders = _orders.filter(o => o.id !== id);
    _saveLocal(DB_KEYS.ORDERS, _orders);
  }

  // ===== STORE STATUS (open/closed) =====
  function isStoreOpen() {
    const s = _settings;
    // Se o switch da loja estiver desligado (fechada manualmente), a loja está fechada
    if (s.storeOpen === false) return false;

    // Se o controle de horário não estiver explicitamente ativo, o switch manual storeOpen mantém a loja aberta!
    if (!s.autoScheduleEnabled) return true;

    const now = new Date();
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayKey = dayNames[now.getDay()];
    const hours = s.operatingHours ? s.operatingHours[dayKey] : null;
    if (!hours || !hours.active) return false;

    // Check for manual closures
    const closures = s.closures || [];
    const todayStr = now.toISOString().slice(0, 10);
    if (closures.some(c => c.date === todayStr)) return false;

    const [openH, openM] = (hours.open || '00:00').split(':').map(Number);
    const [closeH, closeM] = (hours.close || '00:00').split(':').map(Number);
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= openMin && nowMin < closeMin;
  }

  // ===== FORCE REFRESH (Admin) =====
  async function forceRefresh() {
    try { localStorage.removeItem(DB_KEYS.CACHE_META); } catch {}
    await Promise.all([_loadCategories(), _loadProducts(), _loadSettings(), _loadOrders()]);
  }

  // ===== LOYALTY & REWARDS (Sistema de Fidelidade) =====

  function _getLoyaltyAccountKey(userId) {
    return `fashion_loyalty_account_${userId}`;
  }

  function _getLoyaltyTxKey(userId) {
    return `fashion_loyalty_tx_${userId}`;
  }

  function _getLoyaltyCouponsKey(userId) {
    return `fashion_loyalty_coupons_${userId}`;
  }

  function _getLoyaltyMissionsKey(userId) {
    return `fashion_loyalty_missions_${userId}`;
  }

  async function getLoyaltyAccount(userId) {
    if (!userId) return null;
    if (_supabase && window.SupabaseService) {
      try {
        const acc = await window.SupabaseService.getLoyaltyAccount(userId);
        if (acc) return acc;
      } catch (e) {
        console.warn('[DataStore] Erro ao carregar conta fidelidade do Supabase:', e);
      }
    }
    return null;
  }

  async function getLoyaltyTransactions(userId) {
    if (!userId) return [];
    if (_supabase && window.SupabaseService) {
      try {
        const txs = await window.SupabaseService.getLoyaltyTransactions(userId);
        if (Array.isArray(txs)) return txs;
      } catch (e) {
        console.warn('[DataStore] Erro ao carregar extrato de pontos do Supabase:', e);
      }
    }
    return [];
  }

  async function getLoyaltyRewards() {
    if (_supabase && window.SupabaseService) {
      try {
        const rews = await window.SupabaseService.getLoyaltyRewards();
        if (Array.isArray(rews) && rews.length > 0) return rews;
      } catch (e) {
        console.warn('[DataStore] Erro ao carregar catálogo de recompensas:', e);
      }
    }
    return DEFAULT_LOYALTY_REWARDS;
  }

  async function getLoyaltyCoupons(userId) {
    if (!userId) return [];
    if (_supabase && window.SupabaseService) {
      try {
        const coupons = await window.SupabaseService.getLoyaltyCoupons(userId);
        if (Array.isArray(coupons)) return coupons;
      } catch (e) {
        console.warn('[DataStore] Erro ao carregar cupons do Supabase:', e);
      }
    }
    return [];
  }

  async function getLoyaltyMissions(userId) {
    if (_supabase && window.SupabaseService) {
      try {
        const data = await window.SupabaseService.getLoyaltyMissions(userId);
        if (data && data.missions && data.missions.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('[DataStore] Erro ao buscar missões do Supabase:', e);
      }
    }

    return {
      missions: DEFAULT_LOYALTY_MISSIONS,
      userMissions: []
    };
  }

  async function isUserFollowingStore(userId) {
    if (!userId) return false;
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('store_follows').select('id').eq('user_id', userId).maybeSingle();
        if (!error && data) return true;
      } catch (e) {}
    }
    return false;
  }

  async function getStoreFollowersCount() {
    if (_supabase && window.SupabaseService) {
      try {
        const count = await window.SupabaseService.getStoreFollowersCount();
        return typeof count === 'number' ? count : 0;
      } catch (e) {}
    }
    return 0;
  }

  async function claimDailyCheckin(userId) {
    if (!userId) return { success: false, message: 'Usuário não autenticado. Faça login para realizar o check-in.' };
    if (_supabase && window.SupabaseService) {
      try {
        const res = await window.SupabaseService.claimDailyCheckin();
        if (res) return res;
      } catch (err) {
        return { success: false, message: err.message || 'Erro ao processar check-in no servidor.' };
      }
    }
    return { success: false, message: 'Serviço de fidelidade Supabase indisponível.' };
  }

  async function followStore(userId) {
    if (!userId) return { success: false, message: 'Usuário não autenticado. Faça login para seguir a loja.' };
    if (_supabase && window.SupabaseService) {
      try {
        const res = await window.SupabaseService.followStore();
        if (res) return res;
      } catch (err) {
        return { success: false, message: err.message || 'Erro ao seguir a loja no servidor.' };
      }
    }
    return { success: false, message: 'Serviço de fidelidade Supabase indisponível.' };
  }

  async function redeemReward(rewardId, userId) {
    if (!userId) return { success: false, message: 'Usuário não autenticado. Faça login para resgatar cupons.' };
    if (_supabase && window.SupabaseService) {
      try {
        const res = await window.SupabaseService.redeemReward(rewardId);
        if (res) return res;
      } catch (err) {
        return { success: false, message: err.message || 'Erro ao processar resgate no servidor.' };
      }
    }
    return { success: false, message: 'Serviço de recompensas Supabase indisponível.' };
  }

  async function validateCoupon(code, subtotal, userId) {
    if (!userId) return { valid: false, message: 'Faça login para utilizar cupons de fidelidade.' };
    if (!code) return { valid: false, message: 'Código de cupom não informado.' };
    const cleanCode = code.trim().toUpperCase();

    if (_supabase && window.SupabaseService) {
      try {
        const res = await window.SupabaseService.validateCoupon(cleanCode, subtotal);
        if (res) return res;
      } catch (err) {
        return { valid: false, message: err.message || 'Cupom inválido.' };
      }
    }
    return { valid: false, message: 'Validação de cupom Supabase indisponível.' };
  }

  async function markCouponUsed(couponCode, orderId, userId) {
    if (!couponCode) return;
    const cleanCode = couponCode.trim().toUpperCase();

    if (_supabase) {
      try {
        await _supabase
          .from('loyalty_coupons')
          .update({ status: 'used', used_at: new Date().toISOString(), order_id: orderId })
          .eq('code', cleanCode);
      } catch (e) {}
    }
  }

  async function hasCustomerPurchasedProduct(userId, productId) {
    if (!userId || !productId) return false;
    try {
      const orders = await getCustomerOrders(userId);
      if (!orders || !orders.length) return false;
      return orders.some(o => {
        if (o.status === 'cancelado') return false;
        return (o.items || []).some(item => (item.id === productId || item.productId === productId));
      });
    } catch (e) {
      console.warn('[DataStore] Erro ao checar compra do cliente:', e);
      return false;
    }
  }

  async function submitProductReview(productId, rating, comment, hasPhoto = false, photoUrl = '', userId = null, userName = '') {
    if (!userId) return { success: false, message: 'Você precisa estar logado para avaliar produtos e ganhar pontos.' };
    if (!productId || !rating) return { success: false, message: 'Produto e avaliação são obrigatórios.' };

    const hasBought = await hasCustomerPurchasedProduct(userId, productId);
    if (!hasBought) {
      return { success: false, message: 'Apenas clientes que compraram este produto podem enviar uma avaliação.' };
    }

    if (_supabase && window.SupabaseService) {
      try {
        const res = await window.SupabaseService.submitProductReview(productId, rating, comment, hasPhoto, photoUrl);
        if (res) return res;
      } catch (err) {
        return { success: false, message: err.message || 'Erro ao enviar avaliação no servidor.' };
      }
    }
    return { success: false, message: 'Serviço de avaliações Supabase indisponível.' };
  }

  async function getProductReviews(productId) {
    if (!productId) return [];
    if (_supabase && window.SupabaseService) {
      try {
        const data = await window.SupabaseService.getProductReviews(productId);
        if (Array.isArray(data) && data.length > 0) return data;
      } catch (e) {}
    }
    const all = _loadLocal(DB_KEYS.PRODUCT_REVIEWS) || [];
    return all.filter(r => r.product_id === productId && r.status === 'approved');
  }

  async function processOrderLoyaltyPoints(order, userId) {
    if (!order || !userId) return null;
    if (_supabase && window.SupabaseService) {
      try {
        const res = await window.SupabaseService.processOrderPoints(order.id, userId, order.subtotal || order.total, order.status);
        if (res) return res;
      } catch (e) {
        console.warn('[DataStore] Erro ao processar pontos do pedido via Supabase:', e);
      }
    }
    return null;
  }

  async function refundOrderLoyaltyPoints(orderId, userId) {
    if (!orderId || !userId) return;
    // Estorno de pontos de pedidos cancelados deve ser feito via operação administrativa autorizada
    console.log('[DataStore] Estorno solicitado para pedido:', orderId, 'usuário:', userId);
  }

  async function adminAdjustLoyaltyPoints(targetUserId, points, reason) {
    if (!targetUserId || !points || !reason) {
      throw new Error('Usuário, quantidade de pontos e motivo são obrigatórios.');
    }
    const numPts = parseInt(points, 10);
    if (isNaN(numPts) || numPts === 0) throw new Error('Quantidade de pontos inválida.');

    if (_supabase && window.SupabaseService) {
      try {
        const res = await window.SupabaseService.adminAdjustPoints(targetUserId, numPts, reason);
        if (res) return res;
      } catch (err) {
        throw err;
      }
    }
    throw new Error('Serviço Supabase indisponível para ajuste administrativo de saldo.');
  }

  async function adminSaveLoyaltyReward(reward) {
    if (!reward.id) reward.id = 'rew_' + Date.now();
    const rewards = await getLoyaltyRewards();
    const idx = rewards.findIndex(r => r.id === reward.id);
    if (idx >= 0) {
      rewards[idx] = { ...rewards[idx], ...reward };
    } else {
      rewards.push(reward);
    }
    _saveLocal(DB_KEYS.LOYALTY_REWARDS, rewards);

    if (_supabase) {
      try {
        await _supabase.from('loyalty_rewards').upsert([{
          id: reward.id,
          title: reward.title,
          description: reward.description || '',
          reward_type: reward.reward_type,
          discount_value: reward.discount_value,
          points_cost: reward.points_cost,
          min_order_value: reward.min_order_value || 0,
          max_discount: reward.max_discount || 0,
          validity_days: reward.validity_days || 30,
          active: reward.active !== false,
          order_num: reward.order_num || 99
        }]);
      } catch (e) {}
    }
    return reward;
  }

  async function adminDeleteLoyaltyReward(rewardId) {
    const rewards = (await getLoyaltyRewards()).filter(r => r.id !== rewardId);
    _saveLocal(DB_KEYS.LOYALTY_REWARDS, rewards);
    if (_supabase) {
      try {
        await _supabase.from('loyalty_rewards').delete().eq('id', rewardId);
      } catch (e) {}
    }
  }

  async function adminGetReviews() {
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('product_reviews').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {}
    }
    return _loadLocal(DB_KEYS.PRODUCT_REVIEWS) || [];
  }

  async function adminModerateReview(reviewId, status) {
    if (_supabase) {
      try {
        await _supabase.from('product_reviews').update({ status }).eq('id', reviewId);
      } catch (e) {}
    }
    const all = _loadLocal(DB_KEYS.PRODUCT_REVIEWS) || [];
    const rev = all.find(r => r.id === reviewId);
    if (rev) {
      rev.status = status;
      _saveLocal(DB_KEYS.PRODUCT_REVIEWS, all);
    }
    return true;
  }

  // ===== EXPORT =====
  return {
    init,
    getProducts,
    getProductById,
    getCategories,
    getSettings,
    getOrders,
    getCustomerOrders,
    hasCustomerPurchasedProduct,
    getProductTotalStock,
    getVariantStock,
    getAvailableSizesForColor,
    getAvailableColors,
    saveProduct,
    deleteProduct,
    decrementStock,
    saveCategory,
    deleteCategory,
    getFeaturedProducts,
    toggleProductFeatured,
    updateSettings,
    updateSetting,
    saveOrder,
    updateOrderStatus,
    deleteOrder,
    isStoreOpen,
    forceRefresh,
    // Loyalty methods
    getLoyaltyAccount,
    getLoyaltyTransactions,
    getLoyaltyRewards,
    getLoyaltyCoupons,
    getLoyaltyMissions,
    isUserFollowingStore,
    getStoreFollowersCount,
    claimDailyCheckin,
    followStore,
    redeemReward,
    validateCoupon,
    markCouponUsed,
    submitProductReview,
    getProductReviews,
    processOrderLoyaltyPoints,
    refundOrderLoyaltyPoints,
    adminAdjustLoyaltyPoints,
    adminSaveLoyaltyReward,
    adminDeleteLoyaltyReward,
    adminGetReviews,
    adminModerateReview
  };
})();

// ===== UTILS (shared) =====
const Utils = {
  formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  },

  formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  },

  sanitize(str) {
    if (!str) return '';
    return String(str).replace(/[<>\"']/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  decodeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  },

  normalizeCategory(str) {
    if (!str) return '';
    return Utils.decodeHtml(String(str))
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  },

  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-text">${Utils.sanitize(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
  },

  async hashPassword(password) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  /**
   * Calcula o preço com desconto
   */
  calcDiscountedPrice(price, promotion) {
    if (!promotion || !promotion.active || !promotion.discountPercent) return price;
    return price * (1 - promotion.discountPercent / 100);
  },

  /**
   * Calcula as opções de parcelamento no cartão
   */
  calculateInstallments(amount, config) {
    const cfg = config || { enabled: true, maxInstallments: 3, minInstallmentValue: 0, interestFree: true };
    if (!cfg.enabled) {
      return [{ count: 1, value: amount, text: `1x de ${this.formatCurrency(amount)} à vista` }];
    }
    const max = Math.max(1, parseInt(cfg.maxInstallments, 10) || 3);
    const minVal = parseFloat(cfg.minInstallmentValue) || 0;
    const list = [];
    for (let i = 1; i <= max; i++) {
      const val = amount / i;
      if (i > 1 && minVal > 0 && val < minVal) break;
      list.push({
        count: i,
        value: val,
        text: i === 1 
          ? `1x de ${this.formatCurrency(val)} à vista`
          : `${i}x de ${this.formatCurrency(val)} sem juros`
      });
    }
    return list;
  },

  getInstallmentSummary(amount, config) {
    const list = this.calculateInstallments(amount, config);
    if (!list || list.length <= 1) return '';
    const top = list[list.length - 1];
    return `ou até ${top.count}x de ${this.formatCurrency(top.value)} sem juros`;
  }
};

// Explicit global exports for multi-script browser environments
if (typeof window !== 'undefined') {
  window.DataStore = DataStore;
  window.Utils = Utils;
}
