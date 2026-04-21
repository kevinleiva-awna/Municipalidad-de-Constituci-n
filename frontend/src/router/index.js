import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const ADMIN = { auth: true, roles: ['ADMIN'],                layout: 'admin' }
const STAFF = { auth: true, roles: ['ADMIN', 'FUNCIONARIO'], layout: 'admin' }
const USER  = { auth: true,                                  layout: 'admin' }

const routes = [
  { path: '/', component: () => import('../views/public/Home.vue') },

  { path: '/login',    component: () => import('../views/auth/Login.vue'),    meta: { guest: true, bare: true } },
  { path: '/register', component: () => import('../views/auth/Register.vue'), meta: { guest: true, bare: true } },

  { path: '/calendario', component: () => import('../views/public/Calendario.vue') },
  { path: '/eventos/:id', component: () => import('../views/public/DetalleEvento.vue'), props: true },

  { path: '/dashboard',                component: () => import('../views/admin/Dashboard.vue'),         meta: ADMIN },
  { path: '/admin/eventos',            component: () => import('../views/admin/GestionEventos.vue'),    meta: STAFF },
  { path: '/admin/eventos/nuevo',      component: () => import('../views/admin/FormularioEvento.vue'),  meta: STAFF },
  { path: '/admin/eventos/:id/editar', component: () => import('../views/admin/FormularioEvento.vue'),  props: true, meta: STAFF },
  { path: '/admin/usuarios',           component: () => import('../views/admin/GestionUsuarios.vue'),   meta: ADMIN },
  { path: '/admin/suscriptores',       component: () => import('../views/admin/Suscriptores.vue'),      meta: ADMIN },

  { path: '/perfil', component: () => import('../views/shared/Perfil.vue'), meta: USER },

  { path: '/:pathMatch(.*)*', component: () => import('../views/shared/NotFound.vue') },
]

function defaultForRole() {
  const auth = useAuthStore()
  if (auth.rol === 'ADMIN') return '/dashboard'
  if (auth.rol === 'FUNCIONARIO') return '/admin/eventos'
  return '/'
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() { return { top: 0 } },
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.auth && !auth.isAuthenticated) return '/login'

  if (to.meta.roles && !to.meta.roles.includes(auth.rol)) {
    return defaultForRole()
  }

  if (to.meta.guest && auth.isAuthenticated) return defaultForRole()
})

export default router
