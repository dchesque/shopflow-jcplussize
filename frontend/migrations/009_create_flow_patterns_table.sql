-- Flow Patterns Table - Padrões de fluxo e movimento na loja
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.flow_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_id TEXT NOT NULL UNIQUE,
    pattern_name TEXT NOT NULL,
    pattern_type TEXT DEFAULT 'path' CHECK (pattern_type IN ('path', 'heatmap', 'bottleneck', 'popular_route', 'dead_zone')),
    path_sequence JSONB NOT NULL DEFAULT '[]', -- Sequência de zonas ["entrance", "electronics", "checkout"]
    coordinates JSONB DEFAULT '[]', -- Coordenadas do caminho
    frequency INTEGER DEFAULT 1 CHECK (frequency >= 1),
    avg_duration_minutes REAL DEFAULT 0.0 CHECK (avg_duration_minutes >= 0.0),
    conversion_rate REAL DEFAULT 0.0 CHECK (conversion_rate >= 0.0 AND conversion_rate <= 1.0),
    popularity_score REAL DEFAULT 0.0 CHECK (popularity_score >= 0.0 AND popularity_score <= 1.0),
    efficiency_score REAL DEFAULT 0.0 CHECK (efficiency_score >= 0.0 AND efficiency_score <= 1.0),
    avg_group_size REAL DEFAULT 1.0 CHECK (avg_group_size >= 1.0),
    peak_hours JSONB DEFAULT '[]', -- Horários de pico ["14:00-15:00", "19:00-20:00"]
    day_patterns JSONB DEFAULT '{}', -- Padrões por dia da semana
    customer_segments JSONB DEFAULT '{}', -- Segmentos que mais usam este padrão
    success_metrics JSONB DEFAULT '{}',
    bottleneck_points JSONB DEFAULT '[]',
    optimization_suggestions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    is_anomaly BOOLEAN DEFAULT false,
    confidence REAL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    analysis_period_start TIMESTAMPTZ,
    analysis_period_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_flow_patterns_pattern_id ON public.flow_patterns(pattern_id);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_pattern_type ON public.flow_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_frequency ON public.flow_patterns(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_popularity_score ON public.flow_patterns(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_conversion_rate ON public.flow_patterns(conversion_rate DESC);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_is_active ON public.flow_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_is_anomaly ON public.flow_patterns(is_anomaly);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_last_seen ON public.flow_patterns(last_seen DESC);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_flow_patterns_type_active ON public.flow_patterns(pattern_type, is_active);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_active_frequency ON public.flow_patterns(is_active, frequency DESC);

-- Índices GIN para campos JSONB
CREATE INDEX IF NOT EXISTS idx_flow_patterns_path_sequence_gin ON public.flow_patterns USING GIN(path_sequence);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_coordinates_gin ON public.flow_patterns USING GIN(coordinates);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_peak_hours_gin ON public.flow_patterns USING GIN(peak_hours);
CREATE INDEX IF NOT EXISTS idx_flow_patterns_customer_segments_gin ON public.flow_patterns USING GIN(customer_segments);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_flow_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_flow_patterns_updated_at_trigger ON public.flow_patterns;
CREATE TRIGGER update_flow_patterns_updated_at_trigger
    BEFORE UPDATE ON public.flow_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_flow_patterns_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.flow_patterns ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.flow_patterns
    FOR ALL USING (true);

-- Inserir padrões de exemplo
INSERT INTO public.flow_patterns 
(pattern_id, pattern_name, pattern_type, path_sequence, frequency, avg_duration_minutes, conversion_rate, popularity_score, peak_hours, customer_segments, coordinates) VALUES 
('path_001', 'Entrada → Eletrônicos → Caixas', 'path', '["entrance", "electronics", "checkout"]', 45, 12.5, 0.34, 0.85, '["14:00-15:00", "19:00-20:00"]', '{"regular": 60, "vip": 25, "new": 15}', '[{"x": 10, "y": 10}, {"x": 30, "y": 20}, {"x": 90, "y": 50}]'),
('path_002', 'Entrada → Roupas → Alimentação → Caixas', 'path', '["entrance", "clothing", "food", "checkout"]', 32, 18.3, 0.28, 0.72, '["11:00-12:00", "16:00-17:00"]', '{"frequent": 45, "regular": 35, "browser": 20}', '[{"x": 10, "y": 10}, {"x": 50, "y": 30}, {"x": 70, "y": 40}, {"x": 90, "y": 50}]'),
('path_003', 'Entrada → Roupas → Provadores → Caixas', 'path', '["entrance", "clothing", "fitting_rooms", "checkout"]', 28, 22.7, 0.65, 0.68, '["15:00-16:00", "18:00-19:00"]', '{"vip": 40, "frequent": 35, "regular": 25}', '[{"x": 10, "y": 10}, {"x": 50, "y": 30}, {"x": 65, "y": 30}, {"x": 90, "y": 50}]'),
('path_004', 'Rota Rápida: Entrada → Alimentação → Caixas', 'path', '["entrance", "food", "checkout"]', 22, 8.9, 0.82, 0.58, '["12:00-13:00", "17:00-18:00"]', '{"regular": 70, "frequent": 30}', '[{"x": 10, "y": 10}, {"x": 70, "y": 40}, {"x": 90, "y": 50}]'),
('bottleneck_001', 'Congestionamento nos Caixas', 'bottleneck', '["checkout"]', 156, 4.2, 0.95, 0.9, '["12:00-14:00", "18:00-20:00"]', '{"all": 100}', '[{"x": 90, "y": 50}]'),
('heatmap_001', 'Zona Quente: Entrada', 'heatmap', '["entrance"]', 245, 2.5, 0.92, 0.95, '["09:00-10:00", "14:00-15:00", "19:00-20:00"]', '{"all": 100}', '[{"x": 10, "y": 10}]'),
('dead_zone_001', 'Zona Fria: Estoque', 'dead_zone', '["storage"]', 5, 15.2, 0.0, 0.05, '["10:00-11:00"]', '{"employee": 100}', '[{"x": 10, "y": 70}]')
ON CONFLICT (pattern_id) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE public.flow_patterns IS 'Padrões de fluxo e movimento identificados na loja';
COMMENT ON COLUMN public.flow_patterns.pattern_id IS 'Identificador único do padrão';
COMMENT ON COLUMN public.flow_patterns.pattern_name IS 'Nome descritivo do padrão';
COMMENT ON COLUMN public.flow_patterns.pattern_type IS 'Tipo do padrão (caminho, heatmap, gargalo, etc.)';
COMMENT ON COLUMN public.flow_patterns.path_sequence IS 'Sequência de zonas do padrão em JSON';
COMMENT ON COLUMN public.flow_patterns.frequency IS 'Frequência de ocorrência do padrão';
COMMENT ON COLUMN public.flow_patterns.avg_duration_minutes IS 'Duração média do padrão em minutos';
COMMENT ON COLUMN public.flow_patterns.conversion_rate IS 'Taxa de conversão do padrão';
COMMENT ON COLUMN public.flow_patterns.popularity_score IS 'Score de popularidade (0-1)';
COMMENT ON COLUMN public.flow_patterns.peak_hours IS 'Horários de pico do padrão';
COMMENT ON COLUMN public.flow_patterns.customer_segments IS 'Segmentos de clientes que mais usam o padrão';
COMMENT ON COLUMN public.flow_patterns.coordinates IS 'Coordenadas do caminho em JSON';
COMMENT ON COLUMN public.flow_patterns.bottleneck_points IS 'Pontos de gargalo identificados';
COMMENT ON COLUMN public.flow_patterns.optimization_suggestions IS 'Sugestões de otimização do padrão';