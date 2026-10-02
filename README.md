# Tu mundo · web social de viajes

Nombre provisional configurable. Next.js + TypeScript + Vercel + Supabase. Frontend y backend incluidos; datos reales después de configurar Supabase. No es un HTML que se sube a GitHub Pages.

## Qué incluye

Mapa Equal Earth, globo rotatorio, países y wishlist, lugares, recomendaciones y fotos sin metadatos, perfiles con Google, privacidad, follow mutuo/Co-Travelers, Overlap, Mapamundi, comentarios, guardados heterogéneos, mensajes, utilidad de consejos, horas manuales privadas, descarga y borrado de cuenta, manifest PWA y fallback offline.

**El registro está cerrado por defecto.** Sin servicios configurados funcionan el inicio y `/preview`; los cambios de prueba no se guardan en una cuenta. No se muestran usuarios, métricas o testimonios ficticios.

No incluye todavía proveedor de estimación de horas, video, badges definitivos, aplicaciones nativas ni lanzamiento legal aprobado. Ver `docs/DECISIONS.md`.

## Inicio rápido local

Instalar Node.js 22 LTS o posterior. Abrir una terminal en esta carpeta:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Abrir http://localhost:3000. La vista de prueba funciona sin rellenar secretos.

## Subir a GitHub y publicar en Vercel

El procedimiento completo, sin asumir experiencia de programación, está en **docs/DEPLOY.md**. Subir el contenido de esta carpeta, no node_modules, .next o .env.local. Nunca subir el ZIP como único archivo del repositorio.

## Base de datos

Ejecutar en orden `supabase/migrations/001_initial.sql` y `002_countries.sql` en un proyecto **nuevo**. La primera migración crea tablas/RLS/Storage; la segunda inserta el catálogo. No son scripts para volver a ejecutar sobre datos existentes. Cambios futuros requieren nuevas migraciones.

## Verificar

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

CI en `.github/workflows/check.yml`. Los tests DB usan PostgreSQL embebido PGlite con fixture auth/storage para verificar RLS; Google y Supabase reales necesitan una prueba de despliegue.

## Estructura

- `app/`: páginas, autenticación y APIs del servidor.
- `components/`: diseño de la interfaz, mapa y dashboard.
- `lib/`: validación, sesión, procesamiento de imágenes y catálogo.
- `supabase/migrations/`: SQL versionado y permisos.
- `tests/`: aislamiento, imágenes, validación y E2E.
- `docs/`: instalación, decisiones, seguridad y lanzamiento.
- `.env.example`: nombres de variables con valores vacíos, sin secretos.
- `public/`: cartografía, favicon, iconos y shell offline.

## Licencias y datos

Natural Earth: dominio público. world-atlas: ISC. world-countries: ODbL 1.0 (atribución y share-alike según licencia). Licencias reproducidas en `docs/world-countries-license.txt y docs/world-atlas-license.txt`. Georgia/Arial son fuentes del sistema, no archivos redistribuidos. El símbolo se dibujó como SVG original; no copia un activo de otra marca. Catálogo político pendiente de decisión de producto, sin porcentaje mundial.

## Estado honesto

Código inicial funcional y verificable, todavía sin despliegue externo, credenciales o auditoría independiente. Antes de abrir: **docs/LAUNCH.md**. Para no modificar una base existente por accidente, usar proyectos separados de Supabase para ensayo y producción.

Interfaz en seis idiomas oficiales de la ONU, selector persistente y soporte árabe RTL. Ver [internacionalización](docs/I18N.md).
