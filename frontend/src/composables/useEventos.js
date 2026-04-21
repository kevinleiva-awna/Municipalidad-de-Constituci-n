import axios from 'axios'

function toFormData(evento, imagen) {
  const fd = new FormData()
  Object.entries(evento).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return
    fd.append(k, v instanceof Date ? v.toISOString() : String(v))
  })
  if (imagen instanceof File) fd.append('imagen', imagen)
  return fd
}

export function useEventos() {
  async function listar(params = {}) {
    const { data } = await axios.get('/eventos', { params })
    return data
  }

  async function obtener(id) {
    const { data } = await axios.get(`/eventos/${id}`)
    return data.evento
  }

  async function crear(evento, imagen) {
    const { data } = await axios.post('/eventos', toFormData(evento, imagen), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.evento
  }

  async function actualizar(id, evento, imagen) {
    const { data } = await axios.put(`/eventos/${id}`, toFormData(evento, imagen), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.evento
  }

  async function eliminar(id) {
    await axios.delete(`/eventos/${id}`)
  }

  return { listar, obtener, crear, actualizar, eliminar }
}
