-- fix.sql — Ejecutar en Supabase > SQL Editor sobre una BD ya creada con la versión anterior de schema.sql
-- (si creas la BD desde cero con el schema.sql actual, este archivo no es necesario)

-- 1. Permitir borrar clientes de la lista de espera aunque tengan entradas en el log
ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_waitlist_id_fkey;
ALTER TABLE activity_log
  ADD CONSTRAINT activity_log_waitlist_id_fkey
  FOREIGN KEY (waitlist_id) REFERENCES waitlist(id) ON DELETE SET NULL;

ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_appointment_id_fkey;
ALTER TABLE activity_log
  ADD CONSTRAINT activity_log_appointment_id_fkey
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- 2. Activar realtime para que la UI se actualice sola
ALTER PUBLICATION supabase_realtime ADD TABLE appointments, waitlist, activity_log, daily_stats;
