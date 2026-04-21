<script setup>
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const sidebarAbierto = ref(false)

const links = computed(() => [
  { to: '/dashboard',           label: 'Panel',         roles: ['ADMIN'],               icon: 'dashboard' },
  { to: '/admin/eventos',       label: 'Eventos',       roles: ['ADMIN', 'FUNCIONARIO'], icon: 'calendar'  },
  { to: '/admin/usuarios',      label: 'Usuarios',      roles: ['ADMIN'],               icon: 'users'     },
  { to: '/admin/suscriptores',  label: 'Suscriptores',  roles: ['ADMIN'],               icon: 'mail'      },
].filter((l) => l.roles.includes(auth.rol)))

const iniciales = computed(() =>
  (auth.user?.nombre || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex bg-slate-50">
    <!-- Backdrop mobile -->
    <div
      v-if="sidebarAbierto"
      @click="sidebarAbierto = false"
      class="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="sidebarAbierto ? 'translate-x-0' : '-translate-x-full'"
      class="fixed md:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-brand-800 to-brand-700 text-white flex flex-col transition-transform duration-200 md:translate-x-0"
    >
      <!-- Logo -->
      <div class="px-5 py-5 border-b border-white/10">
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-wider text-white/60">Panel Admin</p>
            <p class="font-bold leading-tight">Cultura Constitución</p>
          </div>
        </RouterLink>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          @click="sidebarAbierto = false"
          class="sidebar-link"
        >
          <svg v-if="link.icon === 'dashboard'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <svg v-else-if="link.icon === 'calendar'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <svg v-else-if="link.icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <svg v-else-if="link.icon === 'mail'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{{ link.label }}</span>
        </RouterLink>
      </nav>

      <!-- User + logout -->
      <div class="p-4 border-t border-white/10 space-y-3">
        <RouterLink to="/perfil" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-semibold group-hover:bg-white/20 transition">
            {{ iniciales }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ auth.user?.nombre }}</p>
            <p class="text-xs text-white/60">{{ auth.rol }}</p>
          </div>
        </RouterLink>
        <button
          @click="logout"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/15 transition text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Salir
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <header class="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-3">
        <button
          @click="sidebarAbierto = !sidebarAbierto"
          class="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          aria-label="Menú"
        >
          <svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <RouterLink
          to="/"
          class="flex items-center gap-2 text-sm text-slate-600 hover:text-brand transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Ir al sitio público
        </RouterLink>

        <div class="ml-auto flex items-center gap-3 text-sm">
          <span class="hidden sm:inline text-slate-500">Hola,</span>
          <span class="font-medium text-slate-900">{{ auth.user?.nombre }}</span>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  transition: background-color 150ms ease, color 150ms ease, transform 150ms ease;
}
.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}
.sidebar-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  box-shadow: inset 3px 0 0 white;
}
</style>
