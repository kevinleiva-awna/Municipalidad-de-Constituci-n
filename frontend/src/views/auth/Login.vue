<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
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
  <main class="min-h-screen flex items-center justify-center px-4">
    <form
      class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-5"
      @submit.prevent="submit"
    >
      <div class="text-center space-y-1">
        <h1 class="text-2xl font-semibold text-brand">Cultura Constitución</h1>
        <p class="text-sm text-slate-500">Inicia sesión para continuar</p>
      </div>

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
          autocomplete="current-password"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none"
        />
      </label>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-brand text-white py-2.5 font-medium hover:bg-brand-600 disabled:opacity-60 transition"
      >
        {{ loading ? 'Ingresando…' : 'Ingresar' }}
      </button>

      <p class="text-sm text-center text-slate-500">
        ¿No tienes cuenta?
        <RouterLink to="/register" class="text-brand hover:underline">Regístrate</RouterLink>
      </p>
    </form>
  </main>
</template>
