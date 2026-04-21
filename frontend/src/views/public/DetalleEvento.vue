<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useEventos } from '../../composables/useEventos'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const toast = useToast()
const { obtener } = useEventos()

const evento = ref(null)
const cargando = ref(true)

function fmt(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })
}

function pad(n) { return String(n).padStart(2, '0') }

function toICSDate(iso) {
  const d = new Date(iso)
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}

function icsEscape(text) {
  return (text || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function descargarICS() {
  const ev = evento.value
  if (!ev) return
  const start = toICSDate(ev.fecha)
  const end = toICSDate(ev.fechaFin || new Date(new Date(ev.fecha).getTime() + 2 * 60 * 60 * 1000))
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cultura Constitución//ES',
    'BEGIN:VEVENT',
    `UID:evento-${ev.id}@cultura-constitucion`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsEscape(ev.titulo)}`,
    `LOCATION:${icsEscape(ev.lugar)}`,
    `DESCRIPTION:${icsEscape(ev.descripcion)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `evento-${ev.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function cargar() {
  cargando.value = true
  try {
    evento.value = await obtener(props.id)
  } catch (err) {
    toast.error('No se pudo cargar el evento')
    router.push('/calendario')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-3xl mx-auto p-6">
    <RouterLink to="/calendario" class="text-sm text-brand hover:underline">← Volver al calendario</RouterLink>

    <div v-if="cargando" class="mt-6 text-slate-500">Cargando…</div>

    <article v-else-if="evento" class="mt-4 bg-white rounded-xl shadow-sm overflow-hidden">
      <img
        v-if="evento.imagenUrl"
        :src="evento.imagenUrl"
        :alt="evento.titulo"
        class="w-full max-h-96 object-cover"
      />
      <div class="p-6 space-y-4">
        <header class="space-y-1">
          <p class="text-sm text-brand uppercase tracking-wide">{{ evento.tipo }} · {{ evento.categoria }}</p>
          <h1 class="text-3xl font-semibold text-slate-900">{{ evento.titulo }}</h1>
          <p class="text-slate-500">{{ fmt(evento.fecha) }}<span v-if="evento.fechaFin"> — {{ fmt(evento.fechaFin) }}</span></p>
        </header>

        <p v-if="evento.descripcion" class="text-slate-700 whitespace-pre-line">{{ evento.descripcion }}</p>

        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt class="text-slate-500">Lugar</dt><dd class="font-medium">{{ evento.lugar }}</dd></div>
          <div v-if="evento.artista"><dt class="text-slate-500">Artista</dt><dd class="font-medium">{{ evento.artista }}</dd></div>
          <div v-if="evento.organizador"><dt class="text-slate-500">Organizador</dt><dd class="font-medium">{{ evento.organizador }}</dd></div>
          <div v-if="evento.aforo"><dt class="text-slate-500">Aforo</dt><dd class="font-medium">{{ evento.aforo }} personas</dd></div>
          <div>
            <dt class="text-slate-500">Valor</dt>
            <dd class="font-medium">
              {{ evento.valor === 0 || evento.valor === null ? 'Gratuito' : `$${evento.valor.toLocaleString('es-CL')}` }}
            </dd>
          </div>
          <div v-if="evento.creadoPor"><dt class="text-slate-500">Publicado por</dt><dd class="font-medium">{{ evento.creadoPor.nombre }}</dd></div>
        </dl>

        <div class="pt-4 border-t border-slate-100">
          <button
            @click="descargarICS"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-600 transition"
          >Agregar a mi calendario (.ics)</button>
        </div>
      </div>
    </article>
  </section>
</template>
