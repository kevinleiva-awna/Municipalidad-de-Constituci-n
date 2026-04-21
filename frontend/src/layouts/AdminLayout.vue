<script setup>
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const sidebarAbierto = ref(false)

const secciones = computed(() => [
  {
    titulo: 'Gestión',
    items: [
      { to: '/dashboard',          label: 'Panel',       roles: ['ADMIN'],                icon: 'dashboard' },
      { to: '/admin/eventos',      label: 'Eventos',     roles: ['ADMIN', 'FUNCIONARIO'], icon: 'calendar'  },
      { to: '/admin/usuarios',     label: 'Usuarios',    roles: ['ADMIN'],                icon: 'users'     },
      { to: '/admin/suscriptores', label: 'Suscriptores', roles: ['ADMIN'],               icon: 'mail'      },
    ],
  },
  {
    titulo: 'Cuenta',
    items: [
      { to: '/perfil', label: 'Mi perfil', roles: ['ADMIN', 'FUNCIONARIO', 'CIUDADANO'], icon: 'user' },
    ],
  },
].map((s) => ({ ...s, items: s.items.filter((i) => i.roles.includes(auth.rol)) }))
 .filter((s) => s.items.length > 0))

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
  <div class="min-h-screen flex bg-slate-100">
    <!-- Backdrop mobile -->
    <div
      v-if="sidebarAbierto"
      @click="sidebarAbierto = false"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="sidebarAbierto ? 'translate-x-0' : '-translate-x-full'"
      class="fixed md:sticky md:top-0 inset-y-0 md:h-screen left-0 z-40 w-72 flex flex-col transition-transform duration-300 md:translate-x-0 shadow-2xl md:shadow-none"
      style="background: radial-gradient(140% 120% at 0% 0%, #1b6bb8 0%, #134C84 45%, #0A2642 100%);"
    >
      <!-- Logo -->
      <div class="px-6 py-6">
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white/15 group-hover:scale-105 transition">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div class="text-white">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Panel admin</p>
            <p class="font-bold leading-tight mt-0.5">Cultura Constitución</p>
          </div>
        </RouterLink>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-4 space-y-6 overflow-y-auto">
        <div v-for="seccion in secciones" :key="seccion.titulo">
          <p class="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-2">
            {{ seccion.titulo }}
          </p>
          <div class="space-y-1">
            <RouterLink
              v-for="link in seccion.items"
              :key="link.to"
              :to="link.to"
              @click="sidebarAbierto = false"
              class="sidebar-link"
            >
              <svg v-if="link.icon === 'dashboard'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <svg v-else-if="link.icon === 'calendar'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="link.icon === 'users'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <svg v-else-if="link.icon === 'mail'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="link.icon === 'user'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="flex-1">{{ link.label }}</span>
              <span class="indicator"></span>
            </RouterLink>
          </div>
        </div>

        <!-- Promo card -->
        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <p class="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1">Sitio público</p>
          <p class="text-white/90 text-sm mb-3 leading-snug">
            Así ven los ciudadanos la plataforma.
          </p>
          <RouterLink
            to="/"
            class="inline-flex items-center gap-1.5 text-sm text-white font-medium group"
          >
            Visitar
            <svg class="w-4 h-4 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </RouterLink>
        </div>
      </nav>

      <!-- User + logout -->
      <div class="p-4">
        <div class="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-white/25 to-white/10 flex items-center justify-center font-bold text-white">
            {{ iniciales }}
          </div>
          <RouterLink to="/perfil" class="flex-1 min-w-0 text-white">
            <p class="font-semibold truncate leading-tight">{{ auth.user?.nombre }}</p>
            <p class="text-[11px] text-white/60 uppercase tracking-wide mt-0.5">{{ auth.rol }}</p>
          </RouterLink>
          <button
            @click="logout"
            class="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/80 text-white/70 hover:text-white flex items-center justify-center transition"
            title="Cerrar sesión"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <header class="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button
          @click="sidebarAbierto = !sidebarAbierto"
          class="md:hidden p-2 rounded-xl hover:bg-slate-100 transition"
          aria-label="Menú"
        >
          <svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="hidden md:block">
          <p class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            {{ new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </p>
          <p class="text-sm font-medium text-slate-700">
            Hola, <span class="text-brand">{{ auth.user?.nombre?.split(' ')[0] }}</span> 👋
          </p>
        </div>

        <div class="ml-auto flex items-center gap-2">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-brand px-3 py-2 rounded-xl hover:bg-slate-100 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span class="hidden sm:inline">Ver sitio público</span>
            <span class="sm:hidden">Sitio</span>
          </RouterLink>
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
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.7rem 0.9rem;
  border-radius: 0.875rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 150ms ease, color 150ms ease, transform 150ms ease;
}
.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
  transform: translateX(2px);
}
.sidebar-link .indicator {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background-color: transparent;
  transition: background-color 200ms ease, box-shadow 200ms ease;
}
.sidebar-link.router-link-active {
  background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
  color: white;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 20px -8px rgba(0,0,0,0.4);
}
.sidebar-link.router-link-active .indicator {
  background-color: #4ade80;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.6);
}
</style>
