import axios from 'axios'

export function useUsuarios() {
  async function listar() {
    const { data } = await axios.get('/admin/usuarios')
    return data.usuarios
  }

  async function crear(payload) {
    const { data } = await axios.post('/admin/usuarios', payload)
    return data
  }

  async function cambiarRol(id, rol) {
    const { data } = await axios.put(`/admin/usuarios/${id}/rol`, { rol })
    return data.user
  }

  async function desactivar(id) {
    const { data } = await axios.delete(`/admin/usuarios/${id}`)
    return data.user
  }

  async function reactivar(id) {
    const { data } = await axios.post(`/admin/usuarios/${id}/reactivar`)
    return data.user
  }

  return { listar, crear, cambiarRol, desactivar, reactivar }
}
