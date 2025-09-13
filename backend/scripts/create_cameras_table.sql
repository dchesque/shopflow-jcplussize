-- Criação da tabela de câmeras para o ShopFlow
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.cameras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Nova Câmera',
    rtsp_url TEXT NOT NULL,
    location TEXT DEFAULT 'Localização não definida',
    line_position INTEGER DEFAULT 50 CHECK (line_position >= 0 AND line_position <= 100),
    is_active BOOLEAN DEFAULT true,
    fps INTEGER DEFAULT 30 CHECK (fps >= 1 AND fps <= 60),
    resolution TEXT DEFAULT '1920x1080',
    detection_zone JSONB DEFAULT '{"x": 0, "y": 0, "width": 100, "height": 100}',
    confidence_threshold REAL DEFAULT 0.5 CHECK (confidence_threshold >= 0.1 AND confidence_threshold <= 1.0),
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cameras_status ON public.cameras(status);
CREATE INDEX IF NOT EXISTS idx_cameras_created_at ON public.cameras(created_at);
CREATE INDEX IF NOT EXISTS idx_cameras_is_active ON public.cameras(is_active);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_cameras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_cameras_updated_at_trigger ON public.cameras;
CREATE TRIGGER update_cameras_updated_at_trigger
    BEFORE UPDATE ON public.cameras
    FOR EACH ROW
    EXECUTE FUNCTION update_cameras_updated_at();

-- RLS (Row Level Security) - Permissões básicas
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura/escrita para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.cameras
    FOR ALL USING (true);

-- Inserir câmeras de exemplo (opcional)
INSERT INTO public.cameras (name, rtsp_url, location, status) VALUES 
    ('Entrada Principal', 'rtsp://192.168.1.100:554/stream1', 'Entrada Principal', 'offline'),
    ('Caixas', 'rtsp://192.168.1.101:554/stream1', 'Área dos Caixas', 'offline'),
    ('Seção Eletrônicos', 'rtsp://192.168.1.102:554/stream1', 'Seção de Eletrônicos', 'offline'),
    ('Saída Fundos', 'rtsp://192.168.1.103:554/stream1', 'Saída dos Fundos', 'offline')
ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE public.cameras IS 'Configurações das câmeras do ShopFlow';
COMMENT ON COLUMN public.cameras.name IS 'Nome identificador da câmera';
COMMENT ON COLUMN public.cameras.rtsp_url IS 'URL RTSP para stream da câmera';
COMMENT ON COLUMN public.cameras.location IS 'Localização física da câmera';
COMMENT ON COLUMN public.cameras.line_position IS 'Posição da linha de contagem (0-100%)';
COMMENT ON COLUMN public.cameras.detection_zone IS 'Zona de detecção em coordenadas percentuais';
COMMENT ON COLUMN public.cameras.confidence_threshold IS 'Limiar de confiança para detecções';
COMMENT ON COLUMN public.cameras.status IS 'Status atual da câmera (online/offline/error)';
COMMENT ON COLUMN public.cameras.metadata IS 'Metadados adicionais em formato JSON';