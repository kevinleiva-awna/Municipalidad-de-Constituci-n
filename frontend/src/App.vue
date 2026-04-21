<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import Navbar from './components/Navbar.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import AdminLayout from './layouts/AdminLayout.vue'

const route = useRoute()
const layout = computed(() => route.meta.layout || (route.meta.bare ? 'bare' : 'default'))
</script>

<template>
  <!-- Layout admin: sidebar + topbar + content -->
  <AdminLayout v-if="layout === 'admin'" />

  <!-- Layout bare: solo contenido (login, register) -->
  <RouterView v-else-if="layout === 'bare'" v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <!-- Layout default: navbar + content -->
  <div v-else class="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>

  <!-- Confirm dialog global -->
  <ConfirmDialog />
</template>
