-- ==========================================
-- Tablas para el sistema de citas canceladas
-- ==========================================
-- Copia y pega esto en Supabase > SQL Editor > New query

-- Tabla de citas
CREATE TABLE appointments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  time TEXT NOT NULL,
  client_name TEXT NOT NULL,
  service TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'refilled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de lista de espera
CREATE TABLE waitlist (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  position INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de actividad / log
CREATE TABLE activity_log (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  action TEXT NOT NULL,
  appointment_id BIGINT REFERENCES appointments(id) ON DELETE SET NULL,
  waitlist_id BIGINT REFERENCES waitlist(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de estadísticas del día
CREATE TABLE daily_stats (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_refills INT DEFAULT 0,
  total_recovered DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para queries frecuentes
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created ON appointments(created_at);
CREATE INDEX idx_waitlist_created ON waitlist(created_at);
CREATE INDEX idx_activity_appointment ON activity_log(appointment_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);

-- RLS (Row Level Security) - permitir lectura pública para demo
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON appointments FOR UPDATE USING (true);

CREATE POLICY "Allow public read" ON waitlist FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON waitlist FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON daily_stats FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON daily_stats FOR UPDATE USING (true);

-- Realtime: publicar cambios de las tablas para las suscripciones del frontend
ALTER PUBLICATION supabase_realtime ADD TABLE appointments, waitlist, activity_log, daily_stats;
