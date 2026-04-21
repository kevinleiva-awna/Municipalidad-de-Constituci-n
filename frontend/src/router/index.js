import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const routes = [
  { path: '/', redirect: () => redirectByRole() },

  { path: '/login',    component: () => import('../views/auth/Login.vue'),    meta: { guest: true } },
  { path: '/register', component: () => import('../views/auth/Register.vue'), meta: { guest: true } },

  { path: '/calendario', component: () => import('../views/public/Calendario.vue') },
  { path: '/eventos/:id', component: () => import('../views/public/DetalleEvento.vue'), props: true },

  { path: '/dashboard',       component: () => import('../views/admin/Dashboard.vue'),       meta: { auth: true, roles: ['ADMIN'] } },
  { path: '/admin/eventos',   component: () => import('../views/admin/GestionEventos.vue'),  meta: { auth: true, roles: ['ADMIN', 'FUNCIONARIO'] } },
  { path: '/admin/usuarios',  component: () => import('../views/admin/GestionUsuarios.vue'), meta: { auth: true, roles: ['ADMIN'] } },
  { path: '/admin/suscriptores', component: () => import('../views/admin/Suscriptores.vue'), meta: { auth: true, roles: ['ADMIN'] } },

  { path: '/perfil', component: () => import('../views/shared/Perfil.vue'), meta: { auth: true } },

  { path: '/:pathMatch(.*)*', component: () => import('../views/shared/NotFound.vue') },
]

function redirectByRole() {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return '/login'
  if (auth.rol === 'ADMIN') return '/dashboard'
  if (auth.rol === 'FUNCIONARIO') return '/admin/eventos'
  return '/calendario'
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.auth && !auth.isAuthenticated) return '/login'

  if (to.meta.roles && !to.meta.roles.includes(auth.rol)) {
    return redirectByRole()
  }

  if (to.meta.guest && auth.isAuthenticated) return redirectByRole()
})

export default router
