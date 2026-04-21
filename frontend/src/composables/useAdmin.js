import axios from 'axios'

export function useAdmin() {
  async function stats() {
    const { data } = await axios.get('/admin/stats')
    return data
  }

  return { stats }
}
