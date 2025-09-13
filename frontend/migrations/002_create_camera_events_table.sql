-- Camera Events Table - Armazena eventos de detecção das câmeras
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.camera_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    camera_id UUID NOT NULL REFERENCES public.cameras(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    people_count INTEGER DEFAULT 0 CHECK (people_count >= 0),
    customers_count INTEGER DEFAULT 0 CHECK (customers_count >= 0),
    employees_count INTEGER DEFAULT 0 CHECK (employees_count >= 0),
    groups_count INTEGER DEFAULT 0 CHECK (groups_count >= 0),
    processing_time_ms INTEGER DEFAULT 0 CHECK (processing_time_ms >= 0),
    frame_width INTEGER DEFAULT 0 CHECK (frame_width >= 0),
    frame_height INTEGER DEFAULT 0 CHECK (frame_height >= 0),
    confidence_avg REAL DEFAULT 0.0 CHECK (confidence_avg >= 0.0 AND confidence_avg <= 1.0),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_camera_events_camera_id ON public.camera_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_events_timestamp ON public.camera_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_camera_events_people_count ON public.camera_events(people_count);
CREATE INDEX IF NOT EXISTS idx_camera_events_created_at ON public.camera_events(created_at DESC);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_camera_events_camera_timestamp ON public.camera_events(camera_id, timestamp DESC);

-- RLS (Row Level Security)
ALTER TABLE public.camera_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.camera_events
    FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE public.camera_events IS 'Eventos de detecção processados pelas câmeras';
COMMENT ON COLUMN public.camera_events.camera_id IS 'Referência para a câmera que gerou o evento';
COMMENT ON COLUMN public.camera_events.people_count IS 'Número total de pessoas detectadas no frame';
COMMENT ON COLUMN public.camera_events.customers_count IS 'Número de clientes detectados';
COMMENT ON COLUMN public.camera_events.employees_count IS 'Número de funcionários detectados';
COMMENT ON COLUMN public.camera_events.processing_time_ms IS 'Tempo de processamento do frame em millisegundos';
COMMENT ON COLUMN public.camera_events.metadata IS 'Dados adicionais do evento em formato JSON';