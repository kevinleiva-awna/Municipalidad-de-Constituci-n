import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const rol = computed(() => user.value?.rol || null)

  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value  = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  async function login(email, password) {
    const { data } = await axios.post('/auth/login', { email, password })
    setAuth(data.token, data.user)
    return data.user
  }

  async function register(nombre, email, password) {
    const { data } = await axios.post('/auth/register', { nombre, email, password })
    setAuth(data.token, data.user)
    return data.user
  }

  async function actualizarPerfil(payload) {
    const { data } = await axios.put('/auth/me', payload)
    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    return data.user
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return { token, user, isAuthenticated, rol, setAuth, login, register, actualizarPerfil, logout }
})
