<script setup>
import { useConfirm } from '../composables/useConfirm'

const { state, accept, reject } = useConfirm()

function onKey(e) {
  if (!state.open) return
  if (e.key === 'Escape') reject()
  if (e.key === 'Enter')  accept()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="state.open"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        @click.self="reject"
        @keydown="onKey"
        tabindex="-1"
        ref="dialogRef"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div
                :class="{
                  'bg-red-100 text-red-600': state.variant === 'danger',
                  'bg-amber-100 text-amber-600': state.variant === 'warning',
                  'bg-brand-50 text-brand': state.variant === 'info',
                }"
                class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              >
                <svg v-if="state.variant === 'danger'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <svg v-else-if="state.variant === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-bold text-slate-900">{{ state.title }}</h2>
                <p v-if="state.message" class="text-sm text-slate-600 mt-1.5 leading-relaxed">{{ state.message }}</p>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              @click="reject"
              class="px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition"
            >{{ state.cancelText }}</button>
            <button
              type="button"
              @click="accept"
              :class="{
                'bg-red-600 hover:bg-red-700': state.variant === 'danger',
                'bg-amber-600 hover:bg-amber-700': state.variant === 'warning',
                'bg-brand hover:bg-brand-600': state.variant === 'info',
              }"
              class="px-5 py-2 rounded-xl text-white font-semibold transition shadow-md"
            >{{ state.confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
