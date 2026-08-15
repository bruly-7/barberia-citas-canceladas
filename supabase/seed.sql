-- seed.sql - Cargar datos de prueba
-- Copia y pega esto en Supabase > SQL Editor

-- Limpiar tablas (opcional)
DELETE FROM appointments;
DELETE FROM waitlist;
DELETE FROM activity_log;
DELETE FROM daily_stats;

-- Insertar citas de prueba
INSERT INTO appointments (time, client_name, service, price, status) VALUES
('09:30', 'Manuel R.', 'Corte clásico', 12.00, 'confirmed'),
('10:15', 'Javier S.', 'Fade + diseño', 20.00, 'confirmed'),
('11:00', 'Carlos M.', 'Corte + Barba', 18.00, 'confirmed'),
('11:45', 'Rubén T.', 'Arreglo de barba', 8.00, 'confirmed'),
('12:30', 'Álvaro D.', 'Corte clásico', 12.00, 'confirmed'),
('13:15', 'Iván G.', 'Fade + diseño', 20.00, 'confirmed'),
('14:00', 'Sergio P.', 'Corte + Arreglo', 15.00, 'confirmed'),
('14:45', 'Diego L.', 'Fade clásico', 18.00, 'confirmed'),
('15:30', 'Ángel M.', 'Corte + Barba', 18.00, 'confirmed'),
('16:15', 'Tomás R.', 'Arreglo rápido', 8.00, 'confirmed');

-- Insertar lista de espera
INSERT INTO waitlist (name, phone, position) VALUES
('Sergio R.', '600112244', 1),
('Ana P.', '611888007', 2),
('Diego L.', '622333351', 3),
('María F.', '633119926', 4);

-- Insertar actividad inicial
INSERT INTO activity_log (action) VALUES
('Sistema iniciado — esperando movimientos del día');

-- Inicializar stats del día
INSERT INTO daily_stats (date, total_refills, total_recovered) VALUES
(CURRENT_DATE, 0, 0.00)
ON CONFLICT (date) DO NOTHING;
