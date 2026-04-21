<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { useEventos } from '../../composables/useEventos'

const router = useRouter()
const toast = useToast()
const { listar } = useEventos()

const eventos = ref([])
const opcionesBase = ref([])
const cargando = ref(false)

const filtros = reactive({
  categoria: '',
  lugar: '',
  tipo: '',
})

const categoriasDisponibles = computed(() => uniques(opcionesBase.value.map((e) => e.categoria)))
const lugaresDisponibles    = computed(() => uniques(opcionesBase.value.map((e) => e.lugar)))
const tiposDisponibles      = computed(() => uniques(opcionesBase.value.map((e) => e.tipo)))

function uniques(arr) {
  return [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
}

async function cargar() {
  cargando.value = true
  try {
    const params = { limit: 200 }
    if (filtros.categoria) params.categoria = filtros.categoria
    if (filtros.lugar)     params.lugar     = filtros.lugar
    if (filtros.tipo)      params.tipo      = filtros.tipo
    const { items } = await listar(params)
    eventos.value = items
  } catch (err) {
    toast.error('No se pudieron cargar los eventos')
  } finally {
    cargando.value = false
  }
}

async function cargarOpcionesBase() {
  try {
    const { items } = await listar({ limit: 200 })
    opcionesBase.value = items
  } catch {
    /* silencioso: si falla, los selects quedan vacíos */
  }
}

function limpiar() {
  filtros.categoria = ''
  filtros.lugar = ''
  filtros.tipo = ''
}

const eventosCalendario = computed(() =>
  eventos.value.map((e) => ({
    id: String(e.id),
    title: e.titulo,
    start: e.fecha,
    end: e.fechaFin || undefined,
    extendedProps: { lugar: e.lugar, tipo: e.tipo, categoria: e.categoria },
  }))
)

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: esLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
  },
  events: eventosCalendario.value,
  eventClick: (info) => {
    router.push(`/eventos/${info.event.id}`)
  },
  height: 'auto',
  eventDisplay: 'block',
  eventBackgroundColor: '#185FA5',
  eventBorderColor: '#134C84',
  dayMaxEventRows: 3,
  moreLinkText: (n) => `+${n} más`,
}))

watch(filtros, cargar, { deep: true })

onMounted(() => {
  cargarOpcionesBase()
  cargar()
})
</script>

<template>
  <section class="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
    <header>
      <p class="text-brand font-semibold uppercase tracking-[0.12em] text-xs mb-1">Agenda pública</p>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900">Calendario cultural</h1>
      <p class="text-slate-500 mt-1">Explora los próximos eventos de Constitución.</p>
    </header>

    <div class="bg-white rounded-2xl shadow-soft p-5 flex flex-wrap items-end gap-3 border border-slate-100">
      <label class="block min-w-[150px] flex-1">
        <span class="text-[11px] text-slate-500 uppercase tracking-[0.08em] font-semibold">Categoría</span>
        <select v-model="filtros.categoria" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition">
          <option value="">Todas</option>
          <option v-for="c in categoriasDisponibles" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label class="block min-w-[180px] flex-1">
        <span class="text-[11px] text-slate-500 uppercase tracking-[0.08em] font-semibold">Lugar</span>
        <select v-model="filtros.lugar" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition">
          <option value="">Todos</option>
          <option v-for="l in lugaresDisponibles" :key="l" :value="l">{{ l }}</option>
        </select>
      </label>
      <label class="block min-w-[150px] flex-1">
        <span class="text-[11px] text-slate-500 uppercase tracking-[0.08em] font-semibold">Tipo</span>
        <select v-model="filtros.tipo" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition">
          <option value="">Todos</option>
          <option v-for="t in tiposDisponibles" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>
      <button
        type="button"
        @click="limpiar"
        class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition"
      >Limpiar</button>

      <div class="ml-auto flex items-center gap-2">
        <span v-if="cargando" class="inline-flex items-center gap-1.5 text-sm text-slate-500">
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Cargando…
        </span>
        <span v-else class="inline-flex items-center gap-1.5 text-sm text-brand font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          {{ eventos.length }} eventos
        </span>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-soft p-4 md:p-6 border border-slate-100">
      <FullCalendar :options="calendarOptions" />
    </div>
  </section>
</template>

<style>
.fc .fc-button-primary {
  background-color: #185FA5;
  border-color: #134C84;
}
.fc .fc-button-primary:hover {
  background-color: #134C84;
  border-color: #0E3963;
}
.fc .fc-button-primary:not(:disabled).fc-button-active,
.fc .fc-button-primary:not(:disabled):active {
  background-color: #0E3963;
  border-color: #0A2642;
}
.fc-event {
  cursor: pointer;
}
</style>
