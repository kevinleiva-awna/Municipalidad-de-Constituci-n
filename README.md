# Cultura Constitución

PWA para la gestión cultural de la Municipalidad de Constitución (Dirección de Cultura y Turismo). Plataforma web que centraliza la oferta cultural comunal: home público institucional, calendario interactivo, CRUD de eventos con imágenes, panel administrativo con métricas, gestión de usuarios con roles y (próximamente) módulo de newsletter.

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

La DB incluye además **10 eventos seed** con mezcla de categorías (Música, Teatro, Arte, Literatura, etc.), lugares típicos de Constitución (Teatro Municipal, Casa de la Cultura, Biblioteca, Piedra de la Iglesia, Costanera…) y valores (7 gratuitos + 3 pagos).

---

## Stack tecnológico

### Frontend

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build tool:** Vite 5
- **Estilos:** Tailwind CSS 3 — paleta `brand` generada desde `#185FA5`
- **Tipografía:** Plus Jakarta Sans (Google Fonts)
- **Routing:** Vue Router 4 (lazy loading + guards por rol + transición fade entre rutas)
- **Estado:** Pinia
- **HTTP:** Axios (con interceptor 401 → logout automático)
- **Notificaciones UI:** vue-toastification
- **Calendario interactivo:** FullCalendar v6 (`@fullcalendar/vue3`, `daygrid`, `timegrid`, `interaction`) con locale `es`
- **PWA:** vite-plugin-pwa (pendiente Día 5)

### Backend

- **Runtime:** Node.js 20 LTS (Railway corre con Node 22 — compatible)
- **Framework:** Express 4 + `express-async-errors` (propaga errores async al error handler)
- **ORM:** Prisma 5
- **BD:** PostgreSQL 15
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Subida de archivos:** Multer + `multer-storage-cloudinary`
- **Exportación CSV:** `fast-csv` (pendiente Día 5)

### Infraestructura

| Capa | Servicio |
|---|---|
| Frontend | Vercel (auto-deploy en `main`) con `vercel.json` para SPA rewrite |
| Backend + PostgreSQL | Railway (auto-deploy en `main`) — ambos servicios en el mismo proyecto |
| CDN de imágenes | Cloudinary (folder `cultura-constitucion`, transformación auto a 1200px) |
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
│       ├── controllers/     # auth, eventos, usuarios (futuro: newsletter, admin)
│       ├── middleware/      # auth (JWT) + roles (allowRoles)
│       ├── routes/          # auth, eventos, usuarios
│       ├── utils/           # prisma singleton, cloudinary
│       ├── app.js           # Express + CORS + async-errors
│       └── server.js        # Puerto y arranque
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/      # Navbar, EventoCard
│       ├── composables/     # useEventos, useUsuarios
│       ├── layouts/         # AdminLayout (sidebar + topbar)
│       ├── stores/          # auth.store (Pinia)
│       ├── router/          # meta.layout, meta.auth, meta.roles
│       ├── views/
│       │   ├── auth/        # Login, Register (split screen)
│       │   ├── public/      # Home, Calendario, DetalleEvento
│       │   ├── admin/       # Dashboard, GestionEventos, FormularioEvento, GestionUsuarios, Suscriptores
│       │   └── shared/      # Perfil, NotFound
│       ├── App.vue          # Switch de layouts (admin / bare / default)
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
| `npm run build` | Build de producción |
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

### Eventos

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/eventos` | Pública | Query params: `categoria`, `lugar`, `tipo`, `desde`, `hasta`, `publicado` (`true`/`false`/`all`), `page`, `limit`. Responde con `{ items, total, page, limit }` y header `X-Total-Count`. Default: solo publicados. |
| GET | `/eventos/:id` | Pública | Detalle con `creadoPor.{id,nombre}` (no expone email ni hash). |
| POST | `/eventos` | ADMIN, FUNCIONARIO | Multipart/form-data con campos del evento + `imagen` opcional (Cloudinary). |
| PUT | `/eventos/:id` | ADMIN o creador FUNCIONARIO | Actualización parcial. FUNCIONARIO solo edita sus propios eventos. |
| DELETE | `/eventos/:id` | ADMIN | Eliminación dura. |

Campos del modelo `Evento`: `titulo`, `descripcion`, `fecha`, `fechaFin`, `lugar`, `artista`, `aforo`, `categoria`, `tipo`, `organizador`, `valor` (CLP, 0 = gratuito), `imagenUrl`, `publicado`.

> Los campos `tipo`, `organizador` y `valor` son extensiones al schema base del DOCX técnico, acordadas el 2026-04-21 para cubrir los filtros y atributos de la propuesta comercial.

### Administración de usuarios

Todos los endpoints requieren rol **ADMIN** (`authMiddleware` + `allowRoles('ADMIN')`).

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/admin/usuarios` | Lista de usuarios con rol, estado y fecha de creación. |
| POST | `/admin/usuarios` | Crea un usuario con password temporal generada. Body: `{ nombre, email, rol? }`. Devuelve `{ user, passwordTemporal }` — la password se muestra una única vez. |
| PUT | `/admin/usuarios/:id/rol` | Cambia el rol. Body: `{ rol }`. ADMIN no puede quitarse a sí mismo su rol. |
| DELETE | `/admin/usuarios/:id` | Soft-delete (`activo = false`). ADMIN no puede desactivarse. |
| POST | `/admin/usuarios/:id/reactivar` | Revierte un soft-delete. |

---

## Roles del sistema

| Rol | Permisos |
|---|---|
| **ADMIN** | Control total: CRUD eventos (incluye DELETE), gestión de usuarios con password temporal, panel con estadísticas en tiempo real, suscriptores, exportación (Día 5). |
| **FUNCIONARIO** | Crear eventos y editar solo los propios. No elimina. No gestiona usuarios. Accede al panel con sección "Eventos". |
| **CIUDADANO** | Vista pública: home, calendario, detalle de eventos, perfil propio. (Suscripción a newsletter — Día 5.) |

Las rutas del frontend declaran `meta.auth`, `meta.roles` y `meta.layout`. El `beforeEach` guard las valida y redirige por rol cuando corresponde.

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
  - Upload a Cloudinary (folder `cultura-constitucion`, transformación auto).
  - FUNCIONARIO solo edita sus propios eventos; DELETE solo ADMIN.
  - `express-async-errors` para manejo de rechazos async.
  - Frontend: composable `useEventos`, `GestionEventos` con tabla + filtros + badges, `FormularioEvento` con preview y multipart, `DetalleEvento` público con descarga `.ics`.

- **Día 3 — Calendario interactivo + gestión de usuarios**
  - FullCalendar v6 con vista mes/semana/día y locale `es`.
  - Click en evento navega a `/eventos/:id`; filtros reactivos (`categoria`, `lugar`, `tipo`) con watch.
  - Backend: `/api/admin/usuarios` con listar, crear funcionario (password temporal de 12 chars), cambiar rol, soft-delete y reactivar.
  - Guardrails: ADMIN no puede quitarse su rol ni desactivarse.
  - Frontend: composable `useUsuarios`, `GestionUsuarios` con tabla, buscador, resumen por rol, modal de creación con copy-to-clipboard de la password.

### Rediseño UI institucional (adelanto de Día 4+)

Aplicado el 2026-04-21 sobre los tres días completados:

- **Tipografía:** Plus Jakarta Sans (Google Fonts, preconnect).
- **Tailwind extendido:** shadows soft, animations `float`/`slide-up`.
- **Layout admin:** `AdminLayout.vue` con sidebar sticky (gradient radial, secciones con labels, dot verde en activo, promo card, perfil con avatar gradient), topbar translúcida con saludo personalizado.
- **Home público:** hero con blobs animados, stats flotantes, grid de categorías con emojis, sección "Cómo funciona" con pasos conectados, CTA con gradient, footer oscuro.
- **Dashboard real** (reemplaza placeholder del Día 4): 4 stat cards con gradients e iconos, barras animadas de distribución de categorías y roles, lista de próximos eventos con fecha estilo ticket.
- **EventoCard:** fecha flotante tipo ticket, badge "Gratis" verde vs precio, chip de tipo, hover con gradient overlay + scale.
- **DetalleEvento:** hero full-width con imagen + overlay, grid de detalles con iconos, sidebar sticky con precio y botón `.ics`.
- **Tablas admin:** filas con avatar, fecha tipo ticket, badges con dot de estado, iconos en acciones, empty states ilustrados.
- **FormularioEvento:** form seccionado (básico / cuándo y dónde / clasificación / imagen / publicación), dropzone con hover, input de valor con prefijo `$`.
- **Login / Register:** split screen con hero decorativo (patrones radiales, pulse dots, stats, checklist de beneficios).
- **Navbar público:** sticky translúcido con backdrop-blur, logo gradient, responsive con hamburguesa.
- **Transiciones:** fade entre rutas, `slide-up` en entrada de formularios, hover/active sutiles en botones.

### Pendientes del sprint

| Día | Tema principal |
|---|---|
| 4 | Refinar perfil editable + flujo registro ciudadano + detalles finales del dashboard |
| 5 | Newsletter (suscripción pública + listado admin + CSV) + pulido responsive + PWA (vite-plugin-pwa) |
| 6 | QA end-to-end en prod + seed con eventos reales aportados por la Muni |
| 7 | Optimizaciones (lazy loading reforzado, compresión), README final |
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
- **Accesibilidad:** inputs con `aria-label` donde corresponde, contraste adecuado, focus rings de 4px visibles.
- **Responsive:** breakpoints `md:` y `lg:`; sidebar admin colapsa a drawer con hamburguesa en móvil; navbar público idem; grids se ajustan a 1 / 2 / 3 columnas.

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
