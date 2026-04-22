# Cultura Constitución

PWA para la gestión cultural de la Municipalidad de Constitución (Dirección de Cultura y Turismo). Plataforma web que centraliza la oferta cultural comunal: home público institucional, calendario interactivo con vistas Mes/Semana/Día/Lista y tarjetas, CRUD de eventos con imágenes, panel administrativo con métricas en tiempo real, gestión de usuarios con roles, módulo de newsletter con exportación CSV e instalación como PWA.

**Estado:** sprint MVP — entrega oficial 29 de abril de 2026.

---

## Tabla de contenidos

- [URLs de producción](#urls-de-producción)
- [Credenciales demo](#credenciales-demo)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del monorepo](#estructura-del-monorepo)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [API REST](#api-rest)
- [Roles del sistema](#roles-del-sistema)
- [PWA](#pwa)
- [Estado del sprint](#estado-del-sprint)
- [Diseño y UX](#diseño-y-ux)
- [Pendientes Fase 2](#pendientes-fase-2)
- [Equipo](#equipo)

---

## URLs de producción

| Capa | URL |
|---|---|
| Frontend (Vercel) | <https://municipalidad-de-constituci-n.vercel.app> |
| Backend (Railway) | <https://municipalidad-de-constituci-n-production.up.railway.app> |
| Health check | `GET /api/health` → `{ "ok": true }` |
| Repositorio | <https://github.com/kevinleiva-awna/Municipalidad-de-Constituci-n> |

---

## Credenciales demo

Los tres usuarios cubren los tres roles del sistema. Comparten la misma password por tratarse de un ambiente demo.

| Email | Password | Rol |
|---|---|---|
| `admin@constitucion.cl` | `constitucion2026` | ADMIN |
| `funcionario@constitucion.cl` | `constitucion2026` | FUNCIONARIO |
| `ciudadano@constitucion.cl` | `constitucion2026` | CIUDADANO |

El registro público (`/register`) crea cuentas con rol **CIUDADANO** automáticamente.

La DB incluye 10 eventos seed con mezcla de categorías (Música, Teatro, Arte, Literatura, Danza, Patrimonio, Cine, Fotografía, Festival, Comercio local), lugares típicos de Constitución (Teatro Municipal, Casa de la Cultura, Biblioteca Pública, Piedra de la Iglesia, Costanera, Plaza de Armas) y una mezcla de eventos gratuitos (7) y pagos (3).

---

## Stack tecnológico

### Frontend

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build tool:** Vite 5
- **Estilos:** Tailwind CSS 3 — paleta `brand` generada desde `#185FA5`
- **Tipografía:** Plus Jakarta Sans (Google Fonts)
- **Routing:** Vue Router 4 (lazy loading, guards por rol, transición fade entre rutas, meta.layout)
- **Estado:** Pinia
- **HTTP:** Axios (interceptor 401 → logout automático)
- **Notificaciones UI:** vue-toastification
- **Calendario interactivo:** FullCalendar v6 (`@fullcalendar/vue3`, `daygrid`, `timegrid`, `list`, `interaction`) con locale `es`
- **PWA:** vite-plugin-pwa con Workbox

### Backend

- **Runtime:** Node.js 20 LTS (Railway corre con Node 22 — compatible)
- **Framework:** Express 4 + `express-async-errors`
- **ORM:** Prisma 5
- **BD:** PostgreSQL 15
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Subida de archivos:** Multer + `multer-storage-cloudinary`
- **Exportación CSV:** `@fast-csv/format` (stream)

### Infraestructura

| Capa | Servicio |
|---|---|
| Frontend | Vercel (auto-deploy en `main`) con `vercel.json` para SPA rewrite |
| Backend + PostgreSQL | Railway (auto-deploy en `main`) — ambos servicios en el mismo proyecto `elegant-fulfillment` |
| CDN de imágenes | Cloudinary (folder `cultura-constitucion`, transformación auto a 1200px, quality auto) |
| Control de versiones | GitHub |

---

## Estructura del monorepo

```
cultura-constitucion/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   └── src/
│       ├── controllers/     # auth, eventos, usuarios, admin (stats + export), newsletter
│       ├── middleware/      # auth (JWT) + roles (allowRoles)
│       ├── routes/          # auth, eventos, usuarios, admin, newsletter
│       ├── utils/           # prisma singleton, cloudinary
│       ├── app.js           # Express + CORS + express-async-errors
│       └── server.js        # Puerto y arranque
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons/           # icon-192.svg, icon-512.svg (PWA, maskable)
│   └── src/
│       ├── components/      # Navbar, EventoCard, ConfirmDialog
│       ├── composables/     # useEventos, useUsuarios, useAdmin, useNewsletter, useConfirm
│       ├── layouts/         # AdminLayout (sidebar + topbar + slot con transición)
│       ├── stores/          # auth.store (Pinia)
│       ├── router/          # meta.layout, meta.auth, meta.roles
│       ├── views/
│       │   ├── auth/        # Login, Register (split screen institucional)
│       │   ├── public/      # Home (hero + stats + categorías + pasos + newsletter + eventos), Calendario (toggle Calendario/Tarjetas), DetalleEvento
│       │   ├── admin/       # Dashboard, GestionEventos, FormularioEvento, GestionUsuarios, Suscriptores
│       │   └── shared/      # Perfil (editable), NotFound
│       ├── App.vue          # Switch de layouts + ConfirmDialog global
│       └── main.js
├── vercel.json              # SPA rewrite para Vercel
└── README.md
```

---

## Instalación local

### Requisitos

- Node.js 20+
- npm 10+
- Acceso a una base PostgreSQL (local o la de Railway)
- Cuenta Cloudinary (plan free es suficiente)

### 1. Clonar el repo

```bash
git clone https://github.com/kevinleiva-awna/Municipalidad-de-Constituci-n.git
cd Municipalidad-de-Constituci-n
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Completa DATABASE_URL, JWT_SECRET y las CLOUDINARY_* en .env
npx prisma migrate dev
npm run dev          # escucha en http://localhost:3001
```

Para generar un `JWT_SECRET` robusto:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev          # escucha en http://localhost:5173
```

El frontend usa `VITE_API_URL=http://localhost:3001/api` por defecto.

---

## Variables de entorno

### `backend/.env`

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión PostgreSQL. En Railway usar la URL interna (`postgres.railway.internal`). En local/scripts, la URL pública. |
| `JWT_SECRET` | Clave aleatoria (64+ chars) para firmar tokens |
| `JWT_EXPIRES_IN` | Vida del token (ej: `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Desde cloudinary.com/console |
| `CLOUDINARY_API_KEY` | Idem |
| `CLOUDINARY_API_SECRET` | Idem |
| `PORT` | Puerto local (Railway lo inyecta automáticamente) |
| `FRONTEND_URL` | Origen permitido para CORS (la URL de Vercel en prod) |

### `frontend/.env`

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del API, incluye `/api` al final |

El `.env` de ambos lados está en `.gitignore`. **Nunca subirlo al repo.**

---

## Scripts disponibles

### Backend

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta con `nodemon` |
| `npm start` | Producción: `prisma migrate deploy && node src/server.js` |
| `npm run prisma:generate` | Regenera el Prisma Client |
| `npm run prisma:migrate` | Crea/aplica nueva migración local |
| `npm run prisma:deploy` | Aplica migraciones pendientes (prod) |
| `npm run prisma:studio` | UI de Prisma para explorar la DB |
| `npm run prisma:seed` | Ejecuta `prisma/seed.js` |

### Frontend

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server con HMR |
| `npm run build` | Build de producción (genera service worker y manifest PWA) |
| `npm run preview` | Sirve el `dist/` localmente |

---

## API REST

Base: `${VITE_API_URL}` → `/api`

### Autenticación

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | Pública | Registro. Body: `{ nombre, email, password }`. Rol CIUDADANO por defecto. Devuelve `{ token, user }`. |
| POST | `/auth/login` | Pública | Login. Body: `{ email, password }`. Devuelve `{ token, user }`. |
| GET | `/auth/me` | Bearer | Usuario autenticado actual. |
| PUT | `/auth/me` | Bearer | Actualiza nombre y/o password del usuario autenticado. Si se cambia password, requiere `passwordActual` válida. |

### Eventos

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/eventos` | Pública | Query: `categoria`, `lugar`, `tipo`, `desde`, `hasta`, `publicado` (`true`/`false`/`all`), `page`, `limit`. Responde `{ items, total, page, limit }` y header `X-Total-Count`. Default: solo publicados. |
| GET | `/eventos/:id` | Pública | Detalle con `creadoPor.{id,nombre}`. |
| POST | `/eventos` | ADMIN, FUNCIONARIO | Multipart/form-data con campos + `imagen` opcional (Cloudinary). |
| PUT | `/eventos/:id` | ADMIN o creador FUNCIONARIO | Actualización parcial. |
| DELETE | `/eventos/:id` | ADMIN | Eliminación dura. |

Campos del modelo `Evento`: `titulo`, `descripcion`, `fecha`, `fechaFin`, `lugar`, `artista`, `aforo`, `categoria`, `tipo`, `organizador`, `valor` (CLP, 0 = gratuito), `imagenUrl`, `publicado`.

### Administración de usuarios

Requieren rol **ADMIN**.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/admin/usuarios` | Lista con rol, estado y fecha de creación. |
| POST | `/admin/usuarios` | Crea usuario con password temporal generada (12 chars). Body: `{ nombre, email, rol? }`. Devuelve `{ user, passwordTemporal }` — la password se muestra una única vez. |
| PUT | `/admin/usuarios/:id/rol` | Cambia el rol. ADMIN no puede quitarse a sí mismo su rol. |
| DELETE | `/admin/usuarios/:id` | Soft-delete (`activo = false`). ADMIN no puede desactivarse. |
| POST | `/admin/usuarios/:id/reactivar` | Revierte un soft-delete. |

### Administración (métricas y exportes)

Requieren rol **ADMIN**.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/admin/stats` | Resumen en un solo request: eventos (total, publicados, borradores, próximos 7/30 días), usuarios (total, activos, por rol), distribución por categoría con porcentaje, próximos 5 eventos con creador. |
| GET | `/admin/eventos/exportar` | Stream CSV con BOM UTF-8 — 15 columnas incluyendo URL Cloudinary. |

### Newsletter

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/newsletter/suscribir` | Pública | Body: `{ nombre, email }`. Idempotente: si ya estaba suscrito, responde OK; si estaba inactivo, reactiva. |
| GET | `/admin/suscriptores` | ADMIN | Query: `page`, `limit`, `q` (búsqueda case-insensitive por nombre/email). |
| DELETE | `/admin/suscriptores/:id` | ADMIN | Soft-delete. |
| GET | `/admin/suscriptores/exportar` | ADMIN | Stream CSV con BOM UTF-8 — nombre del archivo `suscriptores-YYYY-MM-DD.csv`. |

---

## Roles del sistema

| Rol | Permisos |
|---|---|
| **ADMIN** | Control total: CRUD eventos (incluye DELETE), duplicar, exportar CSV, gestión de usuarios con password temporal, dashboard con métricas agregadas, suscriptores con exportación. |
| **FUNCIONARIO** | Crear eventos, editar y duplicar solo los propios. No elimina. No gestiona usuarios. Accede al panel con sección "Eventos". |
| **CIUDADANO** | Vista pública: home, calendario (mes/semana/día/lista/tarjetas), detalle de eventos con compartir y `.ics`, suscripción al newsletter, perfil propio editable. |

Las rutas del frontend declaran `meta.auth`, `meta.roles` y `meta.layout`. El `beforeEach` guard las valida y redirige por rol cuando corresponde.

---

## PWA

La plataforma es instalable en móvil y desktop desde Chrome, Edge, Safari iOS y Firefox (a partir de v82+).

**Manifest** (`Cultura Constitución`, `short_name: Cultura`, `display: standalone`, `theme_color: #185FA5`) se genera automáticamente al build con `vite-plugin-pwa`.

**Íconos** en `/icons/`: `icon-192.svg` y `icon-512.svg` con `purpose: any maskable` — gradient brand y glifo de libro.

**Workbox runtime caching:**
- `CacheFirst` (30 días) para imágenes de Cloudinary.
- `NetworkFirst` (8s timeout) para `/api/eventos` — funciona offline para páginas ya visitadas.
- `navigateFallback` a `/index.html` excepto `/api/*`.

Para instalar en Android: Chrome → menú → "Agregar a la pantalla de inicio".
Para desktop: icono de "instalar app" en la barra de direcciones.

---

## Estado del sprint

Última actualización: **21-abril-2026**.

### Días completados

- **Día 1 — Setup, infraestructura y autenticación**
  - Scaffold monorepo, esquema Prisma con migración aplicada en prod.
  - Endpoints de auth con JWT + bcrypt, middlewares `authMiddleware` y `allowRoles`.
  - Frontend: Vue 3 + Tailwind 3 + Pinia + Router + Axios.
  - Deploy Railway (backend + Postgres) y Vercel (frontend).

- **Día 2 — CRUD de eventos + subida de imágenes**
  - CRUD `/api/eventos` con filtros (categoría, lugar, tipo, desde, hasta, publicado) y paginación.
  - Upload a Cloudinary con transformación auto.
  - FUNCIONARIO solo edita sus propios eventos; DELETE solo ADMIN.
  - `express-async-errors` para propagar rechazos async al error handler.
  - Frontend: composable `useEventos`, `GestionEventos` con tabla + filtros + badges, `FormularioEvento` con preview y multipart, `DetalleEvento` público con descarga `.ics`.

- **Día 3 — Calendario interactivo + gestión de usuarios**
  - FullCalendar v6 con vistas Mes/Semana/Día y locale `es`.
  - Click en evento navega a `/eventos/:id`; filtros reactivos (`categoria`, `lugar`, `tipo`) con watch.
  - Backend: `/api/admin/usuarios` (listar, crear con password temporal, cambiar rol, soft-delete, reactivar).
  - Guardrails: ADMIN no puede quitarse su rol ni desactivarse.
  - Frontend: composable `useUsuarios`, `GestionUsuarios` con tabla, buscador, resumen por rol, modal de creación con copy-to-clipboard.

- **Día 4 — Dashboard real + perfil editable**
  - Backend: `PUT /api/auth/me` actualiza nombre/password con validación de `passwordActual` (bcrypt.compare).
  - Backend: `GET /api/admin/stats` agrega 9 queries en paralelo (Promise.all) — eventos, usuarios, categorías, próximos.
  - Frontend: composable `useAdmin`; Dashboard consume el endpoint en un solo request, botón "Actualizar" y skeletons.
  - Frontend: `Perfil.vue` con card de avatar, formulario de datos (email bloqueado) y cambio de password con show/hide.

- **Día 5 — Newsletter + PWA instalable**
  - Backend: newsletter con suscripción idempotente, listar admin paginado + búsqueda, soft-delete, exportar CSV con BOM UTF-8 (compatible Excel).
  - Frontend: composable `useNewsletter`; sección newsletter en el home con estado de éxito y reset; `Suscriptores.vue` con tabla, búsqueda con debounce 300 ms, paginación y botón exportar.
  - PWA: `vite-plugin-pwa` con manifest completo, íconos SVG maskable, Workbox con CacheFirst para imágenes y NetworkFirst para eventos.

### Mejoras de UX adicionales

Aplicadas sobre los 5 días anteriores:

- **Tipografía y sistema visual**: Plus Jakarta Sans, shadows soft, animations `float`/`slide-up`, transición fade entre rutas.
- **AdminLayout**: sidebar con secciones, dot verde en activo, promo card, perfil con avatar gradient; topbar con saludo personalizado.
- **Home rediseñado**: hero con blobs flotantes, stats flotantes, grid de categorías con emojis, sección "Cómo funciona", CTA con gradient, footer oscuro.
- **Dashboard real**: 4 stat cards con gradients e iconos, barras de categorías animadas, distribución de roles, lista de próximos con ticket de fecha.
- **EventoCard**: fecha flotante tipo ticket, badge "Gratis" verde vs precio, hover con gradient overlay + scale.
- **Tablas admin**: avatar + fecha ticket + badges con dot de estado + iconos en acciones + empty states ilustrados.
- **FormularioEvento**: seccionado (básico / cuándo y dónde / clasificación / imagen / publicación) con dropzone clickable.
- **DetalleEvento**: hero full-width con imagen + overlay, grid de detalles con iconos, sidebar sticky con precio.
- **Calendario público**: toggle Calendario/Tarjetas, vista Lista adicional, auto-salto al mes del primer evento al filtrar, sync de filtros y modo con la URL (permite compartir links con filtros pre-aplicados).
- **Modal de confirmación global** (`ConfirmDialog`): reemplaza todos los `confirm()` nativos del navegador con un componente propio con variantes danger/warning/info, atajos Esc/Enter y copy específico por acción.
- **Duplicar evento**: un click en la tabla pre-rellena el formulario con datos de otro evento (excepto fechas y flag publicado).
- **Exportar eventos a CSV**: endpoint admin con stream fast-csv + botón en `GestionEventos`.
- **Compartir evento**: Web Share API nativa en móvil, fallback a copiar link al clipboard.
- **Login/Register rediseñados** en split screen institucional con hero decorativo, inputs con icon y show/hide password.

### Pendientes del sprint

| Día | Tema principal |
|---|---|
| 6 | QA end-to-end en prod + seed con eventos reales aportados por la Muni |
| 7 | Optimizaciones (compresión, revisión de bundle), README final, pinear Node 20 |
| 8 | Deploy limpio final + video demo de 3 minutos + entrega a Lucas y Yerko |

---

## Diseño y UX

- **Color primario:** `#185FA5` (paleta `brand` 50-900 generada con Tailwind).
- **Tipografía:** Plus Jakarta Sans — tono institucional, legible, moderna.
- **Layouts:**
  - `default` — navbar público sticky + contenido (home, calendario, detalle).
  - `bare` — sin chrome (login, register con split hero).
  - `admin` — sidebar + topbar + contenido (dashboard, admin/*, perfil).
- **Animaciones sutiles:** blobs con `animate-float` en hero, `slide-up` escalonado en grids, fade entre rutas (200 ms), hover con `-translate-y-0.5` en CTAs, pulse en dots de estado.
- **Accesibilidad:** inputs con `aria-label`, contraste adecuado, focus rings de 4 px visibles, atajos de teclado en modales (Esc/Enter).
- **Responsive:** breakpoints `md:` y `lg:`; sidebar admin colapsa a drawer con hamburguesa en móvil; navbar público idem; grids ajustan 1 / 2 / 3 columnas.

El manual de marca oficial de la Dirección de Cultura y Turismo está pendiente de entrega por la Muni (responsable: Yerko). Cuando llegue, el color `brand` y las decisiones tipográficas se adaptan sin tocar la estructura.

---

## Pendientes Fase 2

Incluidos en la propuesta comercial original, **fuera del MVP** por restricción de tiempo. Documentados para el handoff con Yerko Espinoza:

- **Pase "SomosCultura"**: QR de beneficios, red de comercios asociados, descuentos.
- **Integración con CRM/SaaS interno** de la Municipalidad (requiere documentación de APIs).
- **Inscripción directa a eventos** con control de aforo en tiempo real.
- **Cartelera del teatro** integrada con la boletería existente.
- **Notificaciones push** (Web Push vía Service Worker).
- **Dashboard avanzado**: mapas de calor, historial de participación, segmentación de audiencia.
- **Mapa de lugares culturales** con Leaflet/OpenStreetMap (fuera del alcance de licitación actual).
- **Integración con redes sociales** para publicación automática.
- **Módulo de talleres/cursos** con inscripción y lista de espera.

---

## Equipo

**AWNA Digital**
- Lucas Escobar — Director de proyecto
- Victor Astete — Líder Técnico
- Kevin Leiva — Desarrollador Full-Stack (este sprint)
- Emilio Bravo — Diseñador UX/UI
- Genesis González — Account Manager (genesis.gonzalez@awna.cl)

**Municipalidad de Constitución**
- Yerko Espinoza — Contraparte técnica única (Dirección de Cultura y Turismo)

Toda comunicación con la Muni se canaliza por Yerko.

---

Desarrollado por [AWNA Digital](https://awna.cl) · Abril 2026
