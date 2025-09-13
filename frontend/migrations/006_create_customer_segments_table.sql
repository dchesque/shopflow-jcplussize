-- Customer Segments Table - Armazena segmentação de clientes
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.customer_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT NOT NULL,
    segment TEXT NOT NULL CHECK (segment IN ('regular', 'new', 'vip', 'frequent', 'occasional', 'browser', 'buyer')),
    first_visit TIMESTAMPTZ DEFAULT NOW(),
    last_visit TIMESTAMPTZ DEFAULT NOW(),
    visit_count INTEGER DEFAULT 1 CHECK (visit_count >= 1),
    avg_dwell_time REAL DEFAULT 0.0 CHECK (avg_dwell_time >= 0.0),
    total_dwell_time REAL DEFAULT 0.0 CHECK (total_dwell_time >= 0.0),
    conversion_rate REAL DEFAULT 0.0 CHECK (conversion_rate >= 0.0 AND conversion_rate <= 1.0),
    avg_purchase_value REAL DEFAULT 0.0 CHECK (avg_purchase_value >= 0.0),
    total_purchases INTEGER DEFAULT 0 CHECK (total_purchases >= 0),
    preferred_zones JSONB DEFAULT '[]',
    behavior_patterns JSONB DEFAULT '[]',
    demographic_data JSONB DEFAULT '{}',
    interaction_history JSONB DEFAULT '[]',
    loyalty_score REAL DEFAULT 0.0 CHECK (loyalty_score >= 0.0 AND loyalty_score <= 1.0),
    satisfaction_score REAL DEFAULT 0.0 CHECK (satisfaction_score >= 0.0 AND satisfaction_score <= 1.0),
    risk_score REAL DEFAULT 0.0 CHECK (risk_score >= 0.0 AND risk_score <= 1.0),
    predicted_ltv REAL DEFAULT 0.0 CHECK (predicted_ltv >= 0.0),
    profile_data JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_customer_segments_customer_id ON public.customer_segments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_segment ON public.customer_segments(segment);
CREATE INDEX IF NOT EXISTS idx_customer_segments_last_visit ON public.customer_segments(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_customer_segments_visit_count ON public.customer_segments(visit_count DESC);
CREATE INDEX IF NOT EXISTS idx_customer_segments_conversion_rate ON public.customer_segments(conversion_rate DESC);
CREATE INDEX IF NOT EXISTS idx_customer_segments_loyalty_score ON public.customer_segments(loyalty_score DESC);
CREATE INDEX IF NOT EXISTS idx_customer_segments_is_active ON public.customer_segments(is_active);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_customer_segments_segment_active ON public.customer_segments(segment, is_active);
CREATE INDEX IF NOT EXISTS idx_customer_segments_last_visit_active ON public.customer_segments(last_visit DESC, is_active);

-- Índices GIN para campos JSONB
CREATE INDEX IF NOT EXISTS idx_customer_segments_preferred_zones_gin ON public.customer_segments USING GIN(preferred_zones);
CREATE INDEX IF NOT EXISTS idx_customer_segments_behavior_patterns_gin ON public.customer_segments USING GIN(behavior_patterns);
CREATE INDEX IF NOT EXISTS idx_customer_segments_tags_gin ON public.customer_segments USING GIN(tags);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_customer_segments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_customer_segments_updated_at_trigger ON public.customer_segments;
CREATE TRIGGER update_customer_segments_updated_at_trigger
    BEFORE UPDATE ON public.customer_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_segments_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.customer_segments
    FOR ALL USING (true);

-- Inserir segmentos de exemplo para testes
INSERT INTO public.customer_segments 
(customer_id, segment, visit_count, avg_dwell_time, conversion_rate, preferred_zones, behavior_patterns, loyalty_score) VALUES 
('customer_001', 'vip', 15, 25.5, 0.85, '["eletrônicos", "roupas"]', '["focused_shopping", "high_value"]', 0.9),
('customer_002', 'regular', 8, 18.2, 0.62, '["alimentação", "casa"]', '["planned_shopping", "moderate_value"]', 0.7),
('customer_003', 'new', 1, 12.0, 0.0, '["entrada", "roupas"]', '["browsing", "exploring"]', 0.3),
('customer_004', 'frequent', 22, 20.8, 0.74, '["eletrônicos", "casa", "roupas"]', '["comparison_shopping", "loyalty"]', 0.8),
('customer_005', 'browser', 5, 30.5, 0.2, '["roupas", "eletrônicos", "casa"]', '["extended_browsing", "indecisive"]', 0.4)
ON CONFLICT (customer_id) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE public.customer_segments IS 'Segmentação e perfis de clientes baseados em comportamento';
COMMENT ON COLUMN public.customer_segments.customer_id IS 'ID único do cliente';
COMMENT ON COLUMN public.customer_segments.segment IS 'Segmento do cliente (vip, regular, new, etc.)';
COMMENT ON COLUMN public.customer_segments.visit_count IS 'Número total de visitas';
COMMENT ON COLUMN public.customer_segments.avg_dwell_time IS 'Tempo médio de permanência em minutos';
COMMENT ON COLUMN public.customer_segments.conversion_rate IS 'Taxa de conversão do cliente';
COMMENT ON COLUMN public.customer_segments.preferred_zones IS 'Zonas preferidas do cliente em formato JSON';
COMMENT ON COLUMN public.customer_segments.behavior_patterns IS 'Padrões comportamentais identificados';
COMMENT ON COLUMN public.customer_segments.loyalty_score IS 'Score de fidelidade (0-1)';
COMMENT ON COLUMN public.customer_segments.satisfaction_score IS 'Score de satisfação (0-1)';
COMMENT ON COLUMN public.customer_segments.risk_score IS 'Score de risco de churn (0-1)';
COMMENT ON COLUMN public.customer_segments.predicted_ltv IS 'Valor de vida previsto do cliente';