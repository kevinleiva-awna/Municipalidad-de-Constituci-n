<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  evento: { type: Object, required: true },
})

const fechaTexto = computed(() => {
  const d = new Date(props.evento.fecha)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
})

const horaTexto = computed(() => {
  const d = new Date(props.evento.fecha)
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
})

const valorTexto = computed(() => {
  const v = props.evento.valor
  if (v === null || v === undefined || v === 0) return 'Gratuito'
  return `$${v.toLocaleString('es-CL')}`
})
</script>

<template>
  <RouterLink
    :to="`/eventos/${evento.id}`"
    class="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
  >
    <div class="aspect-[16/10] bg-gradient-to-br from-brand-400 to-brand-700 relative overflow-hidden">
      <img
        v-if="evento.imagenUrl"
        :src="evento.imagenUrl"
        :alt="evento.titulo"
        class="w-full h-full object-cover group-hover:scale-105 transition"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center text-white/80 text-4xl font-bold">
        {{ evento.titulo?.[0]?.toUpperCase() || '·' }}
      </div>
      <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand text-xs font-semibold px-3 py-1 rounded-full">
        {{ evento.tipo }}
      </span>
      <span class="absolute top-3 right-3 bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">
        {{ valorTexto }}
      </span>
    </div>

    <div class="p-5 flex-1 flex flex-col">
      <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">{{ evento.categoria }}</p>
      <h3 class="text-lg font-semibold text-slate-900 group-hover:text-brand transition line-clamp-2">
        {{ evento.titulo }}
      </h3>

      <div class="mt-3 space-y-1 text-sm text-slate-600">
        <p class="flex items-center gap-2">
          <span aria-hidden="true">📅</span>
          <span>{{ fechaTexto }} · {{ horaTexto }}</span>
        </p>
        <p class="flex items-center gap-2">
          <span aria-hidden="true">📍</span>
          <span class="line-clamp-1">{{ evento.lugar }}</span>
        </p>
      </div>

      <p v-if="evento.descripcion" class="mt-3 text-sm text-slate-600 line-clamp-2">
        {{ evento.descripcion }}
      </p>
    </div>
  </RouterLink>
</template>
