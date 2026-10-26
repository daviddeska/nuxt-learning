<script setup lang="ts">
import { lessonById } from '~/data/lessons'

const route = useRoute()
const currentId = computed(() => (typeof route.params.id === 'string' ? route.params.id : undefined))
const accent = computed(() => {
  const lesson = currentId.value ? lessonById(currentId.value) : undefined
  return `var(--${lesson?.track ?? 'ts'})`
})

const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <div class="shell" :style="{ '--accent': accent }">
    <header class="top">
      <NuxtLink to="/" class="brand">
        <span class="brand-mark" aria-hidden="true">
          <i style="background: var(--ts)" /><i style="background: var(--vue)" /><i style="background: var(--nuxt)" />
        </span>
        TS → Vue → Nuxt
      </NuxtLink>
      <button class="btn quiet menu-toggle" :aria-expanded="menuOpen" aria-controls="lesson-map" @click="menuOpen = !menuOpen">
        {{ menuOpen ? 'Zavřít přehled' : 'Přehled lekcí' }}
      </button>
    </header>

    <div class="body">
      <aside id="lesson-map" class="side" :class="{ open: menuOpen }">
        <TrackMap :current-id="currentId" />
      </aside>
      <main class="main">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell { min-height: 100%; }

.top {
  position: sticky;
  top: env(safe-area-inset-top, 0px);
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem clamp(1rem, 3vw, 2rem);
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.shell::before {
  content: '';
  position: fixed;
  inset: 0 0 auto;
  height: env(safe-area-inset-top, 0px);
  z-index: 10;
  background: var(--bg);
}

.brand {
  font: 800 1.05rem var(--font-display);
  color: var(--ink);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}
.brand-mark { display: inline-flex; align-items: center; }
.brand-mark i {
  display: block;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  margin-right: -0.15rem;
  box-shadow: 0 0 0 2px var(--bg);
}

.menu-toggle { display: none; }

.body {
  display: grid;
  grid-template-columns: 17rem minmax(0, 1fr);
  gap: clamp(1.5rem, 3vw, 3rem);
  padding: 0 clamp(1rem, 3vw, 2rem);
  max-width: 100rem;
  margin: 0 auto;
}

.side {
  position: sticky;
  top: 3.6rem;
  align-self: start;
  max-height: calc(100vh - 3.6rem);
  overflow-y: auto;
  padding: 1.75rem 0.25rem 2rem 0.25rem;
}

.main { min-width: 0; padding: 1.75rem 0 4rem; }

@media (max-width: 860px) {
  .menu-toggle { display: inline-flex; }
  .body { grid-template-columns: minmax(0, 1fr); }
  .side {
    display: none;
    position: static;
    max-height: none;
    padding: 1.25rem 0 0.5rem;
    border-bottom: 1px solid var(--line);
  }
  .side.open { display: block; }
}
</style>
