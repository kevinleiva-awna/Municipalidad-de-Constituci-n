<script setup>
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="bg-brand text-white shadow">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
      <RouterLink to="/" class="font-semibold">Cultura Constitución</RouterLink>

      <div class="flex items-center gap-4 text-sm">
        <RouterLink to="/calendario" class="hover:underline">Calendario</RouterLink>
        <RouterLink
          v-if="['ADMIN','FUNCIONARIO'].includes(auth.rol)"
          to="/admin/eventos"
          class="hover:underline"
        >Eventos</RouterLink>
        <RouterLink
          v-if="auth.rol === 'ADMIN'"
          to="/dashboard"
          class="hover:underline"
        >Panel</RouterLink>
        <RouterLink
          v-if="auth.rol === 'ADMIN'"
          to="/admin/usuarios"
          class="hover:underline"
        >Usuarios</RouterLink>
      </div>

      <div class="ml-auto flex items-center gap-3 text-sm">
        <RouterLink to="/perfil" class="hover:underline">{{ auth.user?.nombre }}</RouterLink>
        <button
          @click="logout"
          class="rounded bg-white/10 hover:bg-white/20 px-3 py-1 transition"
        >Salir</button>
      </div>
    </div>
  </nav>
</template>
