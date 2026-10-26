<script setup lang="ts">
import { tracks, lessonsOf } from '~/data/lessons'

const props = defineProps<{ currentId?: string }>()
const progress = useProgress()

const groups = computed(() => tracks.map(track => ({
  track,
  lessons: lessonsOf(track.id),
  done: lessonsOf(track.id).filter(l => progress.isDone(l.id)).length,
})))
</script>

<template>
  <nav class="map" aria-label="Lekce kurzu">
    <section v-for="g in groups" :key="g.track.id" class="line" :style="{ '--line-color': `var(--${g.track.id})` }">
      <h2>
        {{ g.track.title }}
        <span class="count">{{ g.done }}/{{ g.lessons.length }}</span>
      </h2>
      <ol>
        <li
          v-for="lesson in g.lessons"
          :key="lesson.id"
          :class="{ done: progress.isDone(lesson.id), current: lesson.id === props.currentId }"
        >
          <NuxtLink :to="`/lekce/${lesson.id}`" :aria-current="lesson.id === props.currentId ? 'page' : undefined">
            <span class="stop" aria-hidden="true" />
            <span class="name">{{ lesson.title }}</span>
            <span v-if="progress.isDone(lesson.id)" class="sr-only">(hotovo)</span>
          </NuxtLink>
        </li>
      </ol>
    </section>
  </nav>
</template>

<style scoped>
.map { display: grid; gap: 1.75rem; }

h2 {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0 0 0.6rem;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: var(--line-color);
}
.count {
  font: 500 0.8125rem var(--font-body);
  color: var(--muted);
}

ol {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}
/* samotná linka trasy */
ol::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0.85rem;
  bottom: 0.85rem;
  width: 4px;
  margin-left: -2px;
  background: var(--line-color);
  border-radius: 2px;
}

li a {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.35rem 0.5rem 0.35rem 0;
  color: var(--ink);
  text-decoration: none;
  font-size: 0.9375rem;
  line-height: 1.3;
  border-radius: 6px;
}
li a:hover .name { text-decoration: underline; text-underline-offset: 3px; }

.stop {
  flex: none;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--bg);
  border: 3px solid var(--line-color);
  position: relative;
  z-index: 1;
}
li.done .stop { background: var(--line-color); }
li.current .stop {
  width: 1.35rem;
  height: 1.35rem;
  margin-left: -0.175rem;
  margin-right: -0.175rem;
  box-shadow: 0 0 0 4px var(--bg), 0 0 0 6px var(--line-color);
}
li.current .name { font-weight: 600; }
li:not(.done):not(.current) .name { color: var(--muted); }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
