<script setup>
import { computed, onMounted, ref } from 'vue'
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

function fmtDia(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long' })
}

function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

const esGratuito = computed(() =>
  !evento.value?.valor || evento.value?.valor === 0
)

function pad(n) { return String(n).padStart(2, '0') }

function toICSDate(iso) {
  const d = new Date(iso)
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z'
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
  toast.success('Evento descargado a tu calendario')
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
  <div class="bg-slate-50 min-h-screen">
    <!-- Loading state -->
    <div v-if="cargando" class="max-w-4xl mx-auto px-6 py-10">
      <div class="aspect-[21/9] bg-slate-200 rounded-3xl animate-pulse mb-6"></div>
      <div class="space-y-3">
        <div class="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
        <div class="h-10 w-3/4 bg-slate-200 rounded animate-pulse"></div>
        <div class="h-4 w-1/2 bg-slate-200 rounded animate-pulse"></div>
      </div>
    </div>

    <article v-else-if="evento">
      <!-- Hero -->
      <header class="relative">
        <div class="relative aspect-[21/9] md:aspect-[21/7] w-full overflow-hidden">
          <img
            v-if="evento.imagenUrl"
            :src="evento.imagenUrl"
            :alt="evento.titulo"
            class="w-full h-full object-cover"
          />
          <div v-else class="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand to-brand-800">
            <div class="absolute inset-0 opacity-25"
              style="background-image: radial-gradient(circle at 30% 30%, white 0, transparent 40%), radial-gradient(circle at 70% 70%, white 0, transparent 50%);">
            </div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        </div>

        <div class="absolute inset-x-0 bottom-0 p-6 md:p-10 text-white">
          <div class="max-w-4xl mx-auto">
            <RouterLink to="/calendario" class="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition mb-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al calendario
            </RouterLink>

            <div class="flex flex-wrap gap-2 mb-3">
              <span class="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white">
                {{ evento.tipo }}
              </span>
              <span class="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white">
                {{ evento.categoria }}
              </span>
              <span
                :class="esGratuito
                  ? 'bg-emerald-500/90'
                  : 'bg-amber-500/90'"
                class="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full text-white"
              >
                {{ esGratuito ? 'Entrada gratuita' : `$${evento.valor.toLocaleString('es-CL')}` }}
              </span>
            </div>

            <h1 class="text-3xl md:text-5xl font-bold leading-tight mb-3">{{ evento.titulo }}</h1>
            <p class="text-white/80 text-lg flex flex-wrap items-center gap-4">
              <span class="capitalize">{{ fmtDia(evento.fecha) }}</span>
              <span>·</span>
              <span>{{ fmtHora(evento.fecha) }} h</span>
            </p>
          </div>
        </div>
      </header>

      <!-- Contenido -->
      <div class="max-w-4xl mx-auto px-6 py-10">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Principal -->
          <div class="lg:col-span-2 space-y-6">
            <div v-if="evento.descripcion" class="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-slate-100">
              <h2 class="font-bold text-slate-900 mb-3">Descripción</h2>
              <p class="text-slate-700 whitespace-pre-line leading-relaxed">{{ evento.descripcion }}</p>
            </div>

            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-slate-100">
              <h2 class="font-bold text-slate-900 mb-5">Detalles</h2>
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Lugar</dt>
                    <dd class="text-slate-900 font-medium mt-0.5">{{ evento.lugar }}</dd>
                  </div>
                </div>

                <div v-if="evento.artista" class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-3c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Artista</dt>
                    <dd class="text-slate-900 font-medium mt-0.5">{{ evento.artista }}</dd>
                  </div>
                </div>

                <div v-if="evento.organizador" class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Organizador</dt>
                    <dd class="text-slate-900 font-medium mt-0.5">{{ evento.organizador }}</dd>
                  </div>
                </div>

                <div v-if="evento.aforo" class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Aforo</dt>
                    <dd class="text-slate-900 font-medium mt-0.5">{{ evento.aforo }} personas</dd>
                  </div>
                </div>

                <div v-if="evento.creadoPor" class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Publicado por</dt>
                    <dd class="text-slate-900 font-medium mt-0.5">{{ evento.creadoPor.nombre }}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="space-y-4">
            <div class="bg-white rounded-2xl p-6 shadow-soft border border-slate-100 sticky top-24">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-slate-500">Entrada</span>
                <span :class="esGratuito ? 'text-emerald-600' : 'text-slate-900'" class="text-xl font-bold">
                  {{ esGratuito ? 'Gratis' : `$${evento.valor.toLocaleString('es-CL')}` }}
                </span>
              </div>

              <div class="border-t border-slate-100 pt-4 space-y-3 text-sm">
                <p class="flex items-center gap-2 text-slate-700">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="capitalize">{{ fmtDia(evento.fecha) }}</span>
                </p>
                <p class="flex items-center gap-2 text-slate-700">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ fmtHora(evento.fecha) }}<span v-if="evento.fechaFin"> — {{ fmtHora(evento.fechaFin) }}</span>
                </p>
              </div>

              <button
                @click="descargarICS"
                class="w-full mt-5 inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold px-5 py-3 rounded-xl hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 transition shadow-brand"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Agregar a mi calendario
              </button>
              <p class="text-xs text-slate-400 text-center mt-3">
                Compatible con Google, Apple, Outlook
              </p>
            </div>
          </aside>
        </div>
      </div>
    </article>
  </div>
</template>
