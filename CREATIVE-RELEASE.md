# Prácticas creativas Dosmicos

Base: main bc3b40a653e27fa1f6cd287b03b7bef31e492ce5, posterior al arreglo de privacidad de PR #2. Este cambio está separado y requiere aprobación antes de migración/merge/producción.

## Formulario y compatibilidad

Tres pasos: perfil/datos/universidad/programa; habilitación/inicio/presencialidad/horario académico; CV o portafolio y dos trabajos existentes con aporte personal. Ambos perfiles se distinguen sin prueba adicional inicial. Introducción aprobada y aspiración de expansión global; dos cupos totales, Bogotá presencial, COP 2.000.000 recibidos por persona más costos de empresa aparte, ingreso noviembre 2026–enero 2027, lunes a viernes 08:00–17:00 sujeto a compatibilidad académica y descansos, líder Julián Castro, duración según universidad. Sin modalidad contractual inventada ni plazo prometido de respuesta. Se retiran del formulario y sus metadatos el diagnóstico Instagram, campaña mayo–agosto y reto de ventas; los datos históricos permanecen en el panel.

Carga existente resumes, PDF/Word hasta 5 MB, nombre UUID sin datos personales, upsert=false. Cliente de postulación siempre anon; INSERT sin SELECT. El panel y las exportaciones siguen exigiendo sesión e identidad aprobada; CV mediante firma de 60 segundos. Las API, Auth, políticas, grants, otros buckets y el lockfile no cambian en esta propuesta. JSON inválido de terceros no rompe la vista administrativa.

El ID primario estable por correo normalizado y campaña evita doble clic, reintentos inciertos y duplicados tras recargar sin leer ni sobrescribir registros. Una segunda postulación con el mismo correo en esta campaña conserva la primera; no sirve para editarla. No se afirma verificación de propiedad del correo.

## Validación aislada

Build con Next 15.5.27 y React 19.3.0, tipos y lint. Validaciones unitarias: ambos perfiles, límites/fechas inválidas, URLs inseguras, identidad estable y datos JSON incompletos. Flujo en Chromium escritorio 1440×1000, Chromium móvil 390×844 y WebKit móvil 375×812: campos requeridos, CV o portafolio, tipo/tamaño/carga de CV, retroceso con datos conservados, errores de red, reintento, doble clic y duplicado normalizado tras recarga, sin desbordamiento horizontal. Regresión de seguridad: cinco clases de acceso rechazadas antes de leer/firmar; admin simulado y CV privado, PDF/CSV con candidatos creativos e históricos, revocación, logout y formulario anon aun con sesión admin. Solo fixtures locales y Supabase simulado; destinos externos del navegador bloqueados y cero candidaturas de producción.

Evidencias locales en evidence/, excluidas del PR: build.log, test-results.json, security-test-results.json y capturas desktop-chromium-intro.png/mobile-webkit-works.png. Los avisos de consola 401 de pruebas son rechazos esperados; WebKit hizo fallback de navegación RSC local y completó la suite sin pageerror. El warning informativo Browserslist no impidió build. El login real del administrador y apertura de CV reales quedan fuera de estas pruebas.

## Preview

La rama generará preview con la integración Vercel existente. Inspeccionar solo interfaz con SSO normal. Sus variables pueden apuntar al Supabase real: no enviar postulación ni subir CV ficticios allí. La columna nueva todavía no está aplicada; probar envíos solo en localhost con mock hasta aprobación de publicación. No crear bypass ni nuevos servicios.

## Orden exacto para publicar después de aprobación

1. Revisar el head final del PR y sus checks, confirmando que conserva el arreglo de seguridad.
2. En el proyecto Supabase existente ysdcsqsfnckeuafjyrbc, verificar metadatos de creative_application: ausente o JSONB. Aplicar únicamente migrations/20261001_creative_application.sql: transacción aditiva, sin tocar datos ni permisos. No ejecutar supabase-schema.sql ni repetir la migración de privacidad.
3. Confirmar columna JSONB nullable, sin default; conteos y permisos/RLS/Storage de privacidad sin cambios. El formulario antiguo continúa compatible durante este paso.
4. Integrar el PR creativo en main, lo que dispara el despliegue automático de Vercel. Verificar producción READY para el SHA integrado y alias hiring.dosmicos.com.
5. Revisar formulario/móvil/retroceso sin enviar candidatura falsa; API admin sin sesión 401/private,no-store; acceso administrativo con sesión existente solo si autorizado. No extraer candidatos para esta revisión.

Si falla SQL antes de COMMIT: ROLLBACK y detener. Si falla despliegue, conservar columna aditiva y código de seguridad anterior; no revertir privacidad, eliminar la columna ni borrar postulaciones. No se aplicó migración ni se integró/publicó este formulario.
