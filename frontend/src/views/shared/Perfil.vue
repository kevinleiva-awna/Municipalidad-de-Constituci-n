<script setup>
import { computed, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../../stores/auth.store'

const auth = useAuthStore()
const toast = useToast()

const guardandoNombre = ref(false)
const guardandoPassword = ref(false)
const mostrarPasswordActual = ref(false)
const mostrarPasswordNueva = ref(false)

const formNombre = reactive({
  nombre: auth.user?.nombre || '',
})

const formPassword = reactive({
  passwordActual: '',
  passwordNueva: '',
  passwordConfirmacion: '',
})

const iniciales = computed(() =>
  (auth.user?.nombre || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

const fechaUnion = computed(() => {
  if (!auth.user?.createdAt) return '—'
  return new Date(auth.user.createdAt).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
})

async function guardarNombre() {
  if (guardandoNombre.value) return
  if (!formNombre.nombre.trim()) {
    toast.error('El nombre no puede estar vacío')
    return
  }
  if (formNombre.nombre.trim() === auth.user?.nombre) {
    toast.info('No hay cambios para guardar')
    return
  }
  guardandoNombre.value = true
  try {
    await auth.actualizarPerfil({ nombre: formNombre.nombre })
    toast.success('Nombre actualizado')
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo actualizar')
  } finally {
    guardandoNombre.value = false
  }
}

async function cambiarPassword() {
  if (guardandoPassword.value) return
  if (formPassword.passwordNueva !== formPassword.passwordConfirmacion) {
    toast.error('Las contraseñas nuevas no coinciden')
    return
  }
  if (formPassword.passwordNueva.length < 6) {
    toast.error('La nueva contraseña debe tener al menos 6 caracteres')
    return
  }
  guardandoPassword.value = true
  try {
    await auth.actualizarPerfil({
      passwordActual: formPassword.passwordActual,
      password: formPassword.passwordNueva,
    })
    toast.success('Contraseña actualizada')
    formPassword.passwordActual = ''
    formPassword.passwordNueva = ''
    formPassword.passwordConfirmacion = ''
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo cambiar la contraseña')
  } finally {
    guardandoPassword.value = false
  }
}

function colorRol(rol) {
  if (rol === 'ADMIN') return 'bg-brand-50 text-brand-700 border-brand-200'
  if (rol === 'FUNCIONARIO') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}
</script>

<template>
  <section class="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
    <header>
      <p class="text-brand font-semibold uppercase tracking-[0.12em] text-xs mb-1">Cuenta</p>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900">Mi perfil</h1>
      <p class="text-slate-500 mt-1">Actualiza tu información personal y contraseña.</p>
    </header>

    <!-- Card con avatar + info -->
    <div class="bg-white rounded-2xl shadow-soft p-6 border border-slate-100">
      <div class="flex flex-col md:flex-row md:items-center gap-5">
        <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-brand to-brand-700 text-white font-bold text-2xl md:text-3xl flex items-center justify-center shadow-brand flex-shrink-0">
          {{ iniciales }}
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-slate-900">{{ auth.user?.nombre }}</h2>
          <p class="text-slate-500 truncate">{{ auth.user?.email }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <span :class="colorRol(auth.rol)" class="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border">
              {{ auth.rol }}
            </span>
            <span class="text-xs text-slate-500">Miembro desde {{ fechaUnion }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Información personal -->
    <div class="bg-white rounded-2xl shadow-soft border border-slate-100">
      <header class="p-6 border-b border-slate-100">
        <h2 class="font-bold text-slate-900">Información personal</h2>
        <p class="text-sm text-slate-500">El correo no se puede modificar — contáctanos si necesitas cambiarlo.</p>
      </header>

      <form @submit.prevent="guardarNombre" class="p-6 space-y-4">
        <label class="block">
          <span class="text-sm font-medium text-slate-700 mb-1.5 block">Nombre</span>
          <input
            v-model="formNombre.nombre"
            required
            class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
          />
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700 mb-1.5 block">Correo electrónico</span>
          <input
            :value="auth.user?.email"
            disabled
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-500 cursor-not-allowed"
          />
        </label>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="guardandoNombre"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transition shadow-brand"
          >
            <svg v-if="guardandoNombre" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ guardandoNombre ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Cambiar contraseña -->
    <div class="bg-white rounded-2xl shadow-soft border border-slate-100">
      <header class="p-6 border-b border-slate-100">
        <h2 class="font-bold text-slate-900">Cambiar contraseña</h2>
        <p class="text-sm text-slate-500">Por seguridad, ingresa tu contraseña actual antes de cambiarla.</p>
      </header>

      <form @submit.prevent="cambiarPassword" class="p-6 space-y-4">
        <label class="block">
          <span class="text-sm font-medium text-slate-700 mb-1.5 block">Contraseña actual</span>
          <div class="relative">
            <input
              v-model="formPassword.passwordActual"
              :type="mostrarPasswordActual ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="w-full rounded-xl border border-slate-200 px-3.5 pr-11 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
            />
            <button
              type="button"
              @click="mostrarPasswordActual = !mostrarPasswordActual"
              class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700 transition"
              tabindex="-1"
            >
              <svg v-if="!mostrarPasswordActual" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            </button>
          </div>
        </label>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Nueva contraseña</span>
            <div class="relative">
              <input
                v-model="formPassword.passwordNueva"
                :type="mostrarPasswordNueva ? 'text' : 'password'"
                required
                minlength="6"
                autocomplete="new-password"
                class="w-full rounded-xl border border-slate-200 px-3.5 pr-11 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
              />
              <button
                type="button"
                @click="mostrarPasswordNueva = !mostrarPasswordNueva"
                class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700 transition"
                tabindex="-1"
              >
                <svg v-if="!mostrarPasswordNueva" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
            <span class="text-xs text-slate-400 mt-1.5 block">Mínimo 6 caracteres</span>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700 mb-1.5 block">Confirmar nueva contraseña</span>
            <input
              v-model="formPassword.passwordConfirmacion"
              :type="mostrarPasswordNueva ? 'text' : 'password'"
              required
              minlength="6"
              autocomplete="new-password"
              class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
            />
          </label>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="guardandoPassword"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transition"
          >
            <svg v-if="guardandoPassword" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ guardandoPassword ? 'Actualizando…' : 'Cambiar contraseña' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
