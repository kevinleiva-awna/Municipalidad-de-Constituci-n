<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useEventos } from '../../composables/useEventos'
import { useNewsletter } from '../../composables/useNewsletter'
import { useAuthStore } from '../../stores/auth.store'
import EventoCard from '../../components/EventoCard.vue'

const auth = useAuthStore()
const toast = useToast()
const { listar } = useEventos()
const { suscribir } = useNewsletter()

const eventos = ref([])
const totalEventos = ref(0)
const cargando = ref(true)

const newsletterForm = reactive({ nombre: '', email: '' })
const newsletterOk = ref(false)
const enviandoNewsletter = ref(false)

async function enviarSuscripcion() {
  if (enviandoNewsletter.value) return
  enviandoNewsletter.value = true
  try {
    await suscribir(newsletterForm.nombre, newsletterForm.email)
    newsletterOk.value = true
    newsletterForm.nombre = ''
    newsletterForm.email = ''
    toast.success('¡Listo! Ya estás suscrito')
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo completar la suscripción')
  } finally {
    enviandoNewsletter.value = false
  }
}

const ahora = new Date().toISOString()

const proximos = computed(() =>
  eventos.value.filter((e) => new Date(e.fecha) >= new Date()).slice(0, 6)
)

const categoriasAgrupadas = computed(() => {
  const map = new Map()
  for (const ev of eventos.value) {
    if (!ev.categoria) continue
    map.set(ev.categoria, (map.get(ev.categoria) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([nombre, total]) => ({ nombre, total }))
})

const lugaresUnicos = computed(() => {
  const set = new Set(eventos.value.map((e) => e.lugar).filter(Boolean))
  return set.size
})

function iconoCategoria(categoria) {
  const iconos = {
    'Música': '🎵',
    'Teatro': '🎭',
    'Arte': '🎨',
    'Cine': '🎬',
    'Literatura': '📚',
    'Danza': '💃',
    'Festival': '🎪',
    'Patrimonio': '🏛',
    'Fotografía': '📷',
    'Comercio local': '🛍',
  }
  return iconos[categoria] || '✨'
}

async function cargar() {
  cargando.value = true
  try {
    const { items, total } = await listar({ limit: 100, desde: ahora })
    eventos.value = items
    totalEventos.value = total
  } catch (err) {
    toast.error('No se pudieron cargar los eventos')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="bg-slate-50">
    <!-- Hero -->
    <section class="relative overflow-hidden text-white">
      <!-- Background -->
      <div class="absolute inset-0"
        style="background: radial-gradient(120% 110% at 10% 0%, #3F85C7 0%, #185FA5 40%, #134C84 70%, #0A2642 100%);">
      </div>
      <!-- Decorative blobs -->
      <div class="absolute -top-20 -left-16 w-[460px] h-[460px] rounded-full opacity-40 blur-3xl animate-float"
        style="background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);"></div>
      <div class="absolute top-40 right-0 w-[340px] h-[340px] rounded-full opacity-30 blur-3xl animate-float" style="animation-delay: 2s; background: radial-gradient(circle, #6FA3D5 0%, transparent 70%);"></div>
      <!-- Dotted grid -->
      <div class="absolute inset-0 opacity-[0.08] pointer-events-none"
        style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 28px 28px;">
      </div>

      <div class="relative max-w-6xl mx-auto px-6 pt-20 pb-32 md:pt-28 md:pb-40">
        <div class="max-w-3xl">
          <span class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-slide-up">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Dirección de Cultura y Turismo · Municipalidad de Constitución
          </span>

          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 animate-slide-up" style="animation-delay: 60ms">
            Vive la cultura<br />
            <span class="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              de Constitución.
            </span>
          </h1>

          <p class="text-lg md:text-xl text-white/80 max-w-2xl mb-10 animate-slide-up leading-relaxed" style="animation-delay: 120ms">
            Conciertos, talleres, exposiciones y actividades culturales de la comuna, en un solo lugar. Encuentra tu próximo panorama.
          </p>

          <div class="flex flex-wrap items-center gap-3 animate-slide-up" style="animation-delay: 180ms">
            <RouterLink
              to="/calendario"
              class="inline-flex items-center gap-2 bg-white text-brand font-semibold px-6 py-3.5 rounded-2xl hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 transition shadow-xl shadow-black/10"
            >
              Ver calendario
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </RouterLink>
            <RouterLink
              v-if="!auth.isAuthenticated"
              to="/register"
              class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/25 font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/20 transition"
            >Crear cuenta</RouterLink>
            <RouterLink
              v-else-if="auth.rol === 'ADMIN'"
              to="/dashboard"
              class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/25 font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/20 transition"
            >Ir al panel</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats flotantes sobre el hero -->
    <section class="max-w-6xl mx-auto px-6 -mt-16 relative z-10">
      <div class="bg-white rounded-3xl shadow-soft-lg p-2 md:p-3 grid grid-cols-3">
        <div class="px-4 py-5 md:px-6 md:py-6 text-center md:text-left">
          <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Eventos próximos</p>
          <p class="text-3xl md:text-4xl font-bold text-slate-900 mt-1">{{ totalEventos }}</p>
        </div>
        <div class="px-4 py-5 md:px-6 md:py-6 text-center md:text-left border-x border-slate-100">
          <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Categorías</p>
          <p class="text-3xl md:text-4xl font-bold text-slate-900 mt-1">{{ categoriasAgrupadas.length }}</p>
        </div>
        <div class="px-4 py-5 md:px-6 md:py-6 text-center md:text-left">
          <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Lugares</p>
          <p class="text-3xl md:text-4xl font-bold text-slate-900 mt-1">{{ lugaresUnicos }}</p>
        </div>
      </div>
    </section>

    <!-- Categorías -->
    <section v-if="categoriasAgrupadas.length" class="max-w-6xl mx-auto px-6 py-20">
      <header class="text-center mb-12">
        <p class="text-brand font-semibold uppercase tracking-[0.12em] text-sm mb-2">Explora por interés</p>
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900">Categorías culturales</h2>
      </header>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RouterLink
          v-for="(cat, i) in categoriasAgrupadas"
          :key="cat.nombre"
          :to="`/calendario`"
          class="group bg-white rounded-2xl p-5 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all border border-slate-100"
          :style="`animation: slide-up 400ms ease ${i * 50}ms both`"
        >
          <div class="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-100 text-2xl flex items-center justify-center mb-3 transition">
            {{ iconoCategoria(cat.nombre) }}
          </div>
          <p class="font-semibold text-slate-900 group-hover:text-brand transition">{{ cat.nombre }}</p>
          <p class="text-sm text-slate-500 mt-0.5">{{ cat.total }} {{ cat.total === 1 ? 'evento' : 'eventos' }}</p>
        </RouterLink>
      </div>
    </section>

    <!-- Próximos eventos -->
    <section class="max-w-6xl mx-auto px-6 pb-20">
      <header class="flex flex-wrap items-end justify-between gap-3 mb-10">
        <div>
          <p class="text-brand font-semibold uppercase tracking-[0.12em] text-sm mb-2">Agenda cultural</p>
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900">Próximos eventos</h2>
          <p class="text-slate-600 mt-2">No te quedes fuera — agenda tu próxima experiencia cultural.</p>
        </div>
        <RouterLink
          to="/calendario"
          class="group inline-flex items-center gap-2 text-brand font-semibold hover:gap-3 transition-all"
        >
          Ver todos
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </RouterLink>
      </header>

      <div v-if="cargando" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
          <div class="aspect-[16/10] bg-slate-200"></div>
          <div class="p-5 space-y-3">
            <div class="h-3 bg-slate-200 rounded w-1/3"></div>
            <div class="h-5 bg-slate-200 rounded w-4/5"></div>
            <div class="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!proximos.length" class="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-soft">
        Aún no hay eventos programados. Vuelve pronto.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventoCard v-for="ev in proximos" :key="ev.id" :evento="ev" />
      </div>
    </section>

    <!-- Cómo funciona -->
    <section class="bg-white py-20">
      <div class="max-w-6xl mx-auto px-6">
        <header class="text-center mb-14">
          <p class="text-brand font-semibold uppercase tracking-[0.12em] text-sm mb-2">Cómo funciona</p>
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900">Tres pasos para vivir la cultura</h2>
        </header>

        <div class="grid md:grid-cols-3 gap-8 relative">
          <!-- Línea decorativa -->
          <div class="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent"></div>

          <div v-for="(paso, i) in [
            { n: '01', titulo: 'Crea tu cuenta', desc: 'Regístrate gratis y accede al calendario completo en segundos.' },
            { n: '02', titulo: 'Explora el calendario', desc: 'Filtra por categoría, lugar o tipo y encuentra tu próximo panorama.' },
            { n: '03', titulo: 'Descarga el evento', desc: 'Guárdalo en tu calendario personal con un solo click y no te lo pierdas.' },
          ]" :key="paso.n" class="relative text-center" :style="`animation: slide-up 400ms ease ${i * 100}ms both`">
            <div class="relative inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-700 text-white items-center justify-center font-bold text-lg mb-5 shadow-brand">
              {{ paso.n }}
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">{{ paso.titulo }}</h3>
            <p class="text-slate-600">{{ paso.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="py-16 bg-slate-50">
      <div class="max-w-4xl mx-auto px-6">
        <div class="bg-white rounded-3xl shadow-soft-lg border border-slate-100 overflow-hidden grid md:grid-cols-2">
          <div class="p-8 md:p-10 bg-gradient-to-br from-brand-50 via-white to-brand-50 flex flex-col justify-center">
            <span class="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Newsletter
            </span>
            <h2 class="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
              No te pierdas nada
            </h2>
            <p class="text-slate-600">
              Recibe los próximos eventos culturales de Constitución directamente en tu correo. Sin spam, solo lo esencial.
            </p>
          </div>

          <div class="p-8 md:p-10">
            <div v-if="newsletterOk" class="h-full flex flex-col items-center justify-center text-center space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-slate-900">¡Gracias por suscribirte!</p>
                <p class="text-sm text-slate-500 mt-1">Te llegará el primer newsletter pronto.</p>
              </div>
              <button
                @click="newsletterOk = false"
                class="text-sm text-brand hover:underline"
              >Suscribir otro correo</button>
            </div>
            <form v-else @submit.prevent="enviarSuscripcion" class="space-y-3">
              <input
                v-model="newsletterForm.nombre"
                required
                placeholder="Tu nombre"
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
              />
              <input
                v-model="newsletterForm.email"
                type="email"
                required
                placeholder="tu@correo.cl"
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
              />
              <button
                type="submit"
                :disabled="enviandoNewsletter"
                class="w-full inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold px-5 py-3 rounded-xl hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transition shadow-brand"
              >
                <svg v-if="enviandoNewsletter" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ enviandoNewsletter ? 'Enviando…' : 'Suscribirme al newsletter' }}
              </button>
              <p class="text-[11px] text-slate-400 text-center">
                Al suscribirte aceptas recibir correos. Puedes darte de baja cuando quieras.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section v-if="!auth.isAuthenticated" class="py-20">
      <div class="max-w-5xl mx-auto px-6">
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white p-10 md:p-14 shadow-brand">
          <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
          <div class="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>

          <div class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Únete a la comunidad cultural.
              </h2>
              <p class="text-white/85 text-lg max-w-lg">
                Cuenta gratuita, sin spam. Te avisamos solo de lo que realmente importa.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <RouterLink
                to="/register"
                class="inline-flex items-center gap-2 bg-white text-brand font-semibold px-6 py-3.5 rounded-2xl hover:bg-slate-100 hover:-translate-y-0.5 transition shadow-xl"
              >
                Crear cuenta gratis
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </RouterLink>
              <RouterLink
                to="/login"
                class="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition"
              >Ya tengo cuenta</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-12">
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p class="text-white font-semibold">Cultura Constitución</p>
              <p class="text-sm text-slate-500">Dirección de Cultura y Turismo</p>
            </div>
          </div>
          <p class="text-sm text-slate-500 text-center md:text-right">
            © {{ new Date().getFullYear() }} Municipalidad de Constitución<br class="md:hidden" />
            <span class="hidden md:inline"> · </span>
            Desarrollado por <a href="https://awna.cl" target="_blank" rel="noopener" class="text-white hover:underline">AWNA Digital</a>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
