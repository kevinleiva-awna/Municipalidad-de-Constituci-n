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
const busqueda = ref('')

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

const usuariosFiltrados = computed(() => {
  if (!busqueda.value) return usuarios.value
  const q = busqueda.value.toLowerCase()
  return usuarios.value.filter(
    (u) => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

function inicialesDe(nombre) {
  return (nombre || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function colorAvatar(rol) {
  if (rol === 'ADMIN') return 'from-brand to-brand-700'
  if (rol === 'FUNCIONARIO') return 'from-emerald-500 to-emerald-700'
  return 'from-slate-400 to-slate-600'
}

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
  <section class="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-brand font-semibold uppercase tracking-[0.12em] text-xs mb-1">Administración</p>
        <h1 class="text-3xl md:text-4xl font-bold text-slate-900">Usuarios</h1>
        <p class="text-slate-500 mt-1">Gestiona accesos, roles y cuentas.</p>
      </div>
      <button
        @click="abrirModal"
        class="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 transition shadow-brand font-semibold"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo funcionario
      </button>
    </header>

    <!-- Resumen -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(item, i) in [
        { label: 'Total', value: totales.total, color: 'bg-slate-50 text-slate-700 border-slate-200' },
        { label: 'Admins', value: totales.admins, color: 'bg-brand-50 text-brand-700 border-brand-100' },
        { label: 'Funcionarios', value: totales.funcionarios, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        { label: 'Ciudadanos', value: totales.ciudadanos, color: 'bg-amber-50 text-amber-700 border-amber-100' },
      ]" :key="item.label"
        :class="item.color"
        class="rounded-2xl p-4 border"
        :style="`animation: slide-up 400ms ease ${i * 50}ms both`"
      >
        <p class="text-[11px] font-semibold uppercase tracking-wide opacity-80">{{ item.label }}</p>
        <p class="text-3xl font-bold mt-1">{{ item.value }}</p>
      </div>
    </div>

    <!-- Buscador -->
    <div class="bg-white rounded-2xl shadow-soft p-4 border border-slate-100">
      <div class="relative">
        <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar por nombre o email…"
          class="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl shadow-soft p-5 space-y-3 border border-slate-100">
      <div v-for="n in 5" :key="n" class="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!usuariosFiltrados.length" class="bg-white rounded-2xl p-12 text-center shadow-soft border border-slate-100">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <p class="font-semibold text-slate-900">{{ busqueda ? 'Sin resultados' : 'Aún no hay usuarios' }}</p>
      <p class="text-sm text-slate-500 mt-1">{{ busqueda ? 'Prueba con otro término de búsqueda.' : 'Crea el primer funcionario para empezar.' }}</p>
    </div>

    <!-- Tabla -->
    <div v-else class="bg-white rounded-2xl shadow-soft overflow-hidden border border-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 text-left">
              <th class="px-5 py-3">Usuario</th>
              <th class="px-5 py-3">Rol</th>
              <th class="px-5 py-3">Estado</th>
              <th class="px-5 py-3">Registro</th>
              <th class="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="u in usuariosFiltrados"
              :key="u.id"
              :class="{ 'opacity-60': !u.activo }"
              class="hover:bg-slate-50/70 transition"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div :class="`bg-gradient-to-br ${colorAvatar(u.rol)}`" class="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm">
                    {{ inicialesDe(u.nombre) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-900">
                      {{ u.nombre }}
                      <span v-if="u.id === auth.user?.id" class="ml-1.5 text-[10px] font-semibold uppercase text-brand bg-brand-50 px-1.5 py-0.5 rounded">tú</span>
                    </p>
                    <p class="text-xs text-slate-500 truncate">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <select
                  :value="u.rol"
                  :disabled="u.id === auth.user?.id"
                  @change="actualizarRol(u, $event.target.value)"
                  class="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="FUNCIONARIO">FUNCIONARIO</option>
                  <option value="CIUDADANO">CIUDADANO</option>
                </select>
              </td>
              <td class="px-5 py-4">
                <span
                  :class="u.activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                >
                  <span :class="u.activo ? 'bg-emerald-500' : 'bg-slate-400'" class="w-1.5 h-1.5 rounded-full"></span>
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-5 py-4 text-xs text-slate-500">
                {{ u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }}
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end">
                  <button
                    v-if="u.id !== auth.user?.id"
                    @click="toggleActivo(u)"
                    :class="u.activo ? 'text-red-500 hover:bg-red-50' : 'text-brand hover:bg-brand-50'"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
                  >{{ u.activo ? 'Desactivar' : 'Reactivar' }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal crear -->
    <Transition name="fade">
      <div
        v-if="modalAbierto"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        @click.self="cerrarModal"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
          <div v-if="passwordGenerada" class="p-6 space-y-5">
            <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Usuario creado</h2>
              <p class="text-sm text-slate-500 mt-1">Entrega esta contraseña temporal al usuario. No se volverá a mostrar.</p>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <code class="flex-1 text-sm font-mono text-slate-900 break-all">{{ passwordGenerada }}</code>
              <button
                @click="copiarPassword"
                class="flex-shrink-0 bg-brand text-white px-3 py-2 rounded-lg hover:bg-brand-600 text-sm font-semibold transition"
              >Copiar</button>
            </div>

            <button
              @click="cerrarModal"
              class="w-full bg-slate-900 text-white rounded-xl py-3 font-semibold hover:bg-slate-800 transition"
            >Listo</button>
          </div>

          <form v-else @submit.prevent="crearUsuario" class="p-6 space-y-5">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-bold text-slate-900">Nuevo usuario</h2>
                <p class="text-sm text-slate-500 mt-1">Se generará una contraseña temporal.</p>
              </div>
              <button type="button" @click="cerrarModal" class="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label class="block">
              <span class="text-sm font-medium text-slate-700 mb-1.5 block">Nombre</span>
              <input v-model="form.nombre" required placeholder="Nombre completo" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
            </label>

            <label class="block">
              <span class="text-sm font-medium text-slate-700 mb-1.5 block">Email</span>
              <input v-model="form.email" type="email" required placeholder="persona@constitucion.cl" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition" />
            </label>

            <label class="block">
              <span class="text-sm font-medium text-slate-700 mb-1.5 block">Rol</span>
              <select v-model="form.rol" class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition">
                <option value="FUNCIONARIO">Funcionario</option>
                <option value="ADMIN">Administrador</option>
                <option value="CIUDADANO">Ciudadano</option>
              </select>
            </label>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="cerrarModal" class="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 transition font-medium">Cancelar</button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 bg-brand text-white rounded-xl px-4 py-2.5 hover:bg-brand-600 disabled:opacity-60 transition font-semibold shadow-brand"
              >{{ saving ? 'Creando…' : 'Crear' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </section>
</template>
