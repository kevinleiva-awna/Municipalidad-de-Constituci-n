import { reactive } from 'vue'

const state = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'danger',
  resolve: null,
})

function confirm(opts = {}) {
  return new Promise((resolve) => {
    state.title       = opts.title       || '¿Estás seguro?'
    state.message     = opts.message     || ''
    state.confirmText = opts.confirmText || 'Confirmar'
    state.cancelText  = opts.cancelText  || 'Cancelar'
    state.variant     = opts.variant     || 'danger'
    state.resolve     = resolve
    state.open        = true
  })
}

function accept() {
  state.open = false
  state.resolve?.(true)
  state.resolve = null
}

function reject() {
  state.open = false
  state.resolve?.(false)
  state.resolve = null
}

export function useConfirm() {
  return { state, confirm, accept, reject }
}
