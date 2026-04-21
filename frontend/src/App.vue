<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth.store'
import Navbar from './components/Navbar.vue'

const auth = useAuthStore()
const route = useRoute()

const showNavbar = computed(() => auth.isAuthenticated && !route.meta.guest)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <Navbar v-if="showNavbar" />
    <RouterView />
  </div>
</template>
