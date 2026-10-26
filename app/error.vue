<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
</script>

<template>
  <main style="max-width: 36rem; margin: 15vh auto; padding: 0 1.5rem;">
    <h1 style="font-size: 2.2rem; margin: 0 0 .5rem;">{{ props.error.statusCode === 404 ? 'Tahle stránka neexistuje' : 'Něco se pokazilo' }}</h1>
    <p style="color: var(--muted);">{{ props.error.statusMessage || props.error.message }}</p>
    <button class="btn primary" style="--accent: var(--ts)" @click="clearError({ redirect: '/' })">Zpět na přehled lekcí</button>
  </main>
</template>
