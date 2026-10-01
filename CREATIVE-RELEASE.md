# Primer contacto para prácticas creativas Dosmicos

Base: main bc3b40a653e27fa1f6cd287b03b7bef31e492ce5, posterior al arreglo de privacidad. PR #3 permanece borrador; migración/merge/producción requieren aprobación de esta versión.

## Formulario breve

Una página con ocho campos: Nombre completo; Correo electrónico; Perfil al que te postulas; Universidad; Carrera; Hoja de vida — PDF o Word, máximo 5 MB; ¿Qué es lo más impresionante que has construido, organizado o logrado FUERA de la universidad y de las notas académicas?; Link a tu portafolio (opcional).

Nombre/correo/perfil/universidad/carrera/CV/logro obligatorios; portafolio opcional. Se retiran del primer contacto teléfono, habilitación, fecha/presencialidad/compatibilidad horaria y los dos trabajos/aportes. Disponibilidad y requisitos universitarios se revisan después del primer filtro. Universidad se guarda en su columna histórica existente; Carrera en el JSONB preparado. Teléfono se conserva como columna histórica y recibe cadena vacía sin preguntar ni inventar datos.

Condiciones públicas preservadas: introducción aprobada, aspiración global, dos cupos totales, Bogotá presencial, COP 2.000.000 mensuales recibidos por persona más costos de empresa aparte, ingreso noviembre 2026–enero 2027, lunes a viernes 08:00–17:00 sujeto compatibilidad académica y descansos, líder Julián Castro, duración según universidad. No se detalla almuerzo ni se inventa contratación. No vuelven pruebas antiguas, cifras no comprobadas ni plazos de respuesta.

## Datos y seguridad

El logro se guarda en impressive_achievement existente. creative_application JSONB guarda versión creative-2026-brief-v2, perfil y carrera. El panel/modal/PDF/CSV muestran el logro y mantienen datos de postulaciones históricas y del formato creativo v1. Ningún registro previo se modifica. Se mantiene identidad por correo normalizado/campaña para doble clic, reintentos y duplicados; la segunda postulación conserva la primera, no la edita.

CV: almacenamiento resumes existente, nombre UUID, upsert=false. Cliente público anon incluso con sesión administrativa; INSERT sin SELECT. Auth, API admin, identidad aprobada, firma CV 60s, revalidación exportación y políticas/grants de privacidad se conservan. No cambios a credenciales, otros buckets, servicios, dependencias o Sewdle.

## Validación

Build/tipos/lint y unitarias. Flujo breve en Chromium escritorio/móvil y WebKit móvil con Supabase interceptado: ocho campos y pregunta exacta, ausencia de requisitos retirados, CV obligatorio/portafolio opcional, tipo/tamaño/carga, URLs inseguras, error y reintento, doble clic y duplicado tras recarga. Regresión de seguridad: acceso rechazado antes de datos, panel/exportación de formato breve e históricos/v1, CV privado, revocación, logout y formulario anon con sesión admin. Fixtures locales; cero candidaturas/archivos de producción. Evidencia local en evidence/, fuera del PR. Login real y CV reales siguen fuera de estas pruebas.

## Preview y publicación pendiente

Preview Vercel solo para revisar interfaz con SSO normal. Puede compartir Supabase real: no enviar ni subir datos ficticios allí. La columna JSONB aún no se aplica; envíos se prueban únicamente en localhost con mock.

Después de aprobar esta versión:
1. Revisar head/checks finales del PR #3.
2. Verificar en Supabase ysdcsqsfnckeuafjyrbc que creative_application está ausente o ya es JSONB. Aplicar únicamente migrations/20261001_creative_application.sql y verificar columna JSONB nullable, sin default, sin cambios de datos/permisos/RLS/Storage. El cliente de seguridad actual sigue compatible.
3. Integrar PR #3 en main para activar Vercel. Verificar production READY para SHA integrado y alias hiring.dosmicos.com.
4. Revisar interfaz/móvil sin candidaturas ficticias; API sin sesión 401/private,no-store. Verificar login app administrativo con sesión existente solo dentro del alcance aprobado.

No repetir migración de privacidad ni ejecutar supabase-schema.sql. Error SQL antes de COMMIT: ROLLBACK y detener. Fallo de despliegue: conservar columna aditiva y código de seguridad previo; no revertir privacidad ni eliminar datos/columna. Esta preparación no aplica migración ni integra/publica formulario.
