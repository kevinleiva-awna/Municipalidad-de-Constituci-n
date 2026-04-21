<script setup>
import { useAuthStore } from '../../stores/auth.store'
const auth = useAuthStore()
// TODO Día 4: formulario para cambiar nombre + contraseña con confirmación.
</script>

<template>
  <section class="p-8 space-y-2">
    <h1 class="text-2xl font-semibold text-brand">Mi perfil</h1>
    <p class="text-slate-700">{{ auth.user?.nombre }} — {{ auth.user?.email }}</p>
    <p class="text-sm text-slate-500">Rol: {{ auth.rol }}</p>
    <p class="text-slate-500 mt-4 text-sm">En construcción — Día 4.</p>
  </section>
</template>
