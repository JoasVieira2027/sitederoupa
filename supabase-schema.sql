-- ============================================================
-- SUPABASE POSTGRESQL SCHEMA - LOJA DE ROUPAS
-- ============================================================
-- Execute todo este script no SQL Editor do Supabase.
-- Cria todas as tabelas para loja de roupas com controle
-- completo de estoque por tamanho, cor e quantidade.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE: CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '👗',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABLE: PRODUCTS (Loja de roupas com variantes)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    image TEXT,
    category TEXT NOT NULL,
    badge TEXT,
    active BOOLEAN DEFAULT true,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    -- Variantes: Array de {color, colorHex, image, sizes: [{size, qty}]}
    variants JSONB DEFAULT '[]'::jsonb,
    -- Promoção
    promotion JSONB DEFAULT '{"active": false, "discountPercent": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Foreign Key: Product Category to Categories(name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_category'
    ) THEN
        ALTER TABLE public.products
        ADD CONSTRAINT fk_products_category
        FOREIGN KEY (category)
        REFERENCES public.categories(name)
        ON UPDATE CASCADE
        ON DELETE RESTRICT;
    END IF;
END $$;

-- 4. TABLE: SETTINGS (Configurações gerais)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    store_name TEXT DEFAULT 'Fit Vibe Activewear',
    store_tagline TEXT DEFAULT 'Roupas Fitness de Alta Performance',
    store_logo_emoji TEXT DEFAULT '⚡',
    store_logo_image TEXT DEFAULT '',
    theme_color TEXT DEFAULT '#059669',
    announcement_bar JSONB DEFAULT '{"active": true, "text": "⚡ FRETE GRÁTIS nas compras acima de R$ 199 | Peças Zero Transparência!"}'::jsonb,
    featured_collection JSONB DEFAULT '{"active": true, "title": "Nova Coleção 2026", "subtitle": "Lançamentos e peças exclusivas com tecnologia seamless e alta compressão"}'::jsonb,
    hero JSONB DEFAULT '{"emoji": "⚡", "title": "Treine com Estilo, Supere Limites", "subtitle": "Activewear premium com modelagem anatômica, alta compressão e zero transparência para seu melhor desempenho.", "ctaText": "⚡ Ver Coleção Fitness"}'::jsonb,
    about JSONB DEFAULT '{"active": true, "title": "Tecnologia, Conforto & Performance", "subtitle": "Feito para mover o seu melhor", "text": "A Fit Vibe desenvolve peças esportivas com tecidos nobres e tecnologia têxtil de ponta. Modelagens exclusivas que valorizam a silhueta, oferecem sustentação máxima e acompanham cada movimento do seu dia com total segurança.", "features": [{"desc": "Gramatura reforçada para agachamentos sem medo", "icon": "🛡️", "title": "Zero Transparência"}, {"desc": "Respirabilidade máxima que evapora o suor rapidamente", "icon": "💨", "title": "Tecnologia Dry-Fit"}, {"desc": "Cós anatômico duplo que não enrola durante o treino", "icon": "⚡", "title": "Alta Compressão"}, {"desc": "Primeira troca 100% grátis e sem burocracia", "icon": "🔄", "title": "Troca Fácil"}]}'::jsonb,
    delivery JSONB DEFAULT '{"deliveryEnabled": true, "deliveryFee": 15.00, "freeDeliveryThreshold": 199.00, "estimatedTime": "2 a 5 dias úteis", "pickupEnabled": true, "pickupAddress": "Consulte o ponto de retirada pelo WhatsApp", "pickupEstimate": "Pronto em até 2 horas"}'::jsonb,
    whatsapp_number TEXT DEFAULT '5511999999999',
    contact_phone TEXT DEFAULT '(11) 99999-9999',
    instagram TEXT DEFAULT '@fitvibe.activewear',
    address TEXT DEFAULT 'Rua do Fitness, 120 - São Paulo, SP',
    footer_copyright TEXT DEFAULT '© 2026 Fit Vibe Activewear. Todos os direitos reservados.',
    payment_methods JSONB DEFAULT '[{"active": true, "icon": "📱", "id": "pix", "name": "Pix (Aprovação Imediata)"}, {"active": true, "icon": "💳", "id": "credito", "name": "Cartão de Crédito"}, {"active": true, "icon": "💳", "id": "debito", "name": "Cartão de Débito"}, {"active": true, "icon": "💵", "id": "dinheiro", "name": "Dinheiro na Entrega"}]'::jsonb,
    pix_details JSONB DEFAULT '{"key": "", "keyType": "Celular", "receiverName": "Fit Vibe Moda Fitness", "instructions": "Faça o Pix e envie o comprovante pelo WhatsApp para envio imediato!"}'::jsonb,
    store_open BOOLEAN DEFAULT true,
    closed_custom_message TEXT DEFAULT 'Estamos fora do horário de atendimento. Deixe sua mensagem no WhatsApp que responderemos rapidinho!',
    operating_hours JSONB DEFAULT '{"domingo": {"open": "00:00", "close": "00:00", "active": false}, "quarta": {"open": "08:00", "close": "20:00", "active": true}, "quinta": {"open": "08:00", "close": "20:00", "active": true}, "sabado": {"open": "08:00", "close": "18:00", "active": true}, "segunda": {"open": "08:00", "close": "20:00", "active": true}, "sexta": {"open": "08:00", "close": "20:00", "active": true}, "terca": {"open": "08:00", "close": "20:00", "active": true}}'::jsonb,
    closures JSONB DEFAULT '[]'::jsonb,
    -- Tamanhos disponíveis na loja (configurável pelo admin)
    available_sizes JSONB DEFAULT '["PP", "P", "M", "G", "GG"]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABLE: ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL,
    delivery_type TEXT NOT NULL DEFAULT 'delivery',
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'novo',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Limpa políticas antigas
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all on categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Allow all on products" ON public.products;
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all on settings" ON public.settings;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;

-- Políticas abertas (compatíveis com painel admin via senha do proprietário)
CREATE POLICY "Allow all on categories" ON public.categories FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON public.products FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on settings" ON public.settings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON public.orders FOR ALL TO public USING (true) WITH CHECK (true);

-- ============================================================
-- 7. REALTIME REPLICATION
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'categories') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'settings') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;

-- ============================================================
-- 8. SEED DATA - Categorias iniciais para loja de roupas fitness
-- ============================================================
INSERT INTO public.categories (id, name, icon) VALUES
    ('cat_leggings', 'Leggings', '👖'),
    ('cat_tops', 'Tops & Croppeds', '🎽'),
    ('cat_conjuntos', 'Conjuntos', '⚡'),
    ('cat_shorts', 'Shorts & Bermudas', '🩳'),
    ('cat_macacoes', 'Macacões', '🧘‍♀️'),
    ('cat_acessorios', 'Acessórios', '🎒')
ON CONFLICT (id) DO NOTHING;

-- Produtos de exemplo com variantes fitness (cores + tamanhos + quantidade)
INSERT INTO public.products (id, name, description, price, image, category, badge, active, in_stock, variants, promotion) VALUES
    (
        'prod_legging_sculpt',
        'Legging Sculpt Sem Costura Cós Alto',
        'Legging com tecnologia seamless (sem costura lateral), compressão ideal que modela e empina o bumbum sem apertar. Cós alto duplo anatômico que não enrola durante o agachamento ou corrida. Tecido respirável e 100% à prova de agachamento.',
        139.90,
        'assets/images/legging_fitness.jpg',
        'Leggings',
        'Zero Transparência',
        true,
        true,
        '[
            {"color": "Grafite Mescla", "colorHex": "#4A4A4A", "sizes": [{"size": "PP", "qty": 4}, {"size": "P", "qty": 8}, {"size": "M", "qty": 10}, {"size": "G", "qty": 6}, {"size": "GG", "qty": 3}]},
            {"color": "Preto Ônix", "colorHex": "#1E1E1E", "sizes": [{"size": "PP", "qty": 5}, {"size": "P", "qty": 12}, {"size": "M", "qty": 14}, {"size": "G", "qty": 8}, {"size": "GG", "qty": 4}]},
            {"color": "Verde Militar", "colorHex": "#3A4D39", "sizes": [{"size": "P", "qty": 6}, {"size": "M", "qty": 8}, {"size": "G", "qty": 5}]}
        ]'::jsonb,
        '{"active": true, "discountPercent": 10}'::jsonb
    ),
    (
        'prod_top_cross',
        'Top Fitness Alta Sustentação Alças Cruzadas',
        'Top fitness projetado para treinos de médio e alto impacto. Costas com alças cruzadas que distribuem o peso e garantem total mobilidade para membros superiores. Acompanha bojo removível e forro interno antibacteriano.',
        79.90,
        'assets/images/top_fitness.jpg',
        'Tops & Croppeds',
        'Alta Sustentação',
        true,
        true,
        '[
            {"color": "Grafite Mescla", "colorHex": "#4A4A4A", "sizes": [{"size": "PP", "qty": 5}, {"size": "P", "qty": 10}, {"size": "M", "qty": 9}, {"size": "G", "qty": 5}, {"size": "GG", "qty": 2}]},
            {"color": "Preto Ônix", "colorHex": "#1E1E1E", "sizes": [{"size": "P", "qty": 8}, {"size": "M", "qty": 10}, {"size": "G", "qty": 6}]},
            {"color": "Vinho Borgonha", "colorHex": "#5A1827", "sizes": [{"size": "P", "qty": 4}, {"size": "M", "qty": 6}, {"size": "G", "qty": 3}]}
        ]'::jsonb,
        '{"active": false, "discountPercent": 0}'::jsonb
    ),
    (
        'prod_conjunto_active',
        'Conjunto Activewear Seamless Wave (Top + Biker)',
        'Conjunto fitness completo com top estruturado e short biker de alta compressão. Confeccionado em poliamida premium com elastano, toque gelado, secagem rápida e proteção UV50+. Combinação perfeita de estilo e praticidade para o treino.',
        189.90,
        'assets/images/conjunto_fitness.jpg',
        'Conjuntos',
        'Mais Vendido',
        true,
        true,
        '[
            {"color": "Verde Oliva", "colorHex": "#556B2F", "sizes": [{"size": "P", "qty": 6}, {"size": "M", "qty": 9}, {"size": "G", "qty": 5}, {"size": "GG", "qty": 2}]},
            {"color": "Preto Carbono", "colorHex": "#1A1A1A", "sizes": [{"size": "P", "qty": 7}, {"size": "M", "qty": 8}, {"size": "G", "qty": 4}]},
            {"color": "Terracota", "colorHex": "#A0522D", "sizes": [{"size": "P", "qty": 3}, {"size": "M", "qty": 5}, {"size": "G", "qty": 2}]}
        ]'::jsonb,
        '{"active": false, "discountPercent": 0}'::jsonb
    ),
    (
        'prod_short_biker',
        'Short Biker Compressão com Bolso Lateral para Celular',
        'Bermuda ciclista fitness com bolso lateral profundo perfeito para celular, chave ou documentos. Comprimento meia coxa que não sobe ao caminhar, correr ou pedalar. Costuras reforçadas planas (flatlock) que não marcam a pele.',
        99.90,
        'assets/images/short_fitness.jpg',
        'Shorts & Bermudas',
        'Com Bolso',
        true,
        true,
        '[
            {"color": "Preto Ônix", "colorHex": "#1E1E1E", "sizes": [{"size": "PP", "qty": 4}, {"size": "P", "qty": 10}, {"size": "M", "qty": 12}, {"size": "G", "qty": 8}, {"size": "GG", "qty": 4}]},
            {"color": "Azul Marinho", "colorHex": "#1B263B", "sizes": [{"size": "P", "qty": 5}, {"size": "M", "qty": 6}, {"size": "G", "qty": 4}]},
            {"color": "Chumbo", "colorHex": "#3D3D3D", "sizes": [{"size": "P", "qty": 4}, {"size": "M", "qty": 5}, {"size": "G", "qty": 3}]}
        ]'::jsonb,
        '{"active": true, "discountPercent": 15}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- Settings padrão
INSERT INTO public.settings (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. STORAGE BUCKET PARA FOTOS DE PRODUTOS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow all on storage products" ON storage.objects;
CREATE POLICY "Allow all on storage products" ON storage.objects FOR ALL TO public
USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');
