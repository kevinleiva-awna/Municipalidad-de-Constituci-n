<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import Navbar from './components/Navbar.vue'

const route = useRoute()

const showNavbar = computed(() => !route.meta.bare)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <Navbar v-if="showNavbar" />
    <RouterView />
  </div>
</template>
