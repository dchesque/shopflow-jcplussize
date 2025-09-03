-- Function para atualizar estatísticas em tempo real
CREATE OR REPLACE FUNCTION update_current_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir registro de stats se não existir para hoje
  INSERT INTO current_stats (date, people_count, total_entries, total_exits)
  VALUES (CURRENT_DATE, 0, 0, 0)
  ON CONFLICT (date) DO NOTHING;

  -- Atualizar contadores baseado na ação
  IF NEW.action = 'ENTER' THEN
    UPDATE current_stats 
    SET people_count = people_count + 1,
        total_entries = total_entries + 1,
        last_updated = NOW()
    WHERE date = CURRENT_DATE;
  ELSIF NEW.action = 'EXIT' THEN
    UPDATE current_stats 
    SET people_count = GREATEST(0, people_count - 1),
        total_exits = total_exits + 1,
        last_updated = NOW()
    WHERE date = CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para atualizar estatísticas por hora
CREATE OR REPLACE FUNCTION update_hourly_stats()
RETURNS TRIGGER AS $$
DECLARE
  current_hour integer;
  current_date date;
BEGIN
  current_hour := EXTRACT(hour FROM NEW.timestamp);
  current_date := DATE(NEW.timestamp);

  -- Inserir registro se não existir
  INSERT INTO hourly_stats (date, hour, entries, exits)
  VALUES (current_date, current_hour, 0, 0)
  ON CONFLICT (date, hour) DO NOTHING;

  -- Atualizar contadores por hora
  IF NEW.action = 'ENTER' THEN
    UPDATE hourly_stats 
    SET entries = entries + 1
    WHERE date = current_date AND hour = current_hour;
  ELSIF NEW.action = 'EXIT' THEN
    UPDATE hourly_stats 
    SET exits = exits + 1
    WHERE date = current_date AND hour = current_hour;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para calcular taxa de conversão
CREATE OR REPLACE FUNCTION get_conversion_rate(p_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(
  visitors integer,
  sales_count bigint,
  conversion_rate numeric,
  total_sales_amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(cs.total_entries, 0) as visitors,
    COALESCE(COUNT(s.id), 0) as sales_count,
    CASE 
      WHEN COALESCE(cs.total_entries, 0) > 0 THEN 
        ROUND((COALESCE(COUNT(s.id), 0)::numeric / cs.total_entries) * 100, 2)
      ELSE 0
    END as conversion_rate,
    COALESCE(SUM(s.amount), 0) as total_sales_amount
  FROM current_stats cs
  LEFT JOIN sales s ON DATE(s.timestamp) = cs.date
  WHERE cs.date = p_date
  GROUP BY cs.total_entries;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para obter métricas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_date date DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT JSON_BUILD_OBJECT(
    'current_people', COALESCE(cs.people_count, 0),
    'total_entries', COALESCE(cs.total_entries, 0),
    'total_exits', COALESCE(cs.total_exits, 0),
    'sales_today', COALESCE(sales_data.count, 0),
    'revenue_today', COALESCE(sales_data.total, 0),
    'conversion_rate', COALESCE(conv.conversion_rate, 0),
    'avg_time_spent', '00:15:30', -- Placeholder - seria calculado com tracking
    'peak_hour', peak_data.hour,
    'peak_count', peak_data.max_entries,
    'last_updated', cs.last_updated
  ) INTO result
  FROM current_stats cs
  LEFT JOIN (
    SELECT COUNT(*) as count, SUM(amount) as total
    FROM sales 
    WHERE DATE(timestamp) = p_date
  ) sales_data ON true
  LEFT JOIN (
    SELECT conversion_rate
    FROM get_conversion_rate(p_date)
  ) conv ON true
  LEFT JOIN (
    SELECT hour, entries as max_entries
    FROM hourly_stats 
    WHERE date = p_date
    ORDER BY entries DESC
    LIMIT 1
  ) peak_data ON true
  WHERE cs.date = p_date;

  RETURN COALESCE(result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para obter dados do heatmap por hora
CREATE OR REPLACE FUNCTION get_hourly_heatmap(p_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(
  hour integer,
  entries integer,
  exits integer,
  net_traffic integer,
  intensity float
) AS $$
DECLARE
  max_traffic integer;
BEGIN
  -- Obter o tráfego máximo do dia para normalização
  SELECT MAX(hs.entries) INTO max_traffic
  FROM hourly_stats hs
  WHERE hs.date = p_date;

  RETURN QUERY
  WITH hours AS (
    SELECT generate_series(0, 23) as h
  )
  SELECT 
    hours.h as hour,
    COALESCE(hs.entries, 0) as entries,
    COALESCE(hs.exits, 0) as exits,
    COALESCE(hs.entries, 0) - COALESCE(hs.exits, 0) as net_traffic,
    CASE 
      WHEN max_traffic > 0 THEN COALESCE(hs.entries::float / max_traffic, 0)
      ELSE 0
    END as intensity
  FROM hours
  LEFT JOIN hourly_stats hs ON hs.hour = hours.h AND hs.date = p_date
  ORDER BY hours.h;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para limpar dados antigos (maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep integer DEFAULT 90)
RETURNS void AS $$
BEGIN
  -- Remover eventos antigos
  DELETE FROM people_events 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;

  -- Remover logs antigos
  DELETE FROM system_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * (days_to_keep / 3);

  -- Marcar alertas antigos como lidos
  UPDATE alerts 
  SET is_read = true 
  WHERE created_at < NOW() - INTERVAL '7 days' AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS update_stats_trigger ON people_events;
CREATE TRIGGER update_stats_trigger
  AFTER INSERT ON people_events
  FOR EACH ROW EXECUTE FUNCTION update_current_stats();

DROP TRIGGER IF EXISTS update_hourly_trigger ON people_events;
CREATE TRIGGER update_hourly_trigger
  AFTER INSERT ON people_events
  FOR EACH ROW EXECUTE FUNCTION update_hourly_stats();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_camera_config_updated_at ON camera_config;
CREATE TRIGGER update_camera_config_updated_at
  BEFORE UPDATE ON camera_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();