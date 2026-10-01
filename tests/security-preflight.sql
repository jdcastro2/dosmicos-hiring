-- SOLO METADATOS. No leer candidaturas ni archivos.
SELECT jsonb_build_object(
 'applications_rls', (SELECT relrowsecurity FROM pg_class WHERE oid='public.applications'::regclass),
 'applications_column_acl', (SELECT jsonb_agg(jsonb_build_object('column',attname,'acl',attacl)) FROM pg_attribute WHERE attrelid='public.applications'::regclass AND attacl IS NOT NULL),
 'policies', (SELECT jsonb_agg(to_jsonb(p)) FROM pg_policies p WHERE (schemaname='public' AND tablename='applications') OR (schemaname='storage' AND tablename='objects')),
 'bucket', (SELECT jsonb_build_object('id',id,'public',public) FROM storage.buckets WHERE id='resumes'),
 'security_definer_functions_to_review', (SELECT jsonb_agg(jsonb_build_object('schema',n.nspname,'name',q.proname,'anon_execute',has_function_privilege('anon',q.oid,'EXECUTE'),'authenticated_execute',has_function_privilege('authenticated',q.oid,'EXECUTE'))) FROM pg_proc q JOIN pg_namespace n ON n.oid=q.pronamespace WHERE q.prokind='f' AND q.prosecdef AND n.nspname NOT IN ('pg_catalog','information_schema') AND pg_get_functiondef(q.oid) ~ '\mapplications\M'),
 'dependent_views', (SELECT jsonb_agg(DISTINCT jsonb_build_object('schema',n.nspname,'view',v.relname,'owner',pg_get_userbyid(v.relowner),'options',v.reloptions,'anon_select',has_table_privilege('anon',v.oid,'SELECT'),'authenticated_select',has_table_privilege('authenticated',v.oid,'SELECT'))) FROM pg_depend d JOIN pg_rewrite rw ON rw.oid=d.objid JOIN pg_class v ON v.oid=rw.ev_class JOIN pg_namespace n ON n.oid=v.relnamespace WHERE d.refobjid='public.applications'::regclass AND v.relkind IN ('v','m'))
) AS metadata;
