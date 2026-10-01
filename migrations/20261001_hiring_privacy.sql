-- Reparación exclusiva de hiring, sin columna creativa ni cambios a otros buckets.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '954ca339-7d04-4e5a-bc27-bd9b0e14dcec' AND lower(email) = 'julian@dosmicos.co' AND email_confirmed_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Identidad administrativa existente no coincide';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'resumes') THEN
    RAISE EXCEPTION 'Bucket existente resumes no encontrado';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_depend d JOIN pg_rewrite rw ON rw.oid=d.objid
    JOIN pg_class v ON v.oid=rw.ev_class
    WHERE d.refobjid='public.applications'::regclass AND v.relkind IN ('v','m')
      AND (has_table_privilege('anon',v.oid,'SELECT') OR has_table_privilege('authenticated',v.oid,'SELECT'))
  ) THEN
    RAISE EXCEPTION 'Vista dependiente accesible: revisar alcance antes de modificar';
  END IF;
END $$;

-- No tocar service_role ni grants de otras tablas/esquemas.
REVOKE ALL PRIVILEGES ON TABLE public.applications FROM anon, authenticated, PUBLIC;
-- Eliminar también ACL de columnas, si las hubiera (REVOKE de tabla no basta).
DO $$ DECLARE column_name text; BEGIN
  FOR column_name IN SELECT attname FROM pg_attribute WHERE attrelid='public.applications'::regclass AND attnum > 0 AND NOT attisdropped AND attacl IS NOT NULL LOOP
    EXECUTE format('REVOKE SELECT (%1$I), INSERT (%1$I), UPDATE (%1$I), REFERENCES (%1$I) ON public.applications FROM anon, authenticated, PUBLIC', column_name);
  END LOOP;
END $$;
GRANT INSERT ON TABLE public.applications TO anon;
GRANT SELECT ON TABLE public.applications TO authenticated;
DROP POLICY IF EXISTS "Allow anon select after insert" ON public.applications;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.applications;
CREATE POLICY hiring_admin_read ON public.applications FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = '954ca339-7d04-4e5a-bc27-bd9b0e14dcec'::uuid);
-- Defensa también ante otra política permisiva existente o futura.
CREATE POLICY hiring_admin_read_guard ON public.applications AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING ((SELECT auth.uid()) = '954ca339-7d04-4e5a-bc27-bd9b0e14dcec'::uuid);
-- Mantener la política INSERT anon preexistente y su CHECK, sin ampliar permisos.

UPDATE storage.buckets SET public = false WHERE id = 'resumes';
DROP POLICY IF EXISTS "Allow public reads from resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to resumes" ON storage.objects;
CREATE POLICY hiring_resume_admin_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND (SELECT auth.uid()) = '954ca339-7d04-4e5a-bc27-bd9b0e14dcec'::uuid);
CREATE POLICY hiring_resume_read_guard ON storage.objects AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (bucket_id <> 'resumes' OR (SELECT auth.uid()) = '954ca339-7d04-4e5a-bc27-bd9b0e14dcec'::uuid);
CREATE POLICY hiring_resume_update_guard ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (bucket_id <> 'resumes') WITH CHECK (bucket_id <> 'resumes');
CREATE POLICY hiring_resume_delete_guard ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (bucket_id <> 'resumes');
-- Se conserva Allow public uploads to resumes (INSERT): carga pública sin lectura/sobrescritura.
-- No se alteran grants globales de Storage, roles, archivos, filas ni otros buckets.
COMMIT;
