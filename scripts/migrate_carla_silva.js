const https = require('https');

const SUPABASE_URL = 'https://nhcpeuwrfljlcujxnlmp.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oY3BldXdyZmxqbGN1anhubG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MzQ0OTIsImV4cCI6MjEwNjAxMDQ5Mn0.UvonxRI8rjOihlyuqCWqbtHFWpFlKE_0Qynjg5-4JyQ';

function request(method, path, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const headers = {
      'apikey': ANON_KEY,
      'Authorization': 'Bearer ' + ANON_KEY,
      'Content-Type': 'application/json',
      ...extraHeaders
    };

    const req = https.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const CATEGORIES = [
  { id: 'cat_buffet', name: 'Buffet', icon: '🎪' },
  { id: 'cat_kits', name: 'Kits Festa', icon: '🎉' },
  { id: 'cat_bolos', name: 'Bolos', icon: '🎂' },
  { id: 'cat_doces', name: 'Doces', icon: '🍬' },
  { id: 'cat_salgados', name: 'Salgados', icon: '🥟' }
];

const PRODUCTS = [
  {
    id: 'prod_buffet_01',
    name: 'Buffet Infantil Completo (50 Convidados)',
    category: 'Buffet',
    price: 1499.00,
    badge: 'Pacote 50 Pessoas',
    description: 'Buffet Infantil completo para 50 convidados (3h de festa). Inclui: Doces e salgados tradicionais, Doces Gourmet, Salgados de forno (Mini Pizza, Hambúrguer, Barquete, Mini lanches), Fritura no local, Refrigerantes, Água mineral, Suco da fruta, Descartáveis e 1 apoio de cozinha. Taxa de deslocamento a combinar.',
    image: 'assets/images/buffet_infantil.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_kit_01',
    name: 'Kit Festa 1 (1 kg Bolo + 20 Doces + 30 Salgados)',
    category: 'Kits Festa',
    price: 120.00,
    badge: 'Econômico',
    description: 'Ideal para comemorações íntimas. Inclui: 1 kg de bolo confeitado, 20 doces tradicionais, 30 salgados e Topo de bolo simples.',
    image: 'assets/images/kit_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_kit_02',
    name: 'Kit Festa 2 (1,5 kg Bolo + 30 Doces + 50 Salgados)',
    category: 'Kits Festa',
    price: 160.00,
    badge: 'Mais Pedido',
    description: 'Perfeito para celebrar em família. Inclui: 1,5 kg de bolo confeitado, 30 doces tradicionais, 50 salgados e Topo de bolo simples.',
    image: 'assets/images/kit_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_kit_03',
    name: 'Kit Festa 3 (2 kg Bolo + 50 Doces + 60 Salgados)',
    category: 'Kits Festa',
    price: 199.90,
    badge: 'Destaque',
    description: 'O preferido dos clientes! Inclui: 2 kg de bolo confeitado, 50 doces tradicionais, 60 salgados e Topo de bolo simples.',
    image: 'assets/images/kit_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_kit_04',
    name: 'Kit Festa 4 (3 kg Bolo + 80 Doces + 100 Salgados)',
    category: 'Kits Festa',
    price: 299.00,
    badge: 'Super Festa',
    description: 'Festa completa com muita fartura! Inclui: 3 kg de bolo confeitado, 80 doces tradicionais, 100 salgados e Topo de bolo simples.',
    image: 'assets/images/kit_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_bolo_1k',
    name: 'Bolo Decorado - 1 Kilo',
    category: 'Bolos',
    price: 70.00,
    badge: '1 kg',
    description: 'Bolo confeitado artesanal (1 kg). Massas: Chocolate, Brigadeiro Branco, Baunilha ou Red Velvet. Recheios: Chocolate, Prestígio, Bem Casado, Ninho, Brigadeiro Branco ou Oreo.',
    image: 'assets/images/bolo_decorado.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_bolo_2k',
    name: 'Bolo Decorado - 2 Kilos',
    category: 'Bolos',
    price: 140.00,
    badge: 'Mais Vendido',
    description: 'Bolo confeitado artesanal (2 kg - serve aprox. 20 fatias). Massas: Chocolate, Brigadeiro Branco, Baunilha ou Red Velvet. Recheios: Chocolate, Prestígio, Bem Casado, Ninho, Brigadeiro Branco ou Oreo.',
    image: 'assets/images/bolo_decorado.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_bolo_3k',
    name: 'Bolo Decorado - 3 Kilos',
    category: 'Bolos',
    price: 210.00,
    badge: '3 kg',
    description: 'Bolo confeitado artesanal (3 kg - serve aprox. 30 fatias). Massas: Chocolate, Brigadeiro Branco, Baunilha ou Red Velvet. Recheios: Chocolate, Prestígio, Bem Casado, Ninho, Brigadeiro Branco ou Oreo.',
    image: 'assets/images/bolo_decorado.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_bolo_4k',
    name: 'Bolo Decorado - 4 Kilos',
    category: 'Bolos',
    price: 280.00,
    badge: '4 kg',
    description: 'Bolo confeitado sob medida (4 kg - serve aprox. 40 fatias). Massas e recheios nobres à sua escolha.',
    image: 'assets/images/bolo_decorado.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_bolo_5k',
    name: 'Bolo Decorado - 5 Kilos',
    category: 'Bolos',
    price: 350.00,
    badge: '5 kg',
    description: 'Bolo confeitado sob medida (5 kg - serve aprox. 50 fatias). Perfeito para eventos e celebrações.',
    image: 'assets/images/bolo_decorado.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_bolo_8k',
    name: 'Bolo Decorado - 8 Kilos',
    category: 'Bolos',
    price: 560.00,
    badge: '8 kg',
    description: 'Bolo monumental para grandes festas (8 kg - serve aprox. 80 fatias). Apresentação requintada e recheio generoso.',
    image: 'assets/images/bolo_decorado.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_bolo_10k',
    name: 'Bolo Decorado - 10 Kilos',
    category: 'Bolos',
    price: 700.00,
    badge: '10 kg',
    description: 'Bolo gigante de 10 kg (serve aprox. 100 fatias). Ideal para casamentos, formaturas e grandes eventos.',
    image: 'assets/images/bolo_decorado.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_doce_trad_un',
    name: 'Doces Tradicionais (Unidade)',
    category: 'Doces',
    price: 0.80,
    badge: 'R$ 0,80 un',
    description: 'Docinho tradicional de festa (unidade). Sabores: Brigadeiro, Beijinho, Bem Casado, Moranguinho, Crespinho e Colorido.',
    image: 'assets/images/doces_gourmet.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_doce_trad_cento',
    name: 'Cento de Doces Tradicionais (100 un)',
    category: 'Doces',
    price: 80.00,
    badge: 'Cento 100 un',
    description: 'Caixa com 100 docinhos tradicionais: Brigadeiro, Beijinho, Bem Casado, Moranguinho, Crespinho e Colorido.',
    image: 'assets/images/doces_gourmet.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_doce_esp_un',
    name: 'Doces Especiais Gourmet (Unidade)',
    category: 'Doces',
    price: 2.00,
    badge: 'Gourmet',
    description: 'Docinho gourmet especial (unidade). Sabores: Brigadeiro Gourmet c/ Nutella, Ferrero Rocher c/ Nutella, Ninho com Nutella, Churros c/ Doce de Leite, Surpresa de Uva e Tortinha Doce.',
    image: 'assets/images/doces_gourmet.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_doce_esp_cento',
    name: 'Cento de Doces Especiais Gourmet (100 un)',
    category: 'Doces',
    price: 200.00,
    badge: 'Cento Gourmet',
    description: 'Caixa com 100 doces finos gourmet: Ninho com Nutella, Brigadeiro Gourmet, Ferrero Rocher, Churros e Tortinha Doce.',
    image: 'assets/images/doces_gourmet.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_salg_frito_un',
    name: 'Salgados Fritos Tradicionais (Unidade)',
    category: 'Salgados',
    price: 0.80,
    badge: 'R$ 0,80 un',
    description: 'Salgadinho frito crocante (unidade). Sabores: Coxinha, Bolinho de Queijo, Croquete de Calabresa, Risole de Pizza, Bolinho de Charque e Enroladinho de Salsicha.',
    image: 'assets/images/salgados_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_salg_frito_cento',
    name: 'Cento de Salgados Fritos (100 un)',
    category: 'Salgados',
    price: 80.00,
    badge: 'Cento 100 un',
    description: 'Cento com 100 salgadinhos fritos quentinhos e sequinhos: Coxinha, Bolinho de Queijo, Croquete de Calabresa, Risole de Pizza, Bolinho de Charque e Enroladinho de Salsicha.',
    image: 'assets/images/salgados_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_salg_pizza',
    name: 'Mini Pizza de Forno (Unidade)',
    category: 'Salgados',
    price: 1.50,
    badge: 'De Forno',
    description: 'Mini pizza assada de forno com molho de tomate caseiro, queijo derretido e tempero especial.',
    image: 'assets/images/salgados_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_salg_burguer',
    name: 'Mini Hambúrguer Artesanal (Unidade)',
    category: 'Salgados',
    price: 2.50,
    badge: 'De Forno',
    description: 'Mini hambúrguer artesanal no pão com gergelim, carne suculenta e queijo derretido. O preferido das crianças!',
    image: 'assets/images/salgados_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_salg_barquete',
    name: 'Barquete Recheada (Unidade)',
    category: 'Salgados',
    price: 1.20,
    badge: 'De Forno',
    description: 'Barquete crocante recheada com patê especial decorado, perfeita para recepções e buffets.',
    image: 'assets/images/salgados_festa.jpg',
    active: true,
    in_stock: true,
    promotion: { active: false, discountPercent: 0 }
  }
];

const SETTINGS = {
  id: 'main',
  store_name: 'Carla Silva Buffet',
  store_tagline: 'Buffet Infantil, Bolos & Doces Artesanais',
  store_logo_emoji: '🧁',
  store_logo_image: '',
  theme_color: '#D81B60',
  announcement_bar: {
    active: true,
    text: '🎉 Encomendas abertas! Bolos por kg, Kits Festa, Salgados, Doces Gourmet e Buffet Infantil Completo!'
  },
  hero: {
    emoji: '🧁',
    title: 'Carla Silva Buffet & Confeitaria',
    subtitle: 'Tudo para sua festa ser inesquecível! Bolos confeitados por quilo, kits festa práticos, doces finos, salgados crocantes e buffet infantil completo.',
    ctaText: '✨ Ver Cardápio & Encomendar'
  },
  about: {
    active: true,
    title: 'Carla Silva Buffet',
    subtitle: 'Doces memórias e sabores inesquecíveis para o seu evento',
    text: 'No Carla Silva Buffet, cada comemoração é tratada como única e especial. Trabalhamos com ingredientes de primeira linha, bolos sob medida com massas e recheios generosos, kits festa prontinhos para celebrar, salgados crocantes fritos na hora ou assados de forno, e nosso serviço completo de Buffet Infantil com 3h de festa e equipe de apoio.',
    features: [
      { icon: '🎪', title: 'Buffet Infantil', desc: 'Estrutura completa com 3h de festa, fritura no local e apoio' },
      { icon: '🎂', title: 'Bolos por Quilo', desc: 'Massas nobres e recheios generosos feitos sob medida' },
      { icon: '🎉', title: 'Kits Festa Prontos', desc: 'Bolo confeitado, doces, salgados e topo de bolo inclusos' },
      { icon: '🥟', title: 'Doces & Salgados', desc: 'Doces gourmet com Nutella e salgados de forno especiais' }
    ]
  },
  delivery: {
    deliveryEnabled: true,
    deliveryFee: 15.00,
    freeDeliveryThreshold: 200.00,
    estimatedTime: 'Consulte data e horário',
    pickupEnabled: true,
    pickupAddress: 'Retirada com horário agendado com a Carla Silva',
    pickupEstimate: 'Pronto na data agendada'
  },
  whatsapp_number: '5581998723560',
  contact_phone: '(81) 99872-3560',
  instagram: '@Carlasilvacakes2',
  address: 'Carla Silva Buffet & Confeitaria - Atendimento e Encomendas',
  footer_copyright: '© 2026 Carla Silva Buffet. Todos os direitos reservados.',
  payment_methods: [
    { id: 'pix', name: 'Pix', icon: '📱', active: true },
    { id: 'dinheiro', name: 'Dinheiro', icon: '💵', active: true },
    { id: 'credito', name: 'Cartão Crédito', icon: '💳', active: true },
    { id: 'debito', name: 'Cartão Débito', icon: '💳', active: true },
    { id: 'transferencia', name: 'Transferência', icon: '🏦', active: false }
  ],
  pix_details: {
    keyType: 'Celular',
    key: '(81) 99872-3560',
    receiverName: 'Carla Silva Buffet',
    instructions: 'Faça o Pix para a chave celular acima e envie o comprovante pelo WhatsApp (81) 99872-3560 para confirmar sua encomenda.'
  },
  store_open: true,
  closed_custom_message: 'Estamos em horário de preparação de encomendas. Mande uma mensagem pelo WhatsApp para agendar sua data!',
  operating_hours: {
    segunda: { open: '08:00', close: '19:00', active: true },
    terca: { open: '08:00', close: '19:00', active: true },
    quarta: { open: '08:00', close: '19:00', active: true },
    quinta: { open: '08:00', close: '19:00', active: true },
    sexta: { open: '08:00', close: '19:00', active: true },
    sabado: { open: '08:00', close: '18:00', active: true },
    domingo: { open: '08:00', close: '14:00', active: true }
  },
  closures: [],
  admin_password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
};

async function main() {
  console.log('--- 1. Atualizando Categorias no Supabase ---');
  // Upsert categories
  for (const cat of CATEGORIES) {
    const res = await request('POST', '/rest/v1/categories', cat, {
      'Prefer': 'resolution=merge-duplicates'
    });
    console.log(`Categoria [${cat.name}]: status ${res.status}`);
  }

  // Delete old categories not in CATEGORIES
  const currentCatsRes = await request('GET', '/rest/v1/categories?select=id,name');
  if (Array.isArray(currentCatsRes.data)) {
    const validIds = new Set(CATEGORIES.map(c => c.id));
    for (const c of currentCatsRes.data) {
      if (!validIds.has(c.id)) {
        console.log(`Removendo categoria antiga [${c.name}]...`);
        await request('DELETE', `/rest/v1/categories?id=eq.${c.id}`);
      }
    }
  }

  console.log('\n--- 2. Atualizando Produtos no Supabase ---');
  // Upsert products
  for (const prod of PRODUCTS) {
    const res = await request('POST', '/rest/v1/products', prod, {
      'Prefer': 'resolution=merge-duplicates'
    });
    console.log(`Produto [${prod.name}]: status ${res.status}`);
  }

  // Delete old products not in PRODUCTS
  const currentProdsRes = await request('GET', '/rest/v1/products?select=id,name');
  if (Array.isArray(currentProdsRes.data)) {
    const validProdIds = new Set(PRODUCTS.map(p => p.id));
    for (const p of currentProdsRes.data) {
      if (!validProdIds.has(p.id)) {
        console.log(`Removendo produto antigo [${p.name}]...`);
        await request('DELETE', `/rest/v1/products?id=eq.${p.id}`);
      }
    }
  }

  console.log('\n--- 3. Atualizando Configurações da Loja no Supabase ---');
  delete SETTINGS.admin_password;
  const setRes = await request('PATCH', '/rest/v1/settings?id=eq.main', SETTINGS, {
    'Prefer': 'return=representation'
  });
  console.log(`Settings: status ${setRes.status}`);

  console.log('\n=== MIGRAÇÃO CONCLUÍDA COM SUCESSO! ===');
}

main().catch(console.error);
