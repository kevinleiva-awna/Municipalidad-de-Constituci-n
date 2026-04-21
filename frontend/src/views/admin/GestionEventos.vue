<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useEventos } from '../../composables/useEventos'
import { useAuthStore } from '../../stores/auth.store'
import { useConfirm } from '../../composables/useConfirm'

const { listar, eliminar, descargarCSV } = useEventos()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const { confirm } = useConfirm()

const eventos = ref([])
const loading = ref(false)
const exportando = ref(false)

const filtros = reactive({
  categoria: '',
  lugar: '',
  tipo: '',
  desde: '',
  hasta: '',
})

function buildParams() {
  const params = { limit: 100, publicado: 'all' }
  if (filtros.categoria) params.categoria = filtros.categoria
  if (filtros.lugar)     params.lugar     = filtros.lugar
  if (filtros.tipo)      params.tipo      = filtros.tipo
  if (filtros.desde)     params.desde     = new Date(filtros.desde).toISOString()
  if (filtros.hasta)     params.hasta     = new Date(filtros.hasta + 'T23:59:59').toISOString()
  return params
}

async function cargar() {
  loading.value = true
  try {
    const { items } = await listar(buildParams())
    eventos.value = items
  } catch (err) {
    toast.error('No se pudieron cargar los eventos')
  } finally {
    loading.value = false
  }
}

function limpiar() {
  filtros.categoria = ''
  filtros.lugar = ''
  filtros.tipo = ''
  filtros.desde = ''
  filtros.hasta = ''
  cargar()
}

function puedeEditar(evento) {
  if (auth.rol === 'ADMIN') return true
  if (auth.rol === 'FUNCIONARIO' && evento.creadoPor?.id === auth.user?.id) return true
  return false
}

async function confirmarEliminar(evento) {
  const ok = await confirm({
    title: `Eliminar "${evento.titulo}"`,
    message: 'Esta acción no se puede deshacer. El evento y sus referencias serán eliminados permanentemente.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'danger',
  })
  if (!ok) return
  try {
    await eliminar(evento.id)
    toast.success('Evento eliminado')
    await cargar()
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo eliminar')
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

function formatoDia(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit' })
}
function formatoMes(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { month: 'short' }).replace('.', '')
}
function formatoHora(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-brand font-semibold uppercase tracking-[0.12em] text-xs mb-1">Administración</p>
        <h1 class="text-3xl md:text-4xl font-bold text-slate-900">Gestión de eventos</h1>
        <p class="text-slate-500 mt-1">{{ eventos.length }} {{ eventos.length === 1 ? 'evento' : 'eventos' }} encontrados</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="auth.rol === 'ADMIN'"
          @click="exportar"
          :disabled="exportando || !eventos.length"
          class="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 disabled:opacity-60 transition font-medium"
        >
          <svg v-if="exportando" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">{{ exportando ? 'Exportando…' : 'Exportar CSV' }}</span>
        </button>
        <RouterLink
          to="/admin/eventos/nuevo"
          class="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 transition shadow-brand font-semibold"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo evento
        </RouterLink>
      </div>
    </header>

    <!-- Filtros -->
    <form
      @submit.prevent="cargar"
      class="bg-white rounded-2xl shadow-soft p-5 grid grid-cols-2 md:grid-cols-6 gap-3 border border-slate-100"
    >
      <input v-model="filtros.categoria" placeholder="Categoría" class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition col-span-2 md:col-span-1" />
      <input v-model="filtros.lugar"     placeholder="Lugar"     class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition col-span-2 md:col-span-1" />
      <input v-model="filtros.tipo"      placeholder="Tipo"      class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition col-span-2 md:col-span-1" />
      <input v-model="filtros.desde"     type="date" class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
      <input v-model="filtros.hasta"     type="date" class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
      <div class="flex gap-2 col-span-2 md:col-span-1">
        <button type="submit" class="flex-1 bg-slate-900 text-white rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-800 transition">Aplicar</button>
        <button type="button" @click="limpiar" class="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-50 transition">Limpiar</button>
      </div>
    </form>

    <!-- Loading skeleton -->
    <div v-if="loading" class="bg-white rounded-2xl shadow-soft p-5 space-y-3 border border-slate-100">
      <div v-for="n in 5" :key="n" class="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!eventos.length" class="bg-white rounded-2xl p-12 text-center shadow-soft border border-slate-100">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="font-semibold text-slate-900">No se encontraron eventos</p>
      <p class="text-sm text-slate-500 mt-1">Prueba con otros filtros o crea uno nuevo.</p>
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-2xl shadow-soft overflow-hidden border border-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 text-left">
              <th class="px-5 py-3">Evento</th>
              <th class="px-5 py-3">Cuándo</th>
              <th class="px-5 py-3">Lugar</th>
              <th class="px-5 py-3">Tipo</th>
              <th class="px-5 py-3">Estado</th>
              <th class="px-5 py-3">Creador</th>
              <th class="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="ev in eventos" :key="ev.id" class="hover:bg-slate-50/70 transition">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img v-if="ev.imagenUrl" :src="ev.imagenUrl" class="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                  <div v-else class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-700 text-white font-bold flex items-center justify-center text-sm">
                    {{ ev.titulo?.[0]?.toUpperCase() || '·' }}
                  </div>
                  <div class="min-w-0">
                    <RouterLink :to="`/eventos/${ev.id}`" class="font-semibold text-slate-900 hover:text-brand line-clamp-1 transition">
                      {{ ev.titulo }}
                    </RouterLink>
                    <p class="text-xs text-slate-500 mt-0.5">{{ ev.categoria }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex flex-col items-center justify-center">
                    <span class="text-[9px] font-bold uppercase text-brand-600 leading-none">{{ formatoMes(ev.fecha) }}</span>
                    <span class="text-sm font-bold text-brand-700 leading-none">{{ formatoDia(ev.fecha) }}</span>
                  </div>
                  <span class="text-xs text-slate-500">{{ formatoHora(ev.fecha) }}</span>
                </div>
              </td>
              <td class="px-5 py-4 text-slate-600 max-w-[200px] truncate">{{ ev.lugar }}</td>
              <td class="px-5 py-4">
                <span class="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{{ ev.tipo }}</span>
              </td>
              <td class="px-5 py-4">
                <span
                  :class="ev.publicado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                >
                  <span :class="ev.publicado ? 'bg-emerald-500' : 'bg-amber-500'" class="w-1.5 h-1.5 rounded-full"></span>
                  {{ ev.publicado ? 'Publicado' : 'Borrador' }}
                </span>
              </td>
              <td class="px-5 py-4 text-slate-600 text-sm">{{ ev.creadoPor?.nombre || '—' }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <RouterLink :to="`/eventos/${ev.id}`" title="Ver" class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </RouterLink>
                  <button
                    v-if="puedeEditar(ev)"
                    @click="router.push(`/admin/eventos/${ev.id}/editar`)"
                    title="Editar"
                    class="p-2 rounded-lg hover:bg-brand-50 text-brand hover:text-brand-700 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="puedeEditar(ev)"
                    @click="router.push({ path: '/admin/eventos/nuevo', query: { from: ev.id } })"
                    title="Duplicar"
                    class="p-2 rounded-lg hover:bg-violet-50 text-violet-600 hover:text-violet-700 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    v-if="auth.rol === 'ADMIN'"
                    @click="confirmarEliminar(ev)"
                    title="Eliminar"
                    class="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
