# Cultura Constitución

PWA para la gestión cultural de la Municipalidad de Constitución (Dirección de Cultura y Turismo). Plataforma web que centraliza la oferta cultural comunal: calendario público, CRUD de eventos, panel administrativo y (próximamente) módulo de newsletter.

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

---

## Stack tecnológico

### Frontend

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build tool:** Vite 5
- **Estilos:** Tailwind CSS 3 (color primario de marca: `#185FA5`)
- **Routing:** Vue Router 4 (lazy loading + guards por rol)
- **Estado:** Pinia
- **HTTP:** Axios (con interceptor 401 → logout automático)
- **Notificaciones UI:** vue-toastification
- **Calendario:** FullCalendar (pendiente Día 3)
- **PWA:** vite-plugin-pwa (pendiente Día 5)

### Backend

- **Runtime:** Node.js 20 LTS
- **Framework:** Express 4 (con `express-async-errors`)
- **ORM:** Prisma 5
- **BD:** PostgreSQL 15
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Subida de archivos:** Multer + `multer-storage-cloudinary`
- **Exportación CSV:** `fast-csv` (pendiente Día 5)

### Infraestructura

| Capa | Servicio |
|---|---|
| Frontend | Vercel (auto-deploy en `main`) |
| Backend + PostgreSQL | Railway (auto-deploy en `main`) |
| CDN de imágenes | Cloudinary (folder `cultura-constitucion`) |
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
│       ├── controllers/     # auth, eventos (futuro: usuarios, newsletter, admin)
│       ├── middleware/      # auth (JWT) y roles
│       ├── routes/
│       ├── utils/           # prisma singleton, cloudinary
│       ├── app.js           # Express + CORS
│       └── server.js        # Puerto y arranque
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/      # Navbar, EventoCard (reutilizable)
│       ├── composables/     # useEventos
│       ├── stores/          # auth.store (Pinia)
│       ├── router/          # guards por rol + lazy loading
│       ├── views/
│       │   ├── auth/        # Login, Register
│       │   ├── public/      # Home, Calendario, DetalleEvento
│       │   ├── admin/       # Dashboard, GestionEventos, FormularioEvento, GestionUsuarios, Suscriptores
│       │   └── shared/      # Perfil, NotFound
│       ├── App.vue
│       └── main.js
└── README.md
```

---

## Instalación local

### Requisitos

- Node.js 20+ (Railway corre con Node 22; local funciona con 20)
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

El frontend usa `VITE_API_URL=http://localhost:3001/api` por defecto. Si el backend corre en otro puerto, ajústalo en `frontend/.env`.

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
| GET | `/eventos` | Pública | Query params: `categoria`, `lugar`, `tipo`, `desde`, `hasta`, `publicado` (`true`/`false`/`all`), `page`, `limit`. Responde con `{ items, total, page, limit }` y header `X-Total-Count`. |
| GET | `/eventos/:id` | Pública | Detalle con `creadoPor.{id,nombre}` (sin exponer hash). |
| POST | `/eventos` | ADMIN, FUNCIONARIO | Multipart/form-data con campos del evento + `imagen` opcional. |
| PUT | `/eventos/:id` | ADMIN o creador FUNCIONARIO | Actualización parcial. FUNCIONARIO solo puede editar los que creó. |
| DELETE | `/eventos/:id` | ADMIN | Eliminación dura. |

Campos del modelo `Evento`: `titulo`, `descripcion`, `fecha`, `fechaFin`, `lugar`, `artista`, `aforo`, `categoria`, `tipo`, `organizador`, `valor` (CLP, 0 = gratuito), `imagenUrl`, `publicado`.

> Los campos `tipo`, `organizador` y `valor` son extensiones al schema base del DOCX técnico, acordadas el 2026-04-21 para cubrir los filtros y atributos de la propuesta comercial.

---

## Roles del sistema

| Rol | Permisos |
|---|---|
| **ADMIN** | Control total: CRUD eventos, gestión de usuarios, panel con estadísticas, suscriptores, exportación. |
| **FUNCIONARIO** | Crear eventos y editar solo los propios. No elimina. No gestiona usuarios. |
| **CIUDADANO** | Vista pública: home, calendario, detalle de eventos, perfil propio. (Suscripción a newsletter — Día 5.) |

Las rutas del frontend declaran `meta.auth` y `meta.roles` y un `beforeEach` guard las valida.

---

## Estado del sprint

Última actualización: **21-abril-2026**.

### Completado

- **Día 1 — Setup, infraestructura y autenticación**
  - Scaffold monorepo.
  - Modelo Prisma (`User`, `Evento`, `Suscriptor`) con migración inicial aplicada en prod.
  - Endpoints `/auth/register`, `/auth/login`, `/auth/me` con JWT + bcrypt.
  - Middlewares `authMiddleware` (JWT) y `allowRoles(...)`.
  - Frontend: scaffold Vue 3 + Tailwind 3 + Pinia + Router.
  - Deploy en Railway (backend + Postgres) y Vercel (frontend).

- **Día 2 — CRUD de eventos + subida de imágenes**
  - CRUD `/api/eventos` con filtros por `categoria`, `lugar`, `tipo`, `desde`, `hasta`, `publicado` y paginación.
  - Upload a Cloudinary (folder `cultura-constitucion`, transformación auto a 1200px, quality auto).
  - `FUNCIONARIO` solo edita sus propios eventos; `DELETE` solo ADMIN.
  - `express-async-errors` para propagar errores async al error handler.
  - Frontend: `useEventos` composable, `GestionEventos.vue` con tabla + filtros + badges publicado/borrador, `FormularioEvento.vue` con preview local y FormData, `DetalleEvento.vue` público con descarga `.ics`.

- **Adelanto — Home público**
  - Hero con degradado brand, tarjetas de stats (próximos / categorías / lugares) y grid de próximos 6 eventos.
  - `EventoCard.vue` reutilizable (imagen con hover-zoom o placeholder, badges de tipo y valor).
  - Navbar responsive (hamburguesa en móvil), visible siempre excepto en `/login` y `/register`.

### Pendientes del sprint

| Día | Tema principal |
|---|---|
| 3 | FullCalendar público con filtros + gestión de usuarios (admin) |
| 4 | Dashboard admin con métricas + perfil del usuario + flujo de registro ciudadano |
| 5 | Newsletter (suscripción + CSV) + pulido responsive + PWA (vite-plugin-pwa) |
| 6 | QA end-to-end en prod + seed con 8-10 eventos culturales reales |
| 7 | Lazy loading, compresión, `X-Total-Count`, README final |
| 8 | Deploy final limpio + video demo de 3 minutos + entrega |

---

## Pendientes Fase 2

Incluidos en la propuesta comercial original, **fuera del MVP** por restricción de tiempo. Documentados para el handoff con Yerko Espinoza:

- **Pase "SomosCultura"**: QR de beneficios, red de comercios asociados, descuentos.
- **Integración con CRM/SaaS interno** de la Municipalidad (requiere documentación de APIs por parte de la Muni).
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
