<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const menuAbierto = ref(false)

function logout() {
  auth.logout()
  menuAbierto.value = false
  router.push('/')
}
</script>

<template>
  <nav class="bg-white border-b border-slate-200 sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
      <RouterLink to="/" class="font-bold text-brand text-lg">
        Cultura Constitución
      </RouterLink>

      <!-- Desktop links -->
      <div class="hidden md:flex items-center gap-5 text-sm text-slate-700">
        <RouterLink to="/calendario" class="hover:text-brand transition">Calendario</RouterLink>
        <RouterLink
          v-if="['ADMIN','FUNCIONARIO'].includes(auth.rol)"
          to="/admin/eventos"
          class="hover:text-brand transition"
        >Eventos</RouterLink>
        <RouterLink
          v-if="auth.rol === 'ADMIN'"
          to="/dashboard"
          class="hover:text-brand transition"
        >Panel</RouterLink>
        <RouterLink
          v-if="auth.rol === 'ADMIN'"
          to="/admin/usuarios"
          class="hover:text-brand transition"
        >Usuarios</RouterLink>
      </div>

      <!-- Right side -->
      <div class="ml-auto hidden md:flex items-center gap-3 text-sm">
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/perfil" class="text-slate-700 hover:text-brand transition">
            {{ auth.user?.nombre }}
          </RouterLink>
          <button
            @click="logout"
            class="border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition"
          >Salir</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="text-slate-700 hover:text-brand transition">Ingresar</RouterLink>
          <RouterLink
            to="/register"
            class="bg-brand text-white rounded-lg px-4 py-1.5 font-medium hover:bg-brand-600 transition"
          >Registrarse</RouterLink>
        </template>
      </div>

      <!-- Mobile toggle -->
      <button
        @click="menuAbierto = !menuAbierto"
        class="md:hidden ml-auto p-2 rounded-lg hover:bg-slate-100"
        aria-label="Menú"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            :d="menuAbierto ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <div v-if="menuAbierto" class="md:hidden border-t border-slate-200 bg-white">
      <div class="px-4 py-3 space-y-2 text-sm">
        <RouterLink to="/calendario" @click="menuAbierto = false" class="block py-2 text-slate-700">Calendario</RouterLink>
        <RouterLink
          v-if="['ADMIN','FUNCIONARIO'].includes(auth.rol)"
          to="/admin/eventos"
          @click="menuAbierto = false"
          class="block py-2 text-slate-700"
        >Eventos</RouterLink>
        <RouterLink
          v-if="auth.rol === 'ADMIN'"
          to="/dashboard"
          @click="menuAbierto = false"
          class="block py-2 text-slate-700"
        >Panel</RouterLink>
        <RouterLink
          v-if="auth.rol === 'ADMIN'"
          to="/admin/usuarios"
          @click="menuAbierto = false"
          class="block py-2 text-slate-700"
        >Usuarios</RouterLink>

        <div class="border-t border-slate-100 pt-2 mt-2">
          <template v-if="auth.isAuthenticated">
            <RouterLink to="/perfil" @click="menuAbierto = false" class="block py-2 text-slate-700">
              {{ auth.user?.nombre }}
            </RouterLink>
            <button @click="logout" class="block w-full text-left py-2 text-slate-700">Salir</button>
          </template>
          <template v-else>
            <RouterLink to="/login" @click="menuAbierto = false" class="block py-2 text-slate-700">Ingresar</RouterLink>
            <RouterLink to="/register" @click="menuAbierto = false" class="block py-2 font-medium text-brand">Registrarse</RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
