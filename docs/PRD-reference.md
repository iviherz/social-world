# Documento base de requisitos

Referencia histórica previa al inicio de código. La autorización posterior de la usuaria inicia esta entrega; consultar DECISIONS.md y VERIFICATION.md para el estado actual.

# PRD · Social World

Versión 0.3 · 1 de octubre de 2026 · Nombre pendiente · Estética aprobada · Reglas de diseño y seguridad incorporadas

## 1. Propósito y estado

Producto social para construir un mundo personal de países y lugares visitados o deseados, descubrir recomendaciones concretas de personas conocidas, organizar guardados y comparar mundos. El mapa Equal Earth y el globo son los objetos visuales centrales. Mapamundi designa exclusivamente la comparación colectiva con Co-Travelers.

Este documento reúne los requisitos expresamente acordados. Las reglas nuevas necesarias para implementar el producto se identifican como propuestas. Una propuesta no se convierte en decisión aprobada por aparecer aquí. Ninguna funcionalidad futura se elimina al priorizar una primera versión.

Objetivo inicial: una web responsive y PWA funcional. Aplicaciones nativas posteriores. Stack acordado como dirección: GitHub, Next.js/TypeScript, Vercel, Supabase, cartografía con D3/MapLibre según la vista, luego Expo/React Native. La implementación específica y compatibilidad se verificarán antes de programar. No sustituir este stack por otro servicio sin discutirlo.

## 2. Principios invariables de privacidad

P-01. La plataforma no muestra fechas de visitas o viajes, país o ciudad actual, localización en tiempo real, historial de localización, estado online ni última conexión.

P-02. No solicitar GPS, itinerarios, reservas o fechas para registrar países visitados o deseados. El catálogo contiene coordenadas de lugares, no posiciones del usuario.

P-03. Suprimir When did you go? y campos equivalentes. Tampoco inferir Recently explored a partir del momento de carga. Publicar una recomendación no prueba cuándo ocurrió la visita.

P-04. Flight hours/Trip hours es opt-in. Horas y trayectos permanecen privados. Nunca alimentan perfiles públicos, recomendaciones, rankings, notificaciones a contactos ni mapas sociales.

P-05. Procesar medios antes de publicarlos y eliminar metadatos sensibles de fecha/localización. Los originales no quedan en una ruta pública. Alcance de video y formato de procesamiento pendiente.

P-06. Propuesta: colecciones y wishlist privadas por defecto, con publicación consciente cuando corresponda. Mapas compartidos solo usan datos autorizados para ese observador. Ser Co-Traveler no concede acceso automático a todo.

P-07. Los timestamps técnicos de operaciones no equivalen a fechas de viaje. Propuesta: conservar solo los necesarios, limitar exposición, retención y acceso. Evitar que actividad, logs, analítica o proveedores permitan reconstruir trayectos privados.

P-08. Los textos y fotos que el usuario publica pueden revelar información voluntariamente. La app no puede garantizar que ninguna persona infiera ubicación a partir de contenido libre. Debe evitar etiquetas automáticas, extracción pública de localización o falsas promesas de anonimato.

## 3. Personas y principales recorridos

Usuario individual: crea cuenta, configura perfil/color/tags, marca países y consulta su mapa/globo.

Descubridor: explora lugares y recomendaciones, guarda objetos en colecciones y sigue perfiles.

Co-Traveler: compara mundos con contactos mutuos, participa en Mapamundi y consulta Ask me about.

Contribuyente: publica consejos útiles y recibe señales de reputación calculadas por el sistema.

## 4. Registro de requisitos y aceptación

| ID | Requisito acordado | Criterio de aceptación |
|---|---|---|
| A-01 | Google login, username, nombre, bio, avatar, privacidad | Sesión real, username único y edición persistente. Email no público. |
| W-01 | Mapa Equal Earth y globo personal | Ambos representan los mismos estados y cantidades. Recargar conserva cambios. |
| W-02 | Países y lugares visitados y deseados | Se pueden agregar y quitar sin fecha ni ubicación del dispositivo. |
| W-03 | Cantidad de países y porcentaje del mundo | Un catálogo y denominador documentados evitan cifras contradictorias. |
| R-01 | Recomendaciones de lugares concretos | Lugar, categoría, Recommend/Skip y consejo. No se recomienda un país como unidad. |
| R-02 | Categorías | Food, Stay, Culture, Nature, Nightlife, History, Hidden gem, Experience, Other. |
| R-03 | Fotos y videos opcionales | Publicación condicionada al procesamiento de medios y permisos. Video puede entregarse en fase posterior. |
| C-01 | Guardar lugares, recomendaciones, perfiles, comentarios y medios | Cada objeto válido se agrega/quita de una colección y conserva referencia/autoría. |
| C-02 | Colecciones heterogéneas | Crear, renombrar, borrar y organizar. Guardar perfil no crea seguimiento. |
| C-03 | Save to my world | Diferenciar guardar contenido de agregar un lugar a wishlist. No declarar una visita por guardar. |
| S-01 | Follow y Co-Travelers | Solo seguimiento mutuo vigente produce relación de Co-Traveler. |
| S-02 | Búsqueda de usuarios y feed | Búsqueda y feed respetan visibilidad y bloqueos. No exponen datos privados. |
| S-03 | Ask me about | Lugares elegidos por el usuario. No se presentan como expertise certificado. Interacción entre Co-Travelers. |
| S-04 | Mensajería entre Co-Travelers | Solo participantes autorizados leen mensajes. Sin online/last seen ni recibos obligatorios. |
| O-01 | Overlap entre dos Co-Travelers | Mapa plano comparable al mapa de marcar países, no sustitución por dos globos. |
| O-02 | Estadísticas de Overlap | Both visited, solo X, solo Y y wishlist común. Cantidades coinciden con el mapa y permisos. |
| M-01 | Mapamundi colectivo | Usuario y sus Co-Travelers. Seleccionar participantes y filtrar visitados/deseados. |
| I-01 | Color personal | Predeterminado o elegido por usuario. Paleta final pendiente. |
| I-02 | Tags personales | Seleccionables de catálogo. No se confunden con badges del sistema. |
| B-01 | Badges automáticas | Otorgadas por reglas documentadas, nunca autoadjudicadas. Viajes declarados no equivalen a viajes verificados. |
| B-02 | Rankings por utilidad | Top contributors, Most saved, Most helpful, aportes de ciudad/país; ventanas semanales/mensuales. |
| D-01 | Descubrimiento | Essential places, Community favorites y From people you know para lugares de un país. |
| D-02 | Comunidad inicial pequeña | Ocultar secciones sociales sin contenido; no fabricar recomendaciones o usuarios reales. |
| H-01 | Flight hours/Trip hours privado | Activación opcional, carga manual o estimación asistida. Ningún total o trayecto aparece en respuestas públicas. |
| H-02 | Fuente externa para estimaciones | Integración elegida tras comprobar cobertura, costos, licencia y datos compartidos. Sin proveedor elegido aún. |

## 5. Reglas cartográficas

### Overlap acordado

Color pleno X: visitados de X. Color pleno Y: visitados de Y. Tonos claros respectivos: wishlist de X/Y. Color de marca claro: coincidencias. Neutral: ningún estado de ninguno.

### Propuesta de resolución de ambigüedades

Dos vistas, Visited y Wanna go, más una vista combinada. Cada selección muestra nombres/estados autorizados y una leyenda. En vistas separadas, las coincidencias se distinguen sin confundir ambos visitaron con ambos desean.

En vista combinada: visitados tienen prioridad visual sobre wishlist; patrones o indicadores secundarios comunican estados mixtos. X visitó/Y desea nunca se etiqueta Both visited. No mezclar colores para producir significados indeterminados. Si una persona marca el mismo país visitado y deseado, puede conservar ambos estados como deseo de volver; contar una sola visita de país.

Colores iguales o difíciles de distinguir: preservar color personal en el perfil, añadir patrones/contornos identificados por leyenda en la comparación. Nunca comunicar solo mediante color.

Mapamundi: mostrar totales y participantes al seleccionar país. Con muchos contactos, el mapa puede resumir coincidencias y permitir seleccionar subconjuntos sin perder acceso a todos. No prometer que 30 colores se distinguirán simultáneamente.

Catálogo pendiente: país vs territorio, geometrías y fronteras disputadas, fuente/licencia/atribución, tratamiento de islas pequeñas y denominador de porcentaje. No publicar porcentajes antes de documentar esas reglas. Marcar un lugar como visitado no marca automáticamente su país hasta definir el comportamiento.

## 6. Horas privadas

Requisito firme: carga manual o estimación por origen/destino, opt-in y privacidad de todo el módulo.

Propuesta de cómputo: Flight hours suma tiempo en vuelo. Trip hours suma tiempo de traslado de todos los segmentos, incluyendo vuelos; mostrar flight hours como subconjunto y nunca sumar ambos totales entre sí. Esperas/escalas fuera del total inicial; aclararlo en interfaz.

Cada entrada conserva minutos enteros positivos, modo de transporte y origen de duración manual/estimada. Permitir editar/borrar y recalcular. Usar identificadores de entrada para evitar duplicados en reintentos. No pedir fechas, números de vuelo o reservas.

Propuesta de minimización: origen/destino transitorios durante cálculo, guardar solo duración/modo/método. No incluir trayectos en URL, logs o analítica. Un proveedor externo podría recibirlos para calcular: informar antes de enviar, enviar sin identificador personal y comprobar retención del proveedor. Descartar localmente no borra necesariamente datos del proveedor.

Estimación no equivale a duración real. Pedir aeropuertos/ciudades y segmentos según transporte; países solos no permiten calcular un trayecto concreto. Sin datos adecuados, mostrar no disponible y permitir carga manual. No inventar una duración si falla la fuente.

Pendiente bloqueante: investigación técnica/comercial del proveedor. La función asistida no se considera terminada con un formulario o enlace a una web. Alternativa manual puede funcionar antes, manteniendo asistida en roadmap.

## 7. Objetos y acceso

Objetos: Account, Profile, Country, Place, CountryState, PlaceState, Recommendation, Media, Collection, CollectionItem, Follow, Message/Conversation, HelpfulVote, Badge/Award, UserTag, PrivateDurationEntry, Block y Report.

Sin visited_at. Co-Traveler se deriva del seguimiento mutuo. CollectionItem referencia objetos de tipos diferentes con integridad y permisos; no copia automáticamente contenido privado.

| Datos | Propietario | Otra persona | Público |
|---|---|---|---|
| Email/autenticación | Acceso de cuenta | No | No |
| Perfil/mapa/estados | Gestiona | Solo según permiso | Solo si publicado |
| Wishlist/colecciones | Gestiona | Solo lo compartido | Solo si publicado |
| Recomendaciones/medios | Gestiona | Según visibilidad/bloqueos | Solo publicado |
| Mensajes | Participante autorizado | Solo otro participante | No |
| Horas/entradas privadas | Gestiona | No, tampoco Co-Traveler | No |
| Reportes/moderación | Según rol y finalidad | No | No |

Propuesta: guardar una referencia nunca amplía acceso. Si el original se elimina o se vuelve privado, la colección muestra un elemento no disponible, sin foto/texto filtrados. Cachés, previews y enlaces respetan revocación.

## 8. Arquitectura y calidad de implementación

Frontend: navegación consistente, responsive, teclado, leyendas accesibles, estados de carga/error/vacío, reducción de movimiento, listas alternativas al globo. Acciones persistentes con feedback y recuperación de fallos.

Backend: autenticación, autorización de cada operación y objeto, validación de entradas, integridad relacional, paginación, límites de consumo, archivos y trabajos de procesamiento. Con Supabase, políticas de acceso en base de datos y almacenamiento; ningún acceso se protege exclusivamente ocultando botones.

Seguridad propuesta: secretos solo en servidor, sesiones seguras, protección de mutaciones, contenido libre tratado como datos, prevención de abuso y cargas verificadas por contenido/tamaño. Acceso mínimo a administración. Sin promesa de invulnerabilidad o cifrado de extremo a extremo no implementado.

Operación: entornos separados, migraciones versionadas, CI, monitoreo sin contenido sensible, backups y ensayo de restauración, rollback, dependencias revisadas y plan de incidentes. Definir presupuesto antes de comprometer servicios pagos.

Validación de lanzamiento: cuentas A/B/visitante no acceden a horas, colecciones privadas o mensajes ajenos, incluyendo acceso directo a API/archivos. Revocar permiso deja de servir contenido. Upload elimina metadatos. Ranking no cuenta guardados propios/reintentos como utilidad extra. Fallos de proveedor no fabrican estimaciones. No quedan botones decorativos presentados como funciones disponibles.

## 9. Reputación y abuso

Premiar utilidad, no volumen bruto. Propuesta: conteo de guardados por usuarios distintos, exclusión de autosaves, votos idempotentes, límites contra spam y revisión de actividad coordinada. Badges de visitas describen declaraciones del usuario; contributor/expertise describe señales internas sin certificación profesional. Reglas exactas/umbrales aún pendientes.

Bloquear/reportar debe estar disponible antes de abrir publicación social o mensajería. Propuesta: bloquear impide nuevos follows, mensajes y exposición social entre cuentas. Unfollow elimina relación mutua y bloquea nuevos mensajes; acceso al historial anterior pendiente de elección.

## 10. Diseño y alcance por entregas

Referencia estética definitiva aprobada por la usuaria: 20261001_215246_0000.png (Library: libfile_bb50c01f7c38819187a06d08cde01d9a). Reemplaza las paletas exploratorias anteriores. Mantener experiencia cartográfica/social, con carácter cálido, editorial y detalles dibujados.

Paleta exacta aprobada de la referencia:

| Color | Hex | Rol funcional propuesto, aún no aprobado |
|---|---|---|
| Dark olive | #333700 | Texto oscuro, contornos o controles secundarios |
| Ancient rose | #B46A6A | Superficies secundarias y acentos |
| Butter | #FFD983 | Destacados y superficies cálidas |
| Plum | #61122B | Acento principal y acciones |

La referencia incluye GLOBE escrito a mano y una bandera dibujada con flechas que dicen posible nombre y logo. GLOBE es candidato, no nombre aprobado. La bandera es dirección visual del símbolo, no logotipo final vectorizado ni marca despejada. Su rojo aparente no incorpora automáticamente un quinto color oficial; adaptar al plum aprobado o elegir expresamente otro color.

Pendiente: neutro de fondo, tipografías, tamaño/espaciado/radios, tonos de estados, paleta ampliada de colores personales y roles definitivos de los cuatro colores. Propuesta: fondo marfil y lettering expresivo solo en marca/títulos puntuales, con sans legible en navegación y datos. Verificar contraste por combinación y estado, y no usar blanco automáticamente sobre rose o butter. Probar el sistema en mapa/globo/perfil antes de fijar componentes.

Los colores base de marca no sustituyen la distinción entre estados de usuario. Overlap y Mapamundi necesitan leyendas/patrones y tratamiento de coincidencias. El diseño no altera geometrías precisas ni privacidad. Ninguna tipografía o logo de la referencia se copia como activo ajeno sin autorización.

Roadmap propuesto que conserva toda la visión:

1. Cuenta, perfil, privacidad, mapa/globo, visitados/wishlist y perfil compartible.
2. Lugares, recomendaciones, fotos, búsqueda, guardados y colecciones.
3. Follow, feed, Co-Travelers, Overlap y Mapamundi.
4. Mensajería/Ask me about, rankings, badges y horas privadas. El cálculo externo queda condicionado a proveedor viable.
5. Apps nativas, video, colecciones colaborativas y mejoras de descubrimiento. No reintroducir fechas de viaje o seguimiento bajo richer trip histories.

Moderación/seguridad se entregan junto con cada superficie relevante, no como una fase final opcional.

## 11. Registro de decisiones pendientes

| ID | Decisión | Propuesta actual | Estado |
|---|---|---|---|
| DEC-01 | Marca | Nueva búsqueda; Mapamundi reservado para función | Elección de usuaria |
| DEC-02 | Paleta/tipo/wordmark | Paleta final #333700/#B46A6A/#FFD983/#61122B aprobada; GLOBE candidato y bandera como dirección | Paleta cerrada; roles, tipo y marca pendientes |
| DEC-03 | Horas | Flight subconjunto de trip, excluir esperas inicialmente | Propuesta pendiente |
| DEC-04 | Conservar trayectos | Descartarlos tras cálculo, conservar duración | Propuesta pendiente |
| DEC-05 | Proveedor de horas | API licenciada evaluada por transporte | Investigación pendiente |
| DEC-06 | Estados mixtos/colores repetidos | Filtros, prioridad visited y patrones | Propuesta pendiente |
| DEC-07 | Privacidad y comparación | Perfil/mapa publicables; wishlist/colecciones privadas por defecto | Propuesta pendiente |
| DEC-08 | Países/territorios/porcentaje | Catálogo transparente y licencia documentada | Investigación y elección |
| DEC-09 | Lanzamiento/edades/mercados | Definir antes de apertura pública | Elección y revisión pendientes |
| DEC-10 | Idiomas | Inglés inicial con arquitectura de traducción; ES después | Propuesta pendiente |
| DEC-11 | Presupuesto/servicios | No comprometer costos sin techo acordado | Elección pendiente |
| DEC-12 | Reputación y tags | Reglas versionadas y paleta/catálogo curados | Diseño pendiente |
| DEC-13 | Mensajes al perder relación | Impedir nuevos mensajes; historial por definir | Elección pendiente |
| DEC-14 | Fotos/videos/comentarios | Fotos primero, video posterior; comentarios necesarios para guardarlos | Priorización pendiente |

## 12. Gestión de cambios y condición de cierre

Cada requisito mantiene ID, decisión de origen, fase y criterio de aceptación. Una matriz posterior vincula ID con pantallas, tablas, permisos e implementación. Las modificaciones al alcance actualizan PRD y registro, no solo código.

La versión 0.3 incorpora las 16 referencias de diseño/seguridad y conserva todos los requisitos anteriores. No declara aprobadas otras propuestas ni resueltas investigaciones. Cierre de producto: decidir reglas funcionales antes de sus módulos. Preparación para publicación: verificar proveedores, catálogo/licencias, controles de acceso y operación. Ningún nombre está declarado disponible jurídicamente por una búsqueda web.

## 13. Referencias de implementación · 16 imágenes revisadas

Instrucción de la usuaria: replicar prácticas con ticks verdes, evitar cruces rojas y errores de las demás imágenes, manteniendo paleta final. No empezar código de aplicación hasta recibir las siguientes instrucciones.

Observación de lectura: hay dos imágenes con ticks/cruces, no una. Las imágenes 1 y 3 son listas de buenas prácticas sin ticks, no ejemplos de errores. No se interpreta esto como prohibición de accesibilidad, SEO o privacidad. Sus recomendaciones se registran como contexto técnico o condicional, no como nuevas decisiones indiscriminadas. Imagen 14 muestra modales con texto parcialmente cortado: solo se puede confirmar la referencia a modales y el recorte/oclusión, no un argumento adicional del video.

| Nº | Archivo (fecha y hora) | Lectura y tratamiento |
|---|---|---|
| 1 | 20260929_162146 | Checklist de acabado/SEO, sin ticks. Evitar omisiones, no invertir consejos positivos. |
| 2 | 20260929_161833 | Ticks: términos, favicon, privacidad, dominio. Cruces: clichés visuales, datos falsos y copy genérico. |
| 3 | 20260929_161631 | Checklist legal/accesibilidad, sin ticks. Aplicabilidad depende de producto/mercados. |
| 4 | 20261001_203754 | Evitar gradientes morados, hero genérico y cifras sin evidencia. |
| 5 | 20261001_203824 | Evitar estética cyberpunk/neón/código decorativo. |
| 6 | 20261001_203834 | Evitar animaciones sin propósito. |
| 7 | 20261001_203848 | Evitar franjas o tabs de color decorativos en bordes de tarjetas. |
| 8 | 20261001_203901 | Evitar tarjetas anidadas, bajo contraste y texto tapado. |
| 9 | 20261001_203912 | Evitar plantilla repetida de paneles multicolores. |
| 10 | 20261001_203921 | Evitar Inter como tipografía genérica en toda la app. |
| 11 | 20261001_203930 | Evitar iconos enormes sin función. |
| 12 | 20261001_203945 | Evitar contraste deficiente. |
| 13 | 20261001_203959 | Evitar redundancia de etiquetas/textos y cuerpo diminuto. |
| 14 | 20261001_204012 | Referencia negativa a modales; imagen parcialmente recortada. No copiar este patrón. |
| 15 | 20261001_204040 | Lista de 20 clichés visuales, incorporados abajo. |
| 16 | 20261001_204227 | Ticks de seguridad, debug prohibido, cruce remove unused packages ambigua. |

### 13.1 Restricciones visuales y de contenido obligatorias

V-01. No gradientes morado/azul, texto de hero con gradiente, neón/cyberpunk, tarjetas de glassmorphism ni grano sobre gradientes.

V-02. No emojis como iconos de interfaz o encabezados, iconos enormes decorativos ni Lucide usado de forma ubicua y predeterminada. Propuesta: iconografía vectorial consistente. Los emojis de usuarios en contenido libre no están automáticamente prohibidos por esta regla de diseño.

V-03. No botones en forma de píldora. Rectángulos con radio moderado por definir. No pérdida de contraste por fade al hover. La referencia anterior de bloques redondeados no autoriza pill buttons.

V-04. No cards con bordes laterales coloreados, tarjetas dentro de tarjetas, fila genérica de tres cajas de iconos ni grid de tarjetas repetido para cada pantalla. Mantener componentes consistentes, pero composición adaptada al mapa, perfiles, colecciones y mensajes.

V-05. No badge decorativa sobre el headline, shadcn UI sin personalizar, serif cursiva como acento genérico ni combinación Space Grotesk + Instrument Serif. Las badges funcionales del producto siguen existiendo. No seleccionar Inter como default de toda la interfaz.

V-06. No fade-in al scroll, animaciones de cursor/beam, scroll hijacking ni animaciones sin función. El globo interactivo sigue siendo requisito: definir movimiento funcional y accesible, sin animación decorativa automática obligatoria.

V-07. No fake counters, métricas, reviews o usuarios simulados presentados como reales, claims sin evidencia, hero vago, buzzwords, imágenes generadas para el contenido visual de la marca, em dashes en copy propio, sello made with AI ni copy genérico de IA. Esto no afirma autoría humana falsa ni altera atribuciones/licencias exigidas. Revisión editorial de textos propios; contenido libre de terceros no se trata como texto de marca.

V-08. No spacing inconsistente, textos pequeños ilegibles, bajo contraste, desbordamiento, oclusión por overlays o modales genéricos del ejemplo. Propuesta: páginas/paneles para tareas frecuentes; cualquier diálogo imprescindible necesita decisión explícita y accesibilidad comprobada.

### 13.2 Prácticas con ticks verdes y comprobación futura

| ID | Práctica | Aplicación y evidencia de aceptación |
|---|---|---|
| G-01 | Términos y privacidad | Rutas reales y accesibles; textos describen datos/proveedores y funcionamiento efectivos. No generar promesas legales infundadas. |
| G-02 | Favicon y dominio propio | Identidad propia en pestaña/manifest, dominio elegido y HTTPS comprobado antes de lanzamiento público. |
| G-03 | Revisar git por secretos | Escaneo de archivos e historial y prevención de nuevos commits con credenciales. Si hubo exposición, revocar/rotar; borrar línea no basta. |
| G-04 | Rate limiting | Límites en servidor por identidad/ruta y señales de abuso. Compartidos entre instancias. Cubrir cálculo externo, uploads, mensajes, follows y publicación, además de auth. Probar rechazo/recuperación y rutas directas a Data API. |
| G-05 | Acceso de usuarios | Matriz propietario/tercero/visitante/bloqueado/admin. Probar lectura y mutación directa de recursos ajenos, incluyendo IDs manipulados. |
| G-06 | Password hashing | Con Google OAuth la app no recibe ni almacena contraseñas de Google. Si se agrega password login, usar proveedor de autenticación; nunca hashing casero o contraseñas en logs. |
| G-07 | API keys/env | Secretos de servidor fuera de bundles, HTML, URLs y logs; no prefijarlos NEXT_PUBLIC_. Claves publishable de Supabase son públicas por diseño y requieren permisos/RLS correctos. |
| G-08 | Autenticación correcta | Validar sesión y autorización en cada Server Action/endpoint. No depender de página oculta o middleware como única barrera. |
| G-09 | Dependencias actualizadas | Versiones parcheadas, lockfile, revisión de advisories y actualizaciones con verificación. No actualizar ciegamente ni declarar seguridad por instalar latest. |
| G-10 | Formularios seguros | Esquemas/longitudes/tipos en servidor, consultas parametrizadas, escape de salida por contexto y allowlist de URL. Validación frontend solo mejora UX. |
| G-11 | XSS | No renderizar HTML arbitrario de perfiles, mensajes o recomendaciones. Sanitización específica solo si se admite rich text. CSP complementa, no reemplaza, escape y validación. |
| G-12 | Auditoría de seguridad | Revisión documentada de arquitectura, código, permisos y despliegue con requisitos ASVS aplicables; pruebas automatizadas y manuales. No llamar auditoría completa a un único escáner. |
| G-13 | Archivos expuestos | Comprobar que .env, .git, backups, logs, source maps públicos y originales privados no se sirven. URLs firmadas y cachés respetan límites. |
| G-14 | Admin routes | Roles comprobados en servidor, privilegio mínimo y acceso de base de datos restringido; ocultar link no protege. Propuesta: MFA administrativo. |
| G-15 | API endpoints | HTTPS, permisos por objeto y acción, límite de tamaño, errores sin stack traces sensibles y protección de mutaciones/CSRF. |
| G-16 | CORS | Orígenes permitidos según necesidad, sin wildcard con credenciales. CORS no es autenticación y no evita llamadas fuera del navegador. |
| G-17 | Security headers | CSP adaptada a mapas/auth/medios, protección contra embedding, MIME sniffing y políticas de referer/permisos; HSTS tras comprobar HTTPS y dominios. Verificar respuestas reales. |
| G-18 | DB access | Grants mínimos, RLS y políticas de storage; server secret/service_role bypassa RLS, usar solo para tareas administrativas delimitadas. No permitir que users cambien su rol. |

Cruce roja firme: debug mode no habilitado en producción. Desarrollo local puede usar depuración. No filtrar errores internos al público.

Cruce ambigua: remove unused packages. No ejecutar limpieza destructiva ni interpretarla como obligación de instalar paquetes innecesarios. Confirmar intención antes de modificar dependencias por este motivo.

### 13.3 Checklist sin ticks: interpretación técnica y condicional

Imagen 1: quitar branding Vite/React, título/favicon de scaffold y placeholder editorial; corregir errores de consola; reducir bundles y cargar mapa/globo pesado por demanda. Esto no significa quitar React del stack Next.js. HTML/metadata de páginas públicas, títulos/encabezados únicos, links internos válidos, alt text, 404 real, breadcrumbs donde hay jerarquía, canonical y social previews pertinentes. Robots y sitemap solo para contenido público autorizado. No incluir horas, mensajes o colecciones privadas en metadata/JSON-LD/previews. Robots/noindex no son controles de acceso. Source maps de navegador no públicos; no confundir esto con ocultar JavaScript ejecutable. llms.txt no es requisito de seguridad; LocalBusiness schema no corresponde automáticamente a una app social. Structured data solo describe hechos y entidades reales.

Imagen 3: evitar ausencia de términos/privacidad, consentimiento inadecuado, recopilación excesiva, SDKs sin revisar, dark patterns, tarifas ocultas, claims/reviews falsos, falta de alt text/contraste/teclado, datos de responsable incorrectos, tratamiento de menores sin reglas, correos comerciales sin baja, activos sin licencia y solicitudes de borrado sin proceso. Refund policy solo si hay pagos; cookies/banner según tecnologías y territorios. No publicar banner vacío o ficticio. Definir mercados/edades y prácticas reales antes de finalizar textos o obligaciones. No copiar estos consejos como garantía de no recibir demandas.

Objetivo propuesto de accesibilidad: WCAG 2.2 AA, con controles manuales de teclado/foco/zoom/lectores y pruebas automáticas. Contraste de texto normal mínimo 4.5:1 y texto grande 3:1 con excepciones normativas; no confiar en apariencia a simple vista. Paleta final permanece, pero roles/tonos se validan antes de aprobar componentes.

### 13.4 Fuentes primarias consultadas

Consulta: 1 de octubre de 2026, hora Argentina. Estas fuentes fundamentan controles; no certifican una app que aún no existe.

- Next.js authentication: https://nextjs.org/docs/app/guides/authentication
- Next.js data security: https://nextjs.org/docs/app/guides/data-security
- Next.js forms: https://nextjs.org/docs/app/guides/forms
- Next.js CSP: https://nextjs.org/docs/app/guides/content-security-policy
- Next.js source maps: https://nextjs.org/docs/app/api-reference/config/next-config-js/productionBrowserSourceMaps
- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Data API security: https://supabase.com/docs/guides/api/securing-your-api
- OWASP REST security: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- OWASP XSS: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- OWASP input validation: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- OWASP password storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP CSRF: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- OWASP ASVS: https://owasp.org/projects/asvs
- GitHub secret scanning: https://docs.github.com/code-security/secret-scanning/about-secret-scanning
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/

Estado: requisitos documentados e investigación inicial realizada; código, auditoría, tests y cumplimiento de lanzamiento todavía no ejecutados. No comenzar implementación hasta nuevas instrucciones de la usuaria.
