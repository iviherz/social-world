# Subir el proyecto a GitHub y publicarlo con Vercel

GitHub guarda el código. **Vercel aloja la web y ejecuta el backend de Next.js. Supabase guarda las cuentas, datos y fotos.** No activar GitHub Pages para este proyecto.

## 1. Descargar y abrir los archivos

1. Descargar `Social-World-GitHub-Vercel.zip` y extraerlo.
2. Abrir la carpeta `social-world`. Ahí deben estar `package.json`, `app`, `components`, `supabase`, `docs`, `.github` y `.env.example`.
3. No subir el ZIP como único archivo. GitHub y Vercel necesitan los archivos descomprimidos.
4. Los archivos que comienzan con punto pueden estar ocultos en tu computadora. `.gitignore` es importante. `.env.example` es seguro porque NO contiene claves reales.

## 2. Crear un repositorio en GitHub

1. Iniciar sesión en https://github.com.
2. Elegir **New repository**.
3. Nombre sugerido provisional: `social-world`. Elegir **Private** inicialmente.
4. No agregar README, licencia o .gitignore desde GitHub: el paquete ya contiene sus propios archivos.
5. Crear el repositorio.

### Método recomendado: GitHub Desktop

Este método conserva bien las carpetas y archivos ocultos, sin escribir comandos Git.

1. Instalar GitHub Desktop desde https://desktop.github.com e iniciar sesión.
2. Elegir **File → Add local repository** y seleccionar la carpeta extraída `social-world`.
3. Si informa que no es un repositorio, elegir **create a repository here**. La raíz resultante debe seguir siendo la carpeta que contiene `package.json`.
4. Revisar **Changes**. Deben aparecer código, SQL, documentación y `.env.example`. NO deben aparecer `.env.local`, claves, `node_modules` o `.next`.
5. Crear el primer commit, por ejemplo `Initial social-world implementation`.
6. Usar **Publish repository**, mantenerlo privado y publicar. Si ya creaste un repo vacío en la web, configurar su URL como origin en Repository Settings, o usar el procedimiento Git de abajo.
7. Abrir el repo en la web y verificar que `package.json` está en la raíz, no dentro de una segunda carpeta `social-world`.

### Alternativa: carga desde la web

En el repositorio elegir **Add file → Upload files** y arrastrar el contenido de la carpeta extraída. Verificar que se conservaron `.gitignore`, `.github` y `.env.example`. Si el navegador omite archivos ocultos, usar Desktop o Git. Commit changes. No subir `node_modules`, `.next`, `.env.local` ni archivos con secretos.

### Alternativa: terminal

Instalar Git y ejecutar desde la carpeta que contiene `package.json`. Reemplazar TU_USUARIO por tu usuario real.

```sh
git init
git branch -M main
git add .
git status
# Revisar que NO aparezcan .env.local, claves, node_modules o .next.
git commit -m "Initial social-world implementation"
git remote add origin https://github.com/TU_USUARIO/social-world.git
git push -u origin main
```

La autenticación de GitHub se realiza con Desktop, Git Credential Manager o token de GitHub. No introducir el token en archivos del proyecto.

## 3. Primera publicación visual, sin cuentas reales

Podés ver la web antes de configurar Google, Supabase y Redis.

1. Crear cuenta en https://vercel.com y conectar GitHub.
2. Elegir **Add New → Project**, importar el repo.
3. Framework: **Next.js**. Root Directory: carpeta donde está `package.json` (raíz si subiste bien).
4. Node.js: **22.x** o una LTS compatible posterior. Install Command: `npm ci`. Build Command: `npm run build`. Dejar Output Directory con el valor automático de Next.js; no elegir `out` o `dist`.
5. Variables iniciales:
   - `APP_NAME`: `Tu mundo` (provisional).
   - `APP_REGISTRATION_OPEN`: `false`.
   - `APP_URL`: la URL HTTPS estable del proyecto. Si todavía no la conocés, publicar primero sin login, copiar la URL asignada, configurar la variable y hacer **Redeploy**.
6. Deploy. Revisar inicio, `/preview`, móvil, privacidad y términos. `/world` requiere una sesión real; la vista de prueba no usa Supabase ni guarda cambios al recargar.
7. No anunciar que registro, estimación de horas o video están disponibles. El cierre de registro está visible para visitantes.

## 4. Crear Supabase

1. Crear un proyecto **nuevo** en https://supabase.com. Elegir región, contraseña fuerte de la base y conservarla en un gestor de contraseñas. No es una variable que deba ir al frontend.
2. Abrir **SQL Editor**.
3. Copiar TODO `supabase/migrations/001_initial.sql` y ejecutar una sola vez.
4. Luego ejecutar `supabase/migrations/002_countries.sql`.
5. Revisar que existen `profiles`, `preferences`, `countries`, estados, lugares, recomendaciones, colecciones, mensajes, horas, reportes y bucket privado `media`.
6. En configuración API obtener la **Project URL** y **Publishable key**. En proyectos antiguos la anon key cumple el rol público; usar la documentación actual del panel para identificarla.
7. Para fotos, obtener también la **Secret key**, exclusivamente para servidor. Tiene permisos amplios y debe guardarse como secreto. No hacer público el bucket para que las fotos aparezcan: la app las sirve mediante una API autorizada.
8. Para un ensayo cerrado, revisar también las opciones de registro del proveedor Auth. El interruptor APP_REGISTRATION_OPEN solo controla la entrada desde nuestra web.

## 5. Configurar Google login

1. En Google Cloud Console crear un proyecto y una pantalla OAuth con los datos reales de la app.
2. Mientras esté en pruebas, agregar las cuentas autorizadas como test users según el tipo de publicación de Google.
3. Crear credenciales **OAuth client ID → Web application**.
4. En redirect URI autorizado de Google, usar el callback que muestra Supabase para Google, normalmente `https://TU_PROJECT_REF.supabase.co/auth/v1/callback`. No usar `/auth/callback` de nuestra app como callback de Google.
5. En Supabase **Authentication → Providers → Google**, habilitar Google y colocar el client ID y el client secret. El secreto de Google se configura en Supabase, NO en el código del sitio.
6. En Supabase **Authentication → URL Configuration**:
   - Site URL: la URL HTTPS estable de Vercel o tu dominio definitivo.
   - Redirect URL permitida: `https://TU_DOMINIO/auth/callback`.
   - Para desarrollo, agregar `http://localhost:3000/auth/callback` en el proyecto de pruebas.
7. No autorizar comodines amplios para producción ni cualquier dominio externo como redirect.

## 6. Configurar Redis para limitar login

1. Crear una base Redis en https://upstash.com.
2. Obtener REST URL y REST token.
3. Guardarlos en Vercel como `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
4. En producción, si Redis falta o falla, el login falla cerrado. Esto evita desplegar accidentalmente login sin el límite distribuido.
5. Configurar también límites de Supabase Auth, WAF de Vercel, alertas de uso y presupuesto. Revisar los planes/costos actuales antes de contratar servicios; no se presupone que todo sea gratis.

## 7. Variables definitivas en Vercel

En Project Settings → Environment Variables. Valores reales solo en el panel o `.env.local` para tu desarrollo; nunca en GitHub.

| Variable | Valor | Sensibilidad |
|---|---|---|
| APP_NAME | Nombre visible, provisional hasta elegir marca | Configuración |
| APP_URL | `https://tu-dominio` sin ruta | Configuración |
| APP_REGISTRATION_OPEN | `false` hasta completar revisión | Configuración |
| SUPABASE_URL | Project URL | Configuración del servidor |
| SUPABASE_PUBLISHABLE_KEY | Publishable key | Diseñada como pública, aquí permanece en servidor |
| SUPABASE_SECRET_KEY | Secret key, opcional para fotos | Secreto de alta sensibilidad |
| UPSTASH_REDIS_REST_URL | Redis REST URL | Configuración |
| UPSTASH_REDIS_REST_TOKEN | Redis REST token | Secreto |

No anteponer `NEXT_PUBLIC_` a ninguna de estas claves. No copiarlas en `next.config.ts`. Marcar los secretos como Secret/Sensitive según el panel disponible. Configurar por separado Development, Preview y Production. No entregar credenciales de producción a PRs de forks. Después de cambiar variables, **Redeploy** para aplicarlas.

## 8. Pruebas con cuentas reales antes de abrir

Con entorno de prueba configurado y usuarios de ensayo:

1. Activar temporalmente el registro en el entorno de prueba. Entrar con Google.
2. Editar perfil, marcar país visitado y wishlist, recargar y comprobar persistencia.
3. Compartir solo visitados. Desde otra cuenta comprobar que wishlist sigue oculta incluso para un país que tiene ambas marcas.
4. Activar horas, agregar/editar/borrar duración. Otra cuenta y un visitante no deben poder consultarlas por API.
5. Crear lugar, recomendación, foto y comentario; guardar objetos en colecciones. Las colecciones ajenas no deben estar disponibles.
6. Hacer follow mutuo, probar Overlap y Mapamundi, enviar mensaje. Una tercera cuenta no debe leerlo.
7. Bloquear una cuenta y comprobar que deja de ver perfil, consejos, fotos y mensajes. La web NO debe cachearlos en CDN.
8. Descargar datos y eliminar una cuenta de prueba. Verificar que también se eliminaron los archivos.
9. Revisar reportes con el responsable desde Supabase Dashboard y acordar cómo se atenderán.
10. Seguir `docs/LAUNCH.md`, completar textos legales reales y ejecutar la auditoría del despliegue. Solo después habilitar registro público.

## 9. Verificación local y actualizaciones

```sh
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

El build y tests no requieren claves reales. CI usa los mismos controles. Cada nuevo commit en GitHub puede disparar un despliegue automático en Vercel; PRs generan previews y main puede generar producción según la configuración del proyecto.

Si `package.json` aparece anidado, corregir Root Directory. Si login da error, revisar APP_URL exacto, Google callback, Supabase redirect y Redis. Si fotos no se cargan, revisar Secret key y bucket privado; no volverlo público. Nunca pegar claves completas en capturas para pedir ayuda.

## 10. Dominio y publicación

Agregar tu dominio en Vercel Settings → Domains, configurar el DNS indicado por el panel y actualizar APP_URL, Site URL y redirect permitido de Supabase. Hacer Redeploy y repetir login y pruebas de origen. GitHub no aloja esta app: el enlace público final será el de Vercel o tu dominio.

## Actualización: seis idiomas y archivos de GitHub

La interfaz incluye español, inglés, francés, ruso, chino simplificado y árabe. El selector guarda la elección en ese navegador; también hay soporte RTL para árabe. Los textos escritos por usuarios no se traducen automáticamente. No necesita una API de traducción, claves adicionales ni cambios en Supabase. Guardá los formularios antes de cambiar de idioma porque la página se recarga.

**Sí, `next-env.d.ts` debe estar en GitHub.** Es un archivo de tipos generado por Next.js, sin secretos. No lo edites a mano. `.next` y `node_modules` no se suben. `.env.example` sí; `.env` y `.env.local` no. El comando `npm run typecheck` ahora genera los tipos antes de verificarlos para funcionar desde una copia limpia.

Para actualizar el repositorio ya creado:

1. Descargá y descomprimí el ZIP actualizado.
2. Copiá el contenido de `social-world/` a la raíz del proyecto existente y reemplazá los archivos del mismo nombre. Incluí todos los archivos nuevos de idiomas y el endpoint `app/api/locale/route.ts`; no subas el ZIP como sustituto del código.
3. Conservá tus archivos propios `AGENTS.md` y `CLAUDE.md`, si los agregaste; el paquete no los modifica. Un ZIP subido dentro del repositorio no es necesario para ejecutar la web y podés quitarlo.
4. Subí los cambios con un commit. Si Vercel ya está conectado al repositorio, desplegará el commit automáticamente. Si todavía no lo conectaste, seguí la sección de Vercel de esta guía.
5. En el despliegue probá los seis idiomas desde el selector y comprobá que la elección persista al recargar. No hace falta volver a ejecutar las migraciones SQL existentes para esta actualización.

Detalle técnico y alcance de traducción: `docs/I18N.md`.
