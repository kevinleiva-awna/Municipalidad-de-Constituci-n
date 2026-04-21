<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const loading = ref(false)

async function submit() {
  if (loading.value) return
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    toast.success('Bienvenido')
    router.push('/')
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- Lado izquierdo: formulario -->
    <div class="flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md animate-fade-in">
        <RouterLink to="/" class="inline-flex items-center gap-3 mb-10 group">
          <div class="w-11 h-11 rounded-xl bg-brand/10 group-hover:bg-brand/15 transition flex items-center justify-center">
            <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-wider text-slate-500">Municipalidad de Constitución</p>
            <p class="font-bold text-slate-900">Cultura Constitución</p>
          </div>
        </RouterLink>

        <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
          Bienvenido <span class="inline-block animate-wave origin-bottom-right">👋</span>
        </h1>
        <p class="text-slate-500 mb-8">Ingresa a tu cuenta para continuar.</p>

        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="tu@email.com"
                class="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                v-model="password"
                :type="mostrarPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full rounded-xl border border-slate-300 pl-11 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
              />
              <button
                type="button"
                @click="mostrarPassword = !mostrarPassword"
                class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg v-if="!mostrarPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-end">
            <a href="#" class="text-sm text-brand hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-brand text-white py-3 font-semibold hover:bg-brand-600 active:scale-[0.99] disabled:opacity-60 transition shadow-lg shadow-brand/20"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando…
            </span>
            <span v-else>Iniciar sesión</span>
          </button>

          <p class="text-sm text-center text-slate-500">
            ¿No tienes cuenta?
            <RouterLink to="/register" class="font-semibold text-brand hover:underline">Regístrate gratis</RouterLink>
          </p>

          <p class="text-[11px] text-center text-slate-400">
            Al ingresar aceptas nuestros Términos y Privacidad
          </p>
        </form>
      </div>
    </div>

    <!-- Lado derecho: hero decorativo -->
    <div class="hidden lg:block relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500">
      <!-- Patrones decorativos -->
      <div class="absolute inset-0 opacity-20 pointer-events-none"
        style="background-image: radial-gradient(circle at 15% 25%, white 0, transparent 35%), radial-gradient(circle at 75% 70%, white 0, transparent 40%);">
      </div>
      <div class="absolute inset-0 opacity-10 pointer-events-none"
        style="background-image: linear-gradient(45deg, white 12%, transparent 12.5%, transparent 87%, white 87.5%, white), linear-gradient(135deg, white 12%, transparent 12.5%, transparent 87%, white 87.5%, white); background-size: 60px 60px;">
      </div>

      <div class="relative h-full flex flex-col justify-center px-14 py-16 text-white">
        <span class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-8 self-start">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Dirección de Cultura y Turismo
        </span>

        <h2 class="text-4xl xl:text-5xl font-bold leading-tight mb-4">
          Tu cultura,<br />
          tu comunidad.
        </h2>

        <p class="text-white/85 text-lg max-w-md mb-12">
          Más de 50 actividades culturales al mes en Constitución. Inscríbete y sé parte de la comunidad.
        </p>

        <div class="grid grid-cols-3 gap-6 max-w-md">
          <div>
            <p class="text-3xl font-bold">+50</p>
            <p class="text-white/70 text-sm uppercase tracking-wide mt-1">Eventos</p>
          </div>
          <div>
            <p class="text-3xl font-bold">+8</p>
            <p class="text-white/70 text-sm uppercase tracking-wide mt-1">Lugares</p>
          </div>
          <div>
            <p class="text-3xl font-bold">+1.500</p>
            <p class="text-white/70 text-sm uppercase tracking-wide mt-1">Inscritos</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 400ms ease both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-wave {
  animation: wave 1.4s ease-in-out 600ms 2;
  display: inline-block;
}
@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(18deg); }
  75% { transform: rotate(-10deg); }
}
</style>
