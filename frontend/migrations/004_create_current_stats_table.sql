-- Current Stats Table - Armazena estatísticas atuais do dia
-- Execute este SQL no dashboard do Supabase

CREATE TABLE IF NOT EXISTS public.current_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    people_count INTEGER DEFAULT 0 CHECK (people_count >= 0),
    total_entries INTEGER DEFAULT 0 CHECK (total_entries >= 0),
    total_exits INTEGER DEFAULT 0 CHECK (total_exits >= 0),
    peak_hour INTEGER CHECK (peak_hour >= 0 AND peak_hour <= 23),
    peak_count INTEGER DEFAULT 0 CHECK (peak_count >= 0),
    avg_dwell_time_minutes INTEGER DEFAULT 0 CHECK (avg_dwell_time_minutes >= 0),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_current_stats_date ON public.current_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_current_stats_last_updated ON public.current_stats(last_updated DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_current_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_current_stats_updated_at_trigger ON public.current_stats;
CREATE TRIGGER update_current_stats_updated_at_trigger
    BEFORE UPDATE ON public.current_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_current_stats_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.current_stats ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.current_stats
    FOR ALL USING (true);

-- Inserir registro para hoje se não existir
INSERT INTO public.current_stats (date) VALUES (CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE public.current_stats IS 'Estatísticas atuais agregadas por data';
COMMENT ON COLUMN public.current_stats.date IS 'Data das estatísticas';
COMMENT ON COLUMN public.current_stats.people_count IS 'Número atual de pessoas no local';
COMMENT ON COLUMN public.current_stats.total_entries IS 'Total de entradas no dia';
COMMENT ON COLUMN public.current_stats.total_exits IS 'Total de saídas no dia';
COMMENT ON COLUMN public.current_stats.peak_hour IS 'Hora de pico do dia';
COMMENT ON COLUMN public.current_stats.peak_count IS 'Número de pessoas na hora de pico';
COMMENT ON COLUMN public.current_stats.avg_dwell_time_minutes IS 'Tempo médio de permanência em minutos';