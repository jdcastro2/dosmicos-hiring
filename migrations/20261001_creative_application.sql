-- Aplicar antes de publicar el nuevo formulario. Cambio aditivo, sin tocar datos ni permisos.
-- Las columnas históricas se conservan. No ejecutar nuevamente supabase-schema.sql.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS creative_application JSONB;
COMMENT ON COLUMN public.applications.creative_application IS 'Postulación creativa versionada; NULL para candidaturas históricas.';
COMMIT;
