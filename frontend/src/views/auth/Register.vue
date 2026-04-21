<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmacion = ref('')
const loading = ref(false)

async function submit() {
  if (loading.value) return
  if (password.value !== confirmacion.value) {
    toast.error('Las contraseñas no coinciden')
    return
  }
  loading.value = true
  try {
    await auth.register(nombre.value, email.value, password.value)
    toast.success('Cuenta creada')
    router.push('/')
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo crear la cuenta')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-4 py-8">
    <form
      class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-5"
      @submit.prevent="submit"
    >
      <div class="text-center space-y-1">
        <h1 class="text-2xl font-semibold text-brand">Crear cuenta</h1>
        <p class="text-sm text-slate-500">Regístrate para acceder al calendario cultural</p>
      </div>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Nombre</span>
        <input
          v-model="nombre"
          type="text"
          required
          autocomplete="name"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
        />
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Correo</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
        />
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Contraseña</span>
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
        />
      </label>

      <label class="block">
        <span class="text-sm font-medium text-slate-700">Repite la contraseña</span>
        <input
          v-model="confirmacion"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
        />
      </label>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-brand text-white py-2.5 font-medium hover:bg-brand-600 disabled:opacity-60 transition"
      >
        {{ loading ? 'Creando…' : 'Crear cuenta' }}
      </button>

      <p class="text-sm text-center text-slate-500">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="text-brand hover:underline">Inicia sesión</RouterLink>
      </p>
    </form>
  </main>
</template>
