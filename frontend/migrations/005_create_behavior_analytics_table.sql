-- Behavior Analytics Table - Armazena dados de análise comportamental
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.behavior_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    person_id TEXT,
    person_type TEXT CHECK (person_type IN ('customer', 'employee', 'unknown')),
    dwell_time_minutes INTEGER DEFAULT 0 CHECK (dwell_time_minutes >= 0),
    trajectory_data JSONB DEFAULT '{}',
    zone_visits JSONB DEFAULT '{}',
    behavior_pattern TEXT,
    group_size INTEGER DEFAULT 1 CHECK (group_size >= 1),
    movement_speed REAL DEFAULT 0.0 CHECK (movement_speed >= 0.0),
    interaction_count INTEGER DEFAULT 0 CHECK (interaction_count >= 0),
    purchase_probability REAL DEFAULT 0.0 CHECK (purchase_probability >= 0.0 AND purchase_probability <= 1.0),
    anomaly_score REAL DEFAULT 0.0 CHECK (anomaly_score >= 0.0 AND anomaly_score <= 1.0),
    session_id TEXT,
    camera_id UUID REFERENCES public.cameras(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_timestamp ON public.behavior_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_person_id ON public.behavior_analytics(person_id);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_session_id ON public.behavior_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_person_type ON public.behavior_analytics(person_type);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_behavior_pattern ON public.behavior_analytics(behavior_pattern);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_camera_id ON public.behavior_analytics(camera_id);

-- Índice composto para queries temporais
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_timestamp_person ON public.behavior_analytics(timestamp DESC, person_id);

-- Índice GIN para campos JSONB
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_zone_visits_gin ON public.behavior_analytics USING GIN(zone_visits);
CREATE INDEX IF NOT EXISTS idx_behavior_analytics_trajectory_gin ON public.behavior_analytics USING GIN(trajectory_data);

-- RLS (Row Level Security)
ALTER TABLE public.behavior_analytics ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.behavior_analytics
    FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE public.behavior_analytics IS 'Dados de análise comportamental de pessoas na loja';
COMMENT ON COLUMN public.behavior_analytics.person_id IS 'ID único da pessoa (gerado pelo tracking)';
COMMENT ON COLUMN public.behavior_analytics.person_type IS 'Tipo de pessoa detectada';
COMMENT ON COLUMN public.behavior_analytics.dwell_time_minutes IS 'Tempo de permanência em minutos';
COMMENT ON COLUMN public.behavior_analytics.trajectory_data IS 'Dados da trajetória em formato JSON';
COMMENT ON COLUMN public.behavior_analytics.zone_visits IS 'Zonas visitadas e tempo gasto em cada uma';
COMMENT ON COLUMN public.behavior_analytics.behavior_pattern IS 'Padrão de comportamento identificado';
COMMENT ON COLUMN public.behavior_analytics.group_size IS 'Tamanho do grupo da pessoa';
COMMENT ON COLUMN public.behavior_analytics.movement_speed IS 'Velocidade média de movimento';
COMMENT ON COLUMN public.behavior_analytics.interaction_count IS 'Número de interações com produtos/elementos';
COMMENT ON COLUMN public.behavior_analytics.purchase_probability IS 'Probabilidade de compra calculada pela IA';
COMMENT ON COLUMN public.behavior_analytics.anomaly_score IS 'Score de anomalia comportamental';
COMMENT ON COLUMN public.behavior_analytics.session_id IS 'ID da sessão de analytics';