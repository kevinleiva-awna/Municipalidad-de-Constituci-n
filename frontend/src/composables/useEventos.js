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

  async function descargarCSV() {
    const response = await axios.get('/admin/eventos/exportar', { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const fecha = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `eventos-${fecha}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return { listar, obtener, crear, actualizar, eliminar, descargarCSV }
}
