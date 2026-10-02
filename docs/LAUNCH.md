# Antes de abrir el registro

1. Definir responsable, contacto, edades, mercados y jurisdicción; completar términos y privacidad con prácticas reales y retenciones. Las páginas incluidas identifican claramente su estado de preparación.
2. Ejecutar SQL en proyecto Supabase de pruebas, habilitar Google y probar con cuentas A/B/C. No abrir el registro sin comprobar revocación, wishlist enmascarada, horas, mensajes y Storage con API directa.
3. Configurar Vercel, Supabase y GitHub con MFA y mínimo acceso. Separar producción de desarrollo y previews. No entregar secretos de producción a PRs de forks.
4. Configurar Redis para login, límites Auth de Supabase, WAF, cuotas y alertas de gasto. Nunca depender de un contador en memoria de serverless.
5. Asignar responsable de moderación, revisar public.reports desde Dashboard seguro y acordar respuestas ante spam/abuso. El rol usuario no lee reportes ajenos ni opera administración.
6. Revisar las decisiones abiertas de docs/DECISIONS.md. Usar manual de horas hasta elegir proveedor. No anunciar video, badges definitivos o estimación externa como disponibles.
7. Realizar revisión manual de teclado, contraste, zoom, móvil, lector de pantalla y permisos en el despliegue. axe no certifica accesibilidad completa.
8. Comprobar exportación, borrado de usuario/fotos, backups y restauración. Definir retención de logs y backups sin cuerpos de mensajes ni rutas privadas.
9. Comprobar que ningún bundle, respuesta, .env, commit o log contiene secretos. Revisar GitHub secret scanning, historia y paquete de entrega. Limitar indexación a páginas públicas.
10. Solo después cambiar APP_REGISTRATION_OPEN=true y redeploy. El cierre de registro de la web no impide invocaciones directas a Auth si se expone el proveedor: configurar también las opciones de registro de Supabase para un piloto cerrado.

La revisión de seguridad independiente y la auditoría ASVS no se reemplazan con esta lista. No hay garantía de app imposible de hackear.
