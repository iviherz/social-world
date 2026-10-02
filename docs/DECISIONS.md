# Decisiones de implementación y límites

Esta entrega inicia el código sin convertir decisiones pendientes del PRD en aprobaciones.

- Nombre visible provisional **Tu mundo**, configurable con APP_NAME. GLOBE no se presenta como nombre aprobado.
- Fondo marfil, Georgia normal en títulos y Arial en interfaz son decisiones provisionales. No Inter, texto serif en cursiva, componentes stock, gradientes, neón o animaciones decorativas. Paleta aprobada intacta.
- Perfil privado por defecto. `public` en base de datos significa visible para personas autenticadas, no para visitantes anónimos. Perfiles compartibles fuera de la app quedan pendientes de una decisión explícita.
- Visitas y wishlist se publican por separado. RPC de comparación enmascara cada bandera: compartir visitados NO revela wishlist cuando un país tiene ambos estados.
- Colecciones siempre privadas en esta versión. Referencias guardadas no contienen copias del contenido original. Al perder permiso o borrar un original, se muestra no disponible.
- Mensajes solo entre seguidores mutuos. Al bloquear o dejar de ser mutuos desaparece el acceso al historial. No hay E2EE, lectura, online o última conexión.
- Flight hours es subconjunto de Trip hours. Solo traslado manual, sin esperas. No hay columna de origen, destino o fecha. Se conserva la función de estimación en el roadmap; no se inventa una fuente externa ni una duración.
- Catálogo de 249 países/territorios (world-countries sin Antártida). Geometría Natural Earth 110m: algunos territorios/islas solo están en la lista. NO se muestra porcentaje del mundo. La definición política y el denominador del PRD siguen pendientes.
- Recomendaciones con fotos JPG/PNG/WebP reprocesadas. Videos no están implementados. Avatar utiliza el mismo pipeline.
- Rankings de consejos por votos útiles y guardados de usuarios distintos en 7/30 días, excluyendo propios. No equivalen a viajes verificados. Badges y umbrales automáticos definitivos no se inventan: pendientes de decisión.
- Comentarios, guardado de fotos y perfiles están disponibles. Guardar un perfil no crea un follow.
- Mensajes se actualizan manualmente; no hay sockets ni lectura en vivo. El endpoint trae los últimos 100 mensajes accesibles, no una paginación histórica completa.
- Capacidad inicial: 250 perfiles/consejos, 500 lugares/comentarios/estados, 100 colecciones, 1000 guardados/duraciones, comparación hasta 30 personas, 200 fotos por cuenta. Se requiere paginación adicional para superar esos límites. No presentar esta beta como capacidad ilimitada.
- Borrado de cuenta limpia almacenamiento antes de borrar usuario y datos en cascada. Copias de seguridad del proveedor tienen retención independiente; documentarla antes de lanzamiento.
- Solo manifest y fallback offline, sin caché de datos privados. No es una app nativa.
- Moderación operativa inicial mediante Supabase Dashboard de un responsable autorizado con MFA. Los reportes no se publican. No existe un panel admin en el cliente.
- La cruz sobre remove unused packages continúa pendiente de aclaración. No se conservan dependencias vulnerables deliberadamente ni se realizan limpiezas destructivas.

## Pendiente antes de una apertura pública

Proveedor externo de horas; marca y tipografía definitiva; países/porcentaje; badges y antiabuso coordinado; reglas de menores y mercados; textos legales definitivos; restauración de backups; auditoría de despliegue con Google/Supabase/Storage reales. El paquete no contiene credenciales ni crea cuentas de servicios.
