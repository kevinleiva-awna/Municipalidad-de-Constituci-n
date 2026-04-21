<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAdmin } from '../../composables/useAdmin'

const { stats: fetchStats } = useAdmin()
const toast = useToast()

const data = ref(null)
const cargando = ref(true)

const stats = computed(() => {
  if (!data.value) return []
  return [
    {
      label: 'Total eventos',
      value: data.value.eventos.total,
      change: `${data.value.eventos.publicados} publicados`,
      icon: 'calendar',
      gradient: 'from-brand to-brand-700',
    },
    {
      label: 'Próximos 7 días',
      value: data.value.eventos.proximos7dias,
      change: `${data.value.eventos.proximos30dias} en 30 días`,
      icon: 'clock',
      gradient: 'from-emerald-500 to-emerald-700',
    },
    {
      label: 'Usuarios',
      value: data.value.usuarios.total,
      change: `${data.value.usuarios.activos} activos`,
      icon: 'users',
      gradient: 'from-violet-500 to-violet-700',
    },
    {
      label: 'Ciudadanos',
      value: data.value.usuarios.porRol.CIUDADANO,
      change: `${data.value.usuarios.porRol.FUNCIONARIO} funcionarios`,
      icon: 'user-group',
      gradient: 'from-amber-500 to-amber-700',
    },
  ]
})

const distribucionRoles = computed(() => {
  if (!data.value) return []
  const total = data.value.usuarios.total || 1
  return ['ADMIN', 'FUNCIONARIO', 'CIUDADANO'].map((rol) => ({
    rol,
    cantidad: data.value.usuarios.porRol[rol] || 0,
    porcentaje: Math.round(((data.value.usuarios.porRol[rol] || 0) / total) * 100),
  }))
})

function formatoMes(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { month: 'short' }).replace('.', '')
}
function formatoDia(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit' })
}
function horaFmt(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

async function cargar() {
  cargando.value = true
  try {
    data.value = await fetchStats()
  } catch (err) {
    toast.error('No se pudieron cargar las métricas')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
    <!-- Header -->
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-brand font-semibold uppercase tracking-[0.12em] text-xs mb-1">Panel administrativo</p>
        <h1 class="text-3xl md:text-4xl font-bold text-slate-900">Resumen general</h1>
        <p class="text-slate-500 mt-1">Métricas en tiempo real de la plataforma.</p>
      </div>
      <button
        @click="cargar"
        :disabled="cargando"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 transition disabled:opacity-60"
      >
        <svg class="w-4 h-4" :class="{ 'animate-spin': cargando }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Actualizar
      </button>
    </header>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="(stat, i) in (cargando && !data ? [1,2,3,4] : stats)"
        :key="stat.label || stat"
        class="relative bg-white rounded-2xl shadow-soft p-5 overflow-hidden border border-slate-100 hover:-translate-y-0.5 hover:shadow-soft-lg transition-all"
        :style="`animation: slide-up 400ms ease ${i * 60}ms both`"
      >
        <template v-if="stat.label">
          <div :class="`absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10`"></div>
          <div class="relative flex items-start justify-between mb-4">
            <div :class="`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center shadow-lg`">
              <svg v-if="stat.icon === 'calendar'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="stat.icon === 'clock'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="stat.icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p class="relative text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{{ stat.label }}</p>
          <p class="relative text-3xl font-bold text-slate-900 mt-1">{{ stat.value }}</p>
          <p class="relative text-xs text-slate-500 mt-2">{{ stat.change }}</p>
        </template>
        <template v-else>
          <div class="h-11 w-11 bg-slate-200 rounded-xl animate-pulse mb-4"></div>
          <div class="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
          <div class="h-8 w-16 bg-slate-200 rounded animate-pulse mt-2"></div>
          <div class="h-3 w-20 bg-slate-100 rounded animate-pulse mt-3"></div>
        </template>
      </div>
    </div>

    <!-- Grid principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Distribución categorías -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6 border border-slate-100">
        <header class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Eventos por categoría</h2>
            <p class="text-sm text-slate-500">Distribución del total de eventos</p>
          </div>
          <span v-if="data" class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total: {{ data.eventos.total }}</span>
        </header>

        <div v-if="cargando && !data" class="space-y-3">
          <div v-for="n in 5" :key="n" class="h-8 bg-slate-100 rounded animate-pulse"></div>
        </div>

        <div v-else-if="!data?.eventosPorCategoria?.length" class="text-center py-10 text-slate-500">
          Aún no hay eventos registrados.
        </div>

        <div v-else class="space-y-4">
          <div v-for="cat in data.eventosPorCategoria" :key="cat.nombre">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-medium text-slate-700">{{ cat.nombre }}</span>
              <span class="text-sm text-slate-500"><span class="font-semibold text-slate-900">{{ cat.cantidad }}</span> · {{ cat.porcentaje }}%</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-brand to-brand-400 rounded-full transition-all duration-700"
                :style="`width: ${cat.porcentaje}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribución roles -->
      <div class="bg-white rounded-2xl shadow-soft p-6 border border-slate-100">
        <header class="mb-6">
          <h2 class="text-lg font-bold text-slate-900">Usuarios por rol</h2>
          <p v-if="data" class="text-sm text-slate-500">Total: {{ data.usuarios.total }}</p>
        </header>

        <div v-if="cargando && !data" class="space-y-3">
          <div v-for="n in 3" :key="n" class="h-12 bg-slate-100 rounded animate-pulse"></div>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="rol in distribucionRoles"
            :key="rol.rol"
            class="flex items-center gap-3"
          >
            <div
              :class="{
                'bg-brand text-white': rol.rol === 'ADMIN',
                'bg-emerald-500 text-white': rol.rol === 'FUNCIONARIO',
                'bg-slate-400 text-white': rol.rol === 'CIUDADANO',
              }"
              class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
            >{{ rol.rol[0] }}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-slate-700 capitalize">{{ rol.rol.toLowerCase() }}</span>
                <span class="text-sm font-bold text-slate-900">{{ rol.cantidad }}</span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  :class="{
                    'bg-brand': rol.rol === 'ADMIN',
                    'bg-emerald-500': rol.rol === 'FUNCIONARIO',
                    'bg-slate-400': rol.rol === 'CIUDADANO',
                  }"
                  class="h-full rounded-full transition-all duration-700"
                  :style="`width: ${rol.porcentaje}%`"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Próximos eventos -->
    <div class="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <header class="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Próximos eventos</h2>
          <p class="text-sm text-slate-500">Los 5 más cercanos</p>
        </div>
        <RouterLink
          to="/admin/eventos"
          class="text-sm font-semibold text-brand hover:underline inline-flex items-center gap-1"
        >
          Ver todos
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
      </header>

      <div v-if="cargando && !data" class="divide-y divide-slate-100">
        <div v-for="n in 3" :key="n" class="p-5 flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-slate-200 animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
            <div class="h-3 bg-slate-100 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!data?.proximosEventos?.length" class="p-10 text-center text-slate-500">
        No hay eventos próximos programados.
      </div>

      <ul v-else class="divide-y divide-slate-100">
        <li v-for="ev in data.proximosEventos" :key="ev.id" class="p-5 flex items-center gap-4 hover:bg-slate-50 transition">
          <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-100 flex flex-col items-center justify-center">
            <span class="text-[10px] font-semibold uppercase text-brand-600">{{ formatoMes(ev.fecha) }}</span>
            <span class="text-lg font-bold text-brand-700 leading-none">{{ formatoDia(ev.fecha) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <RouterLink :to="`/eventos/${ev.id}`" class="font-semibold text-slate-900 hover:text-brand transition line-clamp-1">
              {{ ev.titulo }}
            </RouterLink>
            <p class="text-sm text-slate-500 flex items-center gap-3 mt-0.5">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ horaFmt(ev.fecha) }}
              </span>
              <span class="flex items-center gap-1 truncate">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="truncate">{{ ev.lugar }}</span>
              </span>
            </p>
          </div>
          <span class="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
            {{ ev.tipo }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
