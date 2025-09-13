-- Analytics Events Table - Eventos em tempo real para analytics
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('visitor_entry', 'visitor_exit', 'zone_visit', 'interaction', 'alert', 'anomaly', 'purchase', 'group_detected', 'dwell_time', 'flow_pattern')),
    event_subtype TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'success')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    description TEXT,
    source TEXT DEFAULT 'system',
    entity_type TEXT CHECK (entity_type IN ('person', 'group', 'zone', 'camera', 'system')),
    entity_id TEXT,
    camera_id UUID REFERENCES public.cameras(id) ON DELETE SET NULL,
    zone_id TEXT,
    person_id TEXT,
    session_id TEXT,
    data JSONB DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    coordinates JSONB DEFAULT '{}',
    confidence REAL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    is_processed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by TEXT,
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_severity ON public.analytics_events(severity);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity_type ON public.analytics_events(entity_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity_id ON public.analytics_events(entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_camera_id ON public.analytics_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_zone_id ON public.analytics_events(zone_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_person_id ON public.analytics_events(person_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_is_active ON public.analytics_events(is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_events_is_processed ON public.analytics_events(is_processed);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_timestamp ON public.analytics_events(event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_severity_active ON public.analytics_events(severity, is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_events_active_timestamp ON public.analytics_events(is_active, timestamp DESC);

-- Índices GIN para campos JSONB
CREATE INDEX IF NOT EXISTS idx_analytics_events_data_gin ON public.analytics_events USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_analytics_events_metrics_gin ON public.analytics_events USING GIN(metrics);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tags_gin ON public.analytics_events USING GIN(tags);

-- RLS (Row Level Security)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_events
    FOR ALL USING (true);

-- Inserir eventos de exemplo para testes
INSERT INTO public.analytics_events 
(event_type, severity, title, message, entity_type, zone_id, data, metrics, timestamp) VALUES 
('visitor_entry', 'info', 'Novo visitante detectado', 'Nova pessoa detectada na entrada principal', 'person', 'entrance', '{"detection_confidence": 0.95}', '{"count": 1}', NOW() - INTERVAL '5 minutes'),
('zone_visit', 'info', 'Visitante na seção eletrônicos', 'Cliente explorando produtos eletrônicos', 'person', 'electronics', '{"dwell_time": 180}', '{"zone_popularity": 0.8}', NOW() - INTERVAL '3 minutes'),
('alert', 'warning', 'Tempo de espera elevado', 'Fila no caixa #2 acima do normal', 'zone', 'checkout', '{"wait_time": 4.2, "queue_length": 8}', '{"avg_wait_time": 2.5}', NOW() - INTERVAL '2 minutes'),
('anomaly', 'critical', 'Alta densidade detectada', 'Zona de eletrônicos com alta concentração de pessoas', 'zone', 'electronics', '{"people_count": 25, "max_capacity": 20}', '{"density": 1.25}', NOW() - INTERVAL '1 minute'),
('purchase', 'success', 'Compra realizada', 'Transação concluída com sucesso', 'person', 'checkout', '{"amount": 156.50, "items": 3}', '{"conversion": 1}', NOW()),
('group_detected', 'info', 'Grupo familiar detectado', 'Família com crianças identificada', 'group', 'clothing', '{"group_size": 4, "has_children": true}', '{"group_count": 1}', NOW() - INTERVAL '4 minutes'),
('flow_pattern', 'info', 'Padrão de fluxo identificado', 'Rota popular: Entrada → Eletrônicos → Caixas', 'system', null, '{"path": ["entrance", "electronics", "checkout"], "frequency": 45}', '{"flow_efficiency": 0.78}', NOW() - INTERVAL '6 minutes')
ON CONFLICT DO NOTHING;

-- Função para limpar eventos antigos automaticamente
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS void AS $$
BEGIN
    DELETE FROM public.analytics_events 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND event_type NOT IN ('alert', 'anomaly');
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE public.analytics_events IS 'Eventos em tempo real do sistema de analytics';
COMMENT ON COLUMN public.analytics_events.event_type IS 'Tipo do evento (entrada, saída, visita a zona, etc.)';
COMMENT ON COLUMN public.analytics_events.severity IS 'Severidade do evento (info, warning, critical, success)';
COMMENT ON COLUMN public.analytics_events.title IS 'Título do evento';
COMMENT ON COLUMN public.analytics_events.message IS 'Mensagem descritiva do evento';
COMMENT ON COLUMN public.analytics_events.entity_type IS 'Tipo de entidade relacionada ao evento';
COMMENT ON COLUMN public.analytics_events.entity_id IS 'ID da entidade relacionada';
COMMENT ON COLUMN public.analytics_events.zone_id IS 'ID da zona onde ocorreu o evento';
COMMENT ON COLUMN public.analytics_events.data IS 'Dados específicos do evento em JSON';
COMMENT ON COLUMN public.analytics_events.metrics IS 'Métricas associadas ao evento';
COMMENT ON COLUMN public.analytics_events.confidence IS 'Nível de confiança do evento (0-1)';
COMMENT ON COLUMN public.analytics_events.is_processed IS 'Indica se o evento foi processado';
COMMENT ON COLUMN public.analytics_events.is_active IS 'Indica se o evento está ativo/visível';