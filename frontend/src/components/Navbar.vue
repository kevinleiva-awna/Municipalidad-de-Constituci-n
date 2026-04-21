<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const menuAbierto = ref(false)

const iniciales = computed(() =>
  (auth.user?.nombre || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
)

function logout() {
  auth.logout()
  menuAbierto.value = false
  router.push('/')
}

function isActive(path) {
  return route.path === path || (path !== '/' && route.path.startsWith(path))
}
</script>

<template>
  <nav class="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center shadow-brand group-hover:scale-105 transition">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div class="hidden sm:block">
          <p class="font-bold text-slate-900 leading-tight">Cultura Constitución</p>
          <p class="text-[10px] text-slate-500 uppercase tracking-wider">Municipalidad</p>
        </div>
      </RouterLink>

      <!-- Desktop links -->
      <div class="hidden md:flex items-center gap-1 ml-4">
        <RouterLink
          to="/calendario"
          :class="isActive('/calendario') ? 'text-brand bg-brand-50' : 'text-slate-700 hover:bg-slate-100'"
          class="px-3 py-2 rounded-xl text-sm font-medium transition"
        >Calendario</RouterLink>
        <RouterLink
          v-if="['ADMIN','FUNCIONARIO'].includes(auth.rol)"
          to="/admin/eventos"
          :class="isActive('/admin') ? 'text-brand bg-brand-50' : 'text-slate-700 hover:bg-slate-100'"
          class="px-3 py-2 rounded-xl text-sm font-medium transition"
        >Panel admin</RouterLink>
      </div>

      <!-- Right side -->
      <div class="ml-auto hidden md:flex items-center gap-3 text-sm">
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/perfil" class="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 transition">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-700 text-white font-bold text-xs flex items-center justify-center">
              {{ iniciales }}
            </div>
            <span class="text-slate-700 font-medium">{{ auth.user?.nombre?.split(' ')[0] }}</span>
          </RouterLink>
          <button
            @click="logout"
            class="text-slate-500 hover:text-red-600 text-sm font-medium transition px-2"
          >Salir</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="px-3 py-2 text-slate-700 hover:text-brand font-medium transition">Ingresar</RouterLink>
          <RouterLink
            to="/register"
            class="bg-brand text-white rounded-xl px-5 py-2 font-semibold hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 transition shadow-brand"
          >Registrarse</RouterLink>
        </template>
      </div>

      <!-- Mobile toggle -->
      <button
        @click="menuAbierto = !menuAbierto"
        class="md:hidden ml-auto p-2 rounded-xl hover:bg-slate-100 transition"
        aria-label="Menú"
      >
        <svg class="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            :d="menuAbierto ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <div v-if="menuAbierto" class="md:hidden border-t border-slate-200 bg-white">
      <div class="px-4 py-3 space-y-1 text-sm">
        <RouterLink to="/calendario" @click="menuAbierto = false" class="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium">Calendario</RouterLink>
        <RouterLink
          v-if="['ADMIN','FUNCIONARIO'].includes(auth.rol)"
          to="/admin/eventos"
          @click="menuAbierto = false"
          class="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium"
        >Panel admin</RouterLink>

        <div class="border-t border-slate-100 pt-2 mt-2">
          <template v-if="auth.isAuthenticated">
            <RouterLink to="/perfil" @click="menuAbierto = false" class="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium">
              {{ auth.user?.nombre }}
            </RouterLink>
            <button @click="logout" class="block w-full text-left px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium">Cerrar sesión</button>
          </template>
          <template v-else>
            <RouterLink to="/login" @click="menuAbierto = false" class="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-medium">Ingresar</RouterLink>
            <RouterLink to="/register" @click="menuAbierto = false" class="block px-3 py-2.5 rounded-xl text-brand font-bold bg-brand-50">Registrarse</RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
