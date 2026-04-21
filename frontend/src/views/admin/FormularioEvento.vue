<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useEventos } from '../../composables/useEventos'

const props = defineProps({ id: { type: String, default: null } })
const router = useRouter()
const route = useRoute()
const toast = useToast()
const { obtener, crear, actualizar } = useEventos()

const esEdicion = computed(() => !!props.id)
const esDuplicado = computed(() => !props.id && !!route.query.from)
const loading = ref(false)
const cargando = ref(false)
const imagen = ref(null)
const imagenPreview = ref(null)
const duplicadoDe = ref(null)

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
  const idCarga = props.id || route.query.from
  if (!idCarga) return
  cargando.value = true
  try {
    const ev = await obtener(idCarga)
    if (esDuplicado.value) {
      duplicadoDe.value = ev.titulo
    }
    form.value = {
      titulo: esDuplicado.value ? `${ev.titulo} (copia)` : ev.titulo,
      descripcion: ev.descripcion || '',
      // En duplicado, limpio fechas para forzar elegir nuevas
      fecha: esDuplicado.value ? '' : toDatetimeLocal(ev.fecha),
      fechaFin: esDuplicado.value ? '' : toDatetimeLocal(ev.fechaFin),
      lugar: ev.lugar,
      artista: ev.artista || '',
      aforo: ev.aforo ?? '',
      categoria: ev.categoria,
      tipo: ev.tipo,
      organizador: ev.organizador || '',
      valor: ev.valor ?? '',
      publicado: esDuplicado.value ? false : ev.publicado,
    }
    // En edición mostramos la imagen actual; en duplicado dejamos vacío para que re-suban
    if (ev.imagenUrl && esEdicion.value) imagenPreview.value = ev.imagenUrl
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

function quitarImagen() {
  imagen.value = null
  imagenPreview.value = null
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
  <section class="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-brand font-semibold uppercase tracking-[0.12em] text-xs mb-1">Administración</p>
        <h1 class="text-3xl md:text-4xl font-bold text-slate-900">
          {{ esEdicion ? 'Editar evento' : 'Nuevo evento' }}
        </h1>
        <p v-if="esDuplicado && duplicadoDe" class="text-slate-500 mt-1">
          Duplicando desde <span class="font-semibold text-slate-900">{{ duplicadoDe }}</span> · elige una nueva fecha y ajusta los datos.
        </p>
        <p v-else class="text-slate-500 mt-1">
          {{ esEdicion ? 'Actualiza los datos del evento.' : 'Completa los datos para publicar un nuevo evento.' }}
        </p>
      </div>
      <button
        type="button"
        @click="router.push('/admin/eventos')"
        class="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>
    </header>

    <div v-if="cargando" class="bg-white rounded-2xl p-10 text-slate-500 shadow-soft border border-slate-100 text-center">
      Cargando…
    </div>

    <form
      v-else
      @submit.prevent="submit"
      class="bg-white rounded-2xl shadow-soft p-6 md:p-8 space-y-6 border border-slate-100"
    >
      <!-- Información básica -->
      <div class="space-y-4">
        <h2 class="font-bold text-slate-900">Información básica</h2>

        <label class="block">
          <span class="text-sm font-medium text-slate-700 mb-1.5 block">Título <span class="text-red-500">*</span></span>
          <input v-model="form.titulo" required placeholder="Nombre del evento" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700 mb-1.5 block">Descripción</span>
          <textarea v-model="form.descripcion" rows="3" placeholder="Breve descripción del evento" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition resize-none"></textarea>
        </label>
      </div>

      <!-- Fecha y lugar -->
      <div class="pt-6 border-t border-slate-100 space-y-4">
        <h2 class="font-bold text-slate-900">Cuándo y dónde</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Fecha y hora de inicio <span class="text-red-500">*</span></span>
            <input v-model="form.fecha" type="datetime-local" required class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Fecha y hora de fin</span>
            <input v-model="form.fechaFin" type="datetime-local" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
          </label>
        </div>

        <label class="block">
          <span class="text-sm font-medium text-slate-700 mb-1.5 block">Lugar <span class="text-red-500">*</span></span>
          <input v-model="form.lugar" required placeholder="Teatro Municipal, Biblioteca…" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
        </label>
      </div>

      <!-- Clasificación -->
      <div class="pt-6 border-t border-slate-100 space-y-4">
        <h2 class="font-bold text-slate-900">Clasificación</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Categoría <span class="text-red-500">*</span></span>
            <input v-model="form.categoria" required placeholder="Música, Teatro, Arte…" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Tipo <span class="text-red-500">*</span></span>
            <input v-model="form.tipo" required placeholder="Concierto, Taller, Feria…" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Artista</span>
            <input v-model="form.artista" placeholder="Intérprete o grupo" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Organizador</span>
            <input v-model="form.organizador" placeholder="Quién lo organiza" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Aforo</span>
            <input v-model="form.aforo" type="number" min="0" placeholder="N° personas" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
          </label>
        </div>

        <label class="block">
          <span class="text-sm font-medium text-slate-700 mb-1.5 block">Valor (CLP)</span>
          <div class="relative">
            <span class="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none text-sm">$</span>
            <input v-model="form.valor" type="number" min="0" placeholder="0 (gratuito)" class="w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
          </div>
          <span class="text-xs text-slate-400 mt-1.5 block">Dejar en 0 o vacío si es gratuito.</span>
        </label>
      </div>

      <!-- Imagen -->
      <div class="pt-6 border-t border-slate-100 space-y-4">
        <h2 class="font-bold text-slate-900">Imagen</h2>

        <div v-if="imagenPreview" class="relative">
          <img :src="imagenPreview" class="w-full max-h-64 object-cover rounded-xl border border-slate-200" />
          <button type="button" @click="quitarImagen" class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-white transition shadow-soft">
            Cambiar
          </button>
        </div>

        <label v-else class="flex flex-col items-center justify-center gap-2 p-10 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:border-brand hover:bg-brand-50/30 transition">
          <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm text-slate-700 font-medium">Click para subir una imagen</p>
          <p class="text-xs text-slate-400">JPG, PNG o WebP · Max 5 MB</p>
          <input type="file" accept="image/*" @change="onImagen" class="hidden" />
        </label>
      </div>

      <!-- Publicación -->
      <div class="pt-6 border-t border-slate-100">
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="form.publicado" type="checkbox" class="w-5 h-5 rounded accent-brand cursor-pointer" />
          <div>
            <p class="text-sm font-medium text-slate-900">Publicado</p>
            <p class="text-xs text-slate-500">Visible en el calendario y sitio público</p>
          </div>
        </label>
      </div>

      <!-- Acciones -->
      <div class="pt-6 border-t border-slate-100 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          @click="router.push('/admin/eventos')"
          class="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition font-medium"
        >Cancelar</button>
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transition shadow-brand"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ loading ? 'Guardando…' : (esEdicion ? 'Guardar cambios' : 'Crear evento') }}
        </button>
      </div>
    </form>
  </section>
</template>
