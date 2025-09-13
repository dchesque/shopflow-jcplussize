-- People Events Table - Armazena eventos de entrada/saída de pessoas
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.people_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL CHECK (action IN ('entry', 'exit', 'detected')),
    person_tracking_id TEXT,
    camera_id UUID REFERENCES public.cameras(id) ON DELETE SET NULL,
    confidence REAL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    snapshot_url TEXT,
    bbox JSONB DEFAULT '{}',
    person_type TEXT CHECK (person_type IN ('customer', 'employee', 'unknown')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_people_events_action ON public.people_events(action);
CREATE INDEX IF NOT EXISTS idx_people_events_timestamp ON public.people_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_people_events_person_tracking_id ON public.people_events(person_tracking_id);
CREATE INDEX IF NOT EXISTS idx_people_events_camera_id ON public.people_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_people_events_created_at ON public.people_events(created_at DESC);

-- Índice composto para queries de contagem
CREATE INDEX IF NOT EXISTS idx_people_events_action_timestamp ON public.people_events(action, timestamp DESC);

-- RLS (Row Level Security)
ALTER TABLE public.people_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.people_events
    FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE public.people_events IS 'Eventos de entrada, saída e detecção de pessoas';
COMMENT ON COLUMN public.people_events.action IS 'Tipo de ação: entry (entrada), exit (saída), detected (detectado)';
COMMENT ON COLUMN public.people_events.person_tracking_id IS 'ID único para rastreamento da pessoa';
COMMENT ON COLUMN public.people_events.confidence IS 'Nível de confiança da detecção';
COMMENT ON COLUMN public.people_events.snapshot_url IS 'URL do snapshot da detecção';
COMMENT ON COLUMN public.people_events.bbox IS 'Bounding box da detecção em formato JSON';
COMMENT ON COLUMN public.people_events.person_type IS 'Tipo de pessoa detectada';