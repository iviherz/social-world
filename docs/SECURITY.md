# Controles y verificación

## Secretos

Todas las llamadas a Supabase salen del servidor. No hay SDK de autenticación en componentes cliente. Cookies de sesión HttpOnly, Secure en producción y SameSite Lax. No localStorage de sesión. PKCE gestionado por @supabase/ssr. Cada API verifica `auth.getUser()`; no confía solo en proxy, sesión local o botones.

SUPABASE_SECRET_KEY es opcional y se usa exclusivamente en el servidor de fotos después de validar cuenta, origen, cuota, tamaño y contenido. Este cliente no realiza consultas de datos de usuarios. La clave puede omitir RLS: protegerla como secreto de alta sensibilidad. SUPABASE_PUBLISHABLE_KEY es técnicamente publicable, pero esta implementación también la mantiene en el servidor. No guardar secretos en next.config.ts, NEXT_PUBLIC_*, código, screenshots, commits ni logs.

Si una clave se expone: revocar/rotar en el proveedor, reemplazar variable, redeploy, comprobar uso y facturación; retirar de historial sin asumir que eso la invalida. Activar secret scanning/push protection donde esté disponible. .gitignore no protege archivos que ya estaban versionados.

## Permisos

RLS en todas las tablas de aplicación, Storage privado y grants explícitos. Funciones SECURITY DEFINER con search_path vacío y permisos restringidos. Helpers de pares arbitrarios no se exponen a authenticated. RPC de mapas oculta visitados/wishlist no compartidos. Horas en tabla distinta: ninguna comparación, feed, recomendación o ranking las consulta.

Autorización se aplica también a consultas directas de Supabase. Las pruebas PostgreSQL ejecutan consultas con rol authenticated y usuarios A/B/C. El modelo de auth y storage usado en PGlite es un fixture; NO sustituye comprobar Google, JWT, cookies y Storage real.

Colecciones guardan referencias, no copias. Medios se sirven a través de API autenticada con permisos Storage por petición; no hay URLs firmadas reutilizables ni caché público. El bloqueo revoca perfiles, consejos, mensajes y medios asociados. Las fotos pueden mostrar ubicación en su propio contenido; limpiar EXIF no elimina lo que se ve en la imagen.

## Antiabuso

Login: Redis distribuido, 8 intentos por 10 minutos; falla cerrado en producción si falta Redis. Configurar también límites Auth de Supabase y WAF Vercel. No hay login de contraseñas propias ni obligación innecesaria de OTP a usuarios con Google. Exigir MFA a responsables de Vercel, GitHub y Supabase.

Escrituras DB: trigger compartido por usuario, 120 operaciones por minuto, incluso acceso directo a Data API. Autovotos prohibidos, votos/guardados idempotentes, timestamps de utilidad establecidos por DB. Límite de fotos 200 por cuenta y tamaño máximo 3 MiB, píxeles 25M, salida WebP 1600 px; original no se almacena. La cuota de archivos es un control beta, no un contador transaccional frente a cargas concurrentes.

Lecturas: RLS protege confidencialidad, pero no reemplaza límites de consumo. Activar WAF, límites del Data API, alertas de gasto y cuotas del proveedor. Revisar ataques distribuidos y abuso coordinado antes de exposición masiva. Los reportes requieren una persona que los atienda.

## Web

POST requiere Origin exacto APP_URL y JSON validado Zod; lectura de JSON limitada a 12 KB. React escapa texto, no se usa HTML crudo. Consultas del SDK parametrizadas; ninguna consulta SQL se arma con texto del usuario. CSP con nonce para scripts, frame-ancestors none, object-src none, base-uri self; inline styles permitidos para D3/color personal y CSS de React, scripts inline sin nonce prohibidos. HTTPS, HSTS, no-sniff, no-referrer, GPS/cámara/micrófono bloqueados. CORS no se usa como sustituto de permisos.

Errores públicos genéricos sin stack, claves o cuerpos privados. Source maps del cliente desactivados. API/perfil/auth no-store, noindex. PWA solo conserva offline.html e icono; nunca datos privados. No analytics publicitaria instalada.

## Pruebas incluidas

`npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`, `npm audit --omit=dev`.

Schema: duraciones enteras positivas, no rutas persistidas, tamaños y modo válidos. PostgreSQL: migraciones, horas privadas, aislamiento de colecciones, flags enmascarados, mutualidad, revocación por bloqueo, visitante anónimo. Fotos: eliminación de EXIF/ICC/XMP y resolución. E2E: mapa, globo, móvil, 404, estados temporales y axe. La auditoría completa de ASVS y pruebas de servicios reales quedan pendientes; no declarar certificación ni invulnerabilidad.
