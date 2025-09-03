-- Inserir configuração padrão da câmera
INSERT INTO camera_config (name, rtsp_url, line_position, fps, resolution, confidence_threshold) VALUES
('Câmera Principal', 'rtsp://admin:password@192.168.1.100:554/stream1', 50, 25, '1920x1080', 0.6);

-- Inserir estatísticas do dia atual (inicializar)
INSERT INTO current_stats (date, people_count, total_entries, total_exits) VALUES
(CURRENT_DATE, 0, 0, 0)
ON CONFLICT (date) DO NOTHING;

-- Inserir alguns dados de exemplo para demonstração
DO $$
DECLARE
  base_time timestamptz;
  i integer;
  hour_val integer;
BEGIN
  base_time := CURRENT_DATE + INTERVAL '9 hours'; -- Começar às 9h

  -- Inserir eventos de exemplo ao longo do dia
  FOR i IN 1..50 LOOP
    hour_val := 9 + (i % 10); -- Distribuir entre 9h e 18h
    
    -- Entrada
    INSERT INTO people_events (timestamp, action, person_tracking_id, confidence, camera_zone)
    VALUES (
      base_time + INTERVAL '1 hour' * (i % 10) + INTERVAL '1 minute' * (i * 3),
      'ENTER',
      'person_' || i,
      0.8 + (random() * 0.2),
      'main'
    );
    
    -- Algumas saídas (80% das entradas)
    IF i % 5 != 0 THEN
      INSERT INTO people_events (timestamp, action, person_tracking_id, confidence, camera_zone)
      VALUES (
        base_time + INTERVAL '1 hour' * (i % 10) + INTERVAL '1 minute' * (i * 3 + 15),
        'EXIT',
        'person_' || i,
        0.8 + (random() * 0.2),
        'main'
      );
    END IF;
  END LOOP;

  -- Inserir algumas vendas de exemplo
  FOR i IN 1..12 LOOP
    INSERT INTO sales (timestamp, amount, items, payment_method, transaction_id)
    VALUES (
      base_time + INTERVAL '1 hour' * (i % 8) + INTERVAL '1 minute' * (i * 5),
      25.50 + (random() * 100),
      1 + (random() * 3)::integer,
      CASE (random() * 3)::integer
        WHEN 0 THEN 'card'
        WHEN 1 THEN 'cash'
        ELSE 'pix'
      END,
      'TXN_' || LPAD(i::text, 6, '0')
    );
  END LOOP;

  -- Inserir alguns logs do sistema
  INSERT INTO system_logs (level, message, component) VALUES
  ('INFO', 'Sistema iniciado com sucesso', 'system'),
  ('INFO', 'Câmera conectada', 'camera'),
  ('INFO', 'Modelo YOLOv8 carregado', 'detector'),
  ('WARNING', 'Qualidade do stream temporariamente reduzida', 'camera'),
  ('INFO', 'Conexão com banco de dados estabelecida', 'database');

  -- Inserir alguns alertas de exemplo
  INSERT INTO alerts (type, title, message, severity) VALUES
  ('camera', 'Câmera Offline', 'Câmera principal perdeu conexão às 14:30', 'warning'),
  ('system', 'Alto Tráfego', 'Pico de visitantes detectado - 25 pessoas em 10 minutos', 'info'),
  ('sales', 'Meta Atingida', 'Meta diária de vendas atingida: R$ 1.250,00', 'info');
END $$;

-- Atualizar estatísticas horárias baseado nos eventos inseridos
INSERT INTO hourly_stats (date, hour, entries, exits, max_people, avg_people)
SELECT 
  DATE(timestamp) as date,
  EXTRACT(hour FROM timestamp)::integer as hour,
  COUNT(*) FILTER (WHERE action = 'ENTER') as entries,
  COUNT(*) FILTER (WHERE action = 'EXIT') as exits,
  COUNT(*) FILTER (WHERE action = 'ENTER') as max_people, -- Simplificado
  COUNT(*) FILTER (WHERE action = 'ENTER')::float / 2 as avg_people -- Simplificado
FROM people_events
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY DATE(timestamp), EXTRACT(hour FROM timestamp)
ON CONFLICT (date, hour) DO UPDATE SET
  entries = EXCLUDED.entries,
  exits = EXCLUDED.exits,
  max_people = EXCLUDED.max_people,
  avg_people = EXCLUDED.avg_people;