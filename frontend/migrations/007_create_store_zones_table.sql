-- Store Zones Table - Define as zonas da loja para analytics
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.store_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    zone_type TEXT NOT NULL CHECK (zone_type IN ('entrance', 'exit', 'product', 'service', 'waiting', 'checkout', 'storage', 'navigation')),
    category TEXT,
    coordinates JSONB NOT NULL DEFAULT '{}', -- {x, y, width, height} ou polygon points
    area_sqm REAL DEFAULT 0.0 CHECK (area_sqm >= 0.0),
    capacity INTEGER DEFAULT 0 CHECK (capacity >= 0),
    is_active BOOLEAN DEFAULT true,
    is_monitored BOOLEAN DEFAULT true,
    visit_count INTEGER DEFAULT 0 CHECK (visit_count >= 0),
    avg_dwell_time REAL DEFAULT 0.0 CHECK (avg_dwell_time >= 0.0),
    conversion_rate REAL DEFAULT 0.0 CHECK (conversion_rate >= 0.0 AND conversion_rate <= 1.0),
    popularity_score REAL DEFAULT 0.0 CHECK (popularity_score >= 0.0 AND popularity_score <= 1.0),
    congestion_level TEXT DEFAULT 'low' CHECK (congestion_level IN ('low', 'medium', 'high')),
    temperature REAL,
    lighting_level INTEGER CHECK (lighting_level >= 0 AND lighting_level <= 100),
    noise_level INTEGER CHECK (noise_level >= 0 AND noise_level <= 100),
    camera_ids JSONB DEFAULT '[]',
    product_categories JSONB DEFAULT '[]',
    analytics_config JSONB DEFAULT '{}',
    alerts_config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_store_zones_zone_id ON public.store_zones(zone_id);
CREATE INDEX IF NOT EXISTS idx_store_zones_zone_type ON public.store_zones(zone_type);
CREATE INDEX IF NOT EXISTS idx_store_zones_category ON public.store_zones(category);
CREATE INDEX IF NOT EXISTS idx_store_zones_is_active ON public.store_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_store_zones_is_monitored ON public.store_zones(is_monitored);
CREATE INDEX IF NOT EXISTS idx_store_zones_popularity_score ON public.store_zones(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_store_zones_visit_count ON public.store_zones(visit_count DESC);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_store_zones_active_monitored ON public.store_zones(is_active, is_monitored);

-- Índices GIN para campos JSONB
CREATE INDEX IF NOT EXISTS idx_store_zones_coordinates_gin ON public.store_zones USING GIN(coordinates);
CREATE INDEX IF NOT EXISTS idx_store_zones_camera_ids_gin ON public.store_zones USING GIN(camera_ids);
CREATE INDEX IF NOT EXISTS idx_store_zones_product_categories_gin ON public.store_zones USING GIN(product_categories);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_store_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_store_zones_updated_at_trigger ON public.store_zones;
CREATE TRIGGER update_store_zones_updated_at_trigger
    BEFORE UPDATE ON public.store_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_store_zones_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.store_zones ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.store_zones
    FOR ALL USING (true);

-- Inserir zonas de exemplo
INSERT INTO public.store_zones 
(zone_id, name, description, zone_type, category, coordinates, area_sqm, capacity, visit_count, avg_dwell_time, popularity_score, product_categories) VALUES 
('entrance', 'Entrada Principal', 'Área de entrada da loja', 'entrance', 'access', '{"x": 10, "y": 10, "width": 20, "height": 15}', 30.0, 10, 1247, 2.5, 0.9, '["all"]'),
('electronics', 'Seção Eletrônicos', 'Área de produtos eletrônicos', 'product', 'technology', '{"x": 30, "y": 20, "width": 40, "height": 30}', 120.0, 25, 856, 18.7, 0.8, '["electronics", "computers", "phones"]'),
('clothing', 'Seção Roupas', 'Área de vestuário', 'product', 'fashion', '{"x": 50, "y": 30, "width": 35, "height": 25}', 87.5, 20, 674, 22.3, 0.7, '["clothing", "shoes", "accessories"]'),
('food', 'Seção Alimentação', 'Área de alimentos e bebidas', 'product', 'food', '{"x": 70, "y": 40, "width": 30, "height": 20}', 60.0, 15, 523, 8.9, 0.6, '["food", "beverages", "snacks"]'),
('checkout', 'Área dos Caixas', 'Zona de pagamento', 'checkout', 'service', '{"x": 90, "y": 50, "width": 25, "height": 15}', 37.5, 8, 1156, 4.2, 0.9, '["checkout"]'),
('exit', 'Saída', 'Área de saída da loja', 'exit', 'access', '{"x": 90, "y": 10, "width": 15, "height": 10}', 15.0, 5, 1198, 1.8, 0.85, '["all"]'),
('storage', 'Estoque', 'Área de armazenamento', 'storage', 'internal', '{"x": 10, "y": 70, "width": 20, "height": 10}', 20.0, 3, 45, 15.2, 0.1, '["internal"]'),
('fitting_rooms', 'Provadores', 'Cabines de prova', 'service', 'fashion', '{"x": 65, "y": 30, "width": 8, "height": 6}', 4.8, 4, 234, 6.5, 0.4, '["clothing"]')
ON CONFLICT (zone_id) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE public.store_zones IS 'Definição e configuração das zonas da loja para analytics';
COMMENT ON COLUMN public.store_zones.zone_id IS 'Identificador único da zona';
COMMENT ON COLUMN public.store_zones.name IS 'Nome da zona';
COMMENT ON COLUMN public.store_zones.zone_type IS 'Tipo da zona (entrada, produto, serviço, etc.)';
COMMENT ON COLUMN public.store_zones.coordinates IS 'Coordenadas da zona em formato JSON';
COMMENT ON COLUMN public.store_zones.area_sqm IS 'Área da zona em metros quadrados';
COMMENT ON COLUMN public.store_zones.visit_count IS 'Número total de visitas à zona';
COMMENT ON COLUMN public.store_zones.avg_dwell_time IS 'Tempo médio de permanência na zona';
COMMENT ON COLUMN public.store_zones.popularity_score IS 'Score de popularidade da zona (0-1)';
COMMENT ON COLUMN public.store_zones.camera_ids IS 'IDs das câmeras que monitoram esta zona';
COMMENT ON COLUMN public.store_zones.product_categories IS 'Categorias de produtos disponíveis na zona';