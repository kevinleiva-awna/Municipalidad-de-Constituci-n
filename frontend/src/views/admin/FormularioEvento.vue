<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useEventos } from '../../composables/useEventos'

const props = defineProps({ id: { type: String, default: null } })
const router = useRouter()
const toast = useToast()
const { obtener, crear, actualizar } = useEventos()

const esEdicion = computed(() => !!props.id)
const loading = ref(false)
const cargando = ref(false)
const imagen = ref(null)
const imagenPreview = ref(null)

const form = ref({
  titulo: '',
  descripcion: '',
  fecha: '',
  fechaFin: '',
  lugar: '',
  artista: '',
  aforo: '',
  categoria: '',
  tipo: '',
  organizador: '',
  valor: '',
  publicado: true,
})

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function cargar() {
  if (!props.id) return
  cargando.value = true
  try {
    const ev = await obtener(props.id)
    form.value = {
      titulo: ev.titulo,
      descripcion: ev.descripcion || '',
      fecha: toDatetimeLocal(ev.fecha),
      fechaFin: toDatetimeLocal(ev.fechaFin),
      lugar: ev.lugar,
      artista: ev.artista || '',
      aforo: ev.aforo ?? '',
      categoria: ev.categoria,
      tipo: ev.tipo,
      organizador: ev.organizador || '',
      valor: ev.valor ?? '',
      publicado: ev.publicado,
    }
    if (ev.imagenUrl) imagenPreview.value = ev.imagenUrl
  } catch (err) {
    toast.error('No se pudo cargar el evento')
    router.push('/admin/eventos')
  } finally {
    cargando.value = false
  }
}

function onImagen(e) {
  const file = e.target.files?.[0]
  if (!file) return
  imagen.value = file
  imagenPreview.value = URL.createObjectURL(file)
}

async function submit() {
  if (loading.value) return
  loading.value = true
  try {
    const payload = { ...form.value }
    if (payload.fecha)    payload.fecha    = new Date(payload.fecha).toISOString()
    if (payload.fechaFin) payload.fechaFin = new Date(payload.fechaFin).toISOString()

    if (esEdicion.value) {
      await actualizar(props.id, payload, imagen.value)
      toast.success('Evento actualizado')
    } else {
      await crear(payload, imagen.value)
      toast.success('Evento creado')
    }
    router.push('/admin/eventos')
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo guardar el evento')
  } finally {
    loading.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-3xl mx-auto p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold text-brand">
        {{ esEdicion ? 'Editar evento' : 'Nuevo evento' }}
      </h1>
    </header>

    <div v-if="cargando" class="text-slate-500">Cargando…</div>

    <form
      v-else
      @submit.prevent="submit"
      class="bg-white rounded-xl shadow-sm p-6 space-y-5"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label class="block md:col-span-2">
          <span class="text-sm font-medium text-slate-700">Título *</span>
          <input v-model="form.titulo" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block md:col-span-2">
          <span class="text-sm font-medium text-slate-700">Descripción</span>
          <textarea v-model="form.descripcion" rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"></textarea>
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Fecha y hora *</span>
          <input v-model="form.fecha" type="datetime-local" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Fecha y hora de fin</span>
          <input v-model="form.fechaFin" type="datetime-local" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Lugar *</span>
          <input v-model="form.lugar" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Artista</span>
          <input v-model="form.artista" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Categoría *</span>
          <input v-model="form.categoria" required placeholder="Música, Teatro, Arte…" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Tipo *</span>
          <input v-model="form.tipo" required placeholder="Concierto, Taller, Feria…" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Organizador</span>
          <input v-model="form.organizador" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Aforo</span>
          <input v-model="form.aforo" type="number" min="0" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">Valor (CLP, 0 = gratuito)</span>
          <input v-model="form.valor" type="number" min="0" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
        </label>

        <label class="block md:col-span-2">
          <span class="text-sm font-medium text-slate-700">Imagen</span>
          <input type="file" accept="image/*" @change="onImagen" class="mt-1 block w-full text-sm" />
          <img v-if="imagenPreview" :src="imagenPreview" class="mt-3 max-h-40 rounded-lg border" />
        </label>

        <label class="flex items-center gap-2 md:col-span-2">
          <input v-model="form.publicado" type="checkbox" />
          <span class="text-sm text-slate-700">Publicado (visible en el calendario)</span>
        </label>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          @click="router.push('/admin/eventos')"
          class="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
        >Cancelar</button>
        <button
          type="submit"
          :disabled="loading"
          class="px-5 py-2 rounded-lg bg-brand text-white hover:bg-brand-600 disabled:opacity-60 transition"
        >{{ loading ? 'Guardando…' : (esEdicion ? 'Guardar cambios' : 'Crear evento') }}</button>
      </div>
    </form>
  </section>
</template>
