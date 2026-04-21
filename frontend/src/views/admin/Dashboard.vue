<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useEventos } from '../../composables/useEventos'
import { useUsuarios } from '../../composables/useUsuarios'

const { listar: listarEventos } = useEventos()
const { listar: listarUsuarios } = useUsuarios()
const toast = useToast()

const eventos = ref([])
const usuarios = ref([])
const cargando = ref(true)

const ahora = new Date()
const en7dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)
const en30dias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000)

const stats = computed(() => {
  const publicados = eventos.value.filter((e) => e.publicado)
  const proximos = publicados.filter((e) => new Date(e.fecha) >= ahora)
  const estaSemana = proximos.filter((e) => new Date(e.fecha) <= en7dias)
  const esteMes = proximos.filter((e) => new Date(e.fecha) <= en30dias)

  return [
    {
      label: 'Total eventos',
      value: eventos.value.length,
      change: `${publicados.length} publicados`,
      icon: 'calendar',
      gradient: 'from-brand to-brand-700',
    },
    {
      label: 'Próximos 7 días',
      value: estaSemana.length,
      change: `${esteMes.length} en 30 días`,
      icon: 'clock',
      gradient: 'from-emerald-500 to-emerald-700',
    },
    {
      label: 'Usuarios',
      value: usuarios.value.length,
      change: `${usuarios.value.filter((u) => u.activo).length} activos`,
      icon: 'users',
      gradient: 'from-violet-500 to-violet-700',
    },
    {
      label: 'Ciudadanos',
      value: usuarios.value.filter((u) => u.rol === 'CIUDADANO').length,
      change: `${usuarios.value.filter((u) => u.rol === 'FUNCIONARIO').length} funcionarios`,
      icon: 'user-group',
      gradient: 'from-amber-500 to-amber-700',
    },
  ]
})

const distribucionCategorias = computed(() => {
  const map = new Map()
  for (const e of eventos.value) {
    if (!e.categoria) continue
    map.set(e.categoria, (map.get(e.categoria) || 0) + 1)
  }
  const total = eventos.value.length || 1
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100),
    }))
})

const distribucionRoles = computed(() => {
  const total = usuarios.value.length || 1
  const roles = ['ADMIN', 'FUNCIONARIO', 'CIUDADANO']
  return roles.map((rol) => {
    const cantidad = usuarios.value.filter((u) => u.rol === rol).length
    return {
      rol,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100),
    }
  })
})

const proximosEventos = computed(() =>
  eventos.value
    .filter((e) => new Date(e.fecha) >= ahora && e.publicado)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 5)
)

function formatoFecha(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
}

function horaFmt(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

async function cargar() {
  cargando.value = true
  try {
    const [eventosData, usuariosData] = await Promise.all([
      listarEventos({ limit: 200, publicado: 'all' }),
      listarUsuarios(),
    ])
    eventos.value = eventosData.items
    usuarios.value = usuariosData
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
    <header>
      <p class="text-brand font-semibold uppercase tracking-[0.12em] text-xs mb-1">Panel administrativo</p>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900">Resumen general</h1>
      <p class="text-slate-500 mt-1">Métricas en tiempo real de la plataforma.</p>
    </header>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="relative bg-white rounded-2xl shadow-soft p-5 overflow-hidden border border-slate-100 hover:-translate-y-0.5 hover:shadow-soft-lg transition-all"
        :style="`animation: slide-up 400ms ease ${i * 60}ms both`"
      >
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
        <p class="relative text-3xl font-bold text-slate-900 mt-1">
          <span v-if="cargando" class="inline-block h-8 w-16 bg-slate-200 rounded animate-pulse"></span>
          <span v-else>{{ stat.value }}</span>
        </p>
        <p class="relative text-xs text-slate-500 mt-2">{{ stat.change }}</p>
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
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total: {{ eventos.length }}</span>
        </header>

        <div v-if="cargando" class="space-y-3">
          <div v-for="n in 5" :key="n" class="h-8 bg-slate-100 rounded animate-pulse"></div>
        </div>

        <div v-else-if="!distribucionCategorias.length" class="text-center py-10 text-slate-500">
          Aún no hay eventos registrados.
        </div>

        <div v-else class="space-y-4">
          <div v-for="cat in distribucionCategorias" :key="cat.nombre">
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
          <p class="text-sm text-slate-500">Total: {{ usuarios.length }}</p>
        </header>

        <div v-if="cargando" class="space-y-3">
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

      <div v-if="cargando" class="divide-y divide-slate-100">
        <div v-for="n in 3" :key="n" class="p-5 flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-slate-200 animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
            <div class="h-3 bg-slate-100 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!proximosEventos.length" class="p-10 text-center text-slate-500">
        No hay eventos próximos programados.
      </div>

      <ul v-else class="divide-y divide-slate-100">
        <li v-for="ev in proximosEventos" :key="ev.id" class="p-5 flex items-center gap-4 hover:bg-slate-50 transition">
          <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-100 flex flex-col items-center justify-center">
            <span class="text-[10px] font-semibold uppercase text-brand-600">{{ formatoFecha(ev.fecha).split(' ')[1] }}</span>
            <span class="text-lg font-bold text-brand-700 leading-none">{{ formatoFecha(ev.fecha).split(' ')[0] }}</span>
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
