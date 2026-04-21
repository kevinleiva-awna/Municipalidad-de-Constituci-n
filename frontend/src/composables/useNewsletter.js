import axios from 'axios'

export function useNewsletter() {
  async function suscribir(nombre, email) {
    const { data } = await axios.post('/newsletter/suscribir', { nombre, email })
    return data
  }

  async function listar(params = {}) {
    const { data } = await axios.get('/admin/suscriptores', { params })
    return data
  }

  async function desactivar(id) {
    await axios.delete(`/admin/suscriptores/${id}`)
  }

  async function descargarCSV() {
    const response = await axios.get('/admin/suscriptores/exportar', { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const fecha = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `suscriptores-${fecha}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return { suscribir, listar, desactivar, descargarCSV }
}
