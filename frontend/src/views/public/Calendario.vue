<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { useEventos } from '../../composables/useEventos'
import EventoCard from '../../components/EventoCard.vue'

const router = useRouter()
const toast = useToast()
const { listar } = useEventos()

const calendarRef = ref(null)
const eventos = ref([])
const opcionesBase = ref([])
const cargando = ref(false)
const cargaInicial = ref(true)
const modo = ref('calendario') // 'calendario' | 'tarjetas'

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
    // Si el primer evento está fuera del mes actualmente visible, salta a él
    if (!cargaInicial.value && items.length > 0 && calendarRef.value) {
      const api = calendarRef.value.getApi()
      const view = api.view
      const first = new Date(items[0].fecha)
      if (first < view.activeStart || first >= view.activeEnd) {
        api.gotoDate(first)
      }
    }
    cargaInicial.value = false
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

const eventosOrdenados = computed(() =>
  [...eventos.value].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
)

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: esLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
  },
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Lista',
  },
  views: {
    listMonth: {
      listDayFormat: { weekday: 'long', day: 'numeric', month: 'long' },
      listDaySideFormat: false,
      noEventsText: 'No hay eventos en este mes',
    },
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

    <!-- Toggle de vista -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-soft">
        <button
          @click="modo = 'calendario'"
          :class="modo === 'calendario' ? 'bg-brand text-white shadow-brand' : 'text-slate-500 hover:text-slate-900'"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendario
        </button>
        <button
          @click="modo = 'tarjetas'"
          :class="modo === 'tarjetas' ? 'bg-brand text-white shadow-brand' : 'text-slate-500 hover:text-slate-900'"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Tarjetas
        </button>
      </div>
    </div>

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

    <!-- Vista calendario -->
    <div v-if="modo === 'calendario'" class="bg-white rounded-2xl shadow-soft p-4 md:p-6 border border-slate-100">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>

    <!-- Vista tarjetas -->
    <div v-else>
      <div v-if="cargando && !eventos.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
          <div class="aspect-[16/10] bg-slate-200"></div>
          <div class="p-5 space-y-3">
            <div class="h-3 bg-slate-200 rounded w-1/3"></div>
            <div class="h-5 bg-slate-200 rounded w-4/5"></div>
            <div class="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!eventosOrdenados.length" class="bg-white rounded-2xl p-12 text-center shadow-soft border border-slate-100">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="font-semibold text-slate-900">Sin eventos con estos filtros</p>
        <p class="text-sm text-slate-500 mt-1">Prueba limpiando o cambiando los filtros.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventoCard v-for="ev in eventosOrdenados" :key="ev.id" :evento="ev" />
      </div>
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
/* Vista lista más legible */
.fc .fc-list-event:hover td {
  background-color: #EAF2FA;
}
.fc .fc-list-event-dot {
  border-color: #185FA5;
}
.fc .fc-list-day-cushion {
  background-color: #F8FAFC;
}
</style>
