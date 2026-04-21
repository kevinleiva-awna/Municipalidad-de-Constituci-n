<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  evento: { type: Object, required: true },
})

const fechaDia = computed(() => new Date(props.evento.fecha).toLocaleDateString('es-CL', { day: '2-digit' }))
const fechaMes = computed(() => new Date(props.evento.fecha).toLocaleDateString('es-CL', { month: 'short' }).replace('.', ''))
const horaTexto = computed(() =>
  new Date(props.evento.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
)

const esGratuito = computed(() =>
  props.evento.valor === null || props.evento.valor === undefined || props.evento.valor === 0
)

const valorTexto = computed(() =>
  esGratuito.value ? 'Gratis' : `$${props.evento.valor.toLocaleString('es-CL')}`
)
</script>

<template>
  <RouterLink
    :to="`/eventos/${evento.id}`"
    class="group relative bg-white rounded-2xl shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col border border-slate-100"
  >
    <!-- Imagen -->
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        v-if="evento.imagenUrl"
        :src="evento.imagenUrl"
        :alt="evento.titulo"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-brand-400 via-brand to-brand-700 flex items-center justify-center relative">
        <div class="absolute inset-0 opacity-20"
          style="background-image: radial-gradient(circle at 30% 30%, white 0, transparent 40%), radial-gradient(circle at 70% 70%, white 0, transparent 50%);">
        </div>
        <span class="text-6xl font-bold text-white/80 relative">{{ evento.titulo?.[0]?.toUpperCase() || '·' }}</span>
      </div>

      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <!-- Fecha flotante -->
      <div class="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center shadow-soft-md border border-white">
        <p class="text-[9px] font-bold uppercase tracking-wide text-brand leading-none">{{ fechaMes }}</p>
        <p class="text-lg font-bold text-slate-900 leading-none mt-0.5">{{ fechaDia }}</p>
      </div>

      <!-- Badge valor -->
      <span
        :class="esGratuito
          ? 'bg-emerald-500 text-white'
          : 'bg-white/95 backdrop-blur-sm text-slate-900 border border-white'"
        class="absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full shadow-soft-md"
      >{{ valorTexto }}</span>

      <!-- Tipo chip -->
      <span class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
        {{ evento.tipo }}
      </span>
    </div>

    <!-- Contenido -->
    <div class="p-5 flex-1 flex flex-col">
      <p class="text-[11px] font-semibold text-brand uppercase tracking-[0.1em] mb-1">{{ evento.categoria }}</p>
      <h3 class="text-lg font-bold text-slate-900 group-hover:text-brand transition line-clamp-2 leading-snug">
        {{ evento.titulo }}
      </h3>

      <div class="mt-3 space-y-1.5 text-sm text-slate-600">
        <p class="flex items-center gap-2">
          <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ horaTexto }} h</span>
        </p>
        <p class="flex items-center gap-2">
          <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="line-clamp-1">{{ evento.lugar }}</span>
        </p>
      </div>

      <p v-if="evento.descripcion" class="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
        {{ evento.descripcion }}
      </p>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-400">{{ evento.organizador || evento.creadoPor?.nombre || 'Municipalidad' }}</span>
        <span class="inline-flex items-center gap-1 text-sm font-semibold text-brand opacity-0 group-hover:opacity-100 transition">
          Ver detalles
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </div>
    </div>
  </RouterLink>
</template>
