-- ============================================================
-- SUPABASE MIGRATION: SISTEMA COMPLETO DE FIDELIDADE & PONTOS
-- ============================================================
-- Execute este script no SQL Editor do Supabase (Dashboard > SQL Editor)
-- Não apaga dados existentes. Idempotente e transacional.
-- ============================================================

-- 1. TABELA: CONTAS DE FIDELIDADE (LOYALTY_ACCOUNTS)
CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    points_balance INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    lifetime_points INT NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
    checkin_streak INT NOT NULL DEFAULT 0 CHECK (checkin_streak >= 0),
    last_checkin_date DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_user_id ON public.loyalty_accounts(user_id);

-- 2. TABELA: HISTÓRICO DE TRANSAÇÕES AUDITÁVEL (LOYALTY_TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'review', 'checkin', 'follow', 'mission', 'redemption', 'adjustment', 'refund', 'expiration')),
    points INT NOT NULL, -- Positivo (crédito) ou Negativo (débito)
    reference_type TEXT, -- 'order', 'checkin', 'follow', 'mission', 'review', 'manual'
    reference_id TEXT,   -- Código do pedido, data do checkin, id da missão, etc.
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON public.loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON public.loyalty_transactions(created_at DESC);

-- Índice único parcial para garantir IDEMPOTÊNCIA (impossível ganhar pontos duas vezes pela mesma ação)
CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_tx_idempotent
    ON public.loyalty_transactions (user_id, reference_type, reference_id)
    WHERE reference_type IN ('order', 'checkin', 'follow', 'mission', 'review');

-- 3. TABELA: REGISTRO DE SEGUIR A LOJA (STORE_FOLLOWS)
CREATE TABLE IF NOT EXISTS public.store_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_store_follows_user_id ON public.store_follows(user_id);

-- 4. TABELA: RECOMPENSAS DO PROGRAMA (LOYALTY_REWARDS)
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    reward_type TEXT NOT NULL CHECK (reward_type IN ('percent', 'fixed', 'free_shipping')),
    discount_value NUMERIC NOT NULL DEFAULT 0,
    points_cost INT NOT NULL CHECK (points_cost > 0),
    min_order_value NUMERIC DEFAULT 0,
    max_discount NUMERIC DEFAULT 0,
    validity_days INT DEFAULT 30,
    active BOOLEAN DEFAULT TRUE,
    order_num INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABELA: CUPONS RESGATADOS (LOYALTY_COUPONS)
CREATE TABLE IF NOT EXISTS public.loyalty_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES public.loyalty_rewards(id) ON DELETE SET NULL,
    code TEXT NOT NULL UNIQUE,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('percent', 'fixed', 'free_shipping')),
    discount_value NUMERIC NOT NULL DEFAULT 0,
    min_order_value NUMERIC DEFAULT 0,
    max_discount NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    used_order_id TEXT,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_loyalty_coupons_user_id ON public.loyalty_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_coupons_code ON public.loyalty_coupons(code);

-- 6. TABELA: MISSÕES DO PROGRAMA (LOYALTY_MISSIONS)
CREATE TABLE IF NOT EXISTS public.loyalty_missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    reward_points INT NOT NULL CHECK (reward_points > 0),
    mission_type TEXT NOT NULL CHECK (mission_type IN ('composite', 'checkin_count', 'purchase_count', 'review_count', 'follow_store')),
    target_count INT NOT NULL DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    order_num INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. TABELA: PROGRESSO DO USUÁRIO NAS MISSÕES (LOYALTY_USER_MISSIONS)
CREATE TABLE IF NOT EXISTS public.loyalty_user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id TEXT NOT NULL REFERENCES public.loyalty_missions(id) ON DELETE CASCADE,
    current_progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_transaction_id UUID REFERENCES public.loyalty_transactions(id),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_user_missions_user ON public.loyalty_user_missions(user_id);

-- 8. TABELA: AVALIAÇÕES DE PRODUTOS (PRODUCT_REVIEWS)
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    order_id TEXT,
    author_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    has_photo BOOLEAN DEFAULT FALSE,
    photo_url TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON public.product_reviews(user_id);

-- ============================================================
-- 9. POPULAR DADOS INICIAIS DE RECOMPENSAS E MISSÕES
-- ============================================================
INSERT INTO public.loyalty_rewards (title, description, reward_type, discount_value, points_cost, min_order_value, max_discount, validity_days, active, order_num)
VALUES
    ('5% OFF', 'Em qualquer pedido da loja', 'percent', 5, 300, 0, 50, 30, true, 1),
    ('R$ 5 OFF', 'Desconto direto no checkout', 'fixed', 5, 300, 40, 5, 30, true, 2),
    ('10% OFF', 'Válido em qualquer pedido', 'percent', 10, 700, 60, 100, 30, true, 3),
    ('R$ 10 OFF', 'Desconto direto no checkout', 'fixed', 10, 700, 80, 10, 30, true, 4),
    ('Frete Grátis', 'Frete grátis em 1 pedido', 'free_shipping', 0, 1000, 50, 35, 30, true, 5),
    ('R$ 20 OFF', 'Em compras acima de R$ 120', 'fixed', 20, 1400, 120, 20, 30, true, 6)
ON CONFLICT DO NOTHING;

INSERT INTO public.loyalty_missions (id, title, description, reward_points, mission_type, target_count, active, order_num)
VALUES
    ('mission_unlock_bonus', 'Desbloqueie seu bônus', 'Complete 3 ações: check-in, avaliar compra e comprar novamente', 300, 'composite', 3, true, 1),
    ('mission_loyal_buyer', 'Comprador fiel', 'Compre 3 vezes na loja e ganhe 500 pontos', 500, 'purchase_count', 3, true, 2),
    ('mission_first_purchase', 'Primeira Compra', 'Faça seu primeiro pedido e ganhe 100 pontos', 100, 'purchase_count', 1, true, 3),
    ('mission_reviewer', 'Avaliador Oficial', 'Envie avaliações de 3 peças e ganhe 150 pontos', 150, 'review_count', 3, true, 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS) RIGOROSO
-- ============================================================
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- loyalty_accounts: Usuário autenticado consulta apenas sua conta
DROP POLICY IF EXISTS "Users can view own loyalty account" ON public.loyalty_accounts;
CREATE POLICY "Users can view own loyalty account"
    ON public.loyalty_accounts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- loyalty_transactions: Usuário autenticado consulta apenas suas transações
DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Users can view own loyalty transactions"
    ON public.loyalty_transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- store_follows: Usuário consulta seus follows
DROP POLICY IF EXISTS "Users can view own follows" ON public.store_follows;
CREATE POLICY "Users can view own follows"
    ON public.store_follows FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- loyalty_rewards: Catálogo público de recompensas ativas
DROP POLICY IF EXISTS "Public can view active rewards" ON public.loyalty_rewards;
CREATE POLICY "Public can view active rewards"
    ON public.loyalty_rewards FOR SELECT
    TO public
    USING (active = true);

-- loyalty_coupons: Usuário autenticado consulta apenas seus cupons
DROP POLICY IF EXISTS "Users can view own coupons" ON public.loyalty_coupons;
CREATE POLICY "Users can view own coupons"
    ON public.loyalty_coupons FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- loyalty_missions: Catálogo público de missões
DROP POLICY IF EXISTS "Public can view active missions" ON public.loyalty_missions;
CREATE POLICY "Public can view active missions"
    ON public.loyalty_missions FOR SELECT
    TO public
    USING (active = true);

-- loyalty_user_missions: Usuário consulta apenas suas missões
DROP POLICY IF EXISTS "Users can view own user missions" ON public.loyalty_user_missions;
CREATE POLICY "Users can view own user missions"
    ON public.loyalty_user_missions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- product_reviews: Avaliações aprovadas são públicas
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.product_reviews;
CREATE POLICY "Public can view approved reviews"
    ON public.product_reviews FOR SELECT
    TO public
    USING (status = 'approved');

-- Nota de Segurança: INSERT, UPDATE e DELETE em loyalty_accounts, loyalty_transactions
-- e loyalty_coupons são estritamente proibidos para clientes diretos.
-- Todas as mutações ocorrem exclusivamente através das funções transacionais SECURITY DEFINER abaixo.

-- ============================================================
-- 11. FUNÇÕES ATÔMICAS & PROCEDURES TRANSACIONAIS (RPC)
-- ============================================================

-- Helper: Obter ou criar conta de fidelidade do usuário
CREATE OR REPLACE FUNCTION public.get_or_create_loyalty_account(p_user_id UUID)
RETURNS public.loyalty_accounts AS $$
DECLARE
    v_account public.loyalty_accounts;
BEGIN
    SELECT * INTO v_account FROM public.loyalty_accounts WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        INSERT INTO public.loyalty_accounts (user_id, points_balance, lifetime_points, checkin_streak, created_at, updated_at)
        VALUES (p_user_id, 0, 0, 0, NOW(), NOW())
        RETURNING * INTO v_account;
    END IF;
    RETURN v_account;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.1 CHECK-IN DIÁRIO ATÔMICO
CREATE OR REPLACE FUNCTION public.loyalty_claim_daily_checkin()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_account public.loyalty_accounts;
    v_today DATE;
    v_new_streak INT;
    v_points INT;
    v_streak_points INT[] := ARRAY[10, 15, 20, 25, 30, 35, 40];
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado.');
    END IF;

    -- Data oficial da loja no fuso horário de Brasília/Recife
    v_today := (NOW() AT TIME ZONE 'America/Recife')::DATE;

    -- Obter conta com lock pessimista
    v_account := public.get_or_create_loyalty_account(v_user_id);

    -- Verificar se já realizou check-in hoje
    IF v_account.last_checkin_date = v_today THEN
        RETURN jsonb_build_object(
            'success', false,
            'already_done', true,
            'message', 'Check-in já realizado hoje! Volte amanhã para continuar sua sequência.',
            'streak', v_account.checkin_streak,
            'points_balance', v_account.points_balance
        );
    END IF;

    -- Calcular sequência de dias
    IF v_account.last_checkin_date = v_today - 1 THEN
        v_new_streak := (v_account.checkin_streak % 7) + 1;
    ELSE
        -- Perdeu a sequência de dias contínuos
        v_new_streak := 1;
    END IF;

    -- Pontos correspondentes ao dia da sequência (D1..D7)
    v_points := v_streak_points[v_new_streak];

    -- Atualizar saldo atomicamente
    UPDATE public.loyalty_accounts
    SET points_balance = points_balance + v_points,
        lifetime_points = lifetime_points + v_points,
        checkin_streak = v_new_streak,
        last_checkin_date = v_today,
        updated_at = NOW()
    WHERE id = v_account.id;

    -- Registrar transação no extrato auditável (com idempotência garantida por índice único)
    INSERT INTO public.loyalty_transactions (user_id, type, points, reference_type, reference_id, description, created_at)
    VALUES (v_user_id, 'checkin', v_points, 'checkin', v_today::TEXT, 'Check-in diário • Dia ' || v_new_streak || ' da sequência', NOW());

    -- Atualizar progresso em missões de check-in
    INSERT INTO public.loyalty_user_missions (user_id, mission_id, current_progress, created_at)
    VALUES (v_user_id, 'mission_unlock_bonus', 1, NOW())
    ON CONFLICT (user_id, mission_id) DO UPDATE
    SET current_progress = LEAST(public.loyalty_user_missions.current_progress + 1, 3);

    RETURN jsonb_build_object(
        'success', true,
        'points_awarded', v_points,
        'new_balance', v_account.points_balance + v_points,
        'streak', v_new_streak,
        'day', v_new_streak,
        'message', 'Check-in realizado com sucesso! Você ganhou +' || v_points || ' pontos!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.2 SEGUIR LOJA ATÔMICO
CREATE OR REPLACE FUNCTION public.loyalty_follow_store()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_account public.loyalty_accounts;
    v_points INT := 50;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado.');
    END IF;

    -- Verificar se já seguiu anteriormente
    IF EXISTS (SELECT 1 FROM public.store_follows WHERE user_id = v_user_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'already_followed', true,
            'message', 'Você já é uma seguidora oficial da Donna Fitness PE!'
        );
    END IF;

    -- Inserir registro de seguidor
    INSERT INTO public.store_follows (user_id, created_at)
    VALUES (v_user_id, NOW());

    -- Atualizar saldo
    v_account := public.get_or_create_loyalty_account(v_user_id);
    UPDATE public.loyalty_accounts
    SET points_balance = points_balance + v_points,
        lifetime_points = lifetime_points + v_points,
        updated_at = NOW()
    WHERE id = v_account.id;

    -- Registrar transação
    INSERT INTO public.loyalty_transactions (user_id, type, points, reference_type, reference_id, description, created_at)
    VALUES (v_user_id, 'follow', v_points, 'follow', 'follow_store', 'Bônus por seguir a Donna Fitness PE', NOW());

    RETURN jsonb_build_object(
        'success', true,
        'points_awarded', v_points,
        'new_balance', v_account.points_balance + v_points,
        'message', 'Parabéns! Você ganhou +50 pontos por seguir nossa loja!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.3 RESGATE DE RECOMPENSA COM GERAÇÃO ATÔMICA DE CUPOM
CREATE OR REPLACE FUNCTION public.loyalty_redeem_reward(p_reward_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_reward public.loyalty_rewards;
    v_account public.loyalty_accounts;
    v_coupon_code TEXT;
    v_coupon_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado.');
    END IF;

    -- Lock pessimista na recompensa
    SELECT * INTO v_reward FROM public.loyalty_rewards WHERE id = p_reward_id FOR UPDATE;
    IF NOT FOUND OR v_reward.active = FALSE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Recompensa indisponível ou inativa.');
    END IF;

    -- Lock pessimista na conta de fidelidade
    SELECT * INTO v_account FROM public.loyalty_accounts WHERE user_id = v_user_id FOR UPDATE;
    IF NOT FOUND OR v_account.points_balance < v_reward.points_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Saldo insuficiente. Você tem ' || COALESCE(v_account.points_balance, 0) || ' pontos, mas são necessários ' || v_reward.points_cost || ' pontos.'
        );
    END IF;

    -- Gerar código de cupom único imprevisível (ex: LOY-7X9K2B)
    LOOP
        v_coupon_code := 'LOY-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.loyalty_coupons WHERE code = v_coupon_code);
    END LOOP;

    v_expires_at := NOW() + (COALESCE(v_reward.validity_days, 30) || ' days')::INTERVAL;

    -- 1. Debitar pontos
    UPDATE public.loyalty_accounts
    SET points_balance = points_balance - v_reward.points_cost,
        updated_at = NOW()
    WHERE id = v_account.id;

    -- 2. Registrar transação de resgate
    INSERT INTO public.loyalty_transactions (user_id, type, points, reference_type, reference_id, description, created_at)
    VALUES (
        v_user_id,
        'redemption',
        -v_reward.points_cost,
        'reward',
        p_reward_id::TEXT,
        'Resgate de recompensa • ' || v_reward.title || ' (' || v_coupon_code || ')',
        NOW()
    );

    -- 3. Emitir cupom exclusivo do usuário
    INSERT INTO public.loyalty_coupons (
        user_id, reward_id, code, reward_type, discount_value, min_order_value, max_discount, status, expires_at, created_at
    )
    VALUES (
        v_user_id,
        v_reward.id,
        v_coupon_code,
        v_reward.reward_type,
        v_reward.discount_value,
        v_reward.min_order_value,
        v_reward.max_discount,
        'active',
        v_expires_at,
        NOW()
    )
    RETURNING id INTO v_coupon_id;

    RETURN jsonb_build_object(
        'success', true,
        'coupon_code', v_coupon_code,
        'reward_title', v_reward.title,
        'reward_type', v_reward.reward_type,
        'discount_value', v_reward.discount_value,
        'min_order_value', v_reward.min_order_value,
        'points_spent', v_reward.points_cost,
        'new_balance', v_account.points_balance - v_reward.points_cost,
        'expires_at', v_expires_at,
        'message', 'Cupom ' || v_coupon_code || ' gerado com sucesso!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.4 VALIDAÇÃO SEGURA DE CUPOM NO CHECKOUT
CREATE OR REPLACE FUNCTION public.loyalty_validate_coupon(p_code TEXT, p_subtotal NUMERIC)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_coupon public.loyalty_coupons;
    v_discount NUMERIC := 0;
BEGIN
    v_user_id := auth.uid();
    p_code := UPPER(TRIM(p_code));

    SELECT * INTO v_coupon FROM public.loyalty_coupons
    WHERE code = p_code;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Cupom inválido ou não encontrado.');
    END IF;

    -- Validar posse do cupom
    IF v_coupon.user_id != v_user_id THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Este cupom pertence a outra conta.');
    END IF;

    -- Validar status
    IF v_coupon.status != 'active' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Este cupom já foi utilizado.');
    END IF;

    -- Validar expiração
    IF v_coupon.expires_at < NOW() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Este cupom expirou.');
    END IF;

    -- Validar valor mínimo de pedido
    IF v_coupon.min_order_value > 0 AND p_subtotal < v_coupon.min_order_value THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Pedido mínimo para este cupom é de R$ ' || TO_CHAR(v_coupon.min_order_value, 'FM999G999D00')
        );
    END IF;

    -- Calcular desconto no servidor com precisão
    IF v_coupon.reward_type = 'percent' THEN
        v_discount := ROUND(p_subtotal * (v_coupon.discount_value / 100.0), 2);
        IF v_coupon.max_discount > 0 AND v_discount > v_coupon.max_discount THEN
            v_discount := v_coupon.max_discount;
        END IF;
    ELSIF v_coupon.reward_type = 'fixed' THEN
        v_discount := LEAST(p_subtotal, v_coupon.discount_value);
    ELSIF v_coupon.reward_type = 'free_shipping' THEN
        v_discount := 0; -- Indicador especial de frete grátis
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'code', v_coupon.code,
        'reward_type', v_coupon.reward_type,
        'discount_value', v_coupon.discount_value,
        'calculated_discount', v_discount,
        'is_free_shipping', (v_coupon.reward_type = 'free_shipping'),
        'message', 'Cupom aplicado com sucesso!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.5 AVALIAÇÃO DE PRODUTO COM PONTOS ATÔMICOS
CREATE OR REPLACE FUNCTION public.loyalty_submit_review(
    p_product_id TEXT,
    p_rating INT,
    p_comment TEXT,
    p_has_photo BOOLEAN,
    p_photo_url TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_user_name TEXT;
    v_account public.loyalty_accounts;
    v_points INT := 30;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Faça login para avaliar produtos e ganhar pontos.');
    END IF;

    IF p_rating < 1 OR p_rating > 5 THEN
        RETURN jsonb_build_object('success', false, 'error', 'A nota deve ser entre 1 e 5 estrelas.');
    END IF;

    IF LENGTH(TRIM(p_comment)) < 5 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Por favor, escreva um comentário com sua opinião.');
    END IF;

    -- Verificar se já avaliou este produto
    IF EXISTS (SELECT 1 FROM public.product_reviews WHERE user_id = v_user_id AND product_id = p_product_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Você já avaliou este produto anteriormente.');
    END IF;

    -- Bônus de foto
    IF p_has_photo = TRUE THEN
        v_points := v_points + 20; -- Total 50 pontos
    END IF;

    -- Obter nome do usuário
    SELECT name INTO v_user_name FROM public.profiles WHERE user_id = v_user_id;
    IF v_user_name IS NULL OR v_user_name = '' THEN
        v_user_name := 'Cliente Verificada';
    END IF;

    -- Inserir avaliação
    INSERT INTO public.product_reviews (
        user_id, product_id, author_name, rating, comment, has_photo, photo_url, status, created_at
    )
    VALUES (
        v_user_id, p_product_id, v_user_name, p_rating, TRIM(p_comment), p_has_photo, p_photo_url, 'approved', NOW()
    );

    -- Creditar pontos
    v_account := public.get_or_create_loyalty_account(v_user_id);
    UPDATE public.loyalty_accounts
    SET points_balance = points_balance + v_points,
        lifetime_points = lifetime_points + v_points,
        updated_at = NOW()
    WHERE id = v_account.id;

    -- Registrar no extrato
    INSERT INTO public.loyalty_transactions (user_id, type, points, reference_type, reference_id, description, created_at)
    VALUES (
        v_user_id,
        'review',
        v_points,
        'review',
        p_product_id,
        'Avaliação de produto (' || p_rating || '★)' || CASE WHEN p_has_photo THEN ' + Bônus Foto' ELSE '' END,
        NOW()
    );

    -- Atualizar missões de avaliações
    INSERT INTO public.loyalty_user_missions (user_id, mission_id, current_progress, created_at)
    VALUES (v_user_id, 'mission_reviewer', 1, NOW())
    ON CONFLICT (user_id, mission_id) DO UPDATE
    SET current_progress = LEAST(public.loyalty_user_missions.current_progress + 1, 3);

    RETURN jsonb_build_object(
        'success', true,
        'points_awarded', v_points,
        'new_balance', v_account.points_balance + v_points,
        'message', 'Avaliação enviada! Você ganhou +' || v_points || ' pontos no programa de fidelidade!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.6 CRÉDITO DE PONTOS POR COMPRA (IDEMPOTENTE)
CREATE OR REPLACE FUNCTION public.loyalty_process_order_points(
    p_order_id TEXT,
    p_user_id UUID,
    p_order_total NUMERIC,
    p_order_status TEXT DEFAULT 'novo'
)
RETURNS JSONB AS $$
DECLARE
    v_points INT;
    v_account public.loyalty_accounts;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pedido sem cliente autenticado vinculado.');
    END IF;

    -- Regra padrão: 1 ponto por R$ 1 gasto (arredondado para baixo)
    v_points := FLOOR(COALESCE(p_order_total, 0));
    IF v_points <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Valor do pedido insuficiente para pontos.');
    END IF;

    -- Garantir idempotência: verificar se este pedido já pontuou
    IF EXISTS (
        SELECT 1 FROM public.loyalty_transactions 
        WHERE user_id = p_user_id AND reference_type = 'order' AND reference_id = p_order_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'already_credited', true, 'message', 'Pedido já pontuado.');
    END IF;

    -- Creditar pontos
    v_account := public.get_or_create_loyalty_account(p_user_id);
    UPDATE public.loyalty_accounts
    SET points_balance = points_balance + v_points,
        lifetime_points = lifetime_points + v_points,
        updated_at = NOW()
    WHERE id = v_account.id;

    -- Registrar no extrato
    INSERT INTO public.loyalty_transactions (user_id, type, points, reference_type, reference_id, description, created_at)
    VALUES (
        p_user_id,
        'purchase',
        v_points,
        'order',
        p_order_id,
        'Compra aprovada • Pedido #' || p_order_id,
        NOW()
    );

    -- Atualizar missões de compras
    INSERT INTO public.loyalty_user_missions (user_id, mission_id, current_progress, created_at)
    VALUES (p_user_id, 'mission_first_purchase', 1, NOW())
    ON CONFLICT (user_id, mission_id) DO UPDATE
    SET current_progress = 1, completed = TRUE, completed_at = NOW();

    INSERT INTO public.loyalty_user_missions (user_id, mission_id, current_progress, created_at)
    VALUES (p_user_id, 'mission_loyal_buyer', 1, NOW())
    ON CONFLICT (user_id, mission_id) DO UPDATE
    SET current_progress = LEAST(public.loyalty_user_missions.current_progress + 1, 3);

    RETURN jsonb_build_object(
        'success', true,
        'points_awarded', v_points,
        'new_balance', v_account.points_balance + v_points
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.7 AJUSTE MANUAL DE PONTOS PELO ADMINISTRADOR
CREATE OR REPLACE FUNCTION public.loyalty_admin_adjust_points(
    p_target_user_id UUID,
    p_points INT,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_account public.loyalty_accounts;
BEGIN
    IF p_points = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quantidade de pontos não pode ser zero.');
    END IF;

    IF LENGTH(TRIM(p_reason)) < 3 THEN
        RETURN jsonb_build_object('success', false, 'error', 'É obrigatório informar o motivo do ajuste.');
    END IF;

    v_account := public.get_or_create_loyalty_account(p_target_user_id);

    -- Impedir saldo negativo
    IF v_account.points_balance + p_points < 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'O ajuste deixaria o saldo negativo.');
    END IF;

    UPDATE public.loyalty_accounts
    SET points_balance = points_balance + p_points,
        lifetime_points = CASE WHEN p_points > 0 THEN lifetime_points + p_points ELSE lifetime_points END,
        updated_at = NOW()
    WHERE id = v_account.id;

    INSERT INTO public.loyalty_transactions (user_id, type, points, reference_type, reference_id, description, created_at)
    VALUES (
        p_target_user_id,
        'adjustment',
        p_points,
        'manual',
        gen_random_uuid()::TEXT,
        'Ajuste manual pelo administrador: ' || TRIM(p_reason),
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'adjusted_points', p_points,
        'new_balance', v_account.points_balance + p_points,
        'message', 'Ajuste realizado com sucesso.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 12. REALTIME NAS TABELAS DE FIDELIDADE
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'loyalty_accounts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_accounts;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'loyalty_transactions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_transactions;
    END IF;
END $$;
