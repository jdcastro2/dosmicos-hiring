# Pruebas de la reparación de seguridad

Compilar con variables exclusivamente locales:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-fake-key npm run build
node tests/security-flow.cjs
```

La suite usa Playwright ya instalado en `/tmp/dosmicos-hiring-test-tools/node_modules`. Lanza un mock localhost de Supabase y `next start` en 3001, cierra ambos al terminar, bloquea todos los destinos externos del navegador y usa fixtures. Requiere permiso de escuchar localhost y ejecutar Chromium/WebKit. No ejecutar esta suite contra producción ni usar un build conectado a Supabase real.

`security-preflight.sql` inspecciona exclusivamente metadatos en el proyecto existente antes de aplicar. `security-postcheck.sql` verifica metadatos y simula contextos RLS dentro de transacciones revertidas; no crea sesiones Auth ni usuarios, y solo extrae conteos booleanos de lector no autorizado y planes EXPLAIN. Esos scripts todavía no se ejecutaron en producción.

La migración de privacidad no tiene relación con la columna de postulación creativa. Antes de ejecutar SQL, publicar el código sin SELECT en INSERT. La aplicación y verificación reales de políticas quedan pendientes de una sesión administrativa existente.
