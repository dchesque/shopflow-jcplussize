-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Realtime for specific tables
ALTER publication supabase_realtime ADD TABLE people_events;
ALTER publication supabase_realtime ADD TABLE current_stats;
ALTER publication supabase_realtime ADD TABLE hourly_stats;

-- Create custom types
CREATE TYPE action_type AS ENUM ('ENTER', 'EXIT');

-- Tabela de eventos de pessoas
CREATE TABLE people_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamptz DEFAULT now() NOT NULL,
  action action_type NOT NULL,
  person_tracking_id text,
  confidence float NOT NULL DEFAULT 0.0,
  snapshot_url text,
  metadata jsonb DEFAULT '{}',
  camera_zone text DEFAULT 'main',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Estatísticas em tempo real
CREATE TABLE current_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  people_count integer DEFAULT 0 NOT NULL,
  total_entries integer DEFAULT 0 NOT NULL,
  total_exits integer DEFAULT 0 NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL,
  date date DEFAULT current_date NOT NULL,
  CONSTRAINT unique_daily_stats UNIQUE(date)
);

-- Estatísticas por hora
CREATE TABLE hourly_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  hour integer NOT NULL CHECK (hour >= 0 AND hour <= 23),
  entries integer DEFAULT 0 NOT NULL,
  exits integer DEFAULT 0 NOT NULL,
  max_people integer DEFAULT 0 NOT NULL,
  avg_people float DEFAULT 0.0 NOT NULL,
  peak_time time,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT unique_hourly_stats UNIQUE(date, hour)
);

-- Vendas para cálculo de conversão
CREATE TABLE sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamptz DEFAULT now() NOT NULL,
  amount decimal(10,2) NOT NULL,
  items integer DEFAULT 1 NOT NULL,
  payment_method text,
  transaction_id text,
  metadata jsonb DEFAULT '{}',
  imported boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Configuração da câmera
CREATE TABLE camera_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'Main Camera',
  rtsp_url text NOT NULL,
  line_position integer DEFAULT 50 CHECK (line_position >= 0 AND line_position <= 100),
  is_active boolean DEFAULT true NOT NULL,
  fps integer DEFAULT 30 CHECK (fps > 0 AND fps <= 60),
  resolution text DEFAULT '1920x1080',
  detection_zone jsonb DEFAULT '{"x": 0, "y": 0, "width": 100, "height": 100}',
  confidence_threshold float DEFAULT 0.5 CHECK (confidence_threshold >= 0.1 AND confidence_threshold <= 1.0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Logs do sistema para debugging
CREATE TABLE system_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  level text NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  message text NOT NULL,
  component text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Tabela para armazenar alertas
CREATE TABLE alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  is_read boolean DEFAULT false NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes para performance
CREATE INDEX idx_people_events_timestamp ON people_events(timestamp);
CREATE INDEX idx_people_events_action ON people_events(action);
CREATE INDEX idx_people_events_date ON people_events(DATE(timestamp));
CREATE INDEX idx_hourly_stats_date ON hourly_stats(date);
CREATE INDEX idx_hourly_stats_date_hour ON hourly_stats(date, hour);
CREATE INDEX idx_sales_timestamp ON sales(timestamp);
CREATE INDEX idx_sales_date ON sales(DATE(timestamp));
CREATE INDEX idx_current_stats_date ON current_stats(date);
CREATE INDEX idx_system_logs_timestamp ON system_logs(created_at);
CREATE INDEX idx_system_logs_component ON system_logs(component);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- Enable RLS
ALTER TABLE people_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE hourly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permitir leitura pública para demonstração)
CREATE POLICY "Public read people_events" ON people_events FOR SELECT USING (true);
CREATE POLICY "Public read current_stats" ON current_stats FOR SELECT USING (true);
CREATE POLICY "Public read hourly_stats" ON hourly_stats FOR SELECT USING (true);
CREATE POLICY "Public read sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Public read camera_config" ON camera_config FOR SELECT USING (true);
CREATE POLICY "Public read system_logs" ON system_logs FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);

-- Policies para inserção (service_role apenas)
CREATE POLICY "Service role insert people_events" ON people_events FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role insert current_stats" ON current_stats FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role insert hourly_stats" ON hourly_stats FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role insert sales" ON sales FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role insert system_logs" ON system_logs FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role insert alerts" ON alerts FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policies para atualização (service_role apenas)
CREATE POLICY "Service role update current_stats" ON current_stats FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role update camera_config" ON camera_config FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role update alerts" ON alerts FOR UPDATE USING (auth.role() = 'service_role');