# Pruebas de la reparación de seguridad

Compilar con variables exclusivamente locales:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-fake-key npm run build
node tests/security-flow.cjs
```

La suite usa Playwright ya instalado en `/tmp/dosmicos-hiring-test-tools/node_modules`. Lanza un mock localhost de Supabase y `next start` en 3001, cierra ambos al terminar, bloquea todos los destinos externos del navegador y usa fixtures. Requiere permiso de escuchar localhost y ejecutar Chromium/WebKit. No ejecutar esta suite contra producción ni usar un build conectado a Supabase real.

`security-preflight.sql` inspecciona exclusivamente metadatos en el proyecto existente antes de aplicar. `security-postcheck.sql` verifica metadatos y simula contextos RLS dentro de transacciones revertidas; no crea sesiones Auth ni usuarios, y solo extrae conteos booleanos de lector no autorizado y planes EXPLAIN. El cierre de privacidad y esos checks fueron verificados en producción por el worker de navegador el 2026-10-01; no repetir la migración de privacidad.

La migración de privacidad no tiene relación con la columna de postulación creativa. Antes de ejecutar SQL, publicar el código sin SELECT en INSERT. La aplicación y verificación reales de políticas quedan pendientes de una sesión administrativa existente.

## Formulario creativo integrado sobre seguridad

Con el mismo build aislado, iniciar `next start` en localhost 3100. Ejecutar `tests/local-flow.cjs` con NODE_PATH=/tmp/dosmicos-hiring-test-tools/node_modules y TEST_CHROMIUM_PATH/TEST_WEBKIT_PATH a navegadores existentes. Esta suite intercepta todo Supabase y bloquea destinos externos. `tests/security-flow.cjs` usa localhost 3001 y mock en 54321, y ahora cubre panel/exportaciones creativas e históricas y formulario creativo anon mientras hay sesión administrativa.

Unitarias: `./node_modules/.bin/tsc src/lib/creative.ts --outDir /tmp/dosmicos-unit --target es2020 --module commonjs --skipLibCheck --types node`, luego `node tests/validation.cjs`. No copiar variables reales ni probar envíos en preview/producción. La migración creativa sigue pendiente y separada de las políticas de privacidad ya aplicadas. Orden de publicación: CREATIVE-RELEASE.md.
