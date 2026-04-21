<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-4 text-center">
    <div class="space-y-3">
      <p class="text-6xl font-bold text-brand">404</p>
      <h1 class="text-xl font-semibold">Página no encontrada</h1>
      <p class="text-slate-500">La ruta que buscas no existe o fue movida.</p>
      <RouterLink to="/" class="inline-block text-brand hover:underline">Volver al inicio</RouterLink>
    </div>
  </main>
</template>
