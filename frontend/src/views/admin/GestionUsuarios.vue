<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useUsuarios } from '../../composables/useUsuarios'
import { useAuthStore } from '../../stores/auth.store'

const { listar, crear, cambiarRol, desactivar, reactivar } = useUsuarios()
const toast = useToast()
const auth = useAuthStore()

const usuarios = ref([])
const loading = ref(false)
const modalAbierto = ref(false)
const passwordGenerada = ref(null)
const saving = ref(false)

const form = reactive({
  nombre: '',
  email: '',
  rol: 'FUNCIONARIO',
})

const totales = computed(() => ({
  total: usuarios.value.length,
  admins: usuarios.value.filter((u) => u.rol === 'ADMIN').length,
  funcionarios: usuarios.value.filter((u) => u.rol === 'FUNCIONARIO').length,
  ciudadanos: usuarios.value.filter((u) => u.rol === 'CIUDADANO').length,
}))

async function cargar() {
  loading.value = true
  try {
    usuarios.value = await listar()
  } catch (err) {
    toast.error('No se pudieron cargar los usuarios')
  } finally {
    loading.value = false
  }
}

function abrirModal() {
  form.nombre = ''
  form.email = ''
  form.rol = 'FUNCIONARIO'
  passwordGenerada.value = null
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  passwordGenerada.value = null
}

async function crearUsuario() {
  if (saving.value) return
  saving.value = true
  try {
    const { user, passwordTemporal } = await crear({
      nombre: form.nombre,
      email: form.email,
      rol: form.rol,
    })
    usuarios.value.push(user)
    passwordGenerada.value = passwordTemporal
    toast.success(`${user.nombre} creado`)
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo crear el usuario')
  } finally {
    saving.value = false
  }
}

async function actualizarRol(usuario, nuevoRol) {
  if (nuevoRol === usuario.rol) return
  try {
    const user = await cambiarRol(usuario.id, nuevoRol)
    const i = usuarios.value.findIndex((u) => u.id === usuario.id)
    if (i >= 0) usuarios.value[i] = user
    toast.success(`Rol actualizado a ${nuevoRol}`)
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo cambiar el rol')
    await cargar()
  }
}

async function toggleActivo(usuario) {
  try {
    const fn = usuario.activo ? desactivar : reactivar
    const user = await fn(usuario.id)
    const i = usuarios.value.findIndex((u) => u.id === usuario.id)
    if (i >= 0) usuarios.value[i] = user
    toast.success(user.activo ? 'Usuario reactivado' : 'Usuario desactivado')
  } catch (err) {
    toast.error(err.response?.data?.error || 'No se pudo actualizar el usuario')
  }
}

async function copiarPassword() {
  if (!passwordGenerada.value) return
  try {
    await navigator.clipboard.writeText(passwordGenerada.value)
    toast.success('Contraseña copiada')
  } catch {
    toast.info('Copia manual: ' + passwordGenerada.value)
  }
}

onMounted(cargar)
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <header class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-brand">Usuarios</h1>
        <p class="text-sm text-slate-500 mt-1">
          {{ totales.total }} en total · {{ totales.admins }} admins · {{ totales.funcionarios }} funcionarios · {{ totales.ciudadanos }} ciudadanos
        </p>
      </div>
      <button
        @click="abrirModal"
        class="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition"
      >+ Nuevo funcionario</button>
    </header>

    <div v-if="loading" class="text-slate-500">Cargando…</div>

    <div v-else-if="!usuarios.length" class="bg-white rounded-xl p-10 text-center text-slate-500 shadow-sm">
      Aún no hay usuarios.
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-100 text-slate-700 text-left">
          <tr>
            <th class="px-4 py-3">Nombre</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Rol</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="u in usuarios" :key="u.id" :class="{ 'opacity-60': !u.activo }" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium text-slate-900">{{ u.nombre }}</td>
            <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
            <td class="px-4 py-3">
              <select
                :value="u.rol"
                :disabled="u.id === auth.user?.id"
                @change="actualizarRol(u, $event.target.value)"
                class="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none disabled:bg-slate-100"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="FUNCIONARIO">FUNCIONARIO</option>
                <option value="CIUDADANO">CIUDADANO</option>
              </select>
            </td>
            <td class="px-4 py-3">
              <span
                :class="u.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'"
                class="px-2 py-0.5 rounded text-xs font-medium"
              >{{ u.activo ? 'Activo' : 'Inactivo' }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="u.id !== auth.user?.id"
                @click="toggleActivo(u)"
                :class="u.activo ? 'text-red-600' : 'text-brand'"
                class="hover:underline"
              >{{ u.activo ? 'Desactivar' : 'Reactivar' }}</button>
              <span v-else class="text-slate-400 text-xs">(tú)</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="modalAbierto"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 class="text-xl font-semibold text-slate-900 mb-4">Crear usuario</h2>

        <div v-if="passwordGenerada" class="space-y-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-sm text-green-800 font-medium mb-2">✓ Usuario creado</p>
            <p class="text-sm text-slate-700">Entrega esta contraseña temporal al usuario:</p>
            <div class="mt-3 flex items-center gap-2">
              <code class="flex-1 bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono">{{ passwordGenerada }}</code>
              <button
                @click="copiarPassword"
                class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
              >Copiar</button>
            </div>
            <p class="text-xs text-slate-500 mt-2">
              No se volverá a mostrar. Si la pierdes, tendrás que resetear la contraseña del usuario.
            </p>
          </div>

          <div class="flex justify-end">
            <button
              @click="cerrarModal"
              class="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition"
            >Listo</button>
          </div>
        </div>

        <form v-else @submit.prevent="crearUsuario" class="space-y-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Nombre</span>
            <input v-model="form.nombre" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Email</span>
            <input v-model="form.email" type="email" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Rol</span>
            <select v-model="form.rol" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none">
              <option value="FUNCIONARIO">Funcionario</option>
              <option value="ADMIN">Administrador</option>
              <option value="CIUDADANO">Ciudadano</option>
            </select>
          </label>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="cerrarModal" class="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Cancelar</button>
            <button
              type="submit"
              :disabled="saving"
              class="px-5 py-2 rounded-lg bg-brand text-white hover:bg-brand-600 disabled:opacity-60 transition"
            >{{ saving ? 'Creando…' : 'Crear' }}</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
