<script setup>
defineProps({ id: { type: String, required: true } })
// TODO Día 2: cargar GET /api/eventos/:id, mostrar imagen, artista, aforo y botón .ics
</script>

<template>
  <section class="p-8">
    <h1 class="text-2xl font-semibold text-brand">Detalle del evento</h1>
    <p class="text-slate-500 mt-2">En construcción — Día 2. (id: {{ id }})</p>
  </section>
</template>
