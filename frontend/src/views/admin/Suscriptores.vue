<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useNewsletter } from '../../composables/useNewsletter'

const { listar, desactivar, descargarCSV } = useNewsletter()
const toast = useToast()

const items = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(50)
const busqueda = ref('')
const cargando = ref(false)
const exportando = ref(false)

const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

const activos = computed(() => items.value.filter((i) => i.activo).length)

let timer
watch(busqueda, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    cargar()
  }, 300)
})

async function cargar() {
  cargando.value = true
  try {
    const params = { page: page.value, limit: limit.value }
    if (busqueda.value) params.q = busqueda.value
    const data = await listar(params)
    items.value = data.items
    total.value = data.total
  } catch (err) {
    toast.error('No se pudieron cargar los suscriptores')
  } finally {
    cargando.value = false
  }
}

async function toggleDesactivar(suscriptor) {
  if (!confirm(`¿Dar de baja a ${suscriptor.nombre}?`)) return
  try {
    await desactivar(suscriptor.id)
    const i = items.value.findIndex((s) => s.id === suscriptor.id)
    if (i >= 0) items.value[i] = { ...items.value[i], activo: false }
    toast.success('Suscriptor desactivado')
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo desactivar')
  }
}

async function exportar() {
  if (exportando.value) return
  exportando.value = true
  try {
    await descargarCSV()
    toast.success('CSV descargado')
  } catch (err) {
    toast.error('No se pudo generar el CSV')
  } finally {
    exportando.value = false
  }
}

function irAPagina(n) {
  if (n < 1 || n > totalPaginas.value) return
  page.value = n
  cargar()
}

function inicialesDe(nombre) {
  return (nombre || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-brand font-semibold uppercase tracking-[0.12em] text-xs mb-1">Newsletter</p>
        <h1 class="text-3xl md:text-4xl font-bold text-slate-900">Suscriptores</h1>
        <p class="text-slate-500 mt-1">Gestiona los correos inscritos al newsletter cultural.</p>
      </div>
      <button
        @click="exportar"
        :disabled="exportando || !items.length"
        class="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transition shadow-brand font-semibold"
      >
        <svg v-if="exportando" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ exportando ? 'Exportando…' : 'Exportar CSV' }}
      </button>
    </header>

    <!-- Resumen -->
    <div class="grid grid-cols-3 gap-4">
      <div class="rounded-2xl p-4 border bg-slate-50 text-slate-700 border-slate-200">
        <p class="text-[11px] font-semibold uppercase tracking-wide opacity-80">Total</p>
        <p class="text-3xl font-bold mt-1">{{ total }}</p>
      </div>
      <div class="rounded-2xl p-4 border bg-emerald-50 text-emerald-700 border-emerald-100">
        <p class="text-[11px] font-semibold uppercase tracking-wide opacity-80">Activos en página</p>
        <p class="text-3xl font-bold mt-1">{{ activos }}</p>
      </div>
      <div class="rounded-2xl p-4 border bg-brand-50 text-brand-700 border-brand-100">
        <p class="text-[11px] font-semibold uppercase tracking-wide opacity-80">Páginas</p>
        <p class="text-3xl font-bold mt-1">{{ totalPaginas }}</p>
      </div>
    </div>

    <!-- Buscador -->
    <div class="bg-white rounded-2xl shadow-soft p-4 border border-slate-100">
      <div class="relative">
        <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar por nombre o email…"
          class="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="cargando && !items.length" class="bg-white rounded-2xl shadow-soft p-5 space-y-3 border border-slate-100">
      <div v-for="n in 5" :key="n" class="h-14 bg-slate-100 rounded-xl animate-pulse"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="bg-white rounded-2xl p-12 text-center shadow-soft border border-slate-100">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="font-semibold text-slate-900">{{ busqueda ? 'Sin resultados' : 'Aún no hay suscriptores' }}</p>
      <p class="text-sm text-slate-500 mt-1">
        {{ busqueda ? 'Prueba con otro término.' : 'El formulario en el home público empezará a llenar esta lista.' }}
      </p>
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-2xl shadow-soft overflow-hidden border border-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 text-left">
              <th class="px-5 py-3">Suscriptor</th>
              <th class="px-5 py-3">Email</th>
              <th class="px-5 py-3">Estado</th>
              <th class="px-5 py-3">Suscrito</th>
              <th class="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="s in items"
              :key="s.id"
              :class="{ 'opacity-60': !s.activo }"
              class="hover:bg-slate-50/70 transition"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-700 text-white font-bold flex items-center justify-center text-xs">
                    {{ inicialesDe(s.nombre) }}
                  </div>
                  <p class="font-semibold text-slate-900">{{ s.nombre }}</p>
                </div>
              </td>
              <td class="px-5 py-4 text-slate-700 truncate max-w-[280px]">{{ s.email }}</td>
              <td class="px-5 py-4">
                <span
                  :class="s.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                >
                  <span :class="s.activo ? 'bg-emerald-500' : 'bg-slate-400'" class="w-1.5 h-1.5 rounded-full"></span>
                  {{ s.activo ? 'Activo' : 'Dado de baja' }}
                </span>
              </td>
              <td class="px-5 py-4 text-xs text-slate-500">{{ fmt(s.createdAt) }}</td>
              <td class="px-5 py-4 text-right">
                <button
                  v-if="s.activo"
                  @click="toggleDesactivar(s)"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
                >Dar de baja</button>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="flex items-center justify-between px-5 py-4 border-t border-slate-100 text-sm">
        <p class="text-slate-500">
          Página {{ page }} de {{ totalPaginas }} · {{ total }} suscriptores
        </p>
        <div class="flex items-center gap-1">
          <button
            @click="irAPagina(page - 1)"
            :disabled="page === 1"
            class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >← Anterior</button>
          <button
            @click="irAPagina(page + 1)"
            :disabled="page === totalPaginas"
            class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >Siguiente →</button>
        </div>
      </div>
    </div>
  </section>
</template>
