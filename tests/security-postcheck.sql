-- Verificación mínima tras aplicar. SELECT metadata; no nombres, correos de candidatos ni rutas de CV.
SELECT jsonb_build_object(
 'anon_select',has_table_privilege('anon','public.applications','SELECT'),
 'anon_insert',has_table_privilege('anon','public.applications','INSERT'),
 'anon_update',has_table_privilege('anon','public.applications','UPDATE'),
 'anon_delete',has_table_privilege('anon','public.applications','DELETE'),
 'anon_truncate',has_table_privilege('anon','public.applications','TRUNCATE'),
 'authenticated_select',has_table_privilege('authenticated','public.applications','SELECT'),
 'bucket_public',(SELECT public FROM storage.buckets WHERE id='resumes'),
 'policies',(SELECT jsonb_agg(to_jsonb(p)) FROM pg_policies p WHERE (schemaname='public' AND tablename='applications') OR (schemaname='storage' AND tablename='objects' AND policyname LIKE 'hiring_resume%'))
) AS effective_metadata;

-- Simulación de contexto de base de datos; no fabrica JWT ni sesiones Auth reales.
-- No administra roles ni crea usuarios. Devuelve solo conteos filtrados por RLS.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
SELECT 'nonadmin_rls' AS test,
 (SELECT count(*) FROM public.applications) = 0 AS no_applications_visible,
 (SELECT count(*) FROM storage.objects WHERE bucket_id='resumes') = 0 AS no_resumes_visible;
ROLLBACK;

-- Contexto admin aprobado. EXPLAIN no ejecuta consultas ni extrae registros.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','954ca339-7d04-4e5a-bc27-bd9b0e14dcec',true);
SELECT set_config('request.jwt.claims','{"sub":"954ca339-7d04-4e5a-bc27-bd9b0e14dcec","role":"authenticated"}',true);
EXPLAIN (FORMAT JSON) SELECT id FROM public.applications;
EXPLAIN (FORMAT JSON) SELECT id FROM storage.objects WHERE bucket_id='resumes';
ROLLBACK;
