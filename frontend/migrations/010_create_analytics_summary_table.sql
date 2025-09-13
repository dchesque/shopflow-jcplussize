-- Analytics Summary Table - Estatísticas agregadas para dashboards
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.analytics_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour <= 23),
    period_type TEXT NOT NULL CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    total_visitors INTEGER DEFAULT 0 CHECK (total_visitors >= 0),
    unique_visitors INTEGER DEFAULT 0 CHECK (unique_visitors >= 0),
    total_entries INTEGER DEFAULT 0 CHECK (total_entries >= 0),
    total_exits INTEGER DEFAULT 0 CHECK (total_exits >= 0),
    current_occupancy INTEGER DEFAULT 0 CHECK (current_occupancy >= 0),
    peak_occupancy INTEGER DEFAULT 0 CHECK (peak_occupancy >= 0),
    avg_dwell_time_minutes REAL DEFAULT 0.0 CHECK (avg_dwell_time_minutes >= 0.0),
    total_dwell_time_minutes REAL DEFAULT 0.0 CHECK (total_dwell_time_minutes >= 0.0),
    conversion_rate REAL DEFAULT 0.0 CHECK (conversion_rate >= 0.0 AND conversion_rate <= 1.0),
    total_purchases INTEGER DEFAULT 0 CHECK (total_purchases >= 0),
    total_revenue REAL DEFAULT 0.0 CHECK (total_revenue >= 0.0),
    avg_purchase_value REAL DEFAULT 0.0 CHECK (avg_purchase_value >= 0.0),
    group_visits INTEGER DEFAULT 0 CHECK (group_visits >= 0),
    solo_visits INTEGER DEFAULT 0 CHECK (solo_visits >= 0),
    avg_group_size REAL DEFAULT 1.0 CHECK (avg_group_size >= 1.0),
    returning_customers INTEGER DEFAULT 0 CHECK (returning_customers >= 0),
    new_customers INTEGER DEFAULT 0 CHECK (new_customers >= 0),
    customer_satisfaction_score REAL DEFAULT 0.0 CHECK (customer_satisfaction_score >= 0.0 AND customer_satisfaction_score <= 5.0),
    zone_visits JSONB DEFAULT '{}', -- Visitas por zona
    popular_paths JSONB DEFAULT '[]', -- Caminhos mais populares
    bottlenecks JSONB DEFAULT '[]', -- Gargalos identificados
    anomalies JSONB DEFAULT '[]', -- Anomalias detectadas
    weather_conditions JSONB DEFAULT '{}',
    temperature REAL,
    humidity INTEGER CHECK (humidity >= 0 AND humidity <= 100),
    events JSONB DEFAULT '[]', -- Eventos especiais do período
    alerts_count INTEGER DEFAULT 0 CHECK (alerts_count >= 0),
    system_uptime_percentage REAL DEFAULT 100.0 CHECK (system_uptime_percentage >= 0.0 AND system_uptime_percentage <= 100.0),
    data_quality_score REAL DEFAULT 1.0 CHECK (data_quality_score >= 0.0 AND data_quality_score <= 1.0),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, hour, period_type)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON public.analytics_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_period_type ON public.analytics_summary(period_type);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_hour ON public.analytics_summary(hour);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_total_visitors ON public.analytics_summary(total_visitors DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_conversion_rate ON public.analytics_summary(conversion_rate DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_total_revenue ON public.analytics_summary(total_revenue DESC);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date_period ON public.analytics_summary(date DESC, period_type);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date_hour ON public.analytics_summary(date DESC, hour);

-- Índices GIN para campos JSONB
CREATE INDEX IF NOT EXISTS idx_analytics_summary_zone_visits_gin ON public.analytics_summary USING GIN(zone_visits);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_popular_paths_gin ON public.analytics_summary USING GIN(popular_paths);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_analytics_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_analytics_summary_updated_at_trigger ON public.analytics_summary;
CREATE TRIGGER update_analytics_summary_updated_at_trigger
    BEFORE UPDATE ON public.analytics_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_summary_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_summary
    FOR ALL USING (true);

-- Inserir dados de exemplo para hoje
INSERT INTO public.analytics_summary 
(date, hour, period_type, total_visitors, unique_visitors, total_entries, total_exits, current_occupancy, peak_occupancy, avg_dwell_time_minutes, conversion_rate, total_purchases, total_revenue, avg_purchase_value, group_visits, solo_visits, avg_group_size, returning_customers, new_customers, zone_visits, popular_paths) VALUES 
-- Dados horários de hoje
(CURRENT_DATE, 9, 'hourly', 45, 42, 45, 38, 7, 12, 15.2, 0.22, 10, 1250.50, 125.05, 8, 37, 1.2, 35, 10, '{"entrance": 45, "electronics": 28, "clothing": 22, "food": 15, "checkout": 10}', '[{"path": "entrance->electronics->checkout", "count": 8}, {"path": "entrance->clothing->checkout", "count": 5}]'),
(CURRENT_DATE, 10, 'hourly', 67, 58, 67, 52, 15, 22, 18.7, 0.28, 19, 2345.80, 123.46, 12, 55, 1.3, 48, 19, '{"entrance": 67, "electronics": 42, "clothing": 35, "food": 28, "checkout": 19}', '[{"path": "entrance->electronics->checkout", "count": 12}, {"path": "entrance->clothing->food->checkout", "count": 8}]'),
(CURRENT_DATE, 11, 'hourly', 89, 78, 89, 71, 18, 28, 20.1, 0.31, 28, 3567.20, 127.40, 18, 71, 1.4, 62, 27, '{"entrance": 89, "electronics": 56, "clothing": 48, "food": 38, "checkout": 28}', '[{"path": "entrance->electronics->checkout", "count": 15}, {"path": "entrance->clothing->fitting_rooms->checkout", "count": 10}]'),
(CURRENT_DATE, 12, 'hourly', 112, 98, 112, 95, 17, 35, 16.8, 0.34, 38, 4892.60, 128.75, 22, 90, 1.5, 78, 34, '{"entrance": 112, "electronics": 68, "clothing": 62, "food": 55, "checkout": 38}', '[{"path": "entrance->food->checkout", "count": 18}, {"path": "entrance->electronics->checkout", "count": 16}]'),
(CURRENT_DATE, 13, 'hourly', 127, 110, 127, 108, 19, 42, 14.5, 0.37, 47, 6234.90, 132.66, 28, 99, 1.6, 89, 38, '{"entrance": 127, "electronics": 78, "clothing": 72, "food": 68, "checkout": 47}', '[{"path": "entrance->food->checkout", "count": 22}, {"path": "entrance->electronics->checkout", "count": 20}]'),
-- Resumo diário
(CURRENT_DATE, null, 'daily', 1247, 1089, 1247, 1198, 0, 65, 16.3, 0.32, 398, 52345.20, 131.47, 245, 1002, 1.4, 856, 391, '{"entrance": 1247, "electronics": 856, "clothing": 674, "food": 523, "checkout": 398, "fitting_rooms": 234}', '[{"path": "entrance->electronics->checkout", "count": 145}, {"path": "entrance->clothing->checkout", "count": 98}, {"path": "entrance->food->checkout", "count": 89}]'),
-- Resumos da semana anterior
(CURRENT_DATE - INTERVAL '1 day', null, 'daily', 1156, 1012, 1156, 1134, 0, 58, 15.1, 0.29, 342, 48234.80, 141.01, 223, 933, 1.3, 789, 367, '{"entrance": 1156, "electronics": 798, "clothing": 612, "food": 478, "checkout": 342}', '[{"path": "entrance->electronics->checkout", "count": 134}, {"path": "entrance->clothing->checkout", "count": 87}]'),
(CURRENT_DATE - INTERVAL '2 days', null, 'daily', 1398, 1234, 1398, 1356, 0, 72, 17.2, 0.35, 456, 58967.40, 129.32, 289, 1109, 1.5, 967, 431, '{"entrance": 1398, "electronics": 934, "clothing": 789, "food": 634, "checkout": 456}', '[{"path": "entrance->electronics->checkout", "count": 167}, {"path": "entrance->clothing->checkout", "count": 112}]')
ON CONFLICT (date, hour, period_type) DO NOTHING;

-- Função para limpar dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_analytics_summary()
RETURNS void AS $$
BEGIN
    DELETE FROM public.analytics_summary 
    WHERE date < CURRENT_DATE - INTERVAL '90 days' 
    AND period_type = 'hourly';
    
    DELETE FROM public.analytics_summary 
    WHERE date < CURRENT_DATE - INTERVAL '1 year' 
    AND period_type = 'daily';
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE public.analytics_summary IS 'Estatísticas agregadas do sistema de analytics por período';
COMMENT ON COLUMN public.analytics_summary.date IS 'Data do período analisado';
COMMENT ON COLUMN public.analytics_summary.hour IS 'Hora específica (para dados horários)';
COMMENT ON COLUMN public.analytics_summary.period_type IS 'Tipo de período (horário, diário, semanal, mensal)';
COMMENT ON COLUMN public.analytics_summary.total_visitors IS 'Total de visitantes no período';
COMMENT ON COLUMN public.analytics_summary.conversion_rate IS 'Taxa de conversão do período';
COMMENT ON COLUMN public.analytics_summary.avg_dwell_time_minutes IS 'Tempo médio de permanência';
COMMENT ON COLUMN public.analytics_summary.zone_visits IS 'Número de visitas por zona em JSON';
COMMENT ON COLUMN public.analytics_summary.popular_paths IS 'Caminhos mais populares do período';
COMMENT ON COLUMN public.analytics_summary.bottlenecks IS 'Gargalos identificados no período';
COMMENT ON COLUMN public.analytics_summary.anomalies IS 'Anomalias detectadas no período';