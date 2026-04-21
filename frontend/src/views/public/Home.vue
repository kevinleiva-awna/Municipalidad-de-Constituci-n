<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useEventos } from '../../composables/useEventos'
import { useAuthStore } from '../../stores/auth.store'
import EventoCard from '../../components/EventoCard.vue'

const auth = useAuthStore()
const toast = useToast()
const { listar } = useEventos()

const eventos = ref([])
const totalEventos = ref(0)
const cargando = ref(true)

const ahora = new Date().toISOString()

const proximos = computed(() =>
  eventos.value.filter((e) => new Date(e.fecha) >= new Date()).slice(0, 6)
)

const categoriasUnicas = computed(() => {
  const set = new Set(eventos.value.map((e) => e.categoria).filter(Boolean))
  return set.size
})

const lugaresUnicos = computed(() => {
  const set = new Set(eventos.value.map((e) => e.lugar).filter(Boolean))
  return set.size
})

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
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      <div class="absolute inset-0 opacity-20 pointer-events-none"
        style="background-image: radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 60%, white 0, transparent 40%);">
      </div>

      <div class="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
        <span class="inline-block bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Dirección de Cultura y Turismo · Municipalidad de Constitución
        </span>

        <h1 class="text-4xl md:text-6xl font-bold leading-tight mb-4">
          Vive la cultura de <span class="text-white/90 underline decoration-white/40 decoration-4 underline-offset-4">Constitución</span>
        </h1>

        <p class="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8">
          Conciertos, talleres, exposiciones y actividades culturales de la comuna,
          en un solo lugar. Encuentra tu próximo panorama.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <RouterLink
            to="/calendario"
            class="bg-white text-brand font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition shadow-lg"
          >Ver calendario</RouterLink>
          <RouterLink
            v-if="!auth.isAuthenticated"
            to="/register"
            class="bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition"
          >Crear cuenta</RouterLink>
          <RouterLink
            v-else-if="auth.rol === 'ADMIN'"
            to="/dashboard"
            class="bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition"
          >Ir al panel</RouterLink>
        </div>
      </div>

      <!-- Wave -->
      <svg class="block w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,32 C320,80 720,0 1440,48 L1440,80 L0,80 Z" fill="#f8fafc" />
      </svg>
    </section>

    <!-- Stats -->
    <section class="max-w-6xl mx-auto px-6 -mt-6 md:-mt-10 relative">
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:divide-x divide-slate-200">
        <div class="text-center px-4">
          <p class="text-4xl font-bold text-brand">{{ totalEventos }}</p>
          <p class="text-sm text-slate-600 uppercase tracking-wide mt-1">Eventos próximos</p>
        </div>
        <div class="text-center px-4">
          <p class="text-4xl font-bold text-brand">{{ categoriasUnicas }}</p>
          <p class="text-sm text-slate-600 uppercase tracking-wide mt-1">Categorías</p>
        </div>
        <div class="text-center px-4">
          <p class="text-4xl font-bold text-brand">{{ lugaresUnicos }}</p>
          <p class="text-sm text-slate-600 uppercase tracking-wide mt-1">Lugares culturales</p>
        </div>
      </div>
    </section>

    <!-- Próximos eventos -->
    <section class="max-w-6xl mx-auto px-6 py-16">
      <header class="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <h2 class="text-3xl font-bold text-slate-900">Próximos eventos</h2>
          <p class="text-slate-600 mt-1">No te quedes fuera — agenda tu próxima experiencia cultural.</p>
        </div>
        <RouterLink
          to="/calendario"
          class="text-brand font-semibold hover:underline"
        >Ver todos →</RouterLink>
      </header>

      <div v-if="cargando" class="text-slate-500">Cargando…</div>

      <div v-else-if="!proximos.length" class="bg-white rounded-xl p-10 text-center text-slate-500 shadow-sm">
        Aún no hay eventos programados. Vuelve pronto.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventoCard v-for="ev in proximos" :key="ev.id" :evento="ev" />
      </div>
    </section>

    <!-- CTA final -->
    <section v-if="!auth.isAuthenticated" class="bg-slate-100 py-16">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Únete a la comunidad cultural
        </h2>
        <p class="text-slate-600 mb-6">
          Crea tu cuenta y mantente al día con las actividades culturales de la comuna.
        </p>
        <RouterLink
          to="/register"
          class="inline-block bg-brand text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-600 transition shadow-md"
        >Crear cuenta gratis</RouterLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 py-8">
      <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <p>© {{ new Date().getFullYear() }} Municipalidad de Constitución · Dirección de Cultura y Turismo</p>
        <p>Desarrollado por <a href="https://awna.cl" target="_blank" rel="noopener" class="text-white hover:underline">AWNA Digital</a></p>
      </div>
    </footer>
  </div>
</template>
