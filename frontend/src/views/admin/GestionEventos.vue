<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useEventos } from '../../composables/useEventos'
import { useAuthStore } from '../../stores/auth.store'

const { listar, eliminar } = useEventos()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const eventos = ref([])
const loading = ref(false)

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
  if (!confirm(`¿Eliminar el evento "${evento.titulo}"?`)) return
  try {
    await eliminar(evento.id)
    toast.success('Evento eliminado')
    await cargar()
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo eliminar')
  }
}

function formatoFecha(iso) {
  return new Date(iso).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-brand">Eventos</h1>
      <RouterLink
        to="/admin/eventos/nuevo"
        class="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition"
      >+ Nuevo evento</RouterLink>
    </header>

    <form
      @submit.prevent="cargar"
      class="bg-white rounded-xl shadow-sm p-4 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3"
    >
      <input v-model="filtros.categoria" placeholder="Categoría" class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
      <input v-model="filtros.lugar"     placeholder="Lugar"     class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
      <input v-model="filtros.tipo"      placeholder="Tipo"      class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
      <input v-model="filtros.desde"     type="date" class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
      <input v-model="filtros.hasta"     type="date" class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
      <div class="flex gap-2">
        <button type="submit" class="flex-1 bg-brand text-white rounded-lg px-3 py-2 text-sm hover:bg-brand-600 transition">Aplicar</button>
        <button type="button" @click="limpiar" class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Limpiar</button>
      </div>
    </form>

    <div v-if="loading" class="text-slate-500">Cargando…</div>

    <div v-else-if="!eventos.length" class="bg-white rounded-xl p-10 text-center text-slate-500 shadow-sm">
      No se encontraron eventos con estos filtros.
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-100 text-slate-700 text-left">
          <tr>
            <th class="px-4 py-3">Título</th>
            <th class="px-4 py-3">Fecha</th>
            <th class="px-4 py-3">Lugar</th>
            <th class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3">Creador</th>
            <th class="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="ev in eventos" :key="ev.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium text-slate-900">{{ ev.titulo }}</td>
            <td class="px-4 py-3 text-slate-600">{{ formatoFecha(ev.fecha) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ ev.lugar }}</td>
            <td class="px-4 py-3 text-slate-600">{{ ev.tipo }}</td>
            <td class="px-4 py-3">
              <span
                :class="ev.publicado ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                class="px-2 py-0.5 rounded text-xs font-medium"
              >{{ ev.publicado ? 'Publicado' : 'Borrador' }}</span>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ ev.creadoPor?.nombre || '—' }}</td>
            <td class="px-4 py-3 text-right space-x-2">
              <RouterLink
                :to="`/eventos/${ev.id}`"
                class="text-slate-600 hover:underline"
              >Ver</RouterLink>
              <button
                v-if="puedeEditar(ev)"
                @click="router.push(`/admin/eventos/${ev.id}/editar`)"
                class="text-brand hover:underline"
              >Editar</button>
              <button
                v-if="auth.rol === 'ADMIN'"
                @click="confirmarEliminar(ev)"
                class="text-red-600 hover:underline"
              >Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
