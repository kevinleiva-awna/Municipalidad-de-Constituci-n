<script setup>
import { onMounted, ref } from 'vue'
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

async function cargar() {
  loading.value = true
  try {
    const { items } = await listar({ limit: 100 })
    eventos.value = items
  } catch (err) {
    toast.error('No se pudieron cargar los eventos')
  } finally {
    loading.value = false
  }
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

    <div v-if="loading" class="text-slate-500">Cargando…</div>

    <div v-else-if="!eventos.length" class="bg-white rounded-xl p-10 text-center text-slate-500 shadow-sm">
      Aún no hay eventos. Crea el primero.
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-100 text-slate-700 text-left">
          <tr>
            <th class="px-4 py-3">Título</th>
            <th class="px-4 py-3">Fecha</th>
            <th class="px-4 py-3">Lugar</th>
            <th class="px-4 py-3">Tipo</th>
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
